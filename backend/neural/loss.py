"""
Loss Functions for CAMBRIC LABS

Loss functions measure how wrong a model's predictions are.
The training process tries to minimize the loss.
"""

import numpy as np
from typing import List, Dict, Any, Callable


class LossFunctions:
    """
    Collection of loss functions for training neural networks.
    
    A loss function takes the model's predictions and the true values,
    and returns a single number representing how "wrong" the predictions are.
    """
    
    @staticmethod
    def mse(predictions: List[float], targets: List[float]) -> float:
        """
        Mean Squared Error (MSE).
        
        L = (1/n) * Σ(prediction - target)^2
        
        The most common loss for regression. Penalizes large errors more
        than small ones (squared term).
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        return float(np.mean((pred - tgt) ** 2))
    
    @staticmethod
    def mse_derivative(predictions: List[float], targets: List[float]) -> List[float]:
        """
        Derivative of MSE with respect to predictions.
        
        dL/dp = (2/n) * (prediction - target)
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        return (2 / len(pred) * (pred - tgt)).tolist()
    
    @staticmethod
    def mae(predictions: List[float], targets: List[float]) -> float:
        """
        Mean Absolute Error (MAE).
        
        L = (1/n) * Σ|prediction - target|
        
        More robust to outliers than MSE. Uses absolute value instead of square.
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        return float(np.mean(np.abs(pred - tgt)))
    
    @staticmethod
    def mae_derivative(predictions: List[float], targets: List[float]) -> List[float]:
        """
        Derivative of MAE with respect to predictions.
        
        dL/dp = sign(prediction - target) / n
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        diff = pred - tgt
        return (np.sign(diff) / len(pred)).tolist()
    
    @staticmethod
    def cross_entropy(predictions: List[float], targets: List[float]) -> float:
        """
        Cross-Entropy Loss (for binary classification).
        
        L = -Σ(target * log(prediction) + (1-target) * log(1-prediction))
        
        The go-to loss for binary classification. Provides strong gradients
        when predictions are wrong.
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        
        # Clip for numerical stability
        pred = np.clip(pred, 1e-15, 1 - 1e-15)
        
        return float(-np.mean(tgt * np.log(pred) + (1 - tgt) * np.log(1 - pred)))
    
    @staticmethod
    def cross_entropy_derivative(predictions: List[float], targets: List[float]) -> List[float]:
        """
        Derivative of cross-entropy (for binary classification with sigmoid).
        
        When combined with sigmoid activation, simplifies to:
        dL/dp = (prediction - target) / (prediction * (1 - prediction))
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        
        # Clip for numerical stability
        pred = np.clip(pred, 1e-15, 1 - 1e-15)
        
        return ((pred - tgt) / (pred * (1 - pred))).tolist()
    
    @staticmethod
    def categorical_cross_entropy(
        predictions: List[List[float]],
        targets: List[List[float]]
    ) -> float:
        """
        Categorical Cross-Entropy Loss (for multi-class classification).
        
        L = -Σ Σ target_i * log(prediction_i)
        
        Used when targets are one-hot encoded.
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        
        # Clip for numerical stability
        pred = np.clip(pred, 1e-15, 1 - 1e-15)
        
        # Sum over classes, mean over samples
        return float(-np.mean(np.sum(tgt * np.log(pred), axis=1)))
    
    @staticmethod
    def categorical_cross_entropy_derivative(
        predictions: List[List[float]],
        targets: List[List[float]]
    ) -> List[List[float]]:
        """
        Derivative of categorical cross-entropy with softmax.
        
        When combined with softmax, simplifies to: pred - target
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        return (pred - tgt).tolist()
    
    @staticmethod
    def binary_accuracy(predictions: List[float], targets: List[float], threshold: float = 0.5) -> float:
        """
        Binary classification accuracy.
        
        Returns the fraction of correct predictions (above/below threshold).
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        pred_binary = (pred >= threshold).astype(int)
        return float(np.mean(pred_binary == tgt))
    
    @staticmethod
    def categorical_accuracy(
        predictions: List[List[float]],
        targets: List[List[float]]
    ) -> float:
        """
        Multi-class classification accuracy.
        
        Returns the fraction of samples where the predicted class
        (highest probability) matches the target class.
        """
        pred = np.array(predictions, dtype=np.float64)
        tgt = np.array(targets, dtype=np.float64)
        
        pred_classes = np.argmax(pred, axis=1)
        tgt_classes = np.argmax(tgt, axis=1)
        
        return float(np.mean(pred_classes == tgt_classes))
    
    # Registry
    FUNCTIONS: Dict[str, Callable] = {
        'mse': mse,
        'mae': mae,
        'cross_entropy': cross_entropy,
        'categorical_cross_entropy': categorical_cross_entropy
    }
    
    DERIVATIVES: Dict[str, Callable] = {
        'mse': mse_derivative,
        'mae': mae_derivative,
        'cross_entropy': cross_entropy_derivative,
        'categorical_cross_entropy': categorical_cross_entropy_derivative
    }
    
    @classmethod
    def compute(cls, name: str, predictions: List[float], targets: List[float]) -> float:
        """Compute loss by name."""
        if name not in cls.FUNCTIONS:
            raise ValueError(f"Unknown loss: {name}. Choose from: {list(cls.FUNCTIONS.keys())}")
        return cls.FUNCTIONS[name](predictions, targets)
    
    @classmethod
    def compute_derivative(cls, name: str, predictions: List[float], targets: List[float]) -> List[float]:
        """Compute loss derivative by name."""
        if name not in cls.DERIVATIVES:
            raise ValueError(f"Unknown or non-differentiable loss: {name}")
        return cls.DERIVATIVES[name](predictions, targets)
    
    @classmethod
    def get_info(cls, name: str) -> Dict[str, Any]:
        """Get detailed information about a loss function."""
        info = {
            'mse': {
                'name': 'Mean Squared Error (MSE)',
                'formula': 'L = (1/n) * Σ(prediction - target)²',
                'range': '[0, ∞)',
                'best_for': 'Regression problems',
                'uses': [
                    'Price prediction',
                    'Age estimation',
                    'Any continuous value prediction'
                ],
                'pros': [
                    'Smooth gradients everywhere',
                    'Penalizes large errors heavily',
                    'Well-suited for Gaussian noise'
                ],
                'cons': [
                    'Sensitive to outliers',
                    'Can get stuck in local minima with noisy data'
                ],
                'why': 'MSE squares the errors, so large mistakes are penalized '
                       'much more than small ones. This makes sense when large '
                       'errors are particularly bad. However, it can cause issues '
                       'when data has outliers, as a single bad prediction can '
                       'dominate the loss.'
            },
            'mae': {
                'name': 'Mean Absolute Error (MAE)',
                'formula': 'L = (1/n) * Σ|prediction - target|',
                'range': '[0, ∞)',
                'best_for': 'Robust regression',
                'uses': [
                    'Forecasting with outliers',
                    'Robust regression',
                    'Anomaly detection'
                ],
                'pros': [
                    'Robust to outliers',
                    'More interpretable (same units as output)',
                    'Stable gradients'
                ],
                'cons': [
                    'Gradient is constant (not optimal near minimum)',
                    'Slower convergence'
                ],
                'why': 'MAE uses absolute values, so all errors contribute equally '
                       'regardless of size. This makes it robust to outliers—a '
                       'single huge error won\'t dominate the loss. However, the '
                       'gradient is the same everywhere, which can make fine-tuning '
                       'near the minimum difficult.'
            },
            'cross_entropy': {
                'name': 'Cross-Entropy (Binary)',
                'formula': 'L = -[target * log(pred) + (1-target) * log(1-pred)]',
                'range': '[0, ∞)',
                'best_for': 'Binary classification',
                'uses': [
                    'Spam detection',
                    'Image classification (binary)',
                    'Medical diagnosis'
                ],
                'pros': [
                    'Strong gradients when prediction is wrong',
                    'Works well with sigmoid activation',
                    'Interpretable (related to information theory)'
                ],
                'cons': [
                    'Can be unstable with wrong predictions',
                    'Requires clipping for numerical stability'
                ],
                'why': 'Cross-entropy loss is based on information theory. '
                       'When the prediction is confident and wrong, the loss is '
                       'very large (near infinity). When confident and right, '
                       'the loss is near zero. This provides a strong learning '
                       'signal, especially in the early stages of training.'
            },
            'categorical_cross_entropy': {
                'name': 'Categorical Cross-Entropy',
                'formula': 'L = -Σ Σ target_i * log(prediction_i)',
                'range': '[0, ∞)',
                'best_for': 'Multi-class classification',
                'uses': [
                    'Image classification (many classes)',
                    'Text classification',
                    'Any multi-class problem'
                ],
                'pros': [
                    'Natural for multi-class problems',
                    'Strong gradients with softmax',
                    'Outputs are valid probabilities'
                ],
                'cons': [
                    'Requires mutually exclusive classes',
                    'Can be numerically unstable'
                ],
                'why': 'Categorical cross-entropy extends binary cross-entropy to '
                       'multiple classes. It measures the difference between the '
                       'predicted probability distribution and the true distribution '
                       '(which is 1 for the correct class, 0 for others). When '
                       'combined with softmax, the gradient simplifies to prediction '
                       'minus target, making training very effective.'
            }
        }
        
        if name not in info:
            return {'name': name, 'formula': 'N/A', 'best_for': 'N/A'}
        return info[name]
    
    @classmethod
    def get_all_names(cls) -> List[str]:
        """Get list of all loss function names."""
        return list(cls.FUNCTIONS.keys())
