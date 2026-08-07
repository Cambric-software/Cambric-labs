"""
CAMBRIC LABS — GRADIENT VERIFICATION TESTS

This test module verifies the mathematical correctness of the neural engine's
gradients using finite-difference (numerical) gradient checking.

For each parameter θ:
    numerical_gradient = (L(θ + ε) - L(θ - ε)) / (2ε)
    
Where ε = 1e-5.

The numerical gradient is compared against the analytical gradient from backpropagation.
If they match (within tolerance), the backpropagation is proven correct.
"""

import pytest
import numpy as np
from backend.neural.neuron import Neuron, GradientResult
from backend.neural.layer import Layer
from backend.neural.network import Network
from backend.neural.loss import LossFunctions
from backend.neural.activation import ActivationFunctions
from tests.test_numerical_gradients import (
    NumericalGradientChecker,
    LayerGradientChecker,
    NetworkGradientChecker,
    verify_duplicate_backward_bug,
    verify_backward_no_update,
    verify_update_formula,
    verify_loss_gradient_numerical,
    DEFAULT_EPSILON,
    DEFAULT_RTOL
)


# ============================================================================
# SECTION 2-3: NUMERICAL GRADIENT UTILITY AND COMPARISON
# ============================================================================

class TestNumericalGradientUtility:
    """Test the numerical gradient checking utility itself."""
    
    def test_utility_computes_numerical_gradient(self):
        """Verify the utility correctly computes finite-difference gradients."""
        # Create a simple test case where we know the answer
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='identity'
        )
        
        inputs = [1.0]
        target = 0.0
        epsilon = 1e-5
        
        # For identity activation with input=1, weight=1, bias=0:
        # output = 1*1 + 0 = 1
        # dL/dw = dL/dz * dz/dw = 2*(1-0) * 1 = 2
        # Numerical: (L(w+ε) - L(w-ε)) / (2ε)
        # L(w) = (1*1 - 0)^2 = 1
        # L(w+ε) = ((1+ε)*1 - 0)^2 = (1+ε)^2
        # L(w-ε) = ((1-ε)*1 - 0)^2 = (1-ε)^2
        # (L(w+ε) - L(w-ε)) / (2ε) = ((1+ε)^2 - (1-ε)^2) / (2ε)
        #                           = (1 + 2ε + ε² - 1 + 2ε - ε²) / (2ε)
        #                           = 4ε / (2ε) = 2
        
        checker = NumericalGradientChecker(epsilon=epsilon)
        numerical = checker.compute_numerical_weight_gradient(neuron, inputs, target, 0)
        
        # Should be very close to 2
        assert np.isclose(numerical, 2.0, rtol=1e-3), f"Expected 2.0, got {numerical}"
    
    def test_comparison_utility(self):
        """Test the gradient comparison utility."""
        checker = NumericalGradientChecker()
        
        # Identical gradients should pass
        result = checker._compare_gradient("test", 1.0, 1.0)
        assert result.passed
        
        # Close gradients should pass
        result = checker._compare_gradient("test", 1.0, 1.001)
        assert result.passed
        
        # Far gradients should fail
        result = checker._compare_gradient("test", 1.0, 2.0)
        assert not result.passed
    
    def test_relative_error_calculation(self):
        """Test relative error calculation."""
        checker = NumericalGradientChecker()
        
        # When both are small, relative error should still be computed correctly
        rel_error = checker._compute_relative_error(0.0, 0.0)
        assert rel_error < 1e-6  # Should use the small constant


# ============================================================================
# SECTION 4: NEURON GRADIENT TEST
# ============================================================================

class TestNeuronGradients:
    """Test neuron gradients using numerical methods."""
    
    def test_identity_activation_all_weights(self):
        """Test ALL weight gradients for identity activation."""
        neuron = Neuron(
            input_count=3,
            weights=[0.5, -0.3, 0.8],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0, 3.0]
        target = 0.5
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        # Check weight gradients
        weight_results = [r for r in results if r.name.startswith("weight")]
        assert len(weight_results) == 3
        
        for result in weight_results:
            assert result.passed, f"{result.name} failed: analytical={result.analytical}, numerical={result.numerical}, rel_error={result.rel_error}"
    
    def test_identity_activation_bias(self):
        """Test bias gradient for identity activation."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        bias_result = [r for r in results if r.name == "bias"][0]
        assert bias_result.passed, f"bias failed: analytical={bias_result.analytical}, numerical={bias_result.numerical}"
    
    def test_identity_activation_inputs(self):
        """Test input gradients for identity activation."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, 0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        input_results = [r for r in results if r.name.startswith("input")]
        assert len(input_results) == 2
        
        for result in input_results:
            assert result.passed, f"{result.name} failed: analytical={result.analytical}, numerical={result.numerical}"


# ============================================================================
# SECTION 5: TEST MULTIPLE ACTIVATIONS
# ============================================================================

class TestActivationGradients:
    """Test gradients for all supported activations."""
    
    def test_sigmoid_gradient(self):
        """Test sigmoid activation gradients."""
        # Use non-trivial input so gradient isn't near zero
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='sigmoid'
        )
        
        inputs = [1.0]
        target = 0.0
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        weight_result = [r for r in results if r.name == "weight[0]"][0]
        assert weight_result.passed, f"Sigmoid weight gradient failed: rel_error={weight_result.rel_error}"
    
    def test_tanh_gradient(self):
        """Test tanh activation gradients."""
        neuron = Neuron(
            input_count=1,
            weights=[0.5],
            bias=0.0,
            activation='tanh'
        )
        
        inputs = [2.0]
        target = 0.0
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        weight_result = [r for r in results if r.name == "weight[0]"][0]
        assert weight_result.passed, f"Tanh weight gradient failed: rel_error={weight_result.rel_error}"
    
    def test_relu_gradient_active(self):
        """Test ReLU activation when neuron is active (z > 0).
        
        Note: We avoid z = 0 exactly because ReLU derivative is not defined there.
        """
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='relu'
        )
        
        inputs = [1.0]  # z = 1 > 0, so ReLU is active
        target = 0.0
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        weight_result = [r for r in results if r.name == "weight[0]"][0]
        assert weight_result.passed, f"ReLU (active) weight gradient failed: rel_error={weight_result.rel_error}"
    
    def test_relu_gradient_inactive(self):
        """Test ReLU activation when neuron is inactive (z <= 0)."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='relu'
        )
        
        inputs = [-1.0]  # z = -1 < 0, so ReLU is inactive (derivative = 0)
        target = 1.0  # Target = 1 so gradient is non-zero
        
        # Forward to verify z is negative
        result = neuron.forward(inputs)
        assert result['output'] == 0.0  # ReLU clamps negative to 0
        assert result['weighted_sum'] < 0  # z is negative
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        # When ReLU is inactive, gradient should be 0
        weight_result = [r for r in results if r.name == "weight[0]"][0]
        
        # Both analytical and numerical should be near 0
        assert abs(weight_result.analytical) < 1e-10
        assert abs(weight_result.numerical) < 1e-10
    
    def test_leaky_relu_gradient_negative(self):
        """Test Leaky ReLU when z < 0 (should use alpha slope)."""
        neuron = Neuron(
            input_count=1,
            weights=[1.0],
            bias=0.0,
            activation='leaky_relu'
        )
        
        inputs = [-1.0]  # z = -1 < 0
        target = 0.0
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        weight_result = [r for r in results if r.name == "weight[0]"][0]
        assert weight_result.passed, f"Leaky ReLU gradient failed: rel_error={weight_result.rel_error}"
    
    def test_identity_gradient(self):
        """Test identity (linear) activation gradients."""
        neuron = Neuron(
            input_count=2,
            weights=[0.5, -0.3],
            bias=0.1,
            activation='identity'
        )
        
        inputs = [1.0, 2.0]
        target = 0.5
        
        checker = NumericalGradientChecker()
        results = checker.check_neuron_gradients(neuron, inputs, target)
        
        # All gradients should pass
        failed = [r for r in results if not r.passed]
        assert len(failed) == 0, f"Failed gradients: {failed}"


# ============================================================================
# SECTION 6: LAYER GRADIENT TEST
# ============================================================================

class TestLayerGradients:
    """Test layer gradients using numerical methods."""
    
    def test_small_layer_all_weights(self):
        """Test all weights in a small deterministic layer."""
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
        targets = [0.5, 0.5]
        
        checker = LayerGradientChecker()
        
        # Forward first
        layer.forward(inputs)
        output = layer._last_outputs
        
        # Now backward with loss gradients
        loss_grad = 2 * (output - np.array(targets))
        backward_result = layer.backward(loss_grad.tolist())
        
        # Check each neuron's weights
        max_rel_error = 0.0
        for neuron_idx in range(2):
            for weight_idx in range(2):
                numerical = checker.compute_numerical_layer_weight_gradient(
                    layer, inputs, targets, neuron_idx, weight_idx
                )
                analytical = backward_result['neuron_gradients'][neuron_idx]['weight_gradients'][weight_idx]
                
                # Compare
                abs_diff = abs(analytical - numerical)
                max_val = max(abs(analytical), abs(numerical), 1e-8)
                rel_error = abs_diff / max_val
                max_rel_error = max(max_rel_error, rel_error)
        
        assert max_rel_error < 1e-3, f"Layer weight gradient max rel_error: {max_rel_error}"
    
    def test_small_layer_all_biases(self):
        """Test all biases in a small deterministic layer."""
        layer = Layer(
            name='test',
            input_dim=2,
            output_dim=2,
            activation='identity'
        )
        
        layer.set_neuron_weights(0, [1.0, 1.0])
        layer.set_neuron_weights(1, [1.0, 1.0])
        
        inputs = [1.0, 2.0]
        targets = [0.5, 0.5]
        
        checker = LayerGradientChecker()
        
        # Forward first
        layer.forward(inputs)
        output = layer._last_outputs
        
        # Now backward with loss gradients
        loss_grad = 2 * (output - np.array(targets))
        backward_result = layer.backward(loss_grad.tolist())
        
        # Check each neuron's bias
        max_rel_error = 0.0
        for neuron_idx in range(2):
            numerical = checker.compute_numerical_layer_bias_gradient(
                layer, inputs, targets, neuron_idx
            )
            analytical = backward_result['neuron_gradients'][neuron_idx]['bias_gradient']
            
            abs_diff = abs(analytical - numerical)
            max_val = max(abs(analytical), abs(numerical), 1e-8)
            rel_error = abs_diff / max_val
            max_rel_error = max(max_rel_error, rel_error)
        
        assert max_rel_error < 1e-3, f"Layer bias gradient max rel_error: {max_rel_error}"


# ============================================================================
# SECTION 7: VERIFY DUPLICATE BACKWARD BUG HAS NOT RETURNED
# ============================================================================

class TestDuplicateBackwardRegression:
    """Regression test for the duplicate backward bug."""
    
    def test_single_layer_backward_one_call_per_neuron(self):
        """Layer.backward() should call Neuron.backward() exactly once per neuron."""
        passed, msg = verify_duplicate_backward_bug()
        assert passed, msg
    
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
    
    def test_network_backward_one_call_per_neuron(self):
        """Network.backward() should call each Neuron.backward() exactly once."""
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


# ============================================================================
# SECTION 8: NETWORK GRADIENT TEST
# ============================================================================

class TestNetworkGradients:
    """Test network gradients using numerical methods."""
    
    def test_2_layer_network_every_weight(self):
        """Test EVERY weight in a tiny 2-layer network."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        inputs = [1.0, 2.0]
        targets = [0.5]
        
        # Get analytical gradients
        network.forward(inputs)
        output = network.forward(inputs)['output']
        loss_grad = [2 * (output[0] - targets[0])]
        gradient_result = network.backward(loss_grad)
        
        checker = NetworkGradientChecker()
        
        max_rel_error = 0.0
        failed_params = []
        
        # Check layer 1 weights
        for neuron_idx in range(2):
            for weight_idx in range(2):
                numerical = checker.compute_numerical_network_weight_gradient(
                    network, inputs, targets, 0, neuron_idx, weight_idx
                )
                analytical = gradient_result['layer_gradients'][0]['neuron_gradients'][neuron_idx]['weight_gradients'][weight_idx]
                
                abs_diff = abs(analytical - numerical)
                max_val = max(abs(analytical), abs(numerical), 1e-8)
                rel_error = abs_diff / max_val
                max_rel_error = max(max_rel_error, rel_error)
                
                if rel_error >= 1e-3:
                    failed_params.append(f"L1-N{neuron_idx}-W{weight_idx}: ana={analytical:.6f}, num={numerical:.6f}, rel_err={rel_error:.6f}")
        
        # Check layer 2 weights
        for weight_idx in range(2):
            numerical = checker.compute_numerical_network_weight_gradient(
                network, inputs, targets, 1, 0, weight_idx
            )
            analytical = gradient_result['layer_gradients'][1]['neuron_gradients'][0]['weight_gradients'][weight_idx]
            
            abs_diff = abs(analytical - numerical)
            max_val = max(abs(analytical), abs(numerical), 1e-8)
            rel_error = abs_diff / max_val
            max_rel_error = max(max_rel_error, rel_error)
            
            if rel_error >= 1e-3:
                failed_params.append(f"L2-W{weight_idx}: ana={analytical:.6f}, num={numerical:.6f}, rel_err={rel_error:.6f}")
        
        assert max_rel_error < 1e-3, f"Network gradient check failed. Max rel_error: {max_rel_error}. Failed: {failed_params}"
    
    def test_2_layer_network_every_bias(self):
        """Test every bias in a tiny 2-layer network."""
        network = Network(name="test")
        network.add_layer(Layer(name="l1", input_dim=2, output_dim=2, activation='identity'))
        network.add_layer(Layer(name="l2", input_dim=2, output_dim=1, activation='identity'))
        
        inputs = [1.0, 2.0]
        targets = [0.5]
        
        # Get analytical gradients
        network.forward(inputs)
        output = network.forward(inputs)['output']
        loss_grad = [2 * (output[0] - targets[0])]
        gradient_result = network.backward(loss_grad)
        
        checker = NetworkGradientChecker()
        
        max_rel_error = 0.0
        
        # Check layer 1 biases
        for neuron_idx in range(2):
            numerical = checker.compute_numerical_network_bias_gradient(
                network, inputs, targets, 0, neuron_idx
            )
            analytical = gradient_result['layer_gradients'][0]['neuron_gradients'][neuron_idx]['bias_gradient']
            
            abs_diff = abs(analytical - numerical)
            max_val = max(abs(analytical), abs(numerical), 1e-8)
            rel_error = abs_diff / max_val
            max_rel_error = max(max_rel_error, rel_error)
        
        # Check layer 2 bias
        numerical = checker.compute_numerical_network_bias_gradient(
            network, inputs, targets, 1, 0
        )
        analytical = gradient_result['layer_gradients'][1]['neuron_gradients'][0]['bias_gradient']
        
        abs_diff = abs(analytical - numerical)
        max_val = max(abs(analytical), abs(numerical), 1e-8)
        rel_error = abs_diff / max_val
        max_rel_error = max(max_rel_error, rel_error)
        
        assert max_rel_error < 1e-3, f"Network bias gradient max rel_error: {max_rel_error}"


# ============================================================================
# SECTION 9: PARAMETER UPDATE TEST
# ============================================================================

class TestParameterUpdate:
    """Test parameter update behavior."""
    
    def test_backward_does_not_modify_parameters(self):
        """Verify backward() does NOT modify parameters."""
        passed, msg = verify_backward_no_update()
        assert passed, msg
    
    def test_update_changes_parameters_correctly(self):
        """Verify update() changes parameters according to θ_new = θ_old - lr × gradient."""
        passed, msg = verify_update_formula()
        assert passed, msg


# ============================================================================
# SECTION 10: LOSS GRADIENT CHECK
# ============================================================================

class TestLossGradients:
    """Test loss function gradients using numerical methods."""
    
    def test_mse_gradient(self):
        """Test MSE loss gradients."""
        predictions = [1.0, 2.0, 3.0]
        targets = [1.1, 1.9, 3.2]
        
        passed, max_rel_error = verify_loss_gradient_numerical('mse', predictions, targets)
        assert passed, f"MSE gradient failed. Max rel_error: {max_rel_error}"
    
    def test_cross_entropy_gradient(self):
        """Test cross-entropy loss gradients.
        
        Note: Cross-entropy gradients are computed with respect to predictions.
        For the cross-entropy derivative, the formula is:
        dL/dp = (p - t) / (p * (1 - p))
        
        This can be numerically unstable when p is near 0 or 1.
        We use predictions in a safe range [0.2, 0.8].
        """
        # Use predictions in a safe range (not too close to 0 or 1)
        predictions = [0.7, 0.3]
        targets = [0.9, 0.1]  # Target close to prediction for stability
        
        passed, max_rel_error = verify_loss_gradient_numerical('cross_entropy', predictions, targets)
        assert passed, f"Cross-entropy gradient failed. Max rel_error: {max_rel_error}"
    
    def test_mae_gradient(self):
        """Test MAE loss gradients."""
        predictions = [1.0, 2.0]
        targets = [1.5, 2.5]
        
        passed, max_rel_error = verify_loss_gradient_numerical('mae', predictions, targets)
        assert passed, f"MAE gradient failed. Max rel_error: {max_rel_error}"
    
    def test_cross_entropy_numerical_stability(self):
        """Test cross-entropy handles edge cases."""
        # Near-zero predictions
        predictions = [1e-10, 1.0 - 1e-10]
        targets = [1.0, 0.0]
        
        loss = LossFunctions.cross_entropy(predictions, targets)
        assert not np.isnan(loss), "Cross-entropy returned NaN for near-zero predictions"
        assert not np.isinf(loss), "Cross-entropy returned Inf for near-zero predictions"


# ============================================================================
# SECTION 11-13: RUN TESTS AND REPORT
# ============================================================================

class TestActivationFunctions:
    """Test activation function correctness."""
    
    def test_sigmoid_output_range(self):
        """Sigmoid should output between 0 and 1."""
        neuron = Neuron(input_count=1, weights=[1.0], bias=0.0, activation='sigmoid')
        
        for x in [-10, -1, 0, 1, 10]:
            result = neuron.forward([x])
            assert 0 <= result['output'] <= 1, f"Sigmoid output out of range: {result['output']}"
    
    def test_tanh_output_range(self):
        """Tanh should output between -1 and 1."""
        neuron = Neuron(input_count=1, weights=[1.0], bias=0.0, activation='tanh')
        
        for x in [-10, -1, 0, 1, 10]:
            result = neuron.forward([x])
            assert -1 <= result['output'] <= 1, f"Tanh output out of range: {result['output']}"
    
    def test_relu_correct(self):
        """ReLU should return max(0, x)."""
        neuron = Neuron(input_count=1, weights=[1.0], bias=0.0, activation='relu')
        
        assert neuron.forward([-5.0])['output'] == 0.0
        assert neuron.forward([-0.1])['output'] == 0.0
        assert neuron.forward([0.0])['output'] == 0.0
        assert neuron.forward([0.1])['output'] == 0.1
        assert neuron.forward([5.0])['output'] == 5.0


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
