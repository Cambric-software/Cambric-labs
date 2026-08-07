"""
Network Implementation for CAMBRIC LABS

A network is a collection of layers connected sequentially.
Data flows from input layer through hidden layers to output layer.

Architecture:
    Network.forward() -> Layer.forward() -> Neuron.forward()
    Network.backward() -> Layer.backward() -> Neuron.backward() (computes gradients)
    Network.update() -> Layer.update() -> Neuron.update() (applies gradients)

This separation allows inspection of gradients before they're applied.
"""

import numpy as np
from typing import List, Dict, Any, Optional
from .layer import Layer


class Network:
    """
    A neural network composed of sequential layers.
    
    The network takes an input vector, passes it through each layer
    in sequence, and produces an output vector.
    
    Design:
    - backward() computes gradients but does NOT update weights
    - update() applies gradients to all layers
    - compute_gradients() allows inspection without modification
    """
    
    def __init__(
        self,
        name: str = "Network",
        layers: Optional[List[Layer]] = None,
        loss_function: str = 'mse'
    ):
        """
        Initialize a neural network.
        
        Args:
            name: Network identifier
            layers: List of layers (empty if None)
            loss_function: Loss function name
        """
        self.name = name
        self.layers: List[Layer] = layers if layers is not None else []
        self.loss_function = loss_function
        
        # Training history
        self.history: List[Dict[str, Any]] = []
        
        # Current state
        self._last_inputs: Optional[np.ndarray] = None
        self._layer_outputs: List[np.ndarray] = []
        self._current_prediction: Optional[List[float]] = None
    
    @property
    def input_dim(self) -> int:
        """Input dimension (from first layer)."""
        return self.layers[0].input_dim if self.layers else 0
    
    @property
    def output_dim(self) -> int:
        """Output dimension (from last layer)."""
        return self.layers[-1].output_dim if self.layers else 0
    
    @property
    def total_parameters(self) -> int:
        """Total trainable parameters in the network."""
        return sum(layer.parameter_count for layer in self.layers)
    
    def add_layer(self, layer: Layer) -> None:
        """Add a layer to the network."""
        self.layers.append(layer)
    
    def insert_layer(self, index: int, layer: Layer) -> None:
        """Insert a layer at a specific position."""
        self.layers.insert(index, layer)
    
    def remove_layer(self, index: int) -> Layer:
        """Remove and return a layer."""
        return self.layers.pop(index)
    
    def forward(self, inputs: List[float]) -> Dict[str, Any]:
        """
        Compute forward pass through all layers.
        
        Args:
            inputs: Input vector
            
        Returns:
            Dictionary containing:
            - output: Final network output
            - layer_outputs: Output of each layer
            - all_activations: Detailed activations per layer
        """
        self._last_inputs = np.array(inputs, dtype=np.float64)
        current_input = inputs
        layer_outputs = []
        all_activations = []
        
        for i, layer in enumerate(self.layers):
            result = layer.forward(current_input)
            layer_outputs.append(result['outputs'])
            all_activations.append({
                'layer_index': i,
                'layer_name': layer.name,
                'inputs': current_input,
                'outputs': result['outputs'],
                'weight_matrix': result['weight_matrix'],
                'bias_vector': result['bias_vector'],
                'activation': result['activation']
            })
            current_input = result['outputs']
        
        self._layer_outputs = [np.array(out) for out in layer_outputs]
        self._current_prediction = current_input
        
        return {
            'output': current_input,
            'layer_outputs': layer_outputs,
            'all_activations': all_activations,
            'input_dim': self.input_dim,
            'output_dim': self.output_dim,
            'total_parameters': self.total_parameters
        }
    
    def backward(self, loss_gradient: List[float]) -> Dict[str, Any]:
        """
        Compute gradients for all layers.
        
        IMPORTANT: This only computes gradients, does NOT update weights.
        Call update() to apply the gradients.
        
        Args:
            loss_gradient: Gradient of loss with respect to output (dL/dy)
            
        Returns:
            Dictionary with gradients for inspection
        """
        if not self._layer_outputs:
            raise RuntimeError("Must call forward() before backward()")
        
        # Start with output gradients
        current_gradients = np.array(loss_gradient, dtype=np.float64)
        layer_gradients = []
        
        # Propagate backwards through layers
        for i in reversed(range(len(self.layers))):
            layer = self.layers[i]
            result = layer.backward(current_gradients.tolist())
            
            layer_gradients.append({
                'layer_index': i,
                'layer_name': layer.name,
                'input_gradients': result['input_gradients'],
                'neuron_gradients': result['neuron_gradients']
            })
            
            # Pass gradients to previous layer
            current_gradients = np.array(result['input_gradients'])
        
        layer_gradients.reverse()
        
        return {
            'layer_gradients': layer_gradients,
            'parameter_count': self.total_parameters
        }
    
    def compute_gradients(self, loss_gradient: List[float]) -> Dict[str, Any]:
        """
        Compute gradients for inspection (does not modify any parameters).
        
        This is useful for educational visualization where you want to
        show gradients without actually updating the network.
        
        Args:
            loss_gradient: Gradient of loss with respect to output
            
        Returns:
            Dictionary with gradient information
        """
        return self.backward(loss_gradient)
    
    def update(
        self, 
        learning_rate: float,
        clip_gradients: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Apply accumulated gradients to update all layers.
        
        Args:
            learning_rate: Learning rate for gradient descent
            clip_gradients: Optional gradient norm clipping
            
        Returns:
            Dictionary with update information
        """
        layer_updates = []
        
        for i, layer in enumerate(self.layers):
            result = layer.update(learning_rate, clip_gradients)
            layer_updates.append({
                'layer_index': i,
                'layer_name': layer.name,
                'weight_updates': result['weight_updates'],
                'bias_updates': result['bias_updates'],
                'learning_rate': result['learning_rate']
            })
        
        return {
            'layer_updates': layer_updates,
            'parameters_updated': self.total_parameters,
            'learning_rate': learning_rate
        }
    
    def train_step(
        self,
        loss_gradient: List[float],
        learning_rate: float,
        clip_gradients: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Perform one complete training step (backward + update).
        
        This is a convenience method that combines backward() and update().
        Use backward() + update() separately if you need to inspect
        gradients before applying them.
        
        Args:
            loss_gradient: Gradient of loss with respect to output
            learning_rate: Learning rate
            clip_gradients: Optional gradient clipping
            
        Returns:
            Dictionary with gradient and update information
        """
        gradient_result = self.backward(loss_gradient)
        update_result = self.update(learning_rate, clip_gradients)
        
        return {
            'gradients': gradient_result,
            'updates': update_result
        }
    
    def get_state(self) -> Dict[str, Any]:
        """Get complete state of the network."""
        return {
            'name': self.name,
            'input_dim': self.input_dim,
            'output_dim': self.output_dim,
            'total_parameters': self.total_parameters,
            'layer_count': len(self.layers),
            'layers': [layer.get_state() for layer in self.layers],
            'loss_function': self.loss_function
        }
    
    def get_architecture(self) -> List[Dict[str, Any]]:
        """Get architecture summary."""
        return [
            {
                'index': i,
                'name': layer.name,
                'input_dim': layer.input_dim,
                'output_dim': layer.output_dim,
                'activation': layer.activation,
                'parameters': layer.parameter_count
            }
            for i, layer in enumerate(self.layers)
        ]
    
    def set_layer_activation(self, layer_index: int, activation: str):
        """Change activation function of a layer."""
        if layer_index < 0 or layer_index >= len(self.layers):
            raise IndexError(f"Layer index {layer_index} out of range")
        self.layers[layer_index].activation = activation
        for neuron in self.layers[layer_index].neurons:
            neuron.activation = activation
    
    def reset_cache(self):
        """Reset temporary cache (preserves learned parameters)."""
        for layer in self.layers:
            layer.reset_cache()
        self._layer_outputs = []
        self._current_prediction = None
    
    def reset_parameters(self, seed: Optional[int] = None):
        """Reset all parameters to new random values."""
        for i, layer in enumerate(self.layers):
            layer_seed = seed + i if seed is not None else None
            layer.reset_parameters(layer_seed)
    
    def reset(self):
        """Reset internal state (alias for reset_cache)."""
        self.reset_cache()
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize network to dictionary."""
        return {
            'name': self.name,
            'layers': [
                {
                    'name': layer.name,
                    'input_dim': layer.input_dim,
                    'output_dim': layer.output_dim,
                    'activation': layer.activation,
                    'weights': layer.weights_matrix.tolist(),
                    'biases': layer.biases_vector.tolist()
                }
                for layer in self.layers
            ],
            'loss_function': self.loss_function
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Network':
        """Deserialize network from dictionary."""
        network = cls(name=data['name'], loss_function=data.get('loss_function', 'mse'))
        
        for layer_data in data['layers']:
            layer = Layer(
                name=layer_data['name'],
                input_dim=layer_data['input_dim'],
                output_dim=layer_data['output_dim'],
                activation=layer_data['activation']
            )
            layer.set_weights_matrix(layer_data['weights'])
            layer.set_biases_vector(layer_data['biases'])
            network.add_layer(layer)
        
        return network
    
    def __repr__(self) -> str:
        arch = " -> ".join(f"{l.output_dim}" for l in self.layers)
        return f"Network('{self.name}', {self.input_dim} -> {arch}, params={self.total_parameters})"


def create_simple_network(
    input_dim: int,
    hidden_dims: List[int],
    output_dim: int,
    activation: str = 'relu',
    seed: Optional[int] = None
) -> Network:
    """Factory to create a simple multi-layer network."""
    network = Network(name="MLP")
    
    prev_dim = input_dim
    for i, hidden_dim in enumerate(hidden_dims):
        layer = Layer(
            name=f"hidden_{i+1}",
            input_dim=prev_dim,
            output_dim=hidden_dim,
            activation=activation,
            seed=seed + i if seed else None
        )
        network.add_layer(layer)
        prev_dim = hidden_dim
    
    # Output layer (identity for regression)
    output_layer = Layer(
        name="output",
        input_dim=prev_dim,
        output_dim=output_dim,
        activation='identity',
        seed=seed + len(hidden_dims) if seed else None
    )
    network.add_layer(output_layer)
    
    return network
