"""
Layer Implementation for CAMBRIC LABS

A layer contains multiple neurons that process inputs in parallel.
Each layer has an input dimension, output dimension (number of neurons),
and an activation function.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from .neuron import Neuron


class Layer:
    """
    A dense (fully-connected) layer of neurons.
    
    All neurons in a layer receive the same inputs. Each neuron has its
    own weights and bias. The layer outputs a vector of values, one per neuron.
    
    Attributes:
        name: Identifier for this layer
        input_dim: Number of inputs to each neuron
        output_dim: Number of neurons (and outputs)
        activation: Activation function applied to all neurons
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
        
        if seed is not None:
            np.random.seed(seed)
        
        # Create neurons
        self.neurons: List[Neuron] = []
        for i in range(output_dim):
            neuron_seed = seed + i if seed is not None else None
            self.neurons.append(Neuron(
                input_count=input_dim,
                activation=activation,
                seed=neuron_seed
            ))
        
        # Internal state
        self._last_inputs: Optional[np.ndarray] = None
        self._last_outputs: Optional[np.ndarray] = None
    
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
            - weight_matrix: Current weights
            - bias_vector: Current biases
        """
        if len(inputs) != self.input_dim:
            raise ValueError(f"Input dimension ({len(inputs)}) doesn't match "
                           f"layer's input_dim ({self.input_dim})")
        
        inputs_arr = np.array(inputs, dtype=np.float64)
        self._last_inputs = inputs_arr
        
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
    
    def backward(
        self,
        output_gradients: List[float],
        learning_rate: float = 0.01
    ) -> Dict[str, Any]:
        """
        Compute backward pass and update parameters.
        
        Args:
            output_gradients: Gradients for each neuron output
            learning_rate: Learning rate for gradient descent
            
        Returns:
            Dictionary with input gradients and weight updates
        """
        if self._last_inputs is None:
            raise RuntimeError("Must call forward() before backward()")
        
        if len(output_gradients) != self.output_dim:
            raise ValueError(f"Gradient count ({len(output_gradients)}) doesn't match "
                           f"output_dim ({self.output_dim})")
        
        input_gradients = np.zeros(self.input_dim)
        weight_updates_list = []
        bias_updates_list = []
        
        for i, (neuron, gradient) in enumerate(zip(self.neurons, output_gradients)):
            result = neuron.backward(gradient, learning_rate)
            input_gradients += np.array(result['input_gradients'])
            weight_updates_list.append({
                'neuron_index': i,
                'old_weights': result['old_weights'],
                'new_weights': result['new_weights'],
                'updates': result['weight_updates'],
                'gradient': result['weight_gradients']
            })
            bias_updates_list.append({
                'neuron_index': i,
                'old_bias': result['old_bias'],
                'new_bias': result['new_bias'],
                'update': result['bias_update'],
                'gradient': result['bias_gradient']
            })
        
        return {
            'input_gradients': input_gradients.tolist(),
            'weight_updates': weight_updates_list,
            'bias_updates': bias_updates_list,
            'total_parameters_updated': self.parameter_count
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
    
    def reset(self):
        """Reset internal state."""
        self._last_inputs = None
        self._last_outputs = None
        for neuron in self.neurons:
            neuron.reset()
    
    def __repr__(self) -> str:
        return (f"Layer('{self.name}', input={self.input_dim}, "
                f"output={self.output_dim}, activation={self.activation})")
