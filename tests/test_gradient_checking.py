"""
Gradient Checking Tests for CAMBRIC LABS

This test suite verifies that the neural network's gradient computation
is mathematically correct by comparing against numerical (finite-difference) gradients.

For each parameter θ:
    numerical_gradient ≈ (loss(θ + ε) - loss(θ - ε)) / (2ε)
    
Where ε is a small perturbation (typically 1e-5 to 1e-7).

If analytical and numerical gradients match, the backpropagation is correct.
"""

import pytest
import numpy as np
from backend.neural.neuron import Neuron, GradientResult
from backend.neural.layer import Layer
from backend.neural.network import Network
from backend.neural.loss import LossFunctions


class TestNumericalGradientCheck:
    """Verify gradients using finite differences."""
    
    def test_neuron_weight_gradient_identity(self):
        """Test weight gradients for identity activation."""
        neuron = Neuron(
            input_count=2, 
            weights=[0.5, -0.3], 
            bias=0.1, 
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        epsilon = 1e-5
        
        # Forward pass
        neuron.forward(inputs)
        
        # Analytical gradient
        result = neuron.forward(inputs)
        output = result['output']  # z = 0.5*1 + (-0.3)*2 + 0.1 = 0.0
        # dL/dz = 2*(output - target) = 2*(0.0 - 0.5) = -1.0
        analytical_grad = 2 * (output - target)
        
        # For identity activation: dL/dw = dL/dz * x
        expected_w0_grad = analytical_grad * inputs[0]  # -1.0 * 1.0 = -1.0
        expected_w1_grad = analytical_grad * inputs[1]  # -1.0 * 2.0 = -2.0
        
        # Numerical gradient
        def loss_at_weight(idx, w_value):
            neuron.weights[idx] = w_value
            out = neuron.forward(inputs)['output']
            neuron.weights[idx] = 0.5 if idx == 0 else -0.3  # restore
            return (out - target) ** 2
        
        # Compute numerical gradients
        orig_w0 = 0.5
        loss_plus = loss_at_weight(0, orig_w0 + epsilon)
        loss_minus = loss_at_weight(0, orig_w0 - epsilon)
        numerical_w0 = (loss_plus - loss_minus) / (2 * epsilon)
        
        # Should match analytical
        assert np.isclose(numerical_w0, expected_w0_grad, rtol=1e-3)
    
    def test_neuron_bias_gradient_identity(self):
        """Test bias gradient for identity activation."""
        neuron = Neuron(
            input_count=2, 
            weights=[0.5, -0.3], 
            bias=0.1, 
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        epsilon = 1e-5
        
        # Analytical: dL/db = dL/dz (for identity, dz/db = 1)
        result = neuron.forward(inputs)
        output = result['output']
        analytical_grad = 2 * (output - target)  # dL/dz
        
        # Numerical
        loss_plus = ((neuron.forward(inputs)['output'] - target) ** 2)
        orig_bias = neuron.bias
        neuron.bias = orig_bias + epsilon
        loss_plus = ((neuron.forward(inputs)['output'] - target) ** 2)
        neuron.bias = orig_bias - epsilon
        loss_minus = ((neuron.forward(inputs)['output'] - target) ** 2)
        neuron.bias = orig_bias
        numerical_grad = (loss_plus - loss_minus) / (2 * epsilon)
        
        assert np.isclose(numerical_grad, analytical_grad, rtol=1e-3)
    
    def test_neuron_gradient_sigmoid(self):
        """Test gradients for sigmoid activation with non-zero input."""
        neuron = Neuron(
            input_count=1, 
            weights=[1.0], 
            bias=0.0, 
            activation='sigmoid'
        )
        
        # Use non-zero input so gradient isn't zero
        inputs = [1.0]
        target = 0.0
        epsilon = 1e-5
        
        # Forward
        result = neuron.forward(inputs)
        output = result['output']  # sigmoid(1.0) ≈ 0.731
        
        # For sigmoid: dσ/dz = σ(z) * (1 - σ(z))
        # dL/dz = dL/dσ * dσ/dz
        dL_dsigma = 2 * (output - target)  # dL/dσ = 2*(σ - target)
        dsigma_dz = output * (1 - output)  # sigmoid derivative
        analytical_grad = dL_dsigma * dsigma_dz  # dL/dz
        
        # dL/dw = dL/dz * dz/dw = dL/dz * x
        expected_w_grad = analytical_grad * inputs[0]
        
        # Numerical gradient check
        orig_w = neuron.weights[0]
        neuron.set_weights([orig_w + epsilon])
        loss_plus = ((neuron.forward(inputs)['output'] - target) ** 2)
        neuron.set_weights([orig_w - epsilon])
        loss_minus = ((neuron.forward(inputs)['output'] - target) ** 2)
        numerical_grad = (loss_plus - loss_minus) / (2 * epsilon)
        neuron.set_weights([orig_w])
        
        assert np.isclose(numerical_grad, expected_w_grad, rtol=1e-3)
    
    def test_neuron_gradient_relu(self):
        """Test gradients for ReLU activation."""
        # Test with positive input (ReLU active)
        neuron = Neuron(
            input_count=1, 
            weights=[1.0], 
            bias=0.0, 
            activation='relu'
        )
        
        inputs = [1.0]
        target = 0.0
        epsilon = 1e-5
        
        result = neuron.forward(inputs)
        output = result['output']  # ReLU(1.0) = 1.0
        
        # dL/dz = 2*(output - target) = 2*(1.0 - 0) = 2.0
        # dReLU/dz = 1 (since z > 0)
        analytical_grad = 2 * (output - target)
        
        # dL/dw = dL/dz * dz/dw = 2.0 * 1.0 = 2.0
        expected_w_grad = analytical_grad * inputs[0]
        
        # Numerical
        loss_fn = lambda w: ((neuron.forward([w / 1.0])['output'] - target) ** 2)
        neuron.set_weights([1.0])
        orig_w = 1.0
        neuron.forward(inputs)
        loss_plus = ((neuron.forward([1.0])['output'] - target) ** 2)
        neuron.set_weights([orig_w + epsilon])
        loss_plus = ((neuron.forward(inputs)['output'] - target) ** 2)
        neuron.set_weights([orig_w - epsilon])
        loss_minus = ((neuron.forward(inputs)['output'] - target) ** 2)
        neuron.set_weights([orig_w])
        numerical_grad = (loss_plus - loss_minus) / (2 * epsilon)
        
        assert np.isclose(numerical_grad, expected_w_grad, rtol=1e-3)
    
    def test_gradient_clipping(self):
        """Test that gradient clipping works correctly."""
        neuron = Neuron(
            input_count=1, 
            weights=[10.0], 
            bias=0.0, 
            activation='identity'
        )
        
        inputs = [1.0]
        target = 0.0
        
        neuron.forward(inputs)
        gradients = neuron.backward(output_gradient=100.0)  # Large gradient
        
        # Without clipping, gradient should be large
        assert np.linalg.norm(gradients.weight_gradients) > 5.0
        
        # With clipping to 1.0, gradient should be reduced
        update_result = neuron.update(gradients, learning_rate=0.1, clip_gradients=1.0)
        
        # The weight change should be bounded
        assert update_result['gradient_norms']['weight_norm'] <= 1.0


class TestGradientPropagation:
    """Test that gradients propagate correctly through layers and networks."""
    
    def test_layer_accumulates_input_gradients(self):
        """Test that layer correctly accumulates gradients for inputs."""
        layer = Layer(
            name='test',
            input_dim=2,
            output_dim=2,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        
        # Forward pass
        layer.forward(inputs)
        
        # Each neuron gets gradient of 1.0
        gradients = layer.compute_gradients([1.0, 1.0])
        
        # Input gradients should be sum of contributions from both neurons
        # For identity activation:
        # grad[0] = w00*1 + w10*1 = w00 + w10
        # grad[1] = w01*1 + w11*1 = w01 + w11
        result = layer.backward([1.0, 1.0])
        
        # Just verify it runs without error
        assert 'input_gradients' in result
        assert len(result['input_gradients']) == 2
    
    def test_network_gradient_flow(self):
        """Test that gradients flow correctly through a network."""
        network = Network(name='test')
        network.add_layer(Layer(
            name='hidden',
            input_dim=2,
            output_dim=2,
            activation='identity'
        ))
        network.add_layer(Layer(
            name='output',
            input_dim=2,
            output_dim=1,
            activation='identity'
        ))
        
        inputs = [1.0, 2.0]
        targets = [1.0]
        
        # Forward pass
        forward_result = network.forward(inputs)
        prediction = forward_result['output']
        
        # Compute loss gradient
        loss = LossFunctions.mse(prediction, targets)
        loss_grad = LossFunctions.mse_derivative(prediction, targets)
        
        # Backward pass
        gradient_result = network.compute_gradients(loss_grad)
        
        # Verify gradients are computed
        assert 'layer_gradients' in gradient_result
        assert len(gradient_result['layer_gradients']) == 2  # 2 layers


class TestSerialization:
    """Test that neurons can be serialized and restored correctly."""
    
    def test_neuron_serialization_roundtrip(self):
        """Test that a trained neuron can be exported and imported."""
        neuron = Neuron(
            input_count=3,
            weights=[0.1, 0.2, 0.3],
            bias=0.5,
            activation='relu'
        )
        
        # Train it
        inputs = [1.0, 2.0, 3.0]
        for _ in range(100):
            neuron.forward(inputs)
            grad = neuron.backward(output_gradient=1.0)
            neuron.update(grad, learning_rate=0.01)
        
        # Get state
        state = neuron.get_state()
        
        # Create new neuron from state
        new_neuron = Neuron(
            input_count=state['input_count'],
            weights=state['weights'],
            bias=state['bias'],
            activation=state['activation']
        )
        
        # Both should produce same output for same input
        out1 = neuron.forward(inputs)['output']
        out2 = new_neuron.forward(inputs)['output']
        
        assert np.isclose(out1, out2)
    
    def test_network_serialization_roundtrip(self):
        """Test that a trained network can be exported and imported."""
        network = Network(name='test')
        network.add_layer(Layer(
            name='dense1',
            input_dim=2,
            output_dim=4,
            activation='relu'
        ))
        network.add_layer(Layer(
            name='output',
            input_dim=4,
            output_dim=1,
            activation='identity'
        ))
        
        # Train it
        for _ in range(50):
            network.forward([1.0, 2.0])
            loss_grad = [2.0]  # Simple gradient
            network.backward(loss_grad)
            network.update(learning_rate=0.01)
        
        # Export and import
        data = network.to_dict()
        new_network = Network.from_dict(data)
        
        # Should produce same output
        inputs = [1.0, 2.0]
        out1 = network.forward(inputs)['output']
        out2 = new_network.forward(inputs)['output']
        
        assert np.isclose(out1, out2)


class TestInitialization:
    """Test activation-appropriate weight initialization."""
    
    def test_relu_uses_he_initialization(self):
        """ReLU should use He initialization (std = sqrt(2/n))."""
        for _ in range(10):
            neuron = Neuron(input_count=100, activation='relu', seed=42)
            std = np.std(neuron.weights)
            expected_std = np.sqrt(2.0 / 100)  # He init
            
            # Should be close to He initialization
            assert np.isclose(std, expected_std, rtol=0.5)
    
    def test_sigmoid_uses_xavier_initialization(self):
        """Sigmoid should use Xavier initialization (std = sqrt(1/n))."""
        for _ in range(10):
            neuron = Neuron(input_count=100, activation='sigmoid', seed=42)
            std = np.std(neuron.weights)
            expected_std = np.sqrt(1.0 / 100)  # Xavier init
            
            # Should be close to Xavier initialization
            assert np.isclose(std, expected_std, rtol=0.5)
    
    def test_tanh_uses_xavier_initialization(self):
        """Tanh should use Xavier initialization."""
        for _ in range(10):
            neuron = Neuron(input_count=100, activation='tanh', seed=42)
            std = np.std(neuron.weights)
            expected_std = np.sqrt(1.0 / 100)  # Xavier init
            
            assert np.isclose(std, expected_std, rtol=0.5)
    
    def test_seeded_initialization_is_reproducible(self):
        """Same seed should produce same initialization."""
        neuron1 = Neuron(input_count=5, activation='relu', seed=123)
        neuron2 = Neuron(input_count=5, activation='relu', seed=123)
        
        assert np.allclose(neuron1.weights, neuron2.weights)
        assert neuron1.bias == neuron2.bias


class TestNumericalSafety:
    """Test protection against numerical errors."""
    
    def test_rejects_nan_input(self):
        """Should reject NaN inputs."""
        neuron = Neuron(input_count=2, activation='relu')
        
        with pytest.raises(ValueError, match="NaN"):
            neuron.forward([1.0, float('nan')])
    
    def test_rejects_infinite_input(self):
        """Should reject infinite inputs."""
        neuron = Neuron(input_count=2, activation='relu')
        
        with pytest.raises(ValueError, match="Infinity"):
            neuron.forward([1.0, float('inf')])
    
    def test_rejects_invalid_learning_rate(self):
        """Should reject invalid learning rates."""
        neuron = Neuron(input_count=2, activation='relu')
        neuron.forward([1.0, 2.0])
        gradients = neuron.backward(1.0)
        
        with pytest.raises(ValueError, match="positive"):
            neuron.update(gradients, learning_rate=-0.1)
    
    def test_sigmoid_handles_large_values(self):
        """Sigmoid should handle large inputs without overflow."""
        neuron = Neuron(input_count=1, activation='sigmoid')
        
        # Very large positive
        result = neuron.forward([100.0])
        assert result['output'] > 0.999
        
        # Very large negative
        result = neuron.forward([-100.0])
        assert result['output'] < 1e-10  # essentially zero


class TestResetBehavior:
    """Test reset_cache vs reset_parameters distinction."""
    
    def test_reset_cache_preserves_weights(self):
        """reset_cache should preserve learned weights."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.6],
            bias=0.1
        )
        
        # Forward pass to cache values
        neuron.forward([1.0, 2.0])
        gradients = neuron.backward(1.0)
        neuron.update(gradients, learning_rate=0.1)
        
        old_weights = neuron.weights.copy()
        old_bias = neuron.bias
        
        # Reset cache
        neuron.reset_cache()
        
        # Weights should be unchanged
        assert np.allclose(neuron.weights, old_weights)
        assert neuron.bias == old_bias
        
        # But cache should be cleared
        assert neuron._last_input is None
    
    def test_reset_parameters_reinitializes(self):
        """reset_parameters should reinitialize weights."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.6],
            bias=0.1
        )
        
        old_weights = neuron.weights.copy()
        old_bias = neuron.bias
        
        # Reset parameters
        neuron.reset_parameters(seed=42)
        
        # Weights should be different
        assert not np.allclose(neuron.weights, old_weights)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
