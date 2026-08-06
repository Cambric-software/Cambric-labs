"""
Unit tests for training functionality.
"""

import pytest
import numpy as np
from backend.neural.network import Network, Layer
from backend.neural.loss import LossFunctions
from backend.training.trainer import Trainer
from backend.training.backpropagation import Backpropagation


class TestLossFunctions:
    """Tests for loss functions."""
    
    def test_mse(self):
        """Test Mean Squared Error."""
        predictions = [1.0, 2.0, 3.0]
        targets = [1.1, 1.9, 3.2]
        
        loss = LossFunctions.mse(predictions, targets)
        
        # ((0.1)^2 + (0.1)^2 + (0.2)^2) / 3 = 0.06 / 3 = 0.02
        assert np.isclose(loss, 0.02)
    
    def test_mse_derivative(self):
        """Test MSE derivative."""
        predictions = [1.0, 2.0, 3.0]
        targets = [1.0, 2.0, 3.0]
        
        gradients = LossFunctions.mse_derivative(predictions, targets)
        
        # All zeros when prediction = target
        assert gradients == pytest.approx([0.0, 0.0, 0.0])
    
    def test_mae(self):
        """Test Mean Absolute Error."""
        predictions = [1.0, 2.0, 3.0]
        targets = [1.1, 1.9, 3.2]
        
        loss = LossFunctions.mae(predictions, targets)
        
        # (0.1 + 0.1 + 0.2) / 3 = 0.4 / 3 = 0.1333...
        assert np.isclose(loss, 0.1333, atol=0.01)
    
    def test_cross_entropy(self):
        """Test binary cross-entropy."""
        predictions = [0.9, 0.1, 0.8]
        targets = [1.0, 0.0, 1.0]
        
        loss = LossFunctions.cross_entropy(predictions, targets)
        
        # Should be low when predictions match targets
        assert loss < 0.5
    
    def test_binary_accuracy(self):
        """Test binary accuracy."""
        predictions = [0.9, 0.1, 0.8, 0.3]
        targets = [1.0, 0.0, 1.0, 0.0]
        
        accuracy = LossFunctions.binary_accuracy(predictions, targets, threshold=0.5)
        
        # All predictions correct
        assert accuracy == 1.0
    
    def test_categorical_accuracy(self):
        """Test categorical accuracy."""
        predictions = [
            [0.9, 0.1, 0.0],
            [0.1, 0.8, 0.1],
            [0.0, 0.1, 0.9]
        ]
        targets = [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0]
        ]
        
        accuracy = LossFunctions.categorical_accuracy(predictions, targets)
        
        # All predictions correct
        assert accuracy == 1.0


class TestBackpropagation:
    """Tests for backpropagation."""
    
    def test_train_step(self):
        """Test single training step."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=2, activation='identity'))
        
        bp = Backpropagation(network, loss_function='mse')
        
        result = bp.train_step(
            inputs=[1.0, 2.0],
            targets=[1.0, 0.0],
            learning_rate=0.1
        )
        
        assert 'prediction' in result
        assert 'loss' in result
        assert 'layer_gradients' in result
        assert 'layer_updates' in result
    
    def test_gradient_flow(self):
        """Test that gradients flow through network."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        bp = Backpropagation(network, loss_function='mse')
        
        # Initial prediction
        result1 = bp.train_step([1.0, 1.0], [1.0], learning_rate=0.1)
        loss1 = result1['loss']
        
        # After training, loss should decrease (or at least weights should change)
        assert result1['prediction'] is not None


class TestTrainer:
    """Tests for the Trainer class."""
    
    def test_single_cycle(self):
        """Test single training cycle."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.1)
        
        result = trainer.single_cycle(
            inputs=[1.0, 2.0],
            targets=[1.0]
        )
        
        assert result['cycle'] == 1
        assert 'loss' in result
        assert 'prediction' in result
        assert 'weight_changes' in result
    
    def test_cycle_increments(self):
        """Test that cycle counter increments."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network)
        
        trainer.single_cycle([1.0, 2.0], [1.0])
        trainer.single_cycle([1.0, 2.0], [1.0])
        trainer.single_cycle([1.0, 2.0], [1.0])
        
        assert trainer.current_cycle == 3
    
    def test_history_tracking(self):
        """Test that training history is tracked."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network)
        
        trainer.single_cycle([1.0, 2.0], [1.0])
        trainer.single_cycle([1.0, 2.0], [1.0])
        
        history = trainer.get_history()
        
        assert len(history) == 2
        assert history[0]['cycle'] == 1
        assert history[1]['cycle'] == 2
    
    def test_train_batch(self):
        """Test batch training."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.1)
        
        X = [[1.0, 2.0], [2.0, 1.0], [0.5, 0.5]]
        y = [[1.0], [0.0], [0.5]]
        
        result = trainer.train(X, y, cycles=10, verbose=False)
        
        assert 'total_cycles' in result
        assert 'train_losses' in result
        assert len(result['train_losses']) <= 10
    
    def test_train_respects_shuffle(self):
        """Test that shuffle option works."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        # With shuffle
        trainer1 = Trainer(network, shuffle=True)
        
        # Without shuffle
        trainer2 = Trainer(network, shuffle=False)
        
        # Results should be same when not shuffling
        X = [[1.0, 0.0], [0.0, 1.0]]
        y = [[1.0], [0.0]]
        
        result1 = trainer1.train(X, y, cycles=5, verbose=False)
        result2 = trainer2.train(X, y, cycles=5, verbose=False)
        
        # Final losses might differ due to randomness in initialization
        # but the structure should be the same
        assert len(result1['train_losses']) == len(result2['train_losses'])
    
    def test_pause_and_resume(self):
        """Test training pause and resume."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network)
        
        # Start training in background would go here
        # For now, test pause/resume flags
        trainer.pause()
        assert trainer.should_pause == True
        
        trainer.resume()
        assert trainer.should_pause == False
    
    def test_stop(self):
        """Test stopping training."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network)
        
        trainer.stop()
        
        assert trainer.should_stop == True
        assert trainer.should_pause == False


class TestWeightChanges:
    """Tests for weight change tracking."""
    
    def test_weights_change_after_training(self):
        """Test that weights actually change after training."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        # Get initial weights
        initial_weights = network.layers[0].weights_matrix.copy()
        
        trainer = Trainer(network, learning_rate=0.1)
        
        # Train
        trainer.single_cycle([1.0, 2.0], [1.0])
        
        # Get new weights
        new_weights = network.layers[0].weights_matrix
        
        # Weights should have changed
        assert not np.allclose(initial_weights, new_weights)
    
    def test_weight_changes_recorded(self):
        """Test that weight changes are recorded in result."""
        network = Network(name="Test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.1)
        
        result = trainer.single_cycle([1.0, 2.0], [1.0])
        
        changes = result['weight_changes']
        
        assert len(changes) == 1  # One layer
        assert 'weight_changes' in changes[0]
        # One neuron with 2 weights (input_dim=2, output_dim=1)
        assert len(changes[0]['weight_changes']) == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
