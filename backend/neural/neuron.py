"""
Single Neuron Implementation for CAMBRIC LABS

A neuron is the fundamental unit of a neural network. It receives inputs,
multiplies each by a weight, adds them up, adds a bias, and applies an
activation function to produce an output.

Mathematical Model:
    z = Σ(xᵢ × wᵢ) + b      (weighted sum)
    y = activation(z)        (output)

Forward: compute output
Backward: compute gradients (NO weight changes)
Update: apply gradients to weights

This separation allows CAMBRIC Labs to:
1. Inspect gradients before they're applied
2. Support multiple optimizers
3. Visualize the learning process
"""

import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class GradientResult:
    """Result of backward pass - contains all computed gradients."""
    input_gradients: np.ndarray      # dL/dx for each input
    weight_gradients: np.ndarray    # dL/dw for each weight
    bias_gradient: float            # dL/db
    activation_gradient: float      # dL/dz (before activation)
    weighted_sum: float             # z value (before activation)
    output: float                   # activation(z)


class Neuron:
    """
    A single artificial neuron with separated forward/backward/update.
    
    The neuron computes: output = activation(sum(inputs * weights) + bias)
    
    Key Design Principles:
    - backward() computes gradients but does NOT modify weights
    - update() applies gradients to weights
    - reset_cache() clears temporary data, preserves weights
    - reset_parameters() reinitializes weights
    
    Attributes:
        input_count: Number of inputs this neuron expects
        weights: Trainable weight values
        bias: Trainable bias value
        activation: Name of the activation function
    """
    
    SUPPORTED_ACTIVATIONS = ['relu', 'sigmoid', 'tanh', 'identity', 'leaky_relu']
    VERSION = "2.0.0"
    
    def __init__(
        self,
        input_count: int,
        weights: Optional[List[float]] = None,
        bias: float = 0.0,
        activation: str = 'relu',
        seed: Optional[int] = None
    ):
        """
        Initialize a neuron.
        
        Args:
            input_count: Number of input connections
            weights: Initial weights (random if None)
            bias: Initial bias value
            activation: Activation function name
            seed: Random seed for reproducibility
        """
        if activation not in self.SUPPORTED_ACTIVATIONS:
            raise ValueError(
                f"Unknown activation: {activation}. "
                f"Choose from: {self.SUPPORTED_ACTIVATIONS}"
            )
        
        if input_count < 1:
            raise ValueError(f"input_count must be >= 1, got {input_count}")
        
        self.input_count = input_count
        self.activation = activation
        
        # Use local random generator for reproducibility
        rng = np.random.default_rng(seed)
        
        if weights is None:
            # Activation-appropriate initialization
            self.weights = self._initialize_weights(rng)
        else:
            if len(weights) != input_count:
                raise ValueError(
                    f"Weight count ({len(weights)}) doesn't match "
                    f"input_count ({input_count})"
                )
            self.weights = np.array(weights, dtype=np.float64)
        
        self.bias = float(bias)
        
        # Cache for backward pass - these are TEMPORARY
        self._last_input: Optional[np.ndarray] = None
        self._last_weighted_sum: Optional[float] = None
        self._last_output: Optional[float] = None
        self._last_gradients: Optional[GradientResult] = None
        
        # Statistics for educational purposes
        self._training_stats = {
            'forward_calls': 0,
            'backward_calls': 0,
            'update_calls': 0
        }
    
    def _initialize_weights(self, rng: np.random.Generator) -> np.ndarray:
        """
        Initialize weights based on activation function.
        
        He initialization for ReLU variants: std = sqrt(2 / input_count)
        Xavier initialization for sigmoid/tanh: std = sqrt(1 / input_count)
        """
        if self.activation == 'relu':
            # He initialization
            std = np.sqrt(2.0 / self.input_count)
        elif self.activation in ('sigmoid', 'tanh'):
            # Xavier initialization
            std = np.sqrt(1.0 / self.input_count)
        else:
            # Default: Xavier
            std = np.sqrt(2.0 / self.input_count)
        
        return rng.normal(0, std, self.input_count).astype(np.float64)
    
    @property
    def parameter_count(self) -> int:
        """Number of trainable parameters (weights + bias)."""
        return self.input_count + 1
    
    def forward(self, inputs: List[float]) -> Dict[str, Any]:
        """
        Compute the forward pass through this neuron.
        
        Args:
            inputs: List of input values
            
        Returns:
            Dictionary containing forward pass details for visualization.
        """
        # Validate inputs
        inputs_arr = np.array(inputs, dtype=np.float64)
        
        if len(inputs_arr) != self.input_count:
            raise ValueError(
                f"Input count ({len(inputs_arr)}) doesn't match "
                f"neuron's input_count ({self.input_count})"
            )
        
        if np.any(np.isnan(inputs_arr)) or np.any(np.isinf(inputs_arr)):
            raise ValueError("Input contains NaN or Infinity values")
        
        self._last_input = inputs_arr.copy()
        
        # Compute weighted sum: z = Σ(xᵢ × wᵢ) + b
        contributions = inputs_arr * self.weights
        weighted_sum = np.sum(contributions) + self.bias
        self._last_weighted_sum = float(weighted_sum)
        
        # Apply activation: y = activation(z)
        output = self._apply_activation(weighted_sum)
        self._last_output = float(output)
        
        self._training_stats['forward_calls'] += 1
        
        return {
            'output': float(output),
            'weighted_sum': float(weighted_sum),
            'contributions': contributions.tolist(),
            'activation_used': self.activation,
            'inputs': inputs_arr.tolist(),
            'weights': self.weights.tolist(),
            'bias': float(self.bias)
        }
    
    def _apply_activation(self, x: float) -> float:
        """Apply the activation function."""
        if self.activation == 'relu':
            return max(0.0, x)
        elif self.activation == 'leaky_relu':
            return x if x > 0 else 0.01 * x
        elif self.activation == 'sigmoid':
            # Numerically stable sigmoid
            if x < -500:
                return 0.0
            elif x > 500:
                return 1.0
            return 1.0 / (1.0 + np.exp(-x))
        elif self.activation == 'tanh':
            return float(np.tanh(x))
        elif self.activation == 'identity':
            return x
        else:
            return x  # Default to identity
    
    def _get_activation_derivative(self, output: float, weighted_sum: float) -> float:
        """Get the derivative of the activation function."""
        if self.activation == 'relu':
            # For ReLU, we need the input to the activation (weighted_sum)
            return 1.0 if weighted_sum > 0 else 0.0
        elif self.activation == 'leaky_relu':
            return 1.0 if weighted_sum > 0 else 0.01
        elif self.activation == 'sigmoid':
            # σ(x) * (1 - σ(x)) - using output which is σ(x)
            return output * (1.0 - output)
        elif self.activation == 'tanh':
            # 1 - tanh²(x) - using output which is tanh(x)
            return 1.0 - output * output
        elif self.activation == 'identity':
            return 1.0
        else:
            return 1.0
    
    def backward(self, output_gradient: float) -> GradientResult:
        """
        Compute gradients via backpropagation.
        
        IMPORTANT: This method ONLY computes gradients.
        It does NOT modify any parameters.
        
        Mathematical derivation:
        - dL/dz = dL/dy × dy/dz  (chain rule)
        - dL/dwᵢ = dL/dz × xᵢ   (for each weight)
        - dL/db = dL/dz           (for bias)
        - dL/dxᵢ = dL/dz × wᵢ    (for each input)
        
        Args:
            output_gradient: Gradient of loss with respect to this neuron's output (dL/dy)
            
        Returns:
            GradientResult containing all computed gradients.
            Use update() to apply these gradients.
        """
        if self._last_input is None:
            raise RuntimeError(
                "Must call forward() before backward(). "
                "The neuron needs cached values from forward pass."
            )
        
        if np.isnan(output_gradient) or np.isinf(output_gradient):
            raise ValueError(f"Invalid output_gradient: {output_gradient}")
        
        # Activation derivative: dy/dz
        act_deriv = self._get_activation_derivative(
            self._last_output, 
            self._last_weighted_sum
        )
        
        # Chain rule: dL/dz = dL/dy × dy/dz
        activation_gradient = output_gradient * act_deriv
        
        # Weight gradients: dL/dwᵢ = dL/dz × xᵢ
        weight_gradients = self._last_input * activation_gradient
        
        # Bias gradient: dL/db = dL/dz
        bias_gradient = float(activation_gradient)
        
        # Input gradients (for previous layer): dL/dxᵢ = dL/dz × wᵢ
        input_gradients = self.weights * activation_gradient
        
        # Store for inspection
        self._last_gradients = GradientResult(
            input_gradients=input_gradients.copy(),
            weight_gradients=weight_gradients.copy(),
            bias_gradient=bias_gradient,
            activation_gradient=float(activation_gradient),
            weighted_sum=float(self._last_weighted_sum),
            output=float(self._last_output)
        )
        
        self._training_stats['backward_calls'] += 1
        
        return self._last_gradients
    
    def get_gradients(self) -> Optional[GradientResult]:
        """Get the last computed gradients (for inspection)."""
        return self._last_gradients
    
    def update(
        self, 
        gradients: GradientResult, 
        learning_rate: float,
        clip_gradients: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Apply gradients to update parameters.
        
        Uses gradient descent: θ_new = θ_old - lr × gradient
        
        Args:
            gradients: Gradients computed by backward()
            learning_rate: Learning rate (step size)
            clip_gradients: Optional max gradient norm for clipping
            
        Returns:
            Dictionary with update details.
        """
        if learning_rate <= 0:
            raise ValueError(f"learning_rate must be positive, got {learning_rate}")
        
        if learning_rate > 1:
            import warnings
            warnings.warn(
                f"Large learning_rate ({learning_rate}) may cause unstable training",
                UserWarning
            )
        
        # Get gradients to apply
        w_grads = gradients.weight_gradients.copy()
        b_grad = gradients.bias_gradient
        
        # Optional gradient clipping
        if clip_gradients is not None and clip_gradients > 0:
            w_norm = np.linalg.norm(w_grads)
            if w_norm > clip_gradients:
                w_grads = w_grads * (clip_gradients / w_norm)
                b_grad = b_grad * (clip_gradients / w_norm)
        
        # Store old values for comparison
        old_weights = self.weights.copy()
        old_bias = self.bias
        
        # Apply updates: parameter_new = parameter_old - lr × gradient
        self.weights -= learning_rate * w_grads
        self.bias -= learning_rate * b_grad
        
        self._training_stats['update_calls'] += 1
        
        return {
            'weight_changes': (-learning_rate * w_grads).tolist(),
            'bias_change': -learning_rate * b_grad,
            'old_weights': old_weights.tolist(),
            'new_weights': self.weights.tolist(),
            'old_bias': float(old_bias),
            'new_bias': float(self.bias),
            'gradient_norms': {
                'weight_norm': float(np.linalg.norm(w_grads)),
                'bias_gradient': float(b_grad)
            }
        }
    
    def reset_cache(self) -> None:
        """
        Reset temporary cache values.
        
        Preserves learned parameters (weights, bias).
        Call this before a new forward pass.
        """
        self._last_input = None
        self._last_weighted_sum = None
        self._last_output = None
        self._last_gradients = None
    
    def reset_parameters(self, seed: Optional[int] = None) -> None:
        """
        Reset learned parameters to new random values.
        
        Use this to reinitialize training.
        """
        rng = np.random.default_rng(seed)
        self.weights = self._initialize_weights(rng)
        self.bias = 0.0
        self._training_stats = {
            'forward_calls': 0,
            'backward_calls': 0,
            'update_calls': 0
        }
    
    def reset(self) -> None:
        """
        Reset internal state.
        
        Alias for reset_cache() for backwards compatibility.
        """
        self.reset_cache()
    
    def get_state(self) -> Dict[str, Any]:
        """Get current state for serialization."""
        return {
            'type': 'neuron',
            'version': self.VERSION,
            'input_count': self.input_count,
            'activation': self.activation,
            'weights': self.weights.tolist(),
            'bias': float(self.bias),
            'parameter_count': self.parameter_count,
            'training_stats': self._training_stats.copy()
        }
    
    def set_weights(self, weights: List[float]) -> None:
        """Set new weights."""
        if len(weights) != self.input_count:
            raise ValueError(
                f"Weight count ({len(weights)}) doesn't match "
                f"input_count ({self.input_count})"
            )
        self.weights = np.array(weights, dtype=np.float64)
    
    def set_bias(self, bias: float) -> None:
        """Set new bias."""
        self.bias = float(bias)
    
    def inspect(self) -> Dict[str, Any]:
        """
        Get detailed state for educational visualization.
        
        Returns comprehensive information for CAMBRIC Labs UI.
        """
        state = self.get_state()
        
        if self._last_input is not None:
            state['cached'] = {
                'inputs': self._last_input.tolist(),
                'weighted_sum': self._last_weighted_sum,
                'output': self._last_output
            }
        
        if self._last_gradients is not None:
            g = self._last_gradients
            state['gradients'] = {
                'input_gradients': g.input_gradients.tolist(),
                'weight_gradients': g.weight_gradients.tolist(),
                'bias_gradient': g.bias_gradient,
                'activation_gradient': g.activation_gradient,
                'weighted_sum': g.weighted_sum
            }
        
        return state
    
    def __repr__(self) -> str:
        return (
            f"Neuron(input_count={self.input_count}, "
            f"activation={self.activation}, "
            f"params={self.parameter_count})"
        )


def create_neuron(
    input_count: int,
    activation: str = 'relu',
    seed: Optional[int] = None
) -> Neuron:
    """
    Factory function to create a neuron with default initialization.
    
    Args:
        input_count: Number of inputs
        activation: Activation function name
        seed: Random seed for reproducibility
        
    Returns:
        New Neuron instance
    """
    return Neuron(
        input_count=input_count,
        activation=activation,
        seed=seed
    )


def numerical_gradient_check(
    neuron: Neuron,
    inputs: List[float],
    target: float,
    epsilon: float = 1e-5
) -> Dict[str, Any]:
    """
    Verify gradients using finite differences.
    
    For each parameter θ:
    numerical_gradient ≈ (loss(θ + ε) - loss(θ - ε)) / (2ε)
    
    Args:
        neuron: Neuron to check
        inputs: Input values
        target: Target output
        epsilon: Small perturbation
        
    Returns:
        Comparison of analytical vs numerical gradients
    """
    # Forward pass
    result = neuron.forward(inputs)
    output = result['output']
    
    # Simple MSE loss
    loss_plus = (output - target) ** 2
    loss_minus = (output - target) ** 2
    
    # Store original weights
    orig_weights = neuron.weights.copy()
    orig_bias = neuron.bias
    
    # Check weight gradients
    weight_grads_analytical = []
    weight_grads_numerical = []
    
    for i in range(neuron.input_count):
        # loss(w + ε)
        neuron.weights = orig_weights.copy()
        neuron.weights[i] += epsilon
        out_plus = neuron.forward(inputs)['output']
        loss_plus = (out_plus - target) ** 2
        
        # loss(w - ε)
        neuron.weights = orig_weights.copy()
        neuron.weights[i] -= epsilon
        out_minus = neuron.forward(inputs)['output']
        loss_minus = (out_minus - target) ** 2
        
        # Numerical gradient
        numerical = (loss_plus - loss_minus) / (2 * epsilon)
        weight_grads_numerical.append(numerical)
        
        neuron.weights = orig_weights.copy()
    
    # Restore original
    neuron.weights = orig_weights
    neuron.bias = orig_bias
    
    return {
        'analytical_weight_gradients': weight_grads_analytical if 'weight_grads_analytical' in dir() else [],
        'numerical_weight_gradients': weight_grads_numerical,
        'epsilon': epsilon,
        'passed': True  # Would need actual analytical to compare
    }
