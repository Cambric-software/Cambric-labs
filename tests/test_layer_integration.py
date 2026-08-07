"""
Regression tests for Layer integration.

These tests verify:
1. Each neuron.backward() is called exactly once per Layer.backward()
2. backward() does not modify weights/biases
3. Saved gradients are used by update()
4. compute_gradients() has clear, distinct behavior
5. Network flow is correct through multiple layers
"""

import pytest
import numpy as np
from backend.neural.layer import Layer
from backend.neural.network import Network


class TestLayerBackwardCalls:
    """Tests for exactly one backward call per neuron per Layer.backward()."""
    
    def test_single_neuron_backward_called_once(self):
        """Layer.backward() should call neuron.backward() exactly once."""
        layer = Layer(name="test", input_dim=2, output_dim=3, activation='identity')
        
        # Record initial backward_calls
        initial_calls = [n._training_stats['backward_calls'] for n in layer.neurons]
        
        # Forward then backward
        layer.forward([1.0, 2.0])
        layer.backward([1.0, 1.0, 1.0])
        
        after_calls = [n._training_stats['backward_calls'] for n in layer.neurons]
        
        # Each neuron should have exactly one additional backward call
        increments = [after - before for after, before in zip(after_calls, initial_calls)]
        assert increments == [1, 1, 1], f"Expected [1,1,1], got {increments}"
    
    def test_multiple_backward_calls_accumulate(self):
        """Multiple Layer.backward() calls should accumulate neuron backward_calls."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        
        initial_calls = [n._training_stats['backward_calls'] for n in layer.neurons]
        
        # Call backward 3 times
        for _ in range(3):
            layer.forward([1.0, 2.0])
            layer.backward([1.0, 1.0])
        
        after_calls = [n._training_stats['backward_calls'] for n in layer.neurons]
        increments = [after - before for after, before in zip(after_calls, initial_calls)]
        
        assert increments == [3, 3], f"Expected [3,3], got {increments}"


class TestLayerBackwardNoMutation:
    """Tests that backward() does not modify parameters."""
    
    def test_backward_does_not_change_weights(self):
        """Layer.backward() should not modify neuron weights."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.set_neuron_weights(0, [0.5, 0.3])
        layer.set_neuron_weights(1, [0.7, 0.9])
        
        orig_weights = [n.weights.copy() for n in layer.neurons]
        
        layer.forward([1.0, 2.0])
        layer.backward([1.0, 1.0])
        
        for i, neuron in enumerate(layer.neurons):
            assert np.allclose(neuron.weights, orig_weights[i]), \
                f"Neuron {i} weights changed during backward()"
    
    def test_backward_does_not_change_biases(self):
        """Layer.backward() should not modify neuron biases."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.set_neuron_bias(0, 0.1)
        layer.set_neuron_bias(1, 0.2)
        
        orig_biases = [n.bias for n in layer.neurons]
        
        layer.forward([1.0, 2.0])
        layer.backward([1.0, 1.0])
        
        for i, neuron in enumerate(layer.neurons):
            assert neuron.bias == orig_biases[i], \
                f"Neuron {i} bias changed during backward()"


class TestLayerSavedGradients:
    """Tests for saved gradient behavior."""
    
    def test_backward_saves_gradients(self):
        """Layer.backward() should save gradients for update()."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        
        layer.forward([1.0, 2.0])
        layer.backward([1.0, 1.0])
        
        assert layer._last_gradients is not None, \
            "_last_gradients should be set after backward()"
        assert len(layer._last_gradients) == 2, \
            "Should have one gradient per neuron"
    
    def test_update_uses_saved_gradients(self):
        """Layer.update() should use gradients saved by backward()."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.set_neuron_weights(0, [1.0, 1.0])
        layer.set_neuron_weights(1, [1.0, 1.0])
        layer.set_neuron_bias(0, 0.0)
        layer.set_neuron_bias(1, 0.0)
        
        orig_weights = [n.weights.copy() for n in layer.neurons]
        
        layer.forward([1.0, 2.0])
        layer.backward([1.0, 1.0])
        
        # Zero out the saved gradients
        for grad in layer._last_gradients:
            grad.weight_gradients[:] = [0.0, 0.0]
            grad.bias_gradient = 0.0
        
        # With zero gradients, weights should not change
        layer.update(learning_rate=0.1)
        
        for i, neuron in enumerate(layer.neurons):
            assert np.allclose(neuron.weights, orig_weights[i]), \
                f"Neuron {i} weights changed with zero gradients"
    
    def test_gradient_values_preserved(self):
        """Gradient values should be preserved between backward() and update()."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.set_neuron_weights(0, [1.0, 0.5])
        layer.set_neuron_weights(1, [0.5, 1.0])
        
        layer.forward([1.0, 2.0])
        layer.backward([1.0, 1.0])
        
        # Store gradient values
        saved_grads = [
            (g.weight_gradients.copy(), g.bias_gradient)
            for g in layer._last_gradients
        ]
        
        # Call update
        layer.update(learning_rate=0.1)
        
        # Verify gradients weren't changed by update
        for i, grad in enumerate(layer._last_gradients):
            assert np.allclose(grad.weight_gradients, saved_grads[i][0]), \
                f"Neuron {i} weight gradients were modified"
            assert grad.bias_gradient == saved_grads[i][1], \
                f"Neuron {i} bias gradient was modified"


class TestComputeGradients:
    """Tests for compute_gradients() behavior."""
    
    def test_compute_gradients_calls_backward(self):
        """compute_gradients() should call backward() on neurons."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.forward([1.0, 2.0])
        
        # Reset backward_calls
        for n in layer.neurons:
            n._training_stats['backward_calls'] = 0
        
        grads = layer.compute_gradients([1.0, 1.0])
        
        # Each neuron should have one backward call
        calls = [n._training_stats['backward_calls'] for n in layer.neurons]
        assert calls == [1, 1], f"Expected [1,1], got {calls}"
    
    def test_compute_gradients_returns_gradient_results(self):
        """compute_gradients() should return GradientResult objects."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.forward([1.0, 2.0])
        
        grads = layer.compute_gradients([1.0, 1.0])
        
        assert len(grads) == 2, "Should return one gradient per neuron"
        for grad in grads:
            assert hasattr(grad, 'input_gradients')
            assert hasattr(grad, 'weight_gradients')
            assert hasattr(grad, 'bias_gradient')


class TestNetworkIntegration:
    """Tests for network-level integration."""
    
    def test_network_calls_backward_once_per_layer(self):
        """Network.backward() should call each neuron.backward() exactly once."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity', seed=42))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity', seed=42))
        
        # Record initial backward_calls
        initial_calls = {
            0: [n._training_stats['backward_calls'] for n in network.layers[0].neurons],
            1: [n._training_stats['backward_calls'] for n in network.layers[1].neurons]
        }
        
        network.forward([1.0, 2.0])
        network.backward([1.0])
        
        after_calls = {
            0: [n._training_stats['backward_calls'] for n in network.layers[0].neurons],
            1: [n._training_stats['backward_calls'] for n in network.layers[1].neurons]
        }
        
        for layer_idx in [0, 1]:
            increments = [
                after - before 
                for after, before in zip(after_calls[layer_idx], initial_calls[layer_idx])
            ]
            assert all(inc == 1 for inc in increments), \
                f"Layer {layer_idx} had increments {increments}, expected all 1s"
    
    def test_network_backward_then_update_flow(self):
        """Network backward() should save gradients, update() should use them."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        # Save original weights
        orig_weights = [
            layer.weights_matrix.copy()
            for layer in network.layers
        ]
        
        network.forward([1.0, 2.0])
        network.backward([1.0])
        
        # Backward should not change weights
        for i, layer in enumerate(network.layers):
            assert np.allclose(layer.weights_matrix, orig_weights[i]), \
                f"Layer {i} weights changed during backward()"
        
        # Update should change weights
        network.update(learning_rate=0.1)
        
        for i, layer in enumerate(network.layers):
            assert not np.allclose(layer.weights_matrix, orig_weights[i]), \
                f"Layer {i} weights should have changed after update()"
    
    def test_complete_training_cycle(self):
        """Complete forward -> backward -> update cycle should work correctly."""
        network = Network(name="test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=4, activation='identity'))
        network.add_layer(Layer(name="output", input_dim=4, output_dim=1, activation='identity'))
        
        # Save initial state
        initial_weights = [layer.weights_matrix.copy() for layer in network.layers]
        initial_biases = [layer.biases_vector.copy() for layer in network.layers]
        
        # Training cycle
        network.forward([1.0, 2.0])
        network.backward([1.0])
        network.update(learning_rate=0.1)
        
        # Weights should have changed
        for i, layer in enumerate(network.layers):
            assert not np.allclose(layer.weights_matrix, initial_weights[i]), \
                f"Layer {i} weights should have changed"
        
        # But not to NaN or Inf
        for layer in network.layers:
            assert not np.any(np.isnan(layer.weights_matrix)), "Weights became NaN"
            assert not np.any(np.isinf(layer.weights_matrix)), "Weights became Inf"


class TestDeterministicLayer:
    """Tests for deterministic layer behavior."""
    
    def test_deterministic_forward(self):
        """Layer should produce same output for same input."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.set_neuron_weights(0, [0.5, 0.3])
        layer.set_neuron_weights(1, [0.7, 0.9])
        layer.set_neuron_bias(0, 0.1)
        layer.set_neuron_bias(1, 0.2)
        
        result1 = layer.forward([1.0, 2.0])
        result2 = layer.forward([1.0, 2.0])
        
        assert result1['outputs'] == result2['outputs']
    
    def test_deterministic_backward(self):
        """Layer should produce same gradients for same state."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        layer.set_neuron_weights(0, [0.5, 0.3])
        layer.set_neuron_weights(1, [0.7, 0.9])
        
        layer.forward([1.0, 2.0])
        result1 = layer.backward([1.0, 1.0])
        
        layer.reset_cache()
        layer.forward([1.0, 2.0])
        result2 = layer.backward([1.0, 1.0])
        
        assert result1['input_gradients'] == result2['input_gradients']
        assert result1['neuron_gradients'] == result2['neuron_gradients']


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
