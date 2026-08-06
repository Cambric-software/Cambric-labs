"""
Single Neuron Implementation for CAMBRIC LABS

A neuron is the fundamental unit of a neural network. It receives inputs,
multiplies each by a weight, adds them up, adds a bias, and applies an
activation function to produce an output.

Formula: output = activation(sum(inputs * weights) + bias)
"""

import numpy as np
from typing import List, Dict, Any, Optional
import random


class Neuron:
    """
    A single artificial neuron.
    
    The neuron computes a weighted sum of its inputs, adds a bias,
    and applies an activation function to produce an output.
    
    Attributes:
        input_count: Number of inputs this neuron expects
        weights: Trainable weight values
        bias: Trainable bias value
        activation: Name of the activation function
    """
    
    ACTIVATION_FUNCTIONS = {
        'relu': lambda x: np.maximum(0, x),
        'sigmoid': lambda x: 1 / (1 + np.exp(-np.clip(x, -500, 500))),
        'tanh': lambda x: np.tanh(x),
        'identity': lambda x: x,
        'softmax': lambda x: np.exp(x - np.max(x)) / np.sum(np.exp(x - np.max(x)))
    }
    
    ACTIVATION_DERIVATIVES = {
        'relu': lambda x: (x > 0).astype(float),
        'sigmoid': lambda x: x * (1 - x),
        'tanh': lambda x: 1 - x**2,
        'identity': lambda x: np.ones_like(x),
        'softmax': lambda x: x * (1 - x)  # Simplified for single value
    }
    
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
        if seed is not None:
            np.random.seed(seed)
            random.seed(seed)
        
        self.input_count = input_count
        self.activation = activation
        
        if weights is None:
            # Xavier/He initialization for better training
            std = np.sqrt(2.0 / input_count)
            self.weights = np.random.randn(input_count) * std
        else:
            self.weights = np.array(weights, dtype=np.float64)
        
        self.bias = float(bias)
        
        # Internal state for training
        self._last_input: Optional[np.ndarray] = None
        self._last_weighted_sum: Optional[float] = None
        self._last_output: Optional[float] = None
        self._last_gradient: Optional[float] = None
        
        # Validation
        if activation not in self.ACTIVATION_FUNCTIONS:
            raise ValueError(f"Unknown activation: {activation}. "
                           f"Choose from: {list(self.ACTIVATION_FUNCTIONS.keys())}")
        if len(self.weights) != input_count:
            raise ValueError(f"Weight count ({len(self.weights)}) doesn't match "
                           f"input_count ({input_count})")
    
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
            Dictionary containing:
            - output: The neuron's output
            - weighted_sum: Sum of (input * weight) + bias (before activation)
            - contributions: Individual (input * weight) for each input
            - activation_used: Name of activation function
        """
        if len(inputs) != self.input_count:
            raise ValueError(f"Input count ({len(inputs)}) doesn't match "
                           f"neuron's input_count ({self.input_count})")
        
        inputs_arr = np.array(inputs, dtype=np.float64)
        self._last_input = inputs_arr
        
        # Compute weighted sum: sum of (input_i * weight_i)
        contributions = inputs_arr * self.weights
        weighted_sum = np.sum(contributions) + self.bias
        self._last_weighted_sum = weighted_sum
        
        # Apply activation function
        act_func = self.ACTIVATION_FUNCTIONS.get(self.activation, self.ACTIVATION_FUNCTIONS['identity'])
        output = float(act_func(weighted_sum))
        self._last_output = output
        
        return {
            'output': output,
            'weighted_sum': float(weighted_sum),
            'contributions': contributions.tolist(),
            'activation_used': self.activation,
            'inputs': inputs,
            'weights': self.weights.tolist(),
            'bias': self.bias
        }
    
    def backward(
        self,
        output_gradient: float,
        learning_rate: float = 0.01
    ) -> Dict[str, Any]:
        """
        Compute backward pass and update parameters.
        
        This implements gradient descent for a single neuron.
        
        Args:
            output_gradient: Gradient of loss with respect to this neuron's output
            learning_rate: Step size for gradient descent
            
        Returns:
            Dictionary containing:
            - input_gradients: Gradients for each input
            - weight_updates: Change applied to each weight
            - bias_update: Change applied to bias
            - new_weights: Updated weights
            - new_bias: Updated bias
        """
        if self._last_input is None:
            raise RuntimeError("Must call forward() before backward()")
        
        # Get activation derivative
        if self.activation == 'sigmoid':
            derivative = self._last_output * (1 - self._last_output)
        elif self.activation == 'tanh':
            derivative = 1 - self._last_output ** 2
        elif self.activation == 'relu':
            derivative = 1.0 if self._last_weighted_sum > 0 else 0.0
        else:
            derivative = 1.0
        
        # Chain rule: gradient through activation
        activation_gradient = output_gradient * derivative
        
        # Gradient for each weight = input * activation_gradient
        weight_gradients = self._last_input * activation_gradient
        
        # Gradient for each input (passed to previous layer)
        input_gradients = self.weights * activation_gradient
        
        # Gradient for bias = activation_gradient
        bias_gradient = activation_gradient
        
        # Store gradient for inspection
        self._last_gradient = activation_gradient
        
        # Update weights and bias (gradient descent)
        old_weights = self.weights.copy()
        old_bias = self.bias
        
        self.weights -= learning_rate * weight_gradients
        self.bias -= learning_rate * bias_gradient
        
        return {
            'input_gradients': input_gradients.tolist(),
            'weight_gradients': weight_gradients.tolist(),
            'bias_gradient': float(bias_gradient),
            'weight_updates': (-learning_rate * weight_gradients).tolist(),
            'bias_update': float(-learning_rate * bias_gradient),
            'old_weights': old_weights.tolist(),
            'new_weights': self.weights.tolist(),
            'old_bias': float(old_bias),
            'new_bias': float(self.bias),
            'activation_gradient': float(activation_gradient)
        }
    
    def get_state(self) -> Dict[str, Any]:
        """Get current state of the neuron."""
        return {
            'input_count': self.input_count,
            'weights': self.weights.tolist(),
            'bias': float(self.bias),
            'activation': self.activation,
            'parameter_count': self.parameter_count,
            'last_output': self._last_output,
            'last_weighted_sum': self._last_weighted_sum,
            'last_gradient': self._last_gradient
        }
    
    def set_weights(self, weights: List[float]):
        """Set new weights."""
        if len(weights) != self.input_count:
            raise ValueError(f"Weight count ({len(weights)}) doesn't match "
                           f"input_count ({self.input_count})")
        self.weights = np.array(weights, dtype=np.float64)
    
    def set_bias(self, bias: float):
        """Set new bias."""
        self.bias = float(bias)
    
    def reset(self):
        """Reset internal state (but not weights)."""
        self._last_input = None
        self._last_weighted_sum = None
        self._last_output = None
        self._last_gradient = None
    
    def __repr__(self) -> str:
        return (f"Neuron(input_count={self.input_count}, "
                f"activation={self.activation}, "
                f"weights={[f'{w:.4f}' for w in self.weights[:3]]}...)")


def create_neuron(
    input_count: int,
    activation: str = 'relu',
    seed: Optional[int] = None
) -> Neuron:
    """Factory function to create a neuron with default initialization."""
    return Neuron(
        input_count=input_count,
        activation=activation,
        seed=seed
    )
