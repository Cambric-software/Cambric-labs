/**
 * Layer Implementation for CAMBRIC LABS
 *
 * Ported 1:1 from backend/neural/layer.py.
 *
 * A layer contains multiple neurons that process the same inputs in
 * parallel. Each neuron has its own weights and bias.
 *
 * Layer.forward()  -> Neuron.forward() for each neuron
 * Layer.backward() -> Neuron.backward() for each neuron (gradients only)
 * Layer.update()   -> Neuron.update() for each neuron (applies gradients)
 */

import { ActivationName, GradientResult, Neuron } from './neuron';

export interface LayerForwardResult {
  outputs: number[];
  neuronDetails: Array<{
    neuronIndex: number;
    weightedSum: number;
    output: number;
    contributions: number[];
    weights: number[];
    bias: number;
  }>;
  weightMatrix: number[][];
  biasVector: number[];
  activation: ActivationName;
  inputDim: number;
  outputDim: number;
}

export interface LayerBackwardResult {
  inputGradients: number[];
  neuronGradients: Array<{
    neuronIndex: number;
    weightGradients: number[];
    biasGradient: number;
    inputGradients: number[];
    activationGradient: number;
  }>;
  parameterCount: number;
}

export interface LayerUpdateResult {
  weightUpdates: Array<{
    neuronIndex: number;
    oldWeights: number[];
    newWeights: number[];
    changes: number[];
    gradientNorm: number;
  }>;
  biasUpdates: Array<{
    neuronIndex: number;
    oldBias: number;
    newBias: number;
    change: number;
    gradient: number;
  }>;
  parametersUpdated: number;
  learningRate: number;
}

export interface LayerState {
  name: string;
  inputDim: number;
  outputDim: number;
  activation: ActivationName;
  parameterCount: number;
  neurons: ReturnType<Neuron['getState']>[];
  weightsMatrix: number[][];
  biasesVector: number[];
}

export class Layer {
  readonly name: string;
  readonly inputDim: number;
  readonly outputDim: number;
  activation: ActivationName;
  neurons: Neuron[];

  private lastInputs: number[] | null = null;
  private lastOutputs: number[] | null = null;
  private lastGradients: GradientResult[] | null = null;

  constructor(opts: {
    name: string;
    inputDim: number;
    outputDim: number;
    activation?: ActivationName;
    seed?: number;
  }) {
    const { name, inputDim, outputDim, activation = 'relu', seed } = opts;

    this.name = name;
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.activation = activation;

    this.neurons = Array.from(
      { length: outputDim },
      (_, i) =>
        new Neuron({
          inputCount: inputDim,
          activation,
          seed: seed !== undefined ? seed + i : undefined,
        })
    );
  }

  get parameterCount(): number {
    return this.neurons.reduce((sum, n) => sum + n.parameterCount, 0);
  }

  get weightsMatrix(): number[][] {
    return this.neurons.map((n) => [...n.weights]);
  }

  get biasesVector(): number[] {
    return this.neurons.map((n) => n.bias);
  }

  forward(inputs: number[]): LayerForwardResult {
    if (inputs.length !== this.inputDim) {
      throw new Error(
        `Input dimension (${inputs.length}) doesn't match layer's inputDim (${this.inputDim})`
      );
    }

    this.lastInputs = [...inputs];

    const outputs: number[] = [];
    const neuronDetails: LayerForwardResult['neuronDetails'] = [];

    this.neurons.forEach((neuron, i) => {
      const result = neuron.forward(inputs);
      outputs.push(result.output);
      neuronDetails.push({
        neuronIndex: i,
        weightedSum: result.weightedSum,
        output: result.output,
        contributions: result.contributions,
        weights: result.weights,
        bias: result.bias,
      });
    });

    this.lastOutputs = outputs;

    return {
      outputs,
      neuronDetails,
      weightMatrix: this.weightsMatrix,
      biasVector: this.biasesVector,
      activation: this.activation,
      inputDim: this.inputDim,
      outputDim: this.outputDim,
    };
  }

  /** Computes gradients for all neurons. Does NOT update weights — call update() for that. */
  backward(outputGradients: number[]): LayerBackwardResult {
    if (this.lastInputs === null) {
      throw new Error('Must call forward() before backward()');
    }
    if (outputGradients.length !== this.outputDim) {
      throw new Error(
        `Gradient count (${outputGradients.length}) doesn't match outputDim (${this.outputDim})`
      );
    }

    const inputGradients = new Array(this.inputDim).fill(0);
    const neuronGradients: LayerBackwardResult['neuronGradients'] = [];
    this.lastGradients = [];

    this.neurons.forEach((neuron, i) => {
      const gradResult = neuron.backward(outputGradients[i]);
      this.lastGradients!.push(gradResult);

      for (let j = 0; j < this.inputDim; j++) {
        inputGradients[j] += gradResult.inputGradients[j];
      }

      neuronGradients.push({
        neuronIndex: i,
        weightGradients: gradResult.weightGradients,
        biasGradient: gradResult.biasGradient,
        inputGradients: gradResult.inputGradients,
        activationGradient: gradResult.activationGradient,
      });
    });

    return { inputGradients, neuronGradients, parameterCount: this.parameterCount };
  }

  /** Computes and returns gradients for inspection without modifying parameters. */
  computeGradients(outputGradients: number[]): GradientResult[] {
    if (this.lastInputs === null) {
      throw new Error('Must call forward() before computeGradients()');
    }
    return this.neurons.map((neuron, i) => neuron.backward(outputGradients[i]));
  }

  /** Applies gradients computed by the last backward() call. */
  update(learningRate: number, clipGradients?: number): LayerUpdateResult {
    if (this.lastGradients === null) {
      throw new Error('Must call backward() before update()');
    }

    const weightUpdates: LayerUpdateResult['weightUpdates'] = [];
    const biasUpdates: LayerUpdateResult['biasUpdates'] = [];

    this.neurons.forEach((neuron, i) => {
      const result = neuron.update(this.lastGradients![i], learningRate, clipGradients);

      weightUpdates.push({
        neuronIndex: i,
        oldWeights: result.oldWeights,
        newWeights: result.newWeights,
        changes: result.weightChanges,
        gradientNorm: result.gradientNorms.weightNorm,
      });

      biasUpdates.push({
        neuronIndex: i,
        oldBias: result.oldBias,
        newBias: result.newBias,
        change: result.biasChange,
        gradient: result.gradientNorms.biasGradient,
      });
    });

    return {
      weightUpdates,
      biasUpdates,
      parametersUpdated: this.parameterCount,
      learningRate,
    };
  }

  getState(): LayerState {
    return {
      name: this.name,
      inputDim: this.inputDim,
      outputDim: this.outputDim,
      activation: this.activation,
      parameterCount: this.parameterCount,
      neurons: this.neurons.map((n) => n.getState()),
      weightsMatrix: this.weightsMatrix,
      biasesVector: this.biasesVector,
    };
  }

  setNeuronWeights(neuronIndex: number, weights: number[]): void {
    this.neurons[neuronIndex].setWeights(weights);
  }

  setNeuronBias(neuronIndex: number, bias: number): void {
    this.neurons[neuronIndex].setBias(bias);
  }

  setWeightsMatrix(weights: number[][]): void {
    weights.forEach((row, i) => this.neurons[i].setWeights(row));
  }

  setBiasesVector(biases: number[]): void {
    biases.forEach((bias, i) => this.neurons[i].setBias(bias));
  }

  /** Resets temporary cache; preserves learned parameters. */
  resetCache(): void {
    this.lastInputs = null;
    this.lastOutputs = null;
    this.lastGradients = null;
    this.neurons.forEach((n) => n.resetCache());
  }

  resetParameters(seed?: number): void {
    this.neurons.forEach((n, i) => n.resetParameters(seed !== undefined ? seed + i : undefined));
  }

  reset(): void {
    this.resetCache();
  }
}
