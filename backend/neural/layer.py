"""
Layer Implementation for CAMBRIC LABS

A layer contains multiple neurons that process inputs in parallel.
Each layer has an input dimension, output dimension (number of neurons),
and an activation function.

Architecture:
    Layer.forward() -> calls Neuron.forward() for each neuron
    Layer.backward() -> calls Neuron.backward() for each neuron (computes gradients only)
    Layer.update() -> calls Neuron.update() for each neuron (applies gradients)
"""

import numpy as np
from typing import List, Dict, Any, Optional
from .neuron import Neuron, GradientResult


class Layer:
    """
    A dense (fully-connected) layer of neurons.
    
    All neurons in a layer receive the same inputs. Each neuron has its
    own weights and bias. The layer outputs a vector of values, one per neuron.
    
    Design:
    - backward() computes gradients but does NOT update weights
    - update() applies gradients to all neurons
    """
    
    def __init__(
        self,
        name: str,
        input_dim: int,
        output_dim: int,
        activation: str = 'relu',
        seed: Optional[int] = None
    ):
        """
        Initialize a layer with multiple neurons.
        
        Args:
            name: Layer identifier
            input_dim: Number of inputs per neuron
            output_dim: Number of neurons in this layer
            activation: Activation function name
            seed: Random seed for weight initialization
        """
        self.name = name
        self.input_dim = input_dim
        self.output_dim = output_dim
        self.activation = activation
        
        # Create neurons
        self.neurons: List[Neuron] = []
        for i in range(output_dim):
            # Use seed + i for reproducible but different initializations
            neuron_seed = seed + i if seed is not None else None
            self.neurons.append(Neuron(
                input_count=input_dim,
                activation=activation,
                seed=neuron_seed
            ))
        
        # Internal state for caching
        self._last_inputs: Optional[np.ndarray] = None
        self._last_outputs: Optional[np.ndarray] = None
        self._last_gradients: Optional[List[GradientResult]] = None
    
    @property
    def parameter_count(self) -> int:
        """Total trainable parameters in this layer."""
        return sum(n.parameter_count for n in self.neurons)
    
    @property
    def weights_matrix(self) -> np.ndarray:
        """All weights as a matrix (output_dim x input_dim)."""
        return np.array([n.weights for n in self.neurons])
    
    @property
    def biases_vector(self) -> np.ndarray:
        """All biases as a vector."""
        return np.array([n.bias for n in self.neurons])
    
    def forward(self, inputs: List[float]) -> Dict[str, Any]:
        """
        Compute forward pass through all neurons in this layer.
        
        Args:
            inputs: List of input values
            
        Returns:
            Dictionary containing:
            - outputs: List of neuron outputs
            - neuron_details: Details for each neuron computation
        """
        if len(inputs) != self.input_dim:
            raise ValueError(
                f"Input dimension ({len(inputs)}) doesn't match "
                f"layer's input_dim ({self.input_dim})"
            )
        
        inputs_arr = np.array(inputs, dtype=np.float64)
        self._last_inputs = inputs_arr.copy()
        
        outputs = []
        neuron_details = []
        
        for i, neuron in enumerate(self.neurons):
            result = neuron.forward(inputs)
            outputs.append(result['output'])
            neuron_details.append({
                'neuron_index': i,
                'weighted_sum': result['weighted_sum'],
                'output': result['output'],
                'contributions': result['contributions'],
                'weights': result['weights'],
                'bias': result['bias']
            })
        
        self._last_outputs = np.array(outputs)
        
        return {
            'outputs': outputs,
            'neuron_details': neuron_details,
            'weight_matrix': self.weights_matrix.tolist(),
            'bias_vector': self.biases_vector.tolist(),
            'activation': self.activation,
            'input_dim': self.input_dim,
            'output_dim': self.output_dim
        }
    
    def backward(self, output_gradients: List[float]) -> Dict[str, Any]:
        """
        Compute gradients for all neurons.
        
        IMPORTANT: This only computes gradients, does NOT update weights.
        Call update() to apply the gradients.
        
        Args:
            output_gradients: Gradients for each neuron output (dL/dy)
            
        Returns:
            Dictionary with input gradients and gradient information
        """
        if self._last_inputs is None:
            raise RuntimeError("Must call forward() before backward()")
        
        if len(output_gradients) != self.output_dim:
            raise ValueError(
                f"Gradient count ({len(output_gradients)}) doesn't match "
                f"output_dim ({self.output_dim})"
            )
        
        input_gradients = np.zeros(self.input_dim)
        neuron_gradients = []
        
        for i, (neuron, gradient) in enumerate(zip(self.neurons, output_gradients)):
            grad_result = neuron.backward(gradient)
            
            # Accumulate input gradients for previous layer
            input_gradients += grad_result.input_gradients
            
            neuron_gradients.append({
                'neuron_index': i,
                'weight_gradients': grad_result.weight_gradients.tolist(),
                'bias_gradient': grad_result.bias_gradient,
                'input_gradients': grad_result.input_gradients.tolist(),
                'activation_gradient': grad_result.activation_gradient
            })
        
        self._last_gradients = [n.backward(g) for n, g in 
                                zip(self.neurons, output_gradients)]
        
        return {
            'input_gradients': input_gradients.tolist(),
            'neuron_gradients': neuron_gradients,
            'parameter_count': self.parameter_count
        }
    
    def compute_gradients(self, output_gradients: List[float]) -> List[GradientResult]:
        """
        Compute and return gradients for inspection.
        
        Does NOT modify any parameters.
        
        Args:
            output_gradients: Gradients for each neuron output
            
        Returns:
            List of GradientResult objects (one per neuron)
        """
        if self._last_inputs is None:
            raise RuntimeError("Must call forward() before compute_gradients()")
        
        gradients = []
        for neuron, gradient in zip(self.neurons, output_gradients):
            gradients.append(neuron.backward(gradient))
        
        return gradients
    
    def update(
        self, 
        learning_rate: float,
        clip_gradients: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Apply accumulated gradients to update parameters.
        
        Args:
            learning_rate: Learning rate for gradient descent
            clip_gradients: Optional gradient norm clip
            
        Returns:
            Dictionary with update information
        """
        if self._last_gradients is None:
            raise RuntimeError("Must call backward() before update()")
        
        weight_updates = []
        bias_updates = []
        
        for i, (neuron, grad) in enumerate(zip(self.neurons, self._last_gradients)):
            result = neuron.update(grad, learning_rate, clip_gradients)
            
            weight_updates.append({
                'neuron_index': i,
                'old_weights': result['old_weights'],
                'new_weights': result['new_weights'],
                'changes': result['weight_changes'],
                'gradient_norm': result['gradient_norms']['weight_norm']
            })
            
            bias_updates.append({
                'neuron_index': i,
                'old_bias': result['old_bias'],
                'new_bias': result['new_bias'],
                'change': result['bias_change'],
                'gradient': result['gradient_norms']['bias_gradient']
            })
        
        return {
            'weight_updates': weight_updates,
            'bias_updates': bias_updates,
            'parameters_updated': self.parameter_count,
            'learning_rate': learning_rate
        }
    
    def get_state(self) -> Dict[str, Any]:
        """Get current state of the layer."""
        return {
            'name': self.name,
            'input_dim': self.input_dim,
            'output_dim': self.output_dim,
            'activation': self.activation,
            'parameter_count': self.parameter_count,
            'neurons': [n.get_state() for n in self.neurons],
            'weights_matrix': self.weights_matrix.tolist(),
            'biases_vector': self.biases_vector.tolist()
        }
    
    def set_neuron_weights(self, neuron_index: int, weights: List[float]):
        """Set weights for a specific neuron."""
        self.neurons[neuron_index].set_weights(weights)
    
    def set_neuron_bias(self, neuron_index: int, bias: float):
        """Set bias for a specific neuron."""
        self.neurons[neuron_index].set_bias(bias)
    
    def set_weights_matrix(self, weights: List[List[float]]):
        """Set all weights as a matrix."""
        for i, row in enumerate(weights):
            self.neurons[i].set_weights(row)
    
    def set_biases_vector(self, biases: List[float]):
        """Set all biases as a vector."""
        for i, bias in enumerate(biases):
            self.neurons[i].set_bias(bias)
    
    def reset_cache(self):
        """Reset temporary cache (preserves learned parameters)."""
        self._last_inputs = None
        self._last_outputs = None
        self._last_gradients = None
        for neuron in self.neurons:
            neuron.reset_cache()
    
    def reset_parameters(self, seed: Optional[int] = None):
        """Reset all parameters to new random values."""
        for i, neuron in enumerate(self.neurons):
            neuron_seed = seed + i if seed is not None else None
            neuron.reset_parameters(neuron_seed)
    
    def reset(self):
        """Reset internal state (alias for reset_cache)."""
        self.reset_cache()
    
    def __repr__(self) -> str:
        return (
            f"Layer('{self.name}', input={self.input_dim}, "
            f"output={self.output_dim}, activation={self.activation})"
        )
