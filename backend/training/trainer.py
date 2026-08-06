"""
Trainer Implementation for CAMBRIC LABS

The Trainer orchestrates the training process, managing epochs,
batches, and tracking training history.
"""

import numpy as np
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
import time
from neural.network import Network
from neural.loss import LossFunctions
from .backpropagation import Backpropagation


class TrainingSnapshot:
    """Snapshot of training state at a specific point."""
    
    def __init__(self, cycle: int, loss: float, metrics: Dict[str, float]):
        self.cycle = cycle
        self.loss = loss
        self.metrics = metrics
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'cycle': self.cycle,
            'loss': self.loss,
            'metrics': self.metrics,
            'timestamp': self.timestamp
        }


class Trainer:
    """
    Training orchestrator for neural networks.
    
    The trainer manages the training loop, including:
    - Epochs and cycles
    - Batching
    - Learning rate scheduling
    - Early stopping
    - History tracking
    """
    
    def __init__(
        self,
        network: Network,
        loss_function: str = 'mse',
        learning_rate: float = 0.01,
        batch_size: int = 1,
        shuffle: bool = True
    ):
        """
        Initialize the trainer.
        
        Args:
            network: Network to train
            loss_function: Loss function name
            learning_rate: Learning rate for gradient descent
            batch_size: Number of samples per batch
            shuffle: Whether to shuffle data each epoch
        """
        self.network = network
        self.loss_function = loss_function
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.shuffle = shuffle
        
        self.backprop = Backpropagation(network, loss_function)
        
        # Training state
        self.current_cycle = 0
        self.is_training = False
        self.should_stop = False
        self.should_pause = False
        
        # History
        self.history: List[TrainingSnapshot] = []
        
        # Callbacks
        self.on_cycle_complete: Optional[Callable] = None
        self.on_epoch_complete: Optional[Callable] = None
        self.on_training_complete: Optional[Callable] = None
    
    def single_cycle(
        self,
        inputs: List[float],
        targets: List[float],
        learning_rate: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Perform exactly one training cycle (forward + backward).
        
        This is the core educational function - one click, one cycle.
        
        Args:
            inputs: Input values
            targets: Target values
            learning_rate: Override default learning rate
            
        Returns:
            Complete cycle information including:
            - Before/after weights
            - Gradients
            - Loss
            - Changes
        """
        lr = learning_rate if learning_rate is not None else self.learning_rate
        
        # Get current state before training
        state_before = self.network.get_state()
        
        # Perform training step
        result = self.backprop.train_step(inputs, targets, lr)
        
        # Get state after training
        state_after = self.network.get_state()
        
        # Compute weight changes
        weight_changes = self._compute_weight_changes(state_before, state_after)
        
        self.current_cycle += 1
        
        # Create snapshot
        snapshot = TrainingSnapshot(
            cycle=self.current_cycle,
            loss=result['loss'],
            metrics={'accuracy': self._compute_accuracy_estimate(result['prediction'], targets)}
        )
        self.history.append(snapshot.to_dict())
        
        return {
            'cycle': self.current_cycle,
            'inputs': inputs,
            'targets': targets,
            'prediction': result['prediction'],
            'expected': targets,
            'loss': result['loss'],
            'loss_gradient': result['loss_gradient'],
            'state_before': state_before,
            'state_after': state_after,
            'weight_changes': weight_changes,
            'layer_gradients': result['layer_gradients'],
            'layer_updates': result['layer_updates'],
            'learning_rate': lr,
            'accuracy': snapshot.metrics['accuracy']
        }
    
    def train(
        self,
        X: List[List[float]],
        y: List[List[float]],
        cycles: int = 100,
        validation_split: float = 0.0,
        X_val: Optional[List[List[float]]] = None,
        y_val: Optional[List[List[float]]] = None,
        early_stopping_patience: int = 0,
        verbose: bool = True
    ) -> Dict[str, Any]:
        """
        Train the network for multiple cycles.
        
        Args:
            X: Training inputs
            y: Training targets
            cycles: Number of training cycles
            validation_split: Fraction of data for validation
            X_val: Explicit validation inputs (overrides split)
            y_val: Explicit validation targets
            early_stopping_patience: Stop if no improvement for N epochs
            verbose: Print progress
            
        Returns:
            Training results and history
        """
        self.is_training = True
        self.should_stop = False
        self.should_pause = False
        
        start_time = time.time()
        
        # Prepare data
        if validation_split > 0 and X_val is None:
            split_idx = int(len(X) * (1 - validation_split))
            X_train, X_val = X[:split_idx], X[split_idx:]
            y_train, y_val = y[:split_idx], y[split_idx:]
        else:
            X_train, y_train = X, y
        
        # History tracking
        train_losses = []
        val_losses = []
        train_accuracies = []
        val_accuracies = []
        
        # Early stopping
        best_val_loss = float('inf')
        patience_counter = 0
        
        try:
            for cycle in range(cycles):
                if self.should_stop:
                    break
                
                # Pause handling
                while self.should_pause and not self.should_stop:
                    time.sleep(0.1)
                
                # Shuffle training data
                if self.shuffle:
                    indices = np.random.permutation(len(X_train))
                    X_train_shuffled = [X_train[i] for i in indices]
                    y_train_shuffled = [y_train[i] for i in indices]
                else:
                    X_train_shuffled, y_train_shuffled = X_train, y_train
                
                # Train on batches
                epoch_loss = 0
                epoch_correct = 0
                epoch_total = 0
                
                for i in range(0, len(X_train_shuffled), self.batch_size):
                    batch_X = X_train_shuffled[i:i + self.batch_size]
                    batch_y = y_train_shuffled[i:i + self.batch_size]
                    
                    for inputs, targets in zip(batch_X, batch_y):
                        result = self.single_cycle(inputs, targets)
                        epoch_loss += result['loss']
                        
                        # Simple accuracy estimate
                        pred_class = np.argmax(result['prediction'])
                        tgt_class = np.argmax(targets) if len(targets) > 1 else int(targets[0] > 0.5)
                        if pred_class == tgt_class:
                            epoch_correct += 1
                        epoch_total += 1
                
                # Compute epoch metrics
                avg_train_loss = epoch_loss / epoch_total
                train_accuracy = epoch_correct / epoch_total if epoch_total > 0 else 0
                
                train_losses.append(avg_train_loss)
                train_accuracies.append(train_accuracy)
                
                # Validation
                if X_val is not None and y_val is not None:
                    val_loss = self._compute_validation_loss(X_val, y_val)
                    val_acc = self._compute_validation_accuracy(X_val, y_val)
                    val_losses.append(val_loss)
                    val_accuracies.append(val_acc)
                    
                    # Early stopping check
                    if early_stopping_patience > 0:
                        if val_loss < best_val_loss:
                            best_val_loss = val_loss
                            patience_counter = 0
                        else:
                            patience_counter += 1
                            if patience_counter >= early_stopping_patience:
                                if verbose:
                                    print(f"Early stopping at cycle {cycle + 1}")
                                break
                
                # Progress callback
                if self.on_cycle_complete:
                    self.on_cycle_complete({
                        'cycle': cycle + 1,
                        'total_cycles': cycles,
                        'train_loss': avg_train_loss,
                        'train_accuracy': train_accuracy,
                        'val_loss': val_losses[-1] if val_losses else None,
                        'val_accuracy': val_accuracies[-1] if val_accuracies else None
                    })
                
                if verbose and (cycle + 1) % max(1, cycles // 10) == 0:
                    val_str = f", val_loss={val_losses[-1]:.4f}" if val_losses else ""
                    print(f"Cycle {cycle + 1}/{cycles}, loss={avg_train_loss:.4f}{val_str}")
            
        finally:
            self.is_training = False
        
        elapsed_time = time.time() - start_time
        
        return {
            'total_cycles': self.current_cycle,
            'train_losses': train_losses,
            'train_accuracies': train_accuracies,
            'val_losses': val_losses,
            'val_accuracies': val_accuracies,
            'final_train_loss': train_losses[-1] if train_losses else None,
            'final_val_loss': val_losses[-1] if val_losses else None,
            'elapsed_time': elapsed_time,
            'history': self.history
        }
    
    def _compute_validation_loss(
        self,
        X_val: List[List[float]],
        y_val: List[List[float]]
    ) -> float:
        """Compute loss on validation set."""
        total_loss = 0
        for inputs, targets in zip(X_val, y_val):
            pred = self.network.forward(inputs)['output']
            total_loss += LossFunctions.compute(self.loss_function, pred, targets)
        return total_loss / len(X_val) if X_val else 0
    
    def _compute_validation_accuracy(
        self,
        X_val: List[List[float]],
        y_val: List[List[float]]
    ) -> float:
        """Compute accuracy on validation set."""
        correct = 0
        for inputs, targets in zip(X_val, y_val):
            pred = self.network.forward(inputs)['output']
            pred_class = np.argmax(pred)
            tgt_class = np.argmax(targets) if len(targets) > 1 else int(targets[0] > 0.5)
            if pred_class == tgt_class:
                correct += 1
        return correct / len(X_val) if X_val else 0
    
    def _compute_accuracy_estimate(
        self,
        prediction: List[float],
        target: List[float]
    ) -> float:
        """Simple accuracy estimate for single sample."""
        pred_class = np.argmax(prediction)
        tgt_class = np.argmax(target) if len(target) > 1 else int(target[0] > 0.5)
        return 1.0 if pred_class == tgt_class else 0.0
    
    def _compute_weight_changes(
        self,
        state_before: Dict,
        state_after: Dict
    ) -> List[Dict[str, Any]]:
        """Compute how weights changed during training."""
        changes = []
        
        for layer_before, layer_after in zip(
            state_before['layers'],
            state_after['layers']
        ):
            layer_changes = {
                'layer_name': layer_before['name'],
                'weight_changes': [],
                'bias_changes': []
            }
            
            # Weight changes
            for w_before, w_after in zip(
                layer_before['weights_matrix'],
                layer_after['weights_matrix']
            ):
                layer_changes['weight_changes'].append({
                    'before': w_before,
                    'after': w_after,
                    'delta': [a - b for a, b in zip(w_after, w_before)]
                })
            
            # Bias changes
            for b_before, b_after in zip(
                layer_before['biases_vector'],
                layer_after['biases_vector']
            ):
                layer_changes['bias_changes'].append({
                    'before': b_before,
                    'after': b_after,
                    'delta': b_after - b_before
                })
            
            changes.append(layer_changes)
        
        return changes
    
    def pause(self):
        """Pause training."""
        self.should_pause = True
    
    def resume(self):
        """Resume training."""
        self.should_pause = False
    
    def stop(self):
        """Stop training."""
        self.should_stop = True
        self.should_pause = False
    
    def get_history(self) -> List[Dict[str, Any]]:
        """Get training history."""
        return self.history
    
    def reset_history(self):
        """Clear training history."""
        self.history = []
        self.current_cycle = 0
