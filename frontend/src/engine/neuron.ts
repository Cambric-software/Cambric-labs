/**
 * Single Neuron Implementation for CAMBRIC LABS
 *
 * Ported 1:1 from backend/neural/neuron.py.
 *
 * z = Σ(xᵢ × wᵢ) + b      (weighted sum)
 * y = activation(z)        (output)
 *
 * forward()  -> compute output
 * backward() -> compute gradients (does NOT change weights)
 * update()   -> apply gradients to weights
 *
 * This separation lets the UI inspect gradients before they're applied,
 * support multiple optimizers later, and visualize the learning process.
 */

import { ActivationName } from './activation';

export type { ActivationName };

export const SUPPORTED_ACTIVATIONS: ActivationName[] = [
  'relu',
  'sigmoid',
  'tanh',
  'identity',
  'leaky_relu',
];

export interface GradientResult {
  inputGradients: number[]; // dL/dx for each input
  weightGradients: number[]; // dL/dw for each weight
  biasGradient: number; // dL/db
  activationGradient: number; // dL/dz (before activation)
  weightedSum: number; // z value (before activation)
  output: number; // activation(z)
}

export interface ForwardResult {
  output: number;
  weightedSum: number;
  contributions: number[];
  activationUsed: ActivationName;
  inputs: number[];
  weights: number[];
  bias: number;
}

export interface UpdateResult {
  weightChanges: number[];
  biasChange: number;
  oldWeights: number[];
  newWeights: number[];
  oldBias: number;
  newBias: number;
  gradientNorms: { weightNorm: number; biasGradient: number };
}

export interface NeuronState {
  type: 'neuron';
  version: string;
  inputCount: number;
  activation: ActivationName;
  weights: number[];
  bias: number;
  parameterCount: number;
  trainingStats: { forwardCalls: number; backwardCalls: number; updateCalls: number };
}

/** Simple seeded PRNG (mulberry32) + Box-Muller normal sampler, mirroring numpy's default_rng usage. */
class SeededRandom {
  private state: number;

  constructor(seed?: number) {
    this.state = seed === undefined ? (Math.random() * 2 ** 32) >>> 0 : seed >>> 0;
  }

  private next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Sample from N(mean, std) via Box-Muller. */
  normal(mean: number, std: number): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * std;
  }
}

function dot(a: number[], b: number[]): number[] {
  return a.map((v, i) => v * b[i]);
}

function norm(a: number[]): number {
  return Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
}

export class Neuron {
  static readonly VERSION = '2.0.0';

  readonly inputCount: number;
  activation: ActivationName;
  weights: number[];
  bias: number;

  private lastInput: number[] | null = null;
  private lastWeightedSum: number | null = null;
  private lastOutput: number | null = null;
  private lastGradients: GradientResult | null = null;

  private trainingStats = { forwardCalls: 0, backwardCalls: 0, updateCalls: 0 };

  constructor(opts: {
    inputCount: number;
    weights?: number[];
    bias?: number;
    activation?: ActivationName;
    seed?: number;
  }) {
    const { inputCount, weights, bias = 0.0, activation = 'relu', seed } = opts;

    if (!SUPPORTED_ACTIVATIONS.includes(activation)) {
      throw new Error(
        `Unknown activation: ${activation}. Choose from: ${SUPPORTED_ACTIVATIONS.join(', ')}`
      );
    }
    if (inputCount < 1) {
      throw new Error(`inputCount must be >= 1, got ${inputCount}`);
    }

    this.inputCount = inputCount;
    this.activation = activation;

    const rng = new SeededRandom(seed);

    if (weights === undefined) {
      this.weights = this.initializeWeights(rng);
    } else {
      if (weights.length !== inputCount) {
        throw new Error(
          `Weight count (${weights.length}) doesn't match inputCount (${inputCount})`
        );
      }
      this.weights = [...weights];
    }

    this.bias = bias;
  }

  /** He init for ReLU variants (std = sqrt(2/n)); Xavier for sigmoid/tanh (std = sqrt(1/n)). */
  private initializeWeights(rng: SeededRandom): number[] {
    let std: number;
    if (this.activation === 'relu') {
      std = Math.sqrt(2.0 / this.inputCount);
    } else if (this.activation === 'sigmoid' || this.activation === 'tanh') {
      std = Math.sqrt(1.0 / this.inputCount);
    } else {
      std = Math.sqrt(2.0 / this.inputCount);
    }
    return Array.from({ length: this.inputCount }, () => rng.normal(0, std));
  }

  get parameterCount(): number {
    return this.inputCount + 1;
  }

  forward(inputs: number[]): ForwardResult {
    if (inputs.length !== this.inputCount) {
      throw new Error(
        `Input count (${inputs.length}) doesn't match neuron's inputCount (${this.inputCount})`
      );
    }
    if (inputs.some((v) => Number.isNaN(v) || !Number.isFinite(v))) {
      throw new Error('Input contains NaN or Infinity values');
    }

    this.lastInput = [...inputs];

    const contributions = dot(inputs, this.weights);
    const weightedSum = contributions.reduce((a, b) => a + b, 0) + this.bias;
    this.lastWeightedSum = weightedSum;

    const output = this.applyActivation(weightedSum);
    this.lastOutput = output;

    this.trainingStats.forwardCalls += 1;

    return {
      output,
      weightedSum,
      contributions,
      activationUsed: this.activation,
      inputs: [...inputs],
      weights: [...this.weights],
      bias: this.bias,
    };
  }

  private applyActivation(x: number): number {
    switch (this.activation) {
      case 'relu':
        return Math.max(0, x);
      case 'leaky_relu':
        return x > 0 ? x : 0.01 * x;
      case 'sigmoid': {
        if (x < -500) return 0.0;
        if (x > 500) return 1.0;
        return 1.0 / (1.0 + Math.exp(-x));
      }
      case 'tanh':
        return Math.tanh(x);
      case 'identity':
        return x;
      default:
        return x;
    }
  }

  private activationDerivative(output: number, weightedSum: number): number {
    switch (this.activation) {
      case 'relu':
        return weightedSum > 0 ? 1.0 : 0.0;
      case 'leaky_relu':
        return weightedSum > 0 ? 1.0 : 0.01;
      case 'sigmoid':
        return output * (1.0 - output);
      case 'tanh':
        return 1.0 - output * output;
      case 'identity':
        return 1.0;
      default:
        return 1.0;
    }
  }

  /**
   * Backpropagation. ONLY computes gradients — does NOT modify parameters.
   *
   * dL/dz = dL/dy × dy/dz
   * dL/dwᵢ = dL/dz × xᵢ
   * dL/db  = dL/dz
   * dL/dxᵢ = dL/dz × wᵢ
   */
  backward(outputGradient: number): GradientResult {
    if (this.lastInput === null || this.lastOutput === null || this.lastWeightedSum === null) {
      throw new Error('Must call forward() before backward(). The neuron needs cached values.');
    }
    if (Number.isNaN(outputGradient) || !Number.isFinite(outputGradient)) {
      throw new Error(`Invalid outputGradient: ${outputGradient}`);
    }

    const actDeriv = this.activationDerivative(this.lastOutput, this.lastWeightedSum);
    const activationGradient = outputGradient * actDeriv;

    const weightGradients = this.lastInput.map((x) => x * activationGradient);
    const biasGradient = activationGradient;
    const inputGradients = this.weights.map((w) => w * activationGradient);

    this.lastGradients = {
      inputGradients,
      weightGradients,
      biasGradient,
      activationGradient,
      weightedSum: this.lastWeightedSum,
      output: this.lastOutput,
    };

    this.trainingStats.backwardCalls += 1;

    return this.lastGradients;
  }

  getGradients(): GradientResult | null {
    return this.lastGradients;
  }

  /** Applies gradients via gradient descent: θ_new = θ_old - lr × gradient. */
  update(gradients: GradientResult, learningRate: number, clipGradients?: number): UpdateResult {
    if (learningRate <= 0) {
      throw new Error(`learningRate must be positive, got ${learningRate}`);
    }
    if (learningRate > 1) {
      // eslint-disable-next-line no-console
      console.warn(`Large learningRate (${learningRate}) may cause unstable training`);
    }

    let wGrads = [...gradients.weightGradients];
    let bGrad = gradients.biasGradient;

    if (clipGradients !== undefined && clipGradients > 0) {
      const wNorm = norm(wGrads);
      if (wNorm > clipGradients) {
        const scale = clipGradients / wNorm;
        wGrads = wGrads.map((w) => w * scale);
        bGrad *= scale;
      }
    }

    const oldWeights = [...this.weights];
    const oldBias = this.bias;

    this.weights = this.weights.map((w, i) => w - learningRate * wGrads[i]);
    this.bias -= learningRate * bGrad;

    this.trainingStats.updateCalls += 1;

    return {
      weightChanges: wGrads.map((g) => -learningRate * g),
      biasChange: -learningRate * bGrad,
      oldWeights,
      newWeights: [...this.weights],
      oldBias,
      newBias: this.bias,
      gradientNorms: { weightNorm: norm(wGrads), biasGradient: bGrad },
    };
  }

  /** Clears temporary cache; preserves learned weights/bias. Call before a new forward pass. */
  resetCache(): void {
    this.lastInput = null;
    this.lastWeightedSum = null;
    this.lastOutput = null;
    this.lastGradients = null;
  }

  /** Reinitializes weights/bias to new random values. */
  resetParameters(seed?: number): void {
    const rng = new SeededRandom(seed);
    this.weights = this.initializeWeights(rng);
    this.bias = 0.0;
    this.trainingStats = { forwardCalls: 0, backwardCalls: 0, updateCalls: 0 };
  }

  /** Alias for resetCache(), kept for parity with the Python API. */
  reset(): void {
    this.resetCache();
  }

  getState(): NeuronState {
    return {
      type: 'neuron',
      version: Neuron.VERSION,
      inputCount: this.inputCount,
      activation: this.activation,
      weights: [...this.weights],
      bias: this.bias,
      parameterCount: this.parameterCount,
      trainingStats: { ...this.trainingStats },
    };
  }

  setWeights(weights: number[]): void {
    if (weights.length !== this.inputCount) {
      throw new Error(
        `Weight count (${weights.length}) doesn't match inputCount (${this.inputCount})`
      );
    }
    this.weights = [...weights];
  }

  setBias(bias: number): void {
    this.bias = bias;
  }

  /** Detailed state (including cached forward/backward values) for UI visualization. */
  inspect(): NeuronState & {
    cached?: { inputs: number[]; weightedSum: number; output: number };
    gradients?: {
      inputGradients: number[];
      weightGradients: number[];
      biasGradient: number;
      activationGradient: number;
      weightedSum: number;
    };
  } {
    const state = this.getState() as ReturnType<Neuron['inspect']>;

    if (this.lastInput !== null && this.lastWeightedSum !== null && this.lastOutput !== null) {
      state.cached = {
        inputs: [...this.lastInput],
        weightedSum: this.lastWeightedSum,
        output: this.lastOutput,
      };
    }

    if (this.lastGradients !== null) {
      const g = this.lastGradients;
      state.gradients = {
        inputGradients: [...g.inputGradients],
        weightGradients: [...g.weightGradients],
        biasGradient: g.biasGradient,
        activationGradient: g.activationGradient,
        weightedSum: g.weightedSum,
      };
    }

    return state;
  }
}

/** Factory function mirroring create_neuron() in the Python engine. */
export function createNeuron(
  inputCount: number,
  activation: ActivationName = 'relu',
  seed?: number
): Neuron {
  return new Neuron({ inputCount, activation, seed });
}

/**
 * Verify gradients using finite differences (numerical gradient checking).
 * numerical_gradient ≈ (loss(θ+ε) - loss(θ-ε)) / (2ε)
 *
 * Note: this version computes BOTH the analytical and numerical weight
 * gradients and compares them directly — the original Python utility had
 * a bug where the analytical side was never actually populated.
 */
export function numericalGradientCheck(
  neuron: Neuron,
  inputs: number[],
  target: number,
  epsilon = 1e-5
): {
  analyticalWeightGradients: number[];
  numericalWeightGradients: number[];
  epsilon: number;
  maxAbsoluteDifference: number;
  passed: boolean;
} {
  const forwardResult = neuron.forward(inputs);
  const outputGradient = 2 * (forwardResult.output - target); // d(MSE)/d(output)
  const analytical = neuron.backward(outputGradient);
  const analyticalWeightGradients = [...analytical.weightGradients];

  const origWeights = [...neuron.weights];
  const origBias = neuron.bias;

  const numericalWeightGradients: number[] = [];

  for (let i = 0; i < neuron.inputCount; i++) {
    neuron.setWeights(origWeights);
    const wPlus = [...origWeights];
    wPlus[i] += epsilon;
    neuron.setWeights(wPlus);
    const outPlus = neuron.forward(inputs).output;
    const lossPlus = (outPlus - target) ** 2;

    const wMinus = [...origWeights];
    wMinus[i] -= epsilon;
    neuron.setWeights(wMinus);
    const outMinus = neuron.forward(inputs).output;
    const lossMinus = (outMinus - target) ** 2;

    numericalWeightGradients.push((lossPlus - lossMinus) / (2 * epsilon));
  }

  neuron.setWeights(origWeights);
  neuron.setBias(origBias);

  const maxAbsoluteDifference = Math.max(
    ...analyticalWeightGradients.map((a, i) => Math.abs(a - numericalWeightGradients[i]))
  );

  return {
    analyticalWeightGradients,
    numericalWeightGradients,
    epsilon,
    maxAbsoluteDifference,
    passed: maxAbsoluteDifference < 1e-3,
  };
}
