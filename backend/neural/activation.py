"""
Activation Functions for CAMBRIC LABS

This module provides various activation functions and their derivatives
for use in neural networks.
"""

import numpy as np
from typing import Dict, List, Any, Callable


class ActivationFunctions:
    """
    Collection of activation functions used in neural networks.
    
    An activation function determines the output of a neuron given its input.
    Different activation functions have different properties and use cases.
    """
    
    @staticmethod
    def relu(x: float) -> float:
        """
        Rectified Linear Unit (ReLU).
        
        f(x) = max(0, x)
        
        Most common activation for hidden layers. Simple, efficient,
        and helps with the vanishing gradient problem.
        """
        return max(0.0, float(x))
    
    @staticmethod
    def relu_derivative(x: float) -> float:
        """Derivative of ReLU: 1 if x > 0, else 0."""
        return 1.0 if x > 0 else 0.0
    
    @staticmethod
    def sigmoid(x: float) -> float:
        """
        Sigmoid function.
        
        f(x) = 1 / (1 + e^(-x))
        
        Outputs between 0 and 1. Used for binary classification.
        Can suffer from vanishing gradients in deep networks.
        """
        return 1.0 / (1.0 + np.exp(-np.clip(x, -500, 500)))
    
    @staticmethod
    def sigmoid_derivative(x: float) -> float:
        """Derivative of sigmoid: f(x) * (1 - f(x))."""
        s = ActivationFunctions.sigmoid(x)
        return s * (1 - s)
    
    @staticmethod
    def tanh(x: float) -> float:
        """
        Hyperbolic Tangent.
        
        f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
        
        Outputs between -1 and 1. Zero-centered, which can help training.
        Still susceptible to vanishing gradients.
        """
        return float(np.tanh(x))
    
    @staticmethod
    def tanh_derivative(x: float) -> float:
        """Derivative of tanh: 1 - tanh(x)^2."""
        t = ActivationFunctions.tanh(x)
        return 1.0 - t**2
    
    @staticmethod
    def identity(x: float) -> float:
        """
        Identity (linear) function.
        
        f(x) = x
        
        No transformation. Used for regression output layers.
        """
        return float(x)
    
    @staticmethod
    def identity_derivative(x: float) -> float:
        """Derivative of identity is always 1."""
        return 1.0
    
    @staticmethod
    def leaky_relu(x: float, alpha: float = 0.01) -> float:
        """
        Leaky ReLU.
        
        f(x) = x if x > 0 else alpha * x
        
        Allows small negative values, preventing "dying ReLU" problem.
        """
        return float(x) if x > 0 else alpha * float(x)
    
    @staticmethod
    def leaky_relu_derivative(x: float, alpha: float = 0.01) -> float:
        """Derivative of Leaky ReLU: 1 if x > 0, else alpha."""
        return 1.0 if x > 0 else alpha
    
    @staticmethod
    def softmax(x: List[float]) -> List[float]:
        """
        Softmax function.
        
        f(x_i) = e^(x_i) / sum(e^(x_j)) for all j
        
        Converts logits to probabilities. Used for multi-class
        classification. Output sums to 1.
        """
        x_arr = np.array(x, dtype=np.float64)
        x_shifted = x_arr - np.max(x_arr)  # Prevent overflow
        exp_x = np.exp(x_shifted)
        return (exp_x / np.sum(exp_x)).tolist()
    
    @staticmethod
    def softmax_derivative(x: List[float]) -> List[List[float]]:
        """
        Jacobian of softmax.
        
        Returns a matrix of partial derivatives.
        More complex than other activations due to interdependent outputs.
        """
        s = np.array(ActivationFunctions.softmax(x))
        return np.diag(s) - np.outer(s, s)
    
    @staticmethod
    def swish(x: float, beta: float = 1.0) -> float:
        """
        Swish activation.
        
        f(x) = x * sigmoid(beta * x)
        
        Self-gated activation that can learn better than ReLU.
        """
        return float(x) * ActivationFunctions.sigmoid(beta * x)
    
    @staticmethod
    def swish_derivative(x: float, beta: float = 1.0) -> float:
        """Derivative of Swish: sigmoid(beta*x) + beta*x*sigmoid'(beta*x)."""
        s = ActivationFunctions.sigmoid(beta * x)
        return s + beta * x * s * (1 - s)
    
    # Registry of all functions
    FUNCTIONS: Dict[str, Callable] = {
        'relu': relu,
        'sigmoid': sigmoid,
        'tanh': tanh,
        'identity': identity,
        'leaky_relu': leaky_relu,
        'softmax': softmax,
        'swish': swish
    }
    
    DERIVATIVES: Dict[str, Callable] = {
        'relu': relu_derivative,
        'sigmoid': sigmoid_derivative,
        'tanh': tanh_derivative,
        'identity': identity_derivative,
        'leaky_relu': leaky_relu_derivative,
        'swish': swish_derivative
    }
    
    @classmethod
    def get_function(cls, name: str) -> Callable:
        """Get activation function by name."""
        if name not in cls.FUNCTIONS:
            raise ValueError(f"Unknown activation: {name}. "
                           f"Choose from: {list(cls.FUNCTIONS.keys())}")
        return cls.FUNCTIONS[name]
    
    @classmethod
    def get_derivative(cls, name: str) -> Callable:
        """Get derivative function by name."""
        if name not in cls.DERIVATIVES:
            raise ValueError(f"Unknown or non-differentiable activation: {name}")
        return cls.DERIVATIVES[name]
    
    @classmethod
    def get_info(cls, name: str) -> Dict[str, Any]:
        """Get detailed information about an activation function."""
        info = {
            'relu': {
                'name': 'ReLU',
                'formula': 'f(x) = max(0, x)',
                'range': '(0, ∞)',
                'uses': [
                    'Default choice for hidden layers',
                    'Computer vision',
                    'Natural language processing',
                    'Most modern architectures'
                ],
                'pros': [
                    'Computationally efficient',
                    'Reduces vanishing gradient',
                    'Sparse activation (some neurons output 0)'
                ],
                'cons': [
                    'Dying ReLU problem (neurons can get stuck at 0)',
                    'Not zero-centered',
                    'Unbounded output'
                ],
                'why': 'ReLU was introduced to solve the vanishing gradient problem '
                       'in sigmoid and tanh. It is computationally simple (just a '
                       'threshold) yet effective. The zero output for negative inputs '
                       'creates sparse representations, which can be beneficial for '
                       'learning.'
            },
            'sigmoid': {
                'name': 'Sigmoid',
                'formula': 'f(x) = 1 / (1 + e^(-x))',
                'range': '(0, 1)',
                'uses': [
                    'Binary classification output',
                    'Gate functions in LSTMs',
                    'Probability outputs'
                ],
                'pros': [
                    'Outputs between 0 and 1 (probability-like)',
                    'Smooth gradient',
                    'Well-understood'
                ],
                'cons': [
                    'Severe vanishing gradient for large |x|',
                    'Not zero-centered',
                    'Computationally expensive (exponential)'
                ],
                'why': 'Sigmoid was historically the first widely used activation. '
                       'Its smooth S-curve and bounded output made it natural for '
                       'probabilistic interpretations. However, for deep networks, '
                       'the gradient becomes very small for extreme values, making '
                       'learning difficult.'
            },
            'tanh': {
                'name': 'Tanh',
                'formula': 'f(x) = (e^x - e^(-x)) / (e^x + e^(-x))',
                'range': '(-1, 1)',
                'uses': [
                    'Hidden layers in RNNs',
                    'Natural language processing',
                    'Sequence modeling'
                ],
                'pros': [
                    'Zero-centered output',
                    'Stronger gradients than sigmoid',
                    'Smooth gradient'
                ],
                'cons': [
                    'Still susceptible to vanishing gradient',
                    'Computationally expensive'
                ],
                'why': 'Tanh is essentially a scaled and shifted sigmoid. '
                       'Its zero-centered output (-1 to 1) often leads to '
                       'faster convergence than sigmoid (0 to 1) because the '
                       'gradients can flow in both positive and negative directions.'
            },
            'identity': {
                'name': 'Identity (Linear)',
                'formula': 'f(x) = x',
                'range': '(-∞, ∞)',
                'uses': [
                    'Regression output layer',
                    'Autoencoders (bottleneck)',
                    'Simple linear models'
                ],
                'pros': [
                    'No transformation',
                    'No vanishing gradient',
                    'Fast computation'
                ],
                'cons': [
                    'Cannot learn non-linear relationships',
                    'Limited expressiveness'
                ],
                'why': 'Identity activation is used when we want the output to '
                       'be the same as the input. It is appropriate for regression '
                       'problems where the target can be any real number. For '
                       'hidden layers, identity is only useful if the problem is '
                       'inherently linear.'
            },
            'softmax': {
                'name': 'Softmax',
                'formula': 'f(x_i) = e^(x_i) / Σ e^(x_j)',
                'range': '(0, 1), sums to 1',
                'uses': [
                    'Multi-class classification output',
                    'Neural network probability outputs',
                    'Attention mechanisms'
                ],
                'pros': [
                    'Outputs sum to 1 (valid probability distribution)',
                    'Amplifies differences between inputs',
                    'Interpretable as probabilities'
                ],
                'cons': [
                    'Requires all outputs at once (not per-neuron)',
                    'Can be numerically unstable',
                    'Not used in hidden layers'
                ],
                'why': 'Softmax converts a vector of arbitrary real numbers '
                       'into a probability distribution. The exponential amplifies '
                       'larger values, making the output more decisive. This is '
                       'essential for multi-class classification where we want '
                       'to know the probability of each class.'
            }
        }
        
        if name not in info:
            return {'name': name, 'formula': 'N/A', 'range': 'N/A'}
        return info[name]
    
    @classmethod
    def get_all_names(cls) -> List[str]:
        """Get list of all available activation function names."""
        return list(cls.FUNCTIONS.keys())
