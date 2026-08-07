"""
Backpropagation Implementation for CAMBRIC LABS

Backpropagation is the algorithm used to train neural networks.
It computes gradients of the loss with respect to each weight
by propagating the error backwards through the network.

Key Design:
- backward() computes gradients only
- update() applies gradients
- This separation allows gradient inspection before updating
"""

import numpy as np
from typing import List, Dict, Any, Optional
from neural.network import Network
from neural.loss import LossFunctions


class Backpropagation:
    """
    Implementation of the backpropagation algorithm.
    
    Backpropagation consists of two passes:
    1. Forward pass: Compute predictions and loss
    2. Backward pass: Compute gradients
    3. Update: Apply gradients to parameters
    
    The algorithm uses the chain rule of calculus to efficiently
    compute how much each parameter contributed to the error.
    """
    
    def __init__(self, network: Network, loss_function: str = 'mse'):
        """
        Initialize backpropagation for a network.
        
        Args:
            network: The neural network to train
            loss_function: Loss function name
        """
        self.network = network
        self.loss_function = loss_function
    
    def train_step(
        self,
        inputs: List[float],
        targets: List[float],
        learning_rate: float = 0.01,
        clip_gradients: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Perform one training step (forward + backward + update).
        
        Args:
            inputs: Input values
            targets: Target (expected) output values
            learning_rate: Step size for gradient descent
            clip_gradients: Optional gradient norm clipping
            
        Returns:
            Dictionary containing:
            - prediction: Network output
            - loss: Loss value
            - gradients: Gradients for all parameters
            - updates: Weight changes for all parameters
        """
        # Forward pass
        forward_result = self.network.forward(inputs)
        prediction = forward_result['output']
        
        # Compute loss
        loss = LossFunctions.compute(self.loss_function, prediction, targets)
        
        # Compute loss gradient with respect to output
        loss_gradient = LossFunctions.compute_derivative(
            self.loss_function, prediction, targets
        )
        
        # Backward pass (computes gradients only)
        gradient_result = self.network.backward(loss_gradient)
        
        # Update (applies gradients)
        update_result = self.network.update(learning_rate, clip_gradients)
        
        return {
            'cycle': 1,
            'inputs': inputs,
            'targets': targets,
            'prediction': prediction,
            'loss': loss,
            'loss_gradient': loss_gradient,
            'layer_gradients': gradient_result['layer_gradients'],
            'layer_updates': update_result['layer_updates'],
            'total_parameters_updated': update_result['parameters_updated'],
            'learning_rate': learning_rate,
            'architecture': self.network.get_architecture()
        }
    
    def compute_gradients(
        self,
        inputs: List[float],
        targets: List[float]
    ) -> Dict[str, Any]:
        """
        Compute gradients without updating weights (for analysis).
        
        This allows CAMBRIC Labs to inspect gradients before
        they're applied to the network.
        
        Args:
            inputs: Input values
            targets: Target output values
            
        Returns:
            Dictionary with gradient information
        """
        # Forward pass
        forward_result = self.network.forward(inputs)
        prediction = forward_result['output']
        
        # Loss
        loss = LossFunctions.compute(self.loss_function, prediction, targets)
        
        # Loss gradient
        loss_gradient = LossFunctions.compute_derivative(
            self.loss_function, prediction, targets
        )
        
        # Backward pass (computes gradients only, no updates)
        gradient_result = self.network.compute_gradients(loss_gradient)
        
        return {
            'inputs': inputs,
            'targets': targets,
            'prediction': prediction,
            'loss': loss,
            'loss_gradient': loss_gradient,
            'layer_gradients': gradient_result['layer_gradients']
        }
    
    def explain_gradient_flow(
        self,
        inputs: List[float],
        targets: List[float]
    ) -> Dict[str, Any]:
        """
        Explain how gradients flow through the network.
        
        This is an educational function that shows exactly how
        the error signal propagates backward through each layer.
        
        Args:
            inputs: Input values
            targets: Target output values
            
        Returns:
            Step-by-step explanation of gradient flow
        """
        # Forward pass
        forward_result = self.network.forward(inputs)
        prediction = forward_result['output']
        
        # Compute initial loss
        loss = LossFunctions.compute(self.loss_function, prediction, targets)
        
        # Step-by-step gradient explanation
        steps = []
        
        # Step 1: Loss calculation
        steps.append({
            'step': 1,
            'description': 'Loss Calculation',
            'detail': f"Loss = {self.loss_function.upper()}({prediction}, {targets}) = {loss:.6f}",
            'visual': f"LOSS = {loss:.6f}"
        })
        
        # Step 2: Loss gradient at output
        loss_gradient = LossFunctions.compute_derivative(
            self.loss_function, prediction, targets
        )
        steps.append({
            'step': 2,
            'description': 'Loss Gradient (∂L/∂output)',
            'detail': f"Gradient = {loss_gradient}",
            'visual': f"∇L = {loss_gradient}"
        })
        
        # Step 3: Propagate through each layer
        for i, layer in enumerate(reversed(self.network.layers)):
            layer_idx = len(self.network.layers) - 1 - i
            
            # Get activations
            if layer.activation == 'relu':
                act_deriv = "∂ReLU/∂x = 1 if x > 0"
            elif layer.activation == 'sigmoid':
                act_deriv = "∂σ/∂x = σ(x)(1-σ(x))"
            elif layer.activation == 'tanh':
                act_deriv = "∂tanh/∂x = 1 - tanh²(x)"
            else:
                act_deriv = "∂f/∂x = 1"
            
            steps.append({
                'step': 3 + i,
                'description': f"Layer '{layer.name}' Backprop",
                'detail': f"Activation: {layer.activation} | {act_deriv}",
                'layer_index': layer_idx,
                'layer_name': layer.name,
                'visual': f"Layer {layer_idx}: {layer.activation}"
            })
        
        return {
            'explanation': steps,
            'final_loss': loss,
            'network_architecture': self.network.get_architecture()
        }
