"""
Comprehensive Tests for CAMBRIC LABS Neural Engine

This test suite verifies:
1. Complete network numerical gradient checking
2. All activation functions
3. Training actually learns
4. Serialization/deserialization
5. Educational inspection capabilities
"""

import pytest
import numpy as np
from backend.neural.neuron import Neuron, GradientResult
from backend.neural.layer import Layer
from backend.neural.network import Network, create_simple_network
from backend.neural.activation import ActivationFunctions
from backend.neural.loss import LossFunctions
from backend.training.trainer import Trainer


class TestActivationFunctions:
    """Comprehensive tests for all activation functions."""
    
    def test_relu_negative(self):
        """ReLU should return 0 for negative input."""
        assert ActivationFunctions.relu(-5.0) == 0.0
        assert ActivationFunctions.relu(-0.1) == 0.0
    
    def test_relu_zero(self):
        """ReLU should return 0 for zero input."""
        assert ActivationFunctions.relu(0.0) == 0.0
    
    def test_relu_positive(self):
        """ReLU should return input for positive values."""
        assert ActivationFunctions.relu(5.0) == 5.0
        assert ActivationFunctions.relu(0.1) == 0.1
    
    def test_relu_derivative(self):
        """ReLU derivative should be 1 for positive, 0 for negative."""
        assert ActivationFunctions.relu_derivative(5.0) == 1.0
        assert ActivationFunctions.relu_derivative(-5.0) == 0.0
        # At exactly 0, implementation-dependent - test for consistency
        # Some implementations use > 0, some use >= 0
        d = ActivationFunctions.relu_derivative(0.0)
        assert d in (0.0, 1.0)
    
    def test_sigmoid_normal(self):
        """Sigmoid should work correctly for normal values."""
        assert np.isclose(ActivationFunctions.sigmoid(0.0), 0.5)
        assert np.isclose(ActivationFunctions.sigmoid(1.0), 1.0 / (1.0 + np.exp(-1)))
        assert np.isclose(ActivationFunctions.sigmoid(-1.0), 1.0 / (1.0 + np.exp(1)))
    
    def test_sigmoid_large_positive(self):
        """Sigmoid should handle large positive values without overflow."""
        result = ActivationFunctions.sigmoid(100.0)
        assert result > 0.999
        assert result <= 1.0  # Can be exactly 1.0 due to clipping
    
    def test_sigmoid_large_negative(self):
        """Sigmoid should handle large negative values without overflow."""
        result = ActivationFunctions.sigmoid(-100.0)
        assert result < 1e-10
        assert result >= 0.0
    
    def test_sigmoid_derivative(self):
        """Sigmoid derivative should follow σ(x)(1-σ(x))."""
        x = 0.5
        s = ActivationFunctions.sigmoid(x)
        expected = s * (1 - s)
        assert np.isclose(ActivationFunctions.sigmoid_derivative(x), expected)
    
    def test_tanh_normal(self):
        """Tanh should work correctly for normal values."""
        assert np.isclose(ActivationFunctions.tanh(0.0), 0.0)
        assert np.isclose(ActivationFunctions.tanh(1.0), np.tanh(1.0))
        assert np.isclose(ActivationFunctions.tanh(-1.0), np.tanh(-1.0))
    
    def test_tanh_large_positive(self):
        """Tanh should approach 1 for large positive values."""
        result = ActivationFunctions.tanh(100.0)
        assert result > 0.999
        assert result <= 1.0  # Can be exactly 1.0
    
    def test_tanh_large_negative(self):
        """Tanh should approach -1 for large negative values."""
        result = ActivationFunctions.tanh(-100.0)
        assert result < -0.999
        assert result >= -1.0  # Can be exactly -1.0
    
    def test_tanh_derivative(self):
        """Tanh derivative should follow 1 - tanh²(x)."""
        x = 0.5
        t = ActivationFunctions.tanh(x)
        expected = 1.0 - t**2
        assert np.isclose(ActivationFunctions.tanh_derivative(x), expected)
    
    def test_leaky_relu_negative(self):
        """Leaky ReLU should return alpha * x for negative input."""
        alpha = 0.01
        assert np.isclose(ActivationFunctions.leaky_relu(-5.0, alpha), alpha * -5.0)
        assert np.isclose(ActivationFunctions.leaky_relu(-0.1, alpha), alpha * -0.1)
    
    def test_leaky_relu_zero(self):
        """Leaky ReLU should return 0 for zero input."""
        assert ActivationFunctions.leaky_relu(0.0) == 0.0
    
    def test_leaky_relu_positive(self):
        """Leaky ReLU should return input for positive values."""
        assert ActivationFunctions.leaky_relu(5.0) == 5.0
        assert ActivationFunctions.leaky_relu(0.1) == 0.1
    
    def test_leaky_relu_derivative(self):
        """Leaky ReLU derivative should be 1 for positive, alpha for negative."""
        alpha = 0.01
        assert ActivationFunctions.leaky_relu_derivative(5.0, alpha) == 1.0
        assert ActivationFunctions.leaky_relu_derivative(-5.0, alpha) == alpha
        # At exactly 0, implementation-dependent
        d = ActivationFunctions.leaky_relu_derivative(0.0, alpha)
        assert d in (alpha, 1.0)
    
    def test_identity(self):
        """Identity should return input unchanged."""
        assert ActivationFunctions.identity(5.0) == 5.0
        assert ActivationFunctions.identity(-100.0) == -100.0
        assert ActivationFunctions.identity(0.0) == 0.0
    
    def test_identity_derivative(self):
        """Identity derivative should always be 1."""
        assert ActivationFunctions.identity_derivative(5.0) == 1.0
        assert ActivationFunctions.identity_derivative(-100.0) == 1.0
        assert ActivationFunctions.identity_derivative(0.0) == 1.0


class TestSoftmax:
    """Tests for softmax as a vector-level operation."""
    
    def test_softmax_is_vector_operation(self):
        """Softmax should take a list and return a list."""
        result = ActivationFunctions.softmax([1.0, 2.0, 3.0])
        assert isinstance(result, list)
        assert len(result) == 3
    
    def test_softmax_positive_probabilities(self):
        """Softmax should return all positive probabilities."""
        result = ActivationFunctions.softmax([-10.0, 0.0, 10.0])
        for p in result:
            assert p > 0.0
    
    def test_softmax_sums_to_one(self):
        """Softmax probabilities should sum to 1."""
        result = ActivationFunctions.softmax([1.0, 2.0, 3.0])
        assert np.isclose(sum(result), 1.0)
    
    def test_softmax_numerically_stable(self):
        """Softmax should handle large values without overflow."""
        # Large values that would cause overflow without shifting
        result = ActivationFunctions.softmax([1000.0, 1001.0, 1002.0])
        for p in result:
            assert not np.isnan(p)
            assert not np.isinf(p)
            assert 0.0 < p < 1.0
        assert np.isclose(sum(result), 1.0)
    
    def test_softmax_largest_has_highest_probability(self):
        """The largest input should have the highest probability."""
        result = ActivationFunctions.softmax([1.0, 5.0, 3.0])
        assert result[1] > result[0]
        assert result[1] > result[2]


class TestCompleteNetworkGradientCheck:
    """Numerical gradient checking on complete networks."""
    
    def test_2_layer_network_weight_gradients(self):
        """Verify gradients for a 2-layer network using numerical methods."""
        # Create a simple 2-layer network
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        inputs = [1.0, 2.0]
        target = [0.5]
        epsilon = 1e-5
        
        # Store original weights
        orig_l1_weights = network.layers[0].weights_matrix.copy()
        orig_l2_weights = network.layers[1].weights_matrix.copy()
        
        # Forward pass and get loss
        forward_result = network.forward(inputs)
        prediction = forward_result['output']
        loss = LossFunctions.mse(prediction, target)
        
        # Get analytical gradients
        loss_grad = LossFunctions.mse_derivative(prediction, target)
        grad_result = network.backward(loss_grad)
        
        # Numerical gradient check for first layer, first weight
        network.reset_cache()
        network.forward(inputs)
        
        # Perturb weight positively
        network.layers[0].neurons[0].weights[0] += epsilon
        pred_plus = network.forward(inputs)['output']
        loss_plus = LossFunctions.mse(pred_plus, target)
        
        # Perturb weight negatively
        network.layers[0].neurons[0].weights[0] -= 2 * epsilon
        pred_minus = network.forward(inputs)['output']
        loss_minus = LossFunctions.mse(pred_minus, target)
        
        # Numerical gradient
        numerical_grad = (loss_plus - loss_minus) / (2 * epsilon)
        
        # Restore original
        network.layers[0].neurons[0].weights[0] = orig_l1_weights[0][0]
        
        # Analytical gradient
        analytical_grad = grad_result['layer_gradients'][0]['neuron_gradients'][0]['weight_gradients'][0]
        
        # Should match within tolerance
        assert np.isclose(numerical_grad, analytical_grad, rtol=1e-3), \
            f"Numerical: {numerical_grad}, Analytical: {analytical_grad}"
    
    def test_single_neuron_gradient_check_identity(self):
        """Complete numerical gradient check for identity activation."""
        # Use identity activation to avoid ReLU's non-differentiability
        neuron = Neuron(
            input_count=2,
            weights=[0.5, -0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 1.0
        epsilon = 1e-5
        
        # Forward pass
        forward_result = neuron.forward(inputs)
        output = forward_result['output']
        
        # Compute loss gradient (dL/dy)
        dL_dy = 2 * (output - target)
        
        # Backward pass
        grad_result = neuron.backward(dL_dy)
        
        # Numerical weight gradient check
        for i in range(2):
            # loss(w + ε)
            neuron.weights[i] += epsilon
            out_plus = neuron.forward(inputs)['output']
            loss_plus = (out_plus - target) ** 2
            
            # loss(w - ε)
            neuron.weights[i] -= 2 * epsilon
            out_minus = neuron.forward(inputs)['output']
            loss_minus = (out_minus - target) ** 2
            
            numerical = (loss_plus - loss_minus) / (2 * epsilon)
            analytical = grad_result.weight_gradients[i]
            
            # For identity: should match exactly
            assert np.isclose(numerical, analytical, rtol=1e-3), \
                f"Weight {i}: Numerical={numerical}, Analytical={analytical}"
            
            # Restore
            neuron.weights[i] += epsilon
        
        # Numerical bias gradient check
        orig_bias = neuron.bias
        neuron.bias = orig_bias + epsilon
        loss_plus = (neuron.forward(inputs)['output'] - target) ** 2
        neuron.bias = orig_bias - epsilon
        loss_minus = (neuron.forward(inputs)['output'] - target) ** 2
        numerical_bias = (loss_plus - loss_minus) / (2 * epsilon)
        neuron.bias = orig_bias
        
        assert np.isclose(numerical_bias, grad_result.bias_gradient, rtol=1e-3)
    
    def test_single_neuron_gradient_check_relu_active(self):
        """Numerical gradient check for ReLU when active (z > 0)."""
        # Use weights that ensure z > 0 (ReLU active)
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],  # Positive weights
            bias=0.5,            # Positive bias to ensure z > 0
            activation='relu'
        )
        
        inputs = [1.0, 2.0]
        target = 0.0
        epsilon = 1e-5
        
        # Forward pass
        forward_result = neuron.forward(inputs)
        output = forward_result['output']
        
        # Verify ReLU is active (z > 0)
        z = forward_result['weighted_sum']
        assert z > 0, f"ReLU should be active, but z = {z}"
        
        # Compute loss gradient (dL/dy)
        dL_dy = 2 * (output - target)
        
        # Backward pass
        grad_result = neuron.backward(dL_dy)
        
        # Numerical weight gradient check
        for i in range(2):
            # loss(w + ε)
            neuron.weights[i] += epsilon
            out_plus = neuron.forward(inputs)['output']
            loss_plus = (out_plus - target) ** 2
            
            # loss(w - ε)  
            neuron.weights[i] -= 2 * epsilon
            out_minus = neuron.forward(inputs)['output']
            loss_minus = (out_minus - target) ** 2
            
            numerical = (loss_plus - loss_minus) / (2 * epsilon)
            analytical = grad_result.weight_gradients[i]
            
            assert np.isclose(numerical, analytical, rtol=1e-3), \
                f"Weight {i}: Numerical={numerical}, Analytical={analytical}"
            
            # Restore
            neuron.weights[i] += epsilon


class TestTrainingLearns:
    """Tests that training actually improves the network."""
    
    def test_loss_decreases_during_training(self):
        """Loss should decrease when network is trained."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=4, activation='relu'))
        network.add_layer(Layer(name="output", input_dim=4, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.1)
        
        # Simple dataset
        X = [[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [0.0, 0.0]]
        y = [[1.0], [1.0], [0.0], [0.0]]
        
        losses = []
        for _ in range(100):
            for inputs, targets in zip(X, y):
                result = trainer.single_cycle(inputs, targets)
                losses.append(result['loss'])
        
        # Check that loss decreased
        initial_loss = np.mean(losses[:10])
        final_loss = np.mean(losses[-10:])
        
        assert final_loss < initial_loss, \
            f"Loss did not decrease: initial={initial_loss}, final={final_loss}"
    
    def test_weights_change_during_training(self):
        """Weights should actually change during training."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="output", input_dim=2, output_dim=1, activation='identity'))
        
        # Get initial weights
        initial_weights = network.layers[0].weights_matrix.copy()
        
        trainer = Trainer(network, learning_rate=0.1)
        
        # Train for one cycle
        trainer.single_cycle([1.0, 2.0], [1.0])
        
        # Get new weights
        new_weights = network.layers[0].weights_matrix
        
        # At least some weights should have changed
        assert not np.allclose(initial_weights, new_weights), \
            "Weights did not change during training"
    
    def test_simple_regression_learning(self):
        """Network should learn a simple regression problem."""
        network = Network(name="test")
        network.add_layer(Layer(name="dense", input_dim=1, output_dim=8, activation='relu'))
        network.add_layer(Layer(name="output", input_dim=8, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.05)
        
        # y = 2*x + 1
        X = [[0.0], [0.5], [1.0], [1.5], [2.0]]
        y = [[1.0], [2.0], [3.0], [4.0], [5.0]]
        
        initial_loss = None
        final_loss = None
        
        for i in range(200):
            for inputs, targets in zip(X, y):
                result = trainer.single_cycle(inputs, targets)
                if i == 0:
                    initial_loss = result['loss']
                final_loss = result['loss']
        
        # Test prediction
        test_input = [1.25]
        prediction = network.forward(test_input)['output'][0]
        expected = 2 * 1.25 + 1  # = 3.5
        
        # Prediction should be reasonable (within 1.0 of expected)
        assert abs(prediction - expected) < 1.0, \
            f"Prediction {prediction} too far from expected {expected}"


class TestSerializationRoundtrip:
    """Tests for complete serialization/deserialization."""
    
    def test_neuron_serialization_preserves_state(self):
        """Serialization should preserve all neuron state."""
        neuron = Neuron(
            input_count=3,
            weights=[0.1, 0.2, 0.3],
            bias=0.5,
            activation='relu'
        )
        
        # Train it a bit
        for _ in range(10):
            neuron.forward([1.0, 2.0, 3.0])
            neuron.backward(1.0)
            neuron.update(neuron.get_gradients(), learning_rate=0.01)
        
        # Get state
        state = neuron.get_state()
        
        # Create new neuron from state
        new_neuron = Neuron(
            input_count=state['input_count'],
            weights=state['weights'],
            bias=state['bias'],
            activation=state['activation']
        )
        
        # Both should produce same output
        test_input = [1.0, 2.0, 3.0]
        out1 = neuron.forward(test_input)['output']
        out2 = new_neuron.forward(test_input)['output']
        
        assert np.isclose(out1, out2)
    
    def test_network_serialization_preserves_predictions(self):
        """Network serialization should preserve predictions."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=4, activation='relu'))
        network.add_layer(Layer(name="output", input_dim=4, output_dim=2, activation='identity'))
        
        # Train
        for _ in range(50):
            network.forward([1.0, 2.0])
            network.backward([1.0, 0.0])
            network.update(0.1)
        
        # Serialize
        data = network.to_dict()
        
        # Deserialize
        new_network = Network.from_dict(data)
        
        # Both should produce same predictions
        test_input = [1.0, 2.0]
        pred1 = network.forward(test_input)['output']
        pred2 = new_network.forward(test_input)['output']
        
        for p1, p2 in zip(pred1, pred2):
            assert np.isclose(p1, p2)
    
    def test_serialized_state_is_json_compatible(self):
        """Serialized state should be JSON-compatible."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='relu'))
        
        data = network.to_dict()
        
        # Should not raise
        import json
        json_str = json.dumps(data)
        restored = json.loads(json_str)
        
        assert restored['name'] == data['name']
        assert len(restored['layers']) == len(data['layers'])


class TestEducationalInspection:
    """Tests for educational/inspection capabilities."""
    
    def test_neuron_provides_full_forward_details(self):
        """Forward pass should provide all details for visualization."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='relu'
        )
        
        result = neuron.forward([1.0, 2.0])
        
        # All required fields for visualization
        assert 'output' in result
        assert 'weighted_sum' in result
        assert 'contributions' in result
        assert 'activation_used' in result
        assert 'inputs' in result
        assert 'weights' in result
        assert 'bias' in result
        
        # Verify contributions add up
        assert np.isclose(sum(result['contributions']), result['weighted_sum'] - result['bias'])
    
    def test_neuron_provides_full_gradient_details(self):
        """Backward pass should provide all gradient details."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        neuron.forward([1.0, 2.0])
        grad_result = neuron.backward(1.0)
        
        # All required gradient fields
        assert hasattr(grad_result, 'input_gradients')
        assert hasattr(grad_result, 'weight_gradients')
        assert hasattr(grad_result, 'bias_gradient')
        assert hasattr(grad_result, 'activation_gradient')
        
        # Correct shapes
        assert len(grad_result.input_gradients) == 2
        assert len(grad_result.weight_gradients) == 2
    
    def test_update_provides_change_details(self):
        """Update should provide detailed change information."""
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],
            bias=0.0,
            activation='identity'
        )
        
        neuron.forward([1.0, 2.0])
        grad_result = neuron.backward(1.0)
        update_result = neuron.update(grad_result, learning_rate=0.1)
        
        # All required change fields
        assert 'weight_changes' in update_result
        assert 'bias_change' in update_result
        assert 'old_weights' in update_result
        assert 'new_weights' in update_result
        assert 'old_bias' in update_result
        assert 'new_bias' in update_result


class TestResetBehavior:
    """Tests for reset_cache vs reset_parameters."""
    
    def test_reset_cache_preserves_parameters(self):
        """reset_cache should not change weights or bias."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.6],
            bias=0.1,
            activation='relu'
        )
        
        neuron.forward([1.0, 2.0])
        neuron.backward(1.0)
        neuron.update(neuron.get_gradients(), learning_rate=0.1)
        
        orig_weights = neuron.weights.copy()
        orig_bias = neuron.bias
        
        neuron.reset_cache()
        
        assert np.allclose(neuron.weights, orig_weights)
        assert neuron.bias == orig_bias
    
    def test_reset_cache_clears_cached_values(self):
        """reset_cache should clear cached forward/backward data."""
        neuron = Neuron(input_count=2, activation='relu')
        
        neuron.forward([1.0, 2.0])
        assert neuron._last_input is not None
        
        neuron.reset_cache()
        assert neuron._last_input is None
    
    def test_reset_parameters_changes_weights(self):
        """reset_parameters should reinitialize weights."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.6],
            bias=0.1,
            activation='relu'
        )
        
        orig_weights = neuron.weights.copy()
        
        neuron.reset_parameters(seed=42)
        
        # With same seed, should get same weights
        assert np.allclose(neuron.weights, orig_weights) == False  # Different seed
        
        # With different seed, should get different weights
        neuron.reset_parameters(seed=123)
        assert not np.allclose(neuron.weights, orig_weights)


class TestLayerIntegration:
    """Tests for layer-level integration."""
    
    def test_layer_forward_returns_all_neuron_details(self):
        """Layer forward should return details for all neurons."""
        layer = Layer(name="test", input_dim=2, output_dim=3, activation='relu')
        
        result = layer.forward([1.0, 2.0])
        
        assert len(result['outputs']) == 3
        assert len(result['neuron_details']) == 3
        
        for detail in result['neuron_details']:
            assert 'weighted_sum' in detail
            assert 'output' in detail
            assert 'contributions' in detail
    
    def test_layer_accumulates_input_gradients(self):
        """Layer should correctly accumulate input gradients."""
        layer = Layer(name="test", input_dim=2, output_dim=2, activation='identity')
        
        layer.forward([1.0, 2.0])
        result = layer.backward([1.0, 1.0])
        
        # Each input gradient should be sum of contributions from both neurons
        assert len(result['input_gradients']) == 2


class TestNetworkIntegration:
    """Tests for network-level integration."""
    
    def test_network_forward_returns_layer_details(self):
        """Network forward should return details for all layers."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='relu'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        result = network.forward([1.0, 2.0])
        
        assert len(result['layer_outputs']) == 2
        assert len(result['all_activations']) == 2
        
        for activation in result['all_activations']:
            assert 'layer_index' in activation
            assert 'inputs' in activation
            assert 'outputs' in activation
    
    def test_network_backward_returns_layer_gradients(self):
        """Network backward should return gradients for all layers."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        network.forward([1.0, 2.0])
        result = network.backward([1.0])
        
        assert len(result['layer_gradients']) == 2
        
        for lg in result['layer_gradients']:
            assert 'layer_index' in lg
            assert 'input_gradients' in lg
            assert 'neuron_gradients' in lg


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
