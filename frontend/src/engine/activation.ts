/**
 * Activation Functions for CAMBRIC LABS
 *
 * Ported 1:1 from backend/neural/activation.py so the local JS engine
 * produces identical results to the original Python engine.
 */

export type ActivationName =
  | 'relu'
  | 'sigmoid'
  | 'tanh'
  | 'identity'
  | 'leaky_relu'
  | 'softmax'
  | 'swish';

export interface ActivationInfo {
  name: string;
  formula: string;
  range: string;
  uses?: string[];
  pros?: string[];
  cons?: string[];
  why?: string;
}

export class ActivationFunctions {
  /** Rectified Linear Unit (ReLU): f(x) = max(0, x) */
  static relu(x: number): number {
    return Math.max(0, x);
  }

  static reluDerivative(x: number): number {
    return x > 0 ? 1 : 0;
  }

  /** Sigmoid: f(x) = 1 / (1 + e^-x), numerically stable via clipping */
  static sigmoid(x: number): number {
    const clipped = Math.max(-500, Math.min(500, x));
    return 1 / (1 + Math.exp(-clipped));
  }

  static sigmoidDerivative(x: number): number {
    const s = ActivationFunctions.sigmoid(x);
    return s * (1 - s);
  }

  /** Hyperbolic tangent */
  static tanh(x: number): number {
    return Math.tanh(x);
  }

  static tanhDerivative(x: number): number {
    const t = ActivationFunctions.tanh(x);
    return 1 - t * t;
  }

  /** Identity (linear): f(x) = x */
  static identity(x: number): number {
    return x;
  }

  static identityDerivative(_x: number): number {
    return 1;
  }

  /** Leaky ReLU: f(x) = x if x > 0 else alpha * x */
  static leakyRelu(x: number, alpha = 0.01): number {
    return x > 0 ? x : alpha * x;
  }

  static leakyReluDerivative(x: number, alpha = 0.01): number {
    return x > 0 ? 1 : alpha;
  }

  /** Softmax over a vector, numerically stable (max-subtraction trick) */
  static softmax(x: number[]): number[] {
    const max = Math.max(...x);
    const shifted = x.map((v) => v - max);
    const exps = shifted.map((v) => Math.exp(v));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => v / sum);
  }

  /** Jacobian of softmax: diag(s) - outer(s, s) */
  static softmaxDerivative(x: number[]): number[][] {
    const s = ActivationFunctions.softmax(x);
    const n = s.length;
    const jac: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        jac[i][j] = (i === j ? s[i] : 0) - s[i] * s[j];
      }
    }
    return jac;
  }

  /** Swish: f(x) = x * sigmoid(beta * x) */
  static swish(x: number, beta = 1.0): number {
    return x * ActivationFunctions.sigmoid(beta * x);
  }

  static swishDerivative(x: number, beta = 1.0): number {
    const s = ActivationFunctions.sigmoid(beta * x);
    return s + beta * x * s * (1 - s);
  }

  private static readonly FUNCTIONS: Record<string, (x: number) => number> = {
    relu: ActivationFunctions.relu,
    sigmoid: ActivationFunctions.sigmoid,
    tanh: ActivationFunctions.tanh,
    identity: ActivationFunctions.identity,
    leaky_relu: ActivationFunctions.leakyRelu,
    swish: ActivationFunctions.swish,
  };

  private static readonly DERIVATIVES: Record<string, (x: number) => number> = {
    relu: ActivationFunctions.reluDerivative,
    sigmoid: ActivationFunctions.sigmoidDerivative,
    tanh: ActivationFunctions.tanhDerivative,
    identity: ActivationFunctions.identityDerivative,
    leaky_relu: ActivationFunctions.leakyReluDerivative,
    swish: ActivationFunctions.swishDerivative,
  };

  static getFunction(name: string): (x: number) => number {
    const fn = ActivationFunctions.FUNCTIONS[name];
    if (!fn) {
      throw new Error(
        `Unknown activation: ${name}. Choose from: ${Object.keys(ActivationFunctions.FUNCTIONS).join(', ')}`
      );
    }
    return fn;
  }

  static getDerivative(name: string): (x: number) => number {
    const fn = ActivationFunctions.DERIVATIVES[name];
    if (!fn) {
      throw new Error(`Unknown or non-differentiable activation: ${name}`);
    }
    return fn;
  }

  /** Educational metadata used by the UI's "WHY" explanations. */
  static getInfo(name: string): ActivationInfo {
    const info: Record<string, ActivationInfo> = {
      relu: {
        name: 'ReLU',
        formula: 'f(x) = max(0, x)',
        range: '(0, ∞)',
        uses: [
          'Default choice for hidden layers',
          'Computer vision',
          'Natural language processing',
          'Most modern architectures',
        ],
        pros: [
          'Computationally efficient',
          'Reduces vanishing gradient',
          'Sparse activation (some neurons output 0)',
        ],
        cons: [
          'Dying ReLU problem (neurons can get stuck at 0)',
          'Not zero-centered',
          'Unbounded output',
        ],
        why:
          'ReLU was introduced to solve the vanishing gradient problem in sigmoid and tanh. ' +
          'It is computationally simple (just a threshold) yet effective. The zero output for ' +
          'negative inputs creates sparse representations, which can be beneficial for learning.',
      },
      sigmoid: {
        name: 'Sigmoid',
        formula: 'f(x) = 1 / (1 + e^(-x))',
        range: '(0, 1)',
        uses: ['Binary classification output', 'Gate functions in LSTMs', 'Probability outputs'],
        pros: ['Outputs between 0 and 1 (probability-like)', 'Smooth gradient', 'Well-understood'],
        cons: [
          'Severe vanishing gradient for large |x|',
          'Not zero-centered',
          'Computationally expensive (exponential)',
        ],
        why:
          'Sigmoid was historically the first widely used activation. Its smooth S-curve and ' +
          'bounded output made it natural for probabilistic interpretations. However, for deep ' +
          'networks, the gradient becomes very small for extreme values, making learning difficult.',
      },
      tanh: {
        name: 'Tanh',
        formula: 'f(x) = (e^x - e^(-x)) / (e^x + e^(-x))',
        range: '(-1, 1)',
        uses: ['Hidden layers in RNNs', 'Natural language processing', 'Sequence modeling'],
        pros: ['Zero-centered output', 'Stronger gradients than sigmoid', 'Smooth gradient'],
        cons: ['Still susceptible to vanishing gradient', 'Computationally expensive'],
        why:
          'Tanh is essentially a scaled and shifted sigmoid. Its zero-centered output (-1 to 1) ' +
          'often leads to faster convergence than sigmoid (0 to 1) because the gradients can flow ' +
          'in both positive and negative directions.',
      },
      identity: {
        name: 'Identity (Linear)',
        formula: 'f(x) = x',
        range: '(-∞, ∞)',
        uses: ['Regression output layer', 'Autoencoders (bottleneck)', 'Simple linear models'],
        pros: ['No transformation', 'No vanishing gradient', 'Fast computation'],
        cons: ['Cannot learn non-linear relationships', 'Limited expressiveness'],
        why:
          'Identity activation is used when we want the output to be the same as the input. It is ' +
          'appropriate for regression problems where the target can be any real number. For hidden ' +
          'layers, identity is only useful if the problem is inherently linear.',
      },
      softmax: {
        name: 'Softmax',
        formula: 'f(x_i) = e^(x_i) / Σ e^(x_j)',
        range: '(0, 1), sums to 1',
        uses: [
          'Multi-class classification output',
          'Neural network probability outputs',
          'Attention mechanisms',
        ],
        pros: [
          'Outputs sum to 1 (valid probability distribution)',
          'Amplifies differences between inputs',
          'Interpretable as probabilities',
        ],
        cons: [
          'Requires all outputs at once (not per-neuron)',
          'Can be numerically unstable',
          'Not used in hidden layers',
        ],
        why:
          'Softmax converts a vector of arbitrary real numbers into a probability distribution. ' +
          'The exponential amplifies larger values, making the output more decisive. This is ' +
          'essential for multi-class classification where we want to know the probability of each class.',
      },
    };

    return info[name] ?? { name, formula: 'N/A', range: 'N/A' };
  }

  static getAllNames(): string[] {
    return Object.keys(ActivationFunctions.FUNCTIONS);
  }
}
