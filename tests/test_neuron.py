"""
Unit tests for the Neuron implementation.
"""

import pytest
import numpy as np
from backend.neural.neuron import Neuron, create_neuron


class TestNeuronCreation:
    """Tests for neuron creation and initialization."""
    
    def test_create_neuron_with_defaults(self):
        """Test creating a neuron with default values."""
        neuron = Neuron(input_count=3)
        
        assert neuron.input_count == 3
        assert len(neuron.weights) == 3
        assert neuron.bias == 0.0
        assert neuron.activation == 'relu'
    
    def test_create_neuron_with_custom_values(self):
        """Test creating a neuron with custom weights and bias."""
        weights = [0.5, -0.3, 0.8]
        neuron = Neuron(input_count=3, weights=weights, bias=0.1, activation='sigmoid')
        
        assert neuron.weights.tolist() == weights
        assert neuron.bias == 0.1
        assert neuron.activation == 'sigmoid'
    
    def test_create_neuron_with_seed(self):
        """Test that seed produces reproducible results."""
        neuron1 = Neuron(input_count=3, seed=42)
        neuron2 = Neuron(input_count=3, seed=42)
        
        assert np.allclose(neuron1.weights, neuron2.weights)
        assert neuron1.bias == neuron2.bias
    
    def test_invalid_weights_count(self):
        """Test that mismatched weights raise error."""
        with pytest.raises(ValueError):
            Neuron(input_count=3, weights=[0.5, 0.3])  # Only 2 weights for 3 inputs
    
    def test_invalid_activation(self):
        """Test that invalid activation raises error."""
        with pytest.raises(ValueError):
            Neuron(input_count=3, activation='invalid_activation')


class TestNeuronForward:
    """Tests for neuron forward pass."""
    
    def test_forward_pass_identity(self):
        """Test forward pass with identity activation."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0, activation='identity')
        
        result = neuron.forward([1.0, 2.0])
        
        assert result['output'] == 3.0  # 1*1 + 2*1 + 0 = 3
        assert result['weighted_sum'] == 3.0
    
    def test_forward_pass_relu(self):
        """Test forward pass with ReLU activation."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0, activation='relu')
        
        # Positive case
        result = neuron.forward([1.0, 2.0])
        assert result['output'] == 3.0
        
        # Negative case (should be clamped to 0)
        result = neuron.forward([-1.0, -2.0])
        assert result['output'] == 0.0
    
    def test_forward_pass_sigmoid(self):
        """Test forward pass with sigmoid activation."""
        neuron = Neuron(input_count=1, weights=[1.0], bias=0.0, activation='sigmoid')
        
        result = neuron.forward([0.0])
        
        # sigmoid(0) = 0.5
        assert np.isclose(result['output'], 0.5)
    
    def test_forward_pass_tanh(self):
        """Test forward pass with tanh activation."""
        neuron = Neuron(input_count=1, weights=[1.0], bias=0.0, activation='tanh')
        
        result = neuron.forward([0.0])
        
        # tanh(0) = 0
        assert np.isclose(result['output'], 0.0)
    
    def test_forward_pass_with_bias(self):
        """Test that bias is correctly added."""
        neuron = Neuron(input_count=1, weights=[1.0], bias=0.5, activation='identity')
        
        result = neuron.forward([1.0])
        
        # 1*1 + 0.5 = 1.5
        assert result['output'] == 1.5
    
    def test_forward_wrong_input_count(self):
        """Test that wrong input count raises error."""
        neuron = Neuron(input_count=3)
        
        with pytest.raises(ValueError):
            neuron.forward([1.0, 2.0])  # Only 2 inputs for 3 expected
    
    def test_forward_returns_all_details(self):
        """Test that forward returns complete information."""
        neuron = Neuron(input_count=2, weights=[0.5, 0.3], bias=0.1, activation='relu')
        
        result = neuron.forward([1.0, 2.0])
        
        assert 'output' in result
        assert 'weighted_sum' in result
        assert 'contributions' in result
        assert 'activation_used' in result
        assert 'inputs' in result
        assert 'weights' in result
        assert 'bias' in result


class TestNeuronBackward:
    """Tests for neuron backward pass."""
    
    def test_backward_does_not_update_weights(self):
        """Test that backward pass does NOT update weights (only computes gradients)."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0, activation='identity')
        
        # Forward pass
        neuron.forward([1.0, 2.0])
        
        # Backward pass (computes gradients only)
        result = neuron.backward(output_gradient=1.0)
        
        # Weights should NOT have changed yet
        assert neuron.weights[0] == 1.0
        assert neuron.bias == 0.0
        
        # Now apply update
        update_result = neuron.update(result, learning_rate=0.1)
        
        # Now weights should have changed
        assert neuron.weights[0] != 1.0
        assert neuron.bias != 0.0
    
    def test_update_changes_weights(self):
        """Test that update actually changes weights."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0, activation='identity')
        
        # Forward pass
        neuron.forward([1.0, 2.0])
        
        # Get gradients
        gradients = neuron.backward(output_gradient=1.0)
        
        # Apply update
        result = neuron.update(gradients, learning_rate=0.1)
        
        # Check update result
        assert 'weight_changes' in result
        assert 'bias_change' in result
        assert 'new_weights' in result
        assert 'new_bias' in result
        
        # Weights should have moved
        assert result['new_weights'][0] != 1.0
    
    def test_backward_without_forward_raises(self):
        """Test that backward without forward raises error."""
        neuron = Neuron(input_count=2)
        
        with pytest.raises(RuntimeError):
            neuron.backward(output_gradient=1.0)
    
    def test_backward_returns_gradient_result(self):
        """Test that backward returns GradientResult."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0, activation='identity')
        
        neuron.forward([1.0, 2.0])
        result = neuron.backward(output_gradient=1.0)
        
        # Check GradientResult attributes
        assert hasattr(result, 'input_gradients')
        assert hasattr(result, 'weight_gradients')
        assert hasattr(result, 'bias_gradient')
        assert hasattr(result, 'activation_gradient')
        
        # Can also get via get_gradients()
        cached = neuron.get_gradients()
        assert cached is not None
    
    def test_backward_gradient_values(self):
        """Test that gradients are computed correctly for identity activation."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0, activation='identity')
        
        neuron.forward([1.0, 2.0])  # output = 3
        result = neuron.backward(output_gradient=1.0)
        
        # For identity activation, derivative is 1
        # Input gradients = weights * gradient = [1, 1] * 1 = [1, 1]
        assert np.allclose(result.input_gradients, [1.0, 1.0])
        
        # Weight gradients = inputs * gradient = [1, 2] * 1 = [1, 2]
        assert np.allclose(result.weight_gradients, [1.0, 2.0])
        
        # Bias gradient = gradient = 1
        assert np.isclose(result.bias_gradient, 1.0)


class TestNeuronState:
    """Tests for neuron state management."""
    
    def test_get_state(self):
        """Test getting neuron state."""
        neuron = Neuron(input_count=2, weights=[0.5, 0.3], bias=0.1, activation='relu')
        
        state = neuron.get_state()
        
        assert state['input_count'] == 2
        assert state['weights'] == [0.5, 0.3]
        assert state['bias'] == 0.1
        assert state['activation'] == 'relu'
        assert state['parameter_count'] == 3  # 2 weights + 1 bias
    
    def test_set_weights(self):
        """Test setting weights."""
        neuron = Neuron(input_count=2)
        
        neuron.set_weights([0.8, 0.9])
        
        assert neuron.weights.tolist() == [0.8, 0.9]
    
    def test_set_bias(self):
        """Test setting bias."""
        neuron = Neuron(input_count=2)
        
        neuron.set_bias(0.5)
        
        assert neuron.bias == 0.5
    
    def test_reset(self):
        """Test resetting internal state."""
        neuron = Neuron(input_count=2, weights=[1.0, 1.0], bias=0.0)
        
        neuron.forward([1.0, 2.0])
        assert neuron._last_output is not None
        
        neuron.reset()
        assert neuron._last_output is None
        assert neuron._last_input is None


class TestFactoryFunction:
    """Tests for the create_neuron factory function."""
    
    def test_create_neuron_default(self):
        """Test factory creates neuron with defaults."""
        neuron = create_neuron(input_count=3)
        
        assert neuron.input_count == 3
        assert neuron.activation == 'relu'
    
    def test_create_neuron_custom(self):
        """Test factory with custom activation."""
        neuron = create_neuron(input_count=3, activation='sigmoid', seed=42)
        
        assert neuron.activation == 'sigmoid'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
