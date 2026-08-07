"""
Numerical Gradient Checking Utility for CAMBRIC LABS

This module provides a comprehensive numerical gradient checking system
that verifies analytical gradients using finite differences.

For each parameter θ:
    numerical_gradient = (L(θ + ε) - L(θ - ε)) / (2ε)

This is the gold standard for verifying backpropagation correctness.
"""

import numpy as np
from typing import List, Dict, Any, Callable, Optional, Tuple
from backend.neural.neuron import Neuron, GradientResult
from backend.neural.layer import Layer
from backend.neural.network import Network
from backend.neural.loss import LossFunctions


# Default epsilon for finite-difference approximation
DEFAULT_EPSILON = 1e-5

# Relative tolerance for gradient comparison
DEFAULT_RTOL = 1e-3

# Absolute tolerance for gradient comparison  
DEFAULT_ATOL = 1e-6


class GradientComparisonResult:
    """Result of comparing analytical vs numerical gradients."""
    
    def __init__(
        self,
        name: str,
        analytical: float,
        numerical: float,
        diff: float,
        rel_error: float,
        passed: bool
    ):
        self.name = name
        self.analytical = analytical
        self.numerical = numerical
        self.diff = diff
        self.rel_error = rel_error
        self.passed = passed
    
    def __repr__(self) -> str:
        status = "PASS" if self.passed else "FAIL"
        return f"{self.name}: analytical={self.analytical:.6f}, numerical={self.numerical:.6f}, rel_error={self.rel_error:.6f} [{status}]"


class NumericalGradientChecker:
    """
    Numerical gradient checker using finite differences.
    
    This utility verifies that analytical gradients computed by backpropagation
    match the numerically computed finite-difference gradients.
    """
    
    def __init__(self, epsilon: float = DEFAULT_EPSILON, rtol: float = DEFAULT_RTOL, atol: float = DEFAULT_ATOL):
        """
        Initialize the gradient checker.
        
        Args:
            epsilon: Small perturbation for finite difference
            rtol: Relative tolerance for comparison
            atol: Absolute tolerance for comparison
        """
        self.epsilon = epsilon
        self.rtol = rtol
        self.atol = atol
    
    def _compute_relative_error(self, analytical: float, numerical: float) -> float:
        """Compute relative error between analytical and numerical gradients."""
        abs_error = abs(analytical - numerical)
        max_val = max(abs(analytical), abs(numerical), 1e-8)
        return abs_error / max_val
    
    def _compare_gradient(
        self,
        name: str,
        analytical: float,
        numerical: float
    ) -> GradientComparisonResult:
        """Compare analytical vs numerical gradient."""
        diff = analytical - numerical
        rel_error = self._compute_relative_error(analytical, numerical)
        
        # Check if gradients match within tolerance
        passed = (
            np.isclose(analytical, numerical, rtol=self.rtol, atol=self.atol) or
            rel_error < self.rtol
        )
        
        return GradientComparisonResult(
            name=name,
            analytical=analytical,
            numerical=numerical,
            diff=diff,
            rel_error=rel_error,
            passed=passed
        )
    
    def compute_numerical_weight_gradient(
        self,
        neuron: Neuron,
        inputs: List[float],
        target: float,
        weight_idx: int,
        loss_fn: Optional[Callable] = None
    ) -> float:
        """
        Compute numerical gradient for a specific weight.
        
        Args:
            neuron: Neuron to check
            inputs: Input values
            target: Target output
            weight_idx: Index of weight to check
            loss_fn: Loss function (default: MSE)
            
        Returns:
            Numerical gradient dL/dw[weight_idx]
        """
        if loss_fn is None:
            loss_fn = lambda pred: (pred - target) ** 2
        
        # Save original weights
        orig_weights = neuron.weights.copy()
        
        # Forward pass at original
        neuron.forward(inputs)
        loss_orig = loss_fn(neuron._last_output)
        
        # Forward pass at original + epsilon
        neuron.weights = orig_weights.copy()
        neuron.weights[weight_idx] += self.epsilon
        neuron.reset_cache()
        neuron.forward(inputs)
        loss_plus = loss_fn(neuron._last_output)
        
        # Forward pass at original - epsilon
        neuron.weights = orig_weights.copy()
        neuron.weights[weight_idx] -= self.epsilon
        neuron.reset_cache()
        neuron.forward(inputs)
        loss_minus = loss_fn(neuron._last_output)
        
        # Restore original weights
        neuron.weights = orig_weights.copy()
        neuron.reset_cache()
        
        # Compute numerical gradient
        numerical_grad = (loss_plus - loss_minus) / (2 * self.epsilon)
        
        return numerical_grad
    
    def compute_numerical_bias_gradient(
        self,
        neuron: Neuron,
        inputs: List[float],
        target: float,
        loss_fn: Optional[Callable] = None
    ) -> float:
        """
        Compute numerical gradient for bias.
        
        Args:
            neuron: Neuron to check
            inputs: Input values
            target: Target output
            loss_fn: Loss function (default: MSE)
            
        Returns:
            Numerical gradient dL/db
        """
        if loss_fn is None:
            loss_fn = lambda pred: (pred - target) ** 2
        
        # Save original bias
        orig_bias = neuron.bias
        
        # Forward pass at original + epsilon
        neuron.bias = orig_bias + self.epsilon
        neuron.reset_cache()
        neuron.forward(inputs)
        loss_plus = loss_fn(neuron._last_output)
        
        # Forward pass at original - epsilon
        neuron.bias = orig_bias - self.epsilon
        neuron.reset_cache()
        neuron.forward(inputs)
        loss_minus = loss_fn(neuron._last_output)
        
        # Restore original bias
        neuron.bias = orig_bias
        neuron.reset_cache()
        
        # Compute numerical gradient
        numerical_grad = (loss_plus - loss_minus) / (2 * self.epsilon)
        
        return numerical_grad
    
    def compute_numerical_input_gradient(
        self,
        neuron: Neuron,
        inputs: List[float],
        target: float,
        input_idx: int,
        loss_fn: Optional[Callable] = None
    ) -> float:
        """
        Compute numerical gradient for a specific input.
        
        Args:
            neuron: Neuron to check
            inputs: Input values (will be modified temporarily)
            target: Target output
            input_idx: Index of input to check
            loss_fn: Loss function (default: MSE)
            
        Returns:
            Numerical gradient dL/dx[input_idx]
        """
        if loss_fn is None:
            loss_fn = lambda pred: (pred - target) ** 2
        
        # Save original input
        orig_input = inputs[input_idx]
        
        # Forward pass at original + epsilon
        inputs[input_idx] = orig_input + self.epsilon
        neuron.reset_cache()
        neuron.forward(inputs)
        loss_plus = loss_fn(neuron._last_output)
        
        # Forward pass at original - epsilon
        inputs[input_idx] = orig_input - self.epsilon
        neuron.reset_cache()
        neuron.forward(inputs)
        loss_minus = loss_fn(neuron._last_output)
        
        # Restore original input
        inputs[input_idx] = orig_input
        neuron.reset_cache()
        
        # Compute numerical gradient
        numerical_grad = (loss_plus - loss_minus) / (2 * self.epsilon)
        
        return numerical_grad
    
    def check_neuron_gradients(
        self,
        neuron: Neuron,
        inputs: List[float],
        target: float,
        output_gradient: Optional[float] = None,
        loss_fn: Optional[Callable] = None
    ) -> List[GradientComparisonResult]:
        """
        Check all gradients for a neuron.
        
        Args:
            neuron: Neuron to check
            inputs: Input values
            target: Target output
            output_gradient: If provided, use this as dL/dy; otherwise compute from MSE
            loss_fn: Loss function for numerical computation
            
        Returns:
            List of gradient comparison results
        """
        # Perform forward pass
        neuron.forward(inputs)
        
        # Get analytical gradients
        if output_gradient is None:
            # Compute dL/dy from MSE
            output_gradient = 2 * (neuron._last_output - target)
        
        grad_result = neuron.backward(output_gradient)
        
        results = []
        
        # Check weight gradients
        for i in range(neuron.input_count):
            numerical = self.compute_numerical_weight_gradient(
                neuron, inputs, target, i, loss_fn
            )
            analytical = grad_result.weight_gradients[i]
            
            result = self._compare_gradient(
                f"weight[{i}]",
                analytical,
                numerical
            )
            results.append(result)
        
        # Check bias gradient
        numerical = self.compute_numerical_bias_gradient(
            neuron, inputs, target, loss_fn
        )
        analytical = grad_result.bias_gradient
        result = self._compare_gradient("bias", analytical, numerical)
        results.append(result)
        
        # Check input gradients
        for i in range(len(inputs)):
            numerical = self.compute_numerical_input_gradient(
                neuron, inputs.copy(), target, i, loss_fn
            )
            analytical = grad_result.input_gradients[i]
            
            result = self._compare_gradient(
                f"input[{i}]",
                analytical,
                numerical
            )
            results.append(result)
        
        return results


class LayerGradientChecker:
    """Numerical gradient checker for layers."""
    
    def __init__(self, epsilon: float = DEFAULT_EPSILON, rtol: float = DEFAULT_RTOL):
        self.epsilon = epsilon
        self.rtol = rtol
    
    def compute_numerical_layer_weight_gradient(
        self,
        layer: Layer,
        inputs: List[float],
        targets: List[float],
        neuron_idx: int,
        weight_idx: int
    ) -> float:
        """Compute numerical gradient for a layer weight."""
        orig_weights = layer.neurons[neuron_idx].weights.copy()
        
        # Forward and compute loss at original
        layer.reset_cache()
        layer.forward(inputs)
        outputs = layer._last_outputs
        loss_orig = np.sum((outputs - np.array(targets)) ** 2)
        
        # Forward at original + epsilon
        layer.neurons[neuron_idx].weights[weight_idx] = orig_weights[weight_idx] + self.epsilon
        layer.reset_cache()
        layer.forward(inputs)
        outputs = layer._last_outputs
        loss_plus = np.sum((outputs - np.array(targets)) ** 2)
        
        # Forward at original - epsilon
        layer.neurons[neuron_idx].weights[weight_idx] = orig_weights[weight_idx] - self.epsilon
        layer.reset_cache()
        layer.forward(inputs)
        outputs = layer._last_outputs
        loss_minus = np.sum((outputs - np.array(targets)) ** 2)
        
        # Restore
        layer.neurons[neuron_idx].weights = orig_weights.copy()
        layer.reset_cache()
        
        return (loss_plus - loss_minus) / (2 * self.epsilon)
    
    def compute_numerical_layer_bias_gradient(
        self,
        layer: Layer,
        inputs: List[float],
        targets: List[float],
        neuron_idx: int
    ) -> float:
        """Compute numerical gradient for a layer bias."""
        orig_bias = layer.neurons[neuron_idx].bias
        
        # Forward and compute loss at original
        layer.reset_cache()
        layer.forward(inputs)
        outputs = layer._last_outputs
        loss_orig = np.sum((outputs - np.array(targets)) ** 2)
        
        # Forward at original + epsilon
        layer.neurons[neuron_idx].bias = orig_bias + self.epsilon
        layer.reset_cache()
        layer.forward(inputs)
        outputs = layer._last_outputs
        loss_plus = np.sum((outputs - np.array(targets)) ** 2)
        
        # Forward at original - epsilon
        layer.neurons[neuron_idx].bias = orig_bias - self.epsilon
        layer.reset_cache()
        layer.forward(inputs)
        outputs = layer._last_outputs
        loss_minus = np.sum((outputs - np.array(targets)) ** 2)
        
        # Restore
        layer.neurons[neuron_idx].bias = orig_bias
        layer.reset_cache()
        
        return (loss_plus - loss_minus) / (2 * self.epsilon)


class NetworkGradientChecker:
    """Numerical gradient checker for networks."""
    
    def __init__(self, epsilon: float = DEFAULT_EPSILON, rtol: float = DEFAULT_RTOL):
        self.epsilon = epsilon
        self.rtol = rtol
    
    def compute_numerical_network_weight_gradient(
        self,
        network: Network,
        inputs: List[float],
        targets: List[float],
        layer_idx: int,
        neuron_idx: int,
        weight_idx: int
    ) -> float:
        """Compute numerical gradient for a network weight."""
        layer = network.layers[layer_idx]
        orig_weights = layer.neurons[neuron_idx].weights.copy()
        
        # Forward and compute loss at original
        network.reset_cache()
        output = network.forward(inputs)['output']
        loss_orig = np.sum((np.array(output) - np.array(targets)) ** 2)
        
        # Forward at original + epsilon
        layer.neurons[neuron_idx].weights[weight_idx] = orig_weights[weight_idx] + self.epsilon
        network.reset_cache()
        output = network.forward(inputs)['output']
        loss_plus = np.sum((np.array(output) - np.array(targets)) ** 2)
        
        # Forward at original - epsilon
        layer.neurons[neuron_idx].weights[weight_idx] = orig_weights[weight_idx] - self.epsilon
        network.reset_cache()
        output = network.forward(inputs)['output']
        loss_minus = np.sum((np.array(output) - np.array(targets)) ** 2)
        
        # Restore
        layer.neurons[neuron_idx].weights = orig_weights.copy()
        network.reset_cache()
        
        return (loss_plus - loss_minus) / (2 * self.epsilon)
    
    def compute_numerical_network_bias_gradient(
        self,
        network: Network,
        inputs: List[float],
        targets: List[float],
        layer_idx: int,
        neuron_idx: int
    ) -> float:
        """Compute numerical gradient for a network bias."""
        layer = network.layers[layer_idx]
        orig_bias = layer.neurons[neuron_idx].bias
        
        # Forward and compute loss at original
        network.reset_cache()
        output = network.forward(inputs)['output']
        loss_orig = np.sum((np.array(output) - np.array(targets)) ** 2)
        
        # Forward at original + epsilon
        layer.neurons[neuron_idx].bias = orig_bias + self.epsilon
        network.reset_cache()
        output = network.forward(inputs)['output']
        loss_plus = np.sum((np.array(output) - np.array(targets)) ** 2)
        
        # Forward at original - epsilon
        layer.neurons[neuron_idx].bias = orig_bias - self.epsilon
        network.reset_cache()
        output = network.forward(inputs)['output']
        loss_minus = np.sum((np.array(output) - np.array(targets)) ** 2)
        
        # Restore
        layer.neurons[neuron_idx].bias = orig_bias
        network.reset_cache()
        
        return (loss_plus - loss_minus) / (2 * self.epsilon)


def verify_duplicate_backward_bug() -> Tuple[bool, str]:
    """
    Verify that the duplicate backward bug has not returned.
    
    One Layer.backward() should call exactly one Neuron.backward() per neuron.
    
    Returns:
        (passed, message)
    """
    layer = Layer(name="test", input_dim=2, output_dim=3, activation='identity')
    
    # Record initial backward call counts
    initial_calls = [n._training_stats['backward_calls'] for n in layer.neurons]
    
    # Perform one forward and backward
    layer.forward([1.0, 2.0])
    layer.backward([1.0, 1.0, 1.0])
    
    # Check that each neuron was called exactly once
    after_calls = [n._training_stats['backward_calls'] for n in layer.neurons]
    increments = [after - before for after, before in zip(after_calls, initial_calls)]
    
    expected = [1, 1, 1]
    if increments == expected:
        return True, f"Duplicate backward bug check passed. Increments: {increments}"
    else:
        return False, f"Duplicate backward bug detected! Increments: {increments}, expected: {expected}"


def verify_backward_no_update() -> Tuple[bool, str]:
    """
    Verify that backward() does not modify parameters.
    
    Returns:
        (passed, message)
    """
    neuron = Neuron(
        input_count=2,
        weights=[1.0, 1.0],
        bias=0.5,
        activation='identity'
    )
    
    # Save original parameters
    orig_weights = neuron.weights.copy()
    orig_bias = neuron.bias
    
    # Forward and backward
    neuron.forward([1.0, 2.0])
    neuron.backward(1.0)
    
    # Check parameters unchanged
    weights_changed = not np.allclose(neuron.weights, orig_weights)
    bias_changed = neuron.bias != orig_bias
    
    if not weights_changed and not bias_changed:
        return True, "backward() correctly does not modify parameters"
    else:
        msg = []
        if weights_changed:
            msg.append(f"weights changed from {orig_weights} to {neuron.weights}")
        if bias_changed:
            msg.append(f"bias changed from {orig_bias} to {neuron.bias}")
        return False, f"backward() incorrectly modified parameters: {', '.join(msg)}"


def verify_update_formula() -> Tuple[bool, str]:
    """
    Verify that update() uses the correct formula: θ_new = θ_old - lr × gradient.
    
    Returns:
        (passed, message)
    """
    neuron = Neuron(
        input_count=2,
        weights=[1.0, 1.0],
        bias=0.5,
        activation='identity'
    )
    
    # Forward and backward
    neuron.forward([1.0, 2.0])
    grad_result = neuron.backward(1.0)
    
    # Save original
    orig_weights = neuron.weights.copy()
    orig_bias = neuron.bias
    
    # Apply update
    lr = 0.1
    neuron.update(grad_result, lr)
    
    # Compute expected
    expected_weights = orig_weights - lr * grad_result.weight_gradients
    expected_bias = orig_bias - lr * grad_result.bias_gradient
    
    weights_ok = np.allclose(neuron.weights, expected_weights)
    bias_ok = np.isclose(neuron.bias, expected_bias)
    
    if weights_ok and bias_ok:
        return True, "update() correctly uses θ_new = θ_old - lr × gradient"
    else:
        return False, f"update() formula incorrect. Weights: {neuron.weights} vs expected {expected_weights}, Bias: {neuron.bias} vs expected {expected_bias}"


def verify_loss_gradient_numerical(
    loss_name: str,
    predictions: List[float],
    targets: List[float]
) -> Tuple[bool, float]:
    """
    Numerically verify loss function gradients.
    
    Args:
        loss_name: Name of loss function
        predictions: Predicted values
        targets: Target values
        
    Returns:
        (passed, max_relative_error)
    """
    epsilon = 1e-5
    
    # Compute analytical gradient
    analytical_grads = LossFunctions.compute_derivative(loss_name, predictions, targets)
    analytical_grads = np.array(analytical_grads)
    
    # Compute numerical gradients
    numerical_grads = []
    for i in range(len(predictions)):
        # L(p + ε)
        pred_plus = predictions.copy()
        pred_plus[i] += epsilon
        loss_plus = LossFunctions.compute(loss_name, pred_plus, targets)
        
        # L(p - ε)
        pred_minus = predictions.copy()
        pred_minus[i] -= epsilon
        loss_minus = LossFunctions.compute(loss_name, pred_minus, targets)
        
        # Numerical gradient
        numerical = (loss_plus - loss_minus) / (2 * epsilon)
        numerical_grads.append(numerical)
    
    numerical_grads = np.array(numerical_grads)
    
    # Compute max relative error
    abs_diff = np.abs(analytical_grads - numerical_grads)
    max_val = np.maximum(np.abs(analytical_grads), np.abs(numerical_grads))
    max_val = np.maximum(max_val, 1e-8)  # Avoid division by zero
    rel_errors = abs_diff / max_val
    max_rel_error = np.max(rel_errors)
    
    passed = max_rel_error < 1e-3
    
    return passed, max_rel_error
