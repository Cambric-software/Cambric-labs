"""
CAMBRIC LABS — MATHEMATICAL NEURAL ENGINE AUDIT

This test suite performs a rigorous mathematical correctness audit of the
neural engine, including:

1. Neuron forward-pass verification
2. Neuron backpropagation verification  
3. Numerical gradient checking for all activations
4. Layer gradient checking
5. Network gradient checking
6. Parameter update verification
7. Training verification
8. XOR test
9. Loss functions verification
10. Softmax verification
11. Serialization verification
12. Educational inspection

The audit uses finite-difference gradient checking as the gold standard for
verifying analytical gradient computation.
"""

import pytest
import numpy as np
from backend.neural.neuron import Neuron, GradientResult
from backend.neural.layer import Layer
from backend.neural.network import Network, create_simple_network
from backend.neural.activation import ActivationFunctions
from backend.neural.loss import LossFunctions
from backend.training.trainer import Trainer
from backend.training.backpropagation import Backpropagation


# ============================================================================
# SECTION 3: NEURON FORWARD-PASS VERIFICATION
# ============================================================================

class TestNeuronForwardVerification:
    """Verify the neuron implements: z = Σ(xᵢ × wᵢ) + b, output = activation(z)"""
    
    def test_identity_activation_math(self):
        """Test identity activation with manual calculation."""
        # Given: inputs=[1.0, 2.0], weights=[0.5, 0.3], bias=0.1
        # Expected: z = 1.0*0.5 + 2.0*0.3 + 0.1 = 0.5 + 0.6 + 0.1 = 1.2
        # Expected: output = identity(1.2) = 1.2
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        result = neuron.forward([1.0, 2.0])
        
        expected_z = 1.0 * 0.5 + 2.0 * 0.3 + 0.1
        expected_output = expected_z  # identity
        
        assert np.isclose(result['weighted_sum'], expected_z), \
            f"weighted_sum mismatch: got {result['weighted_sum']}, expected {expected_z}"
        assert np.isclose(result['output'], expected_output), \
            f"output mismatch: got {result['output']}, expected {expected_output}"
    
    def test_contributions_calculation(self):
        """Verify individual contributions are computed correctly."""
        neuron = Neuron(
            input_count=3,
            weights=[0.5, -0.3, 0.8],
            bias=0.2,
            activation='identity'
        )
        
        inputs = [1.0, 2.0, 3.0]
        result = neuron.forward(inputs)
        
        # Check individual contributions
        assert np.isclose(result['contributions'][0], 1.0 * 0.5)
        assert np.isclose(result['contributions'][1], 2.0 * (-0.3))
        assert np.isclose(result['contributions'][2], 3.0 * 0.8)
        
        # Check sum matches weighted_sum minus bias
        expected_z = sum(result['contributions']) + result['bias']
        assert np.isclose(result['weighted_sum'], expected_z)
    
    def test_relu_activation_positive(self):
        """Test ReLU with positive weighted sum."""
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],
            bias=0.0,
            activation='relu'
        )
        
        # z = 2.0, ReLU(2.0) = 2.0
        result = neuron.forward([1.0, 1.0])
        assert np.isclose(result['output'], 2.0)
    
    def test_relu_activation_negative(self):
        """Test ReLU with negative weighted sum (should clamp to 0)."""
        neuron = Neuron(
            input_count=2,
            weights=[-1.0, -1.0],
            bias=0.0,
            activation='relu'
        )
        
        # z = -2.0, ReLU(-2.0) = 0.0
        result = neuron.forward([1.0, 1.0])
        assert np.isclose(result['output'], 0.0)
    
    def test_sigmoid_activation_math(self):
        """Test sigmoid activation with known values."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='sigmoid'
        )
        
        # z = 0.0, sigmoid(0.0) = 0.5
        result = neuron.forward([0.0])
        assert np.isclose(result['output'], 0.5)
        
        # z = 1.0, sigmoid(1.0) = 1/(1+e^-1) ≈ 0.731
        result = neuron.forward([1.0])
        expected = 1.0 / (1.0 + np.exp(-1.0))
        assert np.isclose(result['output'], expected)
    
    def test_tanh_activation_math(self):
        """Test tanh activation with known values."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='tanh'
        )
        
        # z = 0.0, tanh(0.0) = 0.0
        result = neuron.forward([0.0])
        assert np.isclose(result['output'], 0.0)
        
        # z = 1.0, tanh(1.0) should match np.tanh(1.0)
        result = neuron.forward([1.0])
        assert np.isclose(result['output'], np.tanh(1.0))
    
    def test_leaky_relu_positive(self):
        """Test Leaky ReLU with positive weighted sum."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='leaky_relu'
        )
        
        # z = 1.0, LeakyReLU(1.0) = 1.0
        result = neuron.forward([1.0])
        assert np.isclose(result['output'], 1.0)
    
    def test_leaky_relu_negative(self):
        """Test Leaky ReLU with negative weighted sum (should scale by 0.01)."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='leaky_relu'
        )
        
        # z = -1.0, LeakyReLU(-1.0) = 0.01 * (-1.0) = -0.01
        result = neuron.forward([-1.0])
        assert np.isclose(result['output'], -0.01)


# ============================================================================
# SECTION 4: NEURON BACKPROPAGATION VERIFICATION
# ============================================================================

class TestNeuronBackpropagation:
    """Verify backpropagation equations:
    dL/dz = dL/dy × activation_derivative(z)
    dL/dwᵢ = dL/dz × xᵢ
    dL/db = dL/dz
    dL/dxᵢ = dL/dz × wᵢ
    """
    
    def test_identity_activation_gradients(self):
        """Verify gradients for identity activation.
        
        For identity activation:
        - dσ/dz = 1 (derivative is always 1)
        
        Given: inputs=[1.0, 2.0], weights=[0.5, 0.3], bias=0.1
        z = 1.2, output = 1.2
        
        If output_gradient = 1.0:
        - dL/dz = dL/dy × dσ/dz = 1.0 × 1.0 = 1.0
        - dL/dw₀ = dL/dz × x₀ = 1.0 × 1.0 = 1.0
        - dL/dw₁ = dL/dz × x₁ = 1.0 × 2.0 = 2.0
        - dL/db = dL/dz = 1.0
        - dL/dx₀ = dL/dz × w₀ = 1.0 × 0.5 = 0.5
        - dL/dx₁ = dL/dz × w₁ = 1.0 × 0.3 = 0.3
        """
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        neuron.forward([1.0, 2.0])
        result = neuron.backward(output_gradient=1.0)
        
        # dL/dz = 1.0 (identity derivative is 1)
        assert np.isclose(result.activation_gradient, 1.0)
        
        # dL/dw = dL/dz × x
        assert np.isclose(result.weight_gradients[0], 1.0 * 1.0)  # 1.0
        assert np.isclose(result.weight_gradients[1], 1.0 * 2.0)  # 2.0
        
        # dL/db = dL/dz
        assert np.isclose(result.bias_gradient, 1.0)
        
        # dL/dx = dL/dz × w
        assert np.isclose(result.input_gradients[0], 1.0 * 0.5)  # 0.5
        assert np.isclose(result.input_gradients[1], 1.0 * 0.3)  # 0.3
    
    def test_relu_gradients_active(self):
        """Verify ReLU gradients when neuron is active (z > 0).
        
        For ReLU when z > 0:
        - dσ/dz = 1
        
        Given: inputs=[1.0, 1.0], weights=[1.0, 1.0], bias=0.0
        z = 2.0 > 0, output = 2.0
        
        If output_gradient = 1.0:
        - dL/dz = 1.0 × 1.0 = 1.0
        - dL/dw = dL/dz × x = [1.0, 1.0]
        """
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],
            bias=0.0,
            activation='relu'
        )
        
        neuron.forward([1.0, 1.0])
        result = neuron.backward(output_gradient=1.0)
        
        # ReLU derivative is 1 when active
        assert np.isclose(result.activation_gradient, 1.0)
        
        # dL/dw = dL/dz × x
        assert np.isclose(result.weight_gradients[0], 1.0)
        assert np.isclose(result.weight_gradients[1], 1.0)
    
    def test_relu_gradients_inactive(self):
        """Verify ReLU gradients when neuron is inactive (z <= 0).
        
        For ReLU when z <= 0:
        - dσ/dz = 0
        
        Given: inputs=[1.0, 1.0], weights=[-1.0, -1.0], bias=0.0
        z = -2.0 < 0, output = 0.0
        
        If output_gradient = 1.0:
        - dL/dz = 1.0 × 0.0 = 0.0 (gradients flow through 0)
        - dL/dw = dL/dz × x = [0.0, 0.0]
        """
        neuron = Neuron(
            input_count=2,
            weights=[-1.0, -1.0],
            bias=0.0,
            activation='relu'
        )
        
        neuron.forward([1.0, 1.0])
        result = neuron.backward(output_gradient=1.0)
        
        # ReLU derivative is 0 when inactive
        assert np.isclose(result.activation_gradient, 0.0)
        
        # All gradients should be 0
        assert np.allclose(result.weight_gradients, [0.0, 0.0])
        assert np.isclose(result.bias_gradient, 0.0)
    
    def test_sigmoid_gradients(self):
        """Verify sigmoid activation gradients.
        
        For sigmoid:
        - dσ/dz = σ(z) × (1 - σ(z))
        
        Given: inputs=[1.0], weights=[1.0], bias=0.0
        z = 1.0, σ(z) ≈ 0.731
        
        If output_gradient = 1.0:
        - dσ/dz = 0.731 × 0.269 ≈ 0.197
        - dL/dz = 1.0 × 0.197 ≈ 0.197
        - dL/dw = dL/dz × x = 0.197 × 1.0 ≈ 0.197
        """
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='sigmoid'
        )
        
        neuron.forward([1.0])
        result = neuron.backward(output_gradient=1.0)
        
        # Calculate expected values
        sigmoid_output = 1.0 / (1.0 + np.exp(-1.0))  # ≈ 0.731
        sigmoid_deriv = sigmoid_output * (1 - sigmoid_output)  # ≈ 0.197
        expected_dL_dz = 1.0 * sigmoid_deriv
        
        assert np.isclose(result.activation_gradient, expected_dL_dz, rtol=1e-4)
        assert np.isclose(result.weight_gradients[0], expected_dL_dz * 1.0, rtol=1e-4)
    
    def test_backward_does_not_update_parameters(self):
        """Verify backward() computes gradients but does NOT update weights/bias."""
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],
            bias=0.5,
            activation='identity'
        )
        
        # Save original values
        orig_weights = neuron.weights.copy()
        orig_bias = neuron.bias
        
        # Forward and backward
        neuron.forward([1.0, 2.0])
        neuron.backward(output_gradient=1.0)
        
        # Weights and bias should NOT have changed
        assert np.allclose(neuron.weights, orig_weights), \
            "Weights changed during backward() - they should only change during update()"
        assert neuron.bias == orig_bias, \
            "Bias changed during backward() - it should only change during update()"


# ============================================================================
# SECTION 5: NUMERICAL GRADIENT CHECKING (CRITICAL)
# ============================================================================

class TestNumericalGradientChecking:
    """Verify gradients using finite differences.
    
    For each parameter θ:
        numerical_gradient = (L(θ + ε) - L(θ - ε)) / (2ε)
    
    We compare this against the analytical gradient from backpropagation.
    """
    
    EPSILON = 1e-5
    RTOL = 1e-3  # Relative tolerance for gradient comparison
    
    def _compute_numerical_weight_gradient(
        self, neuron, inputs, target, weight_idx, epsilon
    ):
        """Compute numerical gradient for a specific weight."""
        orig_weights = neuron.weights.copy()
        orig_bias = neuron.bias
        
        # L(θ + ε)
        neuron.weights = orig_weights.copy()
        neuron.weights[weight_idx] += epsilon
        out_plus = neuron.forward(inputs)['output']
        loss_plus = (out_plus - target) ** 2
        
        # L(θ - ε)
        neuron.weights = orig_weights.copy()
        neuron.weights[weight_idx] -= epsilon
        out_minus = neuron.forward(inputs)['output']
        loss_minus = (out_minus - target) ** 2
        
        # Restore
        neuron.weights = orig_weights.copy()
        neuron.bias = orig_bias
        
        # Numerical gradient
        return (loss_plus - loss_minus) / (2 * epsilon)
    
    def _compute_numerical_bias_gradient(self, neuron, inputs, target, epsilon):
        """Compute numerical gradient for bias."""
        orig_weights = neuron.weights.copy()
        orig_bias = neuron.bias
        
        # L(θ + ε)
        neuron.bias = orig_bias + epsilon
        out_plus = neuron.forward(inputs)['output']
        loss_plus = (out_plus - target) ** 2
        
        # L(θ - ε)
        neuron.bias = orig_bias - epsilon
        out_minus = neuron.forward(inputs)['output']
        loss_minus = (out_minus - target) ** 2
        
        # Restore
        neuron.weights = orig_weights.copy()
        neuron.bias = orig_bias
        
        # Numerical gradient
        return (loss_plus - loss_minus) / (2 * epsilon)
    
    def _compute_numerical_input_gradient(
        self, neuron, inputs, target, input_idx, epsilon
    ):
        """Compute numerical gradient for a specific input."""
        orig_weights = neuron.weights.copy()
        orig_bias = neuron.bias
        
        # L(x + ε)
        modified_inputs_plus = inputs.copy()
        modified_inputs_plus[input_idx] += epsilon
        out_plus = neuron.forward(modified_inputs_plus)['output']
        loss_plus = (out_plus - target) ** 2
        
        # L(x - ε)
        modified_inputs_minus = inputs.copy()
        modified_inputs_minus[input_idx] -= epsilon
        out_minus = neuron.forward(modified_inputs_minus)['output']
        loss_minus = (out_minus - target) ** 2
        
        # Restore
        neuron.weights = orig_weights.copy()
        neuron.bias = orig_bias
        
        # Numerical gradient
        return (loss_plus - loss_minus) / (2 * epsilon)
    
    def test_identity_weight_gradients_numerical(self):
        """Numerical check for identity activation weight gradients."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        
        # Forward and backward to get analytical gradients
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        # Check each weight
        for i in range(neuron.input_count):
            numerical = self._compute_numerical_weight_gradient(
                neuron, inputs, target, i, self.EPSILON
            )
            analytical = grad_result.weight_gradients[i]
            
            assert np.isclose(numerical, analytical, rtol=self.RTOL), \
                f"Weight {i}: numerical={numerical:.6f}, analytical={analytical:.6f}"
    
    def test_identity_bias_gradient_numerical(self):
        """Numerical check for identity activation bias gradient."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        
        # Forward and backward to get analytical gradients
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        numerical = self._compute_numerical_bias_gradient(
            neuron, inputs, target, self.EPSILON
        )
        analytical = grad_result.bias_gradient
        
        assert np.isclose(numerical, analytical, rtol=self.RTOL), \
            f"Bias: numerical={numerical:.6f}, analytical={analytical:.6f}"
    
    def test_identity_input_gradients_numerical(self):
        """Numerical check for input gradients."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        
        # Forward and backward
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        # Check each input
        for i in range(len(inputs)):
            numerical = self._compute_numerical_input_gradient(
                neuron, inputs, target, i, self.EPSILON
            )
            analytical = grad_result.input_gradients[i]
            
            assert np.isclose(numerical, analytical, rtol=self.RTOL), \
                f"Input {i}: numerical={numerical:.6f}, analytical={analytical:.6f}"
    
    def test_sigmoid_weight_gradient_numerical(self):
        """Numerical check for sigmoid activation weight gradients."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='sigmoid'
        )
        
        inputs = [1.0]
        target = 0.0
        
        # Forward and backward
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        numerical = self._compute_numerical_weight_gradient(
            neuron, inputs, target, 0, self.EPSILON
        )
        analytical = grad_result.weight_gradients[0]
        
        assert np.isclose(numerical, analytical, rtol=self.RTOL), \
            f"Sigmoid weight: numerical={numerical:.6f}, analytical={analytical:.6f}"
    
    def test_tanh_weight_gradient_numerical(self):
        """Numerical check for tanh activation weight gradients."""
        neuron = Neuron(
            input_count=1,
            weights=[0.5],
            bias=0.0,
            activation='tanh'
        )
        
        inputs = [2.0]
        target = 0.0
        
        # Forward and backward
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        numerical = self._compute_numerical_weight_gradient(
            neuron, inputs, target, 0, self.EPSILON
        )
        analytical = grad_result.weight_gradients[0]
        
        assert np.isclose(numerical, analytical, rtol=self.RTOL), \
            f"Tanh weight: numerical={numerical:.6f}, analytical={analytical:.6f}"
    
    def test_relu_weight_gradient_numerical_active(self):
        """Numerical check for ReLU weight gradients when active."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='relu'
        )
        
        inputs = [1.0]
        target = 0.0
        
        # Forward and backward
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        numerical = self._compute_numerical_weight_gradient(
            neuron, inputs, target, 0, self.EPSILON
        )
        analytical = grad_result.weight_gradients[0]
        
        assert np.isclose(numerical, analytical, rtol=self.RTOL), \
            f"ReLU (active) weight: numerical={numerical:.6f}, analytical={analytical:.6f}"
    
    def test_leaky_relu_weight_gradient_numerical_negative(self):
        """Numerical check for Leaky ReLU weight gradients when negative."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='leaky_relu'
        )
        
        # Use negative input so leaky ReLU is active with small slope
        inputs = [-1.0]
        target = 0.0
        
        # Forward and backward
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=2 * (neuron._last_output - target))
        
        numerical = self._compute_numerical_weight_gradient(
            neuron, inputs, target, 0, self.EPSILON
        )
        analytical = grad_result.weight_gradients[0]
        
        assert np.isclose(numerical, analytical, rtol=self.RTOL), \
            f"Leaky ReLU (negative) weight: numerical={numerical:.6f}, analytical={analytical:.6f}"


# ============================================================================
# SECTION 6: LAYER GRADIENT CHECK
# ============================================================================

class TestLayerGradientCheck:
    """Verify Layer backward pass computes gradients correctly."""
    
    def test_layer_gradient_shapes(self):
        """Verify layer returns gradients with correct shapes."""
        layer = Layer(
            name='test',
            input_dim=3,
            output_dim=2,
            activation='identity'
        )
        
        inputs = [1.0, 2.0, 3.0]
        
        layer.forward(inputs)
        result = layer.backward([1.0, 1.0])
        
        # Input gradients should match input dimension
        assert len(result['input_gradients']) == 3
        
        # Should have gradients for each neuron
        assert len(result['neuron_gradients']) == 2
    
    def test_layer_accumulates_input_gradients(self):
        """Verify layer sums input gradients from all neurons."""
        layer = Layer(
            name='test',
            input_dim=2,
            output_dim=2,
            activation='identity'
        )
        
        # Set specific weights for verification
        layer.set_neuron_weights(0, [1.0, 0.0])
        layer.set_neuron_weights(1, [0.0, 1.0])
        
        inputs = [1.0, 2.0]
        
        layer.forward(inputs)
        result = layer.backward([1.0, 1.0])
        
        # Input 0 gets gradient from neuron 0 only (weight = 1.0)
        # Input 1 gets gradient from neuron 1 only (weight = 1.0)
        # Total: [1.0, 1.0]
        assert np.isclose(result['input_gradients'][0], 1.0)
        assert np.isclose(result['input_gradients'][1], 1.0)
    
    def test_small_layer_numerical_gradient_check(self):
        """Numerical gradient check on a small deterministic layer."""
        layer = Layer(
            name='test',
            input_dim=2,
            output_dim=2,
            activation='identity'
        )
        
        # Set deterministic weights
        layer.set_neuron_weights(0, [0.5, 0.3])
        layer.set_neuron_weights(1, [0.7, 0.9])
        layer.set_neuron_bias(0, 0.1)
        layer.set_neuron_bias(1, 0.2)
        
        inputs = [1.0, 2.0]
        target = [0.5, 0.5]
        epsilon = 1e-5
        
        # Forward pass
        layer.forward(inputs)
        
        # Compute loss gradient for MEAN-based MSE
        # dL/doutput = 2 * (output - target) / n
        output = layer._last_outputs
        n = len(target)
        loss_grad = 2 * (output - np.array(target)) / n
        
        # Get analytical gradients
        result = layer.backward(loss_grad.tolist())
        
        # Check first neuron's first weight gradient numerically
        # Store original
        orig_weight = layer.neurons[0].weights[0]
        
        # L(θ + ε) - use np.mean to match production MSE loss
        layer.neurons[0].weights[0] = orig_weight + epsilon
        out_plus = layer.forward(inputs)['outputs']
        loss_plus = np.mean((out_plus - np.array(target)) ** 2)
        
        # L(θ - ε) - use np.mean to match production MSE loss
        layer.neurons[0].weights[0] = orig_weight - epsilon
        out_minus = layer.forward(inputs)['outputs']
        loss_minus = np.mean((out_minus - np.array(target)) ** 2)
        
        # Restore
        layer.neurons[0].weights[0] = orig_weight
        
        numerical_grad = (loss_plus - loss_minus) / (2 * epsilon)
        analytical_grad = result['neuron_gradients'][0]['weight_gradients'][0]
        
        assert np.isclose(numerical_grad, analytical_grad, rtol=1e-3), \
            f"Layer weight gradient: numerical={numerical_grad:.6f}, analytical={analytical_grad:.6f}"


# ============================================================================
# SECTION 8: NETWORK BACKPROPAGATION
# ============================================================================

class TestNetworkBackpropagation:
    """Verify network backward pass propagates gradients correctly."""
    
    def test_network_gradient_flow_direction(self):
        """Verify gradients flow from output to input layer."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        # Set deterministic weights
        network.layers[0].set_neuron_weights(0, [1.0, 0.0])
        network.layers[0].set_neuron_weights(1, [0.0, 1.0])
        network.layers[1].set_neuron_weights(0, [1.0, 1.0])
        
        inputs = [1.0, 2.0]
        targets = [1.0]
        
        # Forward pass
        forward_result = network.forward(inputs)
        
        # Get output
        output = forward_result['output'][0]
        
        # Compute loss gradient
        loss_grad = [2 * (output - targets[0])]
        
        # Backward pass
        backward_result = network.backward(loss_grad)
        
        # Should have gradients for both layers
        assert len(backward_result['layer_gradients']) == 2
        
        # First layer (index 0) gradients should be non-trivial
        l1_grads = backward_result['layer_gradients'][0]
        assert len(l1_grads['input_gradients']) == 2
    
    def test_network_backward_preserves_weights(self):
        """Verify network.backward() does NOT update weights."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        
        # Save original weights
        orig_weights = [layer.weights_matrix.copy() for layer in network.layers]
        
        network.forward([1.0, 2.0])
        network.backward([1.0, 1.0])
        
        # Weights should not have changed
        for i, layer in enumerate(network.layers):
            assert np.allclose(layer.weights_matrix, orig_weights[i]), \
                f"Layer {i} weights changed during backward()"


# ============================================================================
# SECTION 9: COMPLETE NETWORK NUMERICAL GRADIENT CHECK
# ============================================================================

class TestCompleteNetworkGradientCheck:
    """Mandatory numerical gradient checking on complete networks."""
    
    def test_2_layer_network_all_weights(self):
        """Check ALL weights in a tiny 2-layer network."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        inputs = [1.0, 2.0]
        target = [0.5]
        epsilon = 1e-5
        
        # Get analytical gradients for all weights
        forward_result = network.forward(inputs)
        output = forward_result['output'][0]
        loss_grad = [2 * (output - target[0])]
        backward_result = network.backward(loss_grad)
        
        # Check layer 1 weight gradients
        for neuron_idx in range(2):
            for weight_idx in range(2):
                orig_weight = network.layers[0].neurons[neuron_idx].weights[weight_idx]
                
                # L(θ + ε)
                network.layers[0].neurons[neuron_idx].weights[weight_idx] = orig_weight + epsilon
                network.reset_cache()
                out_plus = network.forward(inputs)['output'][0]
                loss_plus = (out_plus - target[0]) ** 2
                
                # L(θ - ε)
                network.layers[0].neurons[neuron_idx].weights[weight_idx] = orig_weight - epsilon
                network.reset_cache()
                out_minus = network.forward(inputs)['output'][0]
                loss_minus = (out_minus - target[0]) ** 2
                
                # Restore
                network.layers[0].neurons[neuron_idx].weights[weight_idx] = orig_weight
                network.reset_cache()
                
                numerical = (loss_plus - loss_minus) / (2 * epsilon)
                analytical = backward_result['layer_gradients'][0]['neuron_gradients'][neuron_idx]['weight_gradients'][weight_idx]
                
                assert np.isclose(numerical, analytical, rtol=1e-3), \
                    f"L1 N{neuron_idx} W{weight_idx}: num={numerical:.6f}, ana={analytical:.6f}"
        
        # Check layer 2 weight gradients
        for weight_idx in range(2):
            orig_weight = network.layers[1].neurons[0].weights[weight_idx]
            
            # L(θ + ε)
            network.layers[1].neurons[0].weights[weight_idx] = orig_weight + epsilon
            network.reset_cache()
            out_plus = network.forward(inputs)['output'][0]
            loss_plus = (out_plus - target[0]) ** 2
            
            # L(θ - ε)
            network.layers[1].neurons[0].weights[weight_idx] = orig_weight - epsilon
            network.reset_cache()
            out_minus = network.forward(inputs)['output'][0]
            loss_minus = (out_minus - target[0]) ** 2
            
            # Restore
            network.layers[1].neurons[0].weights[weight_idx] = orig_weight
            network.reset_cache()
            
            numerical = (loss_plus - loss_minus) / (2 * epsilon)
            analytical = backward_result['layer_gradients'][1]['neuron_gradients'][0]['weight_gradients'][weight_idx]
            
            assert np.isclose(numerical, analytical, rtol=1e-3), \
                f"L2 W{weight_idx}: num={numerical:.6f}, ana={analytical:.6f}"


# ============================================================================
# SECTION 10: PARAMETER UPDATE VERIFICATION
# ============================================================================

class TestParameterUpdate:
    """Verify update() changes parameters correctly."""
    
    def test_update_formula(self):
        """Verify parameter_new = parameter_old - learning_rate × gradient."""
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],
            bias=0.5,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        learning_rate = 0.1
        
        # Forward and backward
        neuron.forward(inputs)
        grad_result = neuron.backward(output_gradient=1.0)
        
        # Save original
        orig_weights = neuron.weights.copy()
        orig_bias = neuron.bias
        
        # Apply update
        neuron.update(grad_result, learning_rate=learning_rate)
        
        # Verify formula: parameter_new = parameter_old - lr × gradient
        expected_weights = orig_weights - learning_rate * grad_result.weight_gradients
        expected_bias = orig_bias - learning_rate * grad_result.bias_gradient
        
        assert np.allclose(neuron.weights, expected_weights), \
            f"Weights mismatch: got {neuron.weights}, expected {expected_weights}"
        assert np.isclose(neuron.bias, expected_bias), \
            f"Bias mismatch: got {neuron.bias}, expected {expected_bias}"
    
    def test_update_returns_change_details(self):
        """Verify update() returns information about changes."""
        neuron = Neuron(
            input_count=2,
            weights=[1.0, 1.0],
            bias=0.0,
            activation='identity'
        )
        
        neuron.forward([1.0, 2.0])
        grad_result = neuron.backward(output_gradient=1.0)
        result = neuron.update(grad_result, learning_rate=0.1)
        
        # Should return change details
        assert 'weight_changes' in result
        assert 'bias_change' in result
        assert 'old_weights' in result
        assert 'new_weights' in result
        
        # Changes should match formula
        expected_change = -0.1 * grad_result.weight_gradients[0]
        assert np.isclose(result['weight_changes'][0], expected_change)


# ============================================================================
# SECTION 11: TRAINING VERIFICATION
# ============================================================================

class TestTrainingVerification:
    """Verify the training process actually learns."""
    
    def test_loss_decreases(self):
        """Verify loss decreases during training."""
        network = Network(name="test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=4, activation='relu'))
        network.add_layer(Layer(name="output", input_dim=4, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.1)
        
        inputs = [1.0, 2.0]
        targets = [3.0]  # Use reasonable target that won't cause overflow
        
        # Initial loss
        pred = network.forward(inputs)['output'][0]
        initial_loss = (pred - targets[0]) ** 2
        
        # Train for several cycles
        losses = [initial_loss]
        for _ in range(50):
            result = trainer.single_cycle(inputs, targets)
            losses.append(result['loss'])
        
        # Loss should generally decrease (allowing for some fluctuation)
        final_loss = losses[-1]
        
        # For this simple problem, loss should decrease significantly
        assert final_loss < initial_loss, \
            f"Loss did not decrease: initial={initial_loss:.6f}, final={final_loss:.6f}"
    
    def test_weights_change_during_training(self):
        """Verify weights actually change during training."""
        network = Network(name="test")
        network.add_layer(Layer(name="dense", input_dim=2, output_dim=2, activation='identity'))
        
        # Save initial weights
        initial_weights = network.layers[0].weights_matrix.copy()
        
        trainer = Trainer(network, learning_rate=0.1)
        trainer.single_cycle([1.0, 2.0], [1.0])
        
        # Weights should have changed
        assert not np.allclose(network.layers[0].weights_matrix, initial_weights), \
            "Weights did not change during training"


# ============================================================================
# SECTION 12: XOR TEST
# ============================================================================

class TestXOR:
    """Test XOR problem - requires nonlinearity to solve."""
    
    def test_xor_learning(self):
        """Test that the network can learn XOR.
        
        XOR truth table:
        [0, 0] → 0
        [0, 1] → 1
        [1, 0] → 1
        [1, 1] → 0
        
        This requires a hidden layer with nonlinear activation.
        """
        # Create network with hidden layer - use fixed seed for determinism
        network = Network(name="xor")
        network.add_layer(Layer(name="hidden", input_dim=2, output_dim=8, activation='relu', seed=42))
        network.add_layer(Layer(name="output", input_dim=8, output_dim=1, activation='sigmoid', seed=42))
        
        trainer = Trainer(network, learning_rate=0.5)
        
        # XOR training data
        X = [
            [0.0, 0.0],
            [0.0, 1.0],
            [1.0, 0.0],
            [1.0, 1.0]
        ]
        y = [
            [0.0],
            [1.0],
            [1.0],
            [0.0]
        ]
        
        # Train - more epochs for reliability
        losses = []
        for _ in range(1000):
            for xi, yi in zip(X, y):
                result = trainer.single_cycle(xi, yi)
                losses.append(result['loss'])
        
        # Test predictions
        predictions = []
        for xi in X:
            pred = network.forward(xi)['output'][0]
            predictions.append(pred)
        
        # XOR should be approximately correct (use looser thresholds due to sigmoid)
        # [0,0] → near 0
        # [0,1] → near 1
        # [1,0] → near 1
        # [1,1] → near 0
        assert predictions[0] < 0.4, f"XOR(0,0) should be near 0, got {predictions[0]}"
        assert predictions[1] > 0.6, f"XOR(0,1) should be near 1, got {predictions[1]}"
        assert predictions[2] > 0.6, f"XOR(1,0) should be near 1, got {predictions[2]}"
        assert predictions[3] < 0.4, f"XOR(1,1) should be near 0, got {predictions[3]}"
    
    def test_xor_requires_nonlinearity(self):
        """Verify XOR fails with only linear activations."""
        # Single layer network with identity activation cannot learn XOR
        network = Network(name="linear")
        network.add_layer(Layer(name="output", input_dim=2, output_dim=1, activation='identity'))
        
        trainer = Trainer(network, learning_rate=0.1)
        
        X = [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]
        y = [[0.0], [1.0], [1.0], [0.0]]
        
        # Train
        for _ in range(100):
            for xi, yi in zip(X, y):
                trainer.single_cycle(xi, yi)
        
        # Test predictions
        predictions = [network.forward(xi)['output'][0] for xi in X]
        
        # With linear network, XOR cannot be learned
        # All predictions should be the same (the average of targets)
        # This test verifies the nonlinearity is necessary
        std = np.std(predictions)
        assert std < 0.5, \
            f"Linear network should not solve XOR, but got varied predictions: {predictions}"


# ============================================================================
# SECTION 13: LOSS FUNCTIONS
# ============================================================================

class TestLossFunctions:
    """Verify loss functions and their gradients."""
    
    def test_mse_loss_and_gradient(self):
        """Test MSE loss and gradient."""
        predictions = [1.0, 2.0, 3.0]
        targets = [1.1, 1.9, 3.2]
        
        loss = LossFunctions.mse(predictions, targets)
        gradients = LossFunctions.mse_derivative(predictions, targets)
        
        # Manual calculation
        expected_loss = np.mean((np.array(predictions) - np.array(targets)) ** 2)
        expected_grads = 2 * (np.array(predictions) - np.array(targets)) / len(predictions)
        
        assert np.isclose(loss, expected_loss)
        assert np.allclose(gradients, expected_grads.tolist())
    
    def test_cross_entropy_numerical_stability(self):
        """Test cross-entropy handles edge cases."""
        # Very small predictions
        predictions = [1e-15]
        targets = [1.0]
        
        loss = LossFunctions.cross_entropy(predictions, targets)
        assert not np.isnan(loss)
        assert not np.isinf(loss)
        
        # Very large predictions
        predictions = [1.0 - 1e-15]
        targets = [0.0]
        
        loss = LossFunctions.cross_entropy(predictions, targets)
        assert not np.isnan(loss)
        assert not np.isinf(loss)
    
    def test_cross_entropy_gradient_numerical(self):
        """Numerical gradient check for cross-entropy."""
        predictions = [0.7]
        targets = [1.0]
        
        analytical_grads = LossFunctions.cross_entropy_derivative(predictions, targets)
        
        # Numerical gradient
        epsilon = 1e-5
        numerical_grads = []
        
        for i in range(len(predictions)):
            # L(p + ε)
            pred_plus = predictions.copy()
            pred_plus[i] += epsilon
            loss_plus = LossFunctions.cross_entropy(pred_plus, targets)
            
            # L(p - ε)
            pred_minus = predictions.copy()
            pred_minus[i] -= epsilon
            loss_minus = LossFunctions.cross_entropy(pred_minus, targets)
            
            numerical = (loss_plus - loss_minus) / (2 * epsilon)
            numerical_grads.append(numerical)
        
        assert np.allclose(numerical_grads, analytical_grads, rtol=1e-3)


# ============================================================================
# SECTION 14: SOFTMAX
# ============================================================================

class TestSoftmax:
    """Verify softmax implementation."""
    
    def test_softmax_properties(self):
        """Verify softmax produces valid probabilities."""
        logits = [1.0, 2.0, 3.0]
        probs = ActivationFunctions.softmax(logits)
        
        # All probabilities should be positive
        for p in probs:
            assert p > 0.0, f"Probability {p} should be positive"
        
        # Sum should be 1
        assert np.isclose(sum(probs), 1.0), f"Sum should be 1, got {sum(probs)}"
    
    def test_softmax_numerical_stability(self):
        """Verify softmax handles large values."""
        # Large positive logits
        logits = [1000.0, 1001.0, 1002.0]
        probs = ActivationFunctions.softmax(logits)
        
        for p in probs:
            assert not np.isnan(p)
            assert not np.isinf(p)
        
        # Large negative logits
        logits = [-1000.0, -1001.0, -1002.0]
        probs = ActivationFunctions.softmax(logits)
        
        for p in probs:
            assert not np.isnan(p)
            assert not np.isinf(p)
        
        # Sum should still be 1
        assert np.isclose(sum(probs), 1.0)
    
    def test_softmax_largest_logit_highest_prob(self):
        """Verify largest logit gets highest probability."""
        logits = [1.0, 5.0, 3.0]
        probs = ActivationFunctions.softmax(logits)
        
        max_idx = np.argmax(probs)
        assert max_idx == 1, "Largest logit should have highest probability"
    
    def test_softmax_shift_improves_stability(self):
        """Verify softmax uses shifting for numerical stability."""
        # Without proper shifting, exp(1000) would overflow
        logits = [1000.0, 1000.0, 1000.0]
        probs = ActivationFunctions.softmax(logits)
        
        # All should be equal and valid
        for p in probs:
            assert np.isclose(p, 1.0/3.0, rtol=1e-10)


# ============================================================================
# SECTION 15: SERIALIZATION
# ============================================================================

class TestSerialization:
    """Verify network serialization/deserialization."""
    
    def test_neuron_roundtrip(self):
        """Verify neuron state is preserved after export/import."""
        neuron = Neuron(
            input_count=3,
            weights=[0.1, 0.2, 0.3],
            bias=0.5,
            activation='relu'
        )
        
        # Get state
        state = neuron.get_state()
        
        # Create new neuron from state
        new_neuron = Neuron(
            input_count=state['input_count'],
            weights=state['weights'],
            bias=state['bias'],
            activation=state['activation']
        )
        
        # Same input should produce same output
        inputs = [1.0, 2.0, 3.0]
        out1 = neuron.forward(inputs)['output']
        out2 = new_neuron.forward(inputs)['output']
        
        assert np.isclose(out1, out2)
    
    def test_network_roundtrip(self):
        """Verify network state is preserved after export/import."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=4, activation='relu'))
        network.add_layer(Layer(name="l2", input_dim=4, output_dim=1, activation='identity'))
        
        # Export
        data = network.to_dict()
        
        # Import
        new_network = Network.from_dict(data)
        
        # Same input should produce same output
        inputs = [1.0, 2.0]
        out1 = network.forward(inputs)['output']
        out2 = new_network.forward(inputs)['output']
        
        for o1, o2 in zip(out1, out2):
            assert np.isclose(o1, o2)
    
    def test_trained_network_roundtrip(self):
        """Verify trained network preserves learned weights."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        
        # Train
        trainer = Trainer(network, learning_rate=0.1)
        for _ in range(10):
            trainer.single_cycle([1.0, 2.0], [1.0])
        
        # Export and import
        data = network.to_dict()
        new_network = Network.from_dict(data)
        
        # Predictions should match
        inputs = [1.0, 2.0]
        pred1 = network.forward(inputs)['output']
        pred2 = new_network.forward(inputs)['output']
        
        for p1, p2 in zip(pred1, pred2):
            assert np.isclose(p1, p2, rtol=1e-10)


# ============================================================================
# SECTION 16: EDUCATIONAL INSPECTION
# ============================================================================

class TestEducationalInspection:
    """Verify the engine exposes values for visualization."""
    
    def test_neuron_exposes_forward_details(self):
        """Verify neuron provides all details for forward visualization."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='relu'
        )
        
        result = neuron.forward([1.0, 2.0])
        
        # Required for visualization
        assert 'output' in result
        assert 'weighted_sum' in result
        assert 'contributions' in result
        assert 'activation_used' in result
        assert 'inputs' in result
        assert 'weights' in result
        assert 'bias' in result
    
    def test_neuron_exposes_gradient_details(self):
        """Verify neuron provides gradient details for visualization."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        neuron.forward([1.0, 2.0])
        grad_result = neuron.backward(1.0)
        
        # Required for gradient visualization
        assert hasattr(grad_result, 'input_gradients')
        assert hasattr(grad_result, 'weight_gradients')
        assert hasattr(grad_result, 'bias_gradient')
        assert hasattr(grad_result, 'activation_gradient')
    
    def test_neuron_inspect_method(self):
        """Verify inspect() provides complete state."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='relu'
        )
        
        neuron.forward([1.0, 2.0])
        neuron.backward(1.0)
        
        state = neuron.inspect()
        
        # Should have all state
        assert 'weights' in state
        assert 'bias' in state
        assert 'cached' in state
        assert 'gradients' in state


# ============================================================================
# MAIN RUNNER
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
