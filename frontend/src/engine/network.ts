/**
 * Network Implementation for CAMBRIC LABS
 *
 * Ported 1:1 from backend/neural/network.py.
 *
 * A network is a sequence of layers. Data flows from the input layer,
 * through each hidden layer, to the output layer.
 *
 * Network.forward()  -> Layer.forward()  -> Neuron.forward()
 * Network.backward() -> Layer.backward() -> Neuron.backward() (gradients only)
 * Network.update()   -> Layer.update()   -> Neuron.update()   (applies gradients)
 */

import { ActivationName } from './neuron';
import { Layer, LayerForwardResult } from './layer';

export interface NetworkForwardResult {
  output: number[];
  layerOutputs: number[][];
  allActivations: Array<{
    layerIndex: number;
    layerName: string;
    inputs: number[];
    outputs: number[];
    weightMatrix: number[][];
    biasVector: number[];
    activation: ActivationName;
  }>;
  inputDim: number;
  outputDim: number;
  totalParameters: number;
}

export interface NetworkBackwardResult {
  layerGradients: Array<{
    layerIndex: number;
    layerName: string;
    inputGradients: number[];
    neuronGradients: ReturnType<Layer['backward']>['neuronGradients'];
  }>;
  parameterCount: number;
}

export interface NetworkUpdateResult {
  layerUpdates: Array<{
    layerIndex: number;
    layerName: string;
    weightUpdates: ReturnType<Layer['update']>['weightUpdates'];
    biasUpdates: ReturnType<Layer['update']>['biasUpdates'];
    learningRate: number;
  }>;
  parametersUpdated: number;
  learningRate: number;
}

export interface NetworkState {
  name: string;
  inputDim: number;
  outputDim: number;
  totalParameters: number;
  layerCount: number;
  layers: ReturnType<Layer['getState']>[];
  lossFunction: string;
}

export interface SerializedNetwork {
  name: string;
  layers: Array<{
    name: string;
    inputDim: number;
    outputDim: number;
    activation: ActivationName;
    weights: number[][];
    biases: number[];
  }>;
  lossFunction: string;
}

export class Network {
  name: string;
  layers: Layer[];
  lossFunction: string;

  /** Optional: append {epoch, loss, ...} entries here from your training loop. */
  history: Record<string, unknown>[] = [];

  private layerOutputs: number[][] = [];

  constructor(opts: { name?: string; layers?: Layer[]; lossFunction?: string } = {}) {
    this.name = opts.name ?? 'Network';
    this.layers = opts.layers ?? [];
    this.lossFunction = opts.lossFunction ?? 'mse';
  }

  get inputDim(): number {
    return this.layers.length > 0 ? this.layers[0].inputDim : 0;
  }

  get outputDim(): number {
    return this.layers.length > 0 ? this.layers[this.layers.length - 1].outputDim : 0;
  }

  get totalParameters(): number {
    return this.layers.reduce((sum, l) => sum + l.parameterCount, 0);
  }

  addLayer(layer: Layer): void {
    this.layers.push(layer);
  }

  insertLayer(index: number, layer: Layer): void {
    this.layers.splice(index, 0, layer);
  }

  removeLayer(index: number): Layer {
    return this.layers.splice(index, 1)[0];
  }

  forward(inputs: number[]): NetworkForwardResult {
    let currentInput = inputs;
    const layerOutputs: number[][] = [];
    const allActivations: NetworkForwardResult['allActivations'] = [];

    this.layers.forEach((layer, i) => {
      const result: LayerForwardResult = layer.forward(currentInput);
      layerOutputs.push(result.outputs);
      allActivations.push({
        layerIndex: i,
        layerName: layer.name,
        inputs: currentInput,
        outputs: result.outputs,
        weightMatrix: result.weightMatrix,
        biasVector: result.biasVector,
        activation: result.activation,
      });
      currentInput = result.outputs;
    });

    this.layerOutputs = layerOutputs;

    return {
      output: currentInput,
      layerOutputs,
      allActivations,
      inputDim: this.inputDim,
      outputDim: this.outputDim,
      totalParameters: this.totalParameters,
    };
  }

  /** Computes gradients for all layers. Does NOT update weights — call update() for that. */
  backward(lossGradient: number[]): NetworkBackwardResult {
    if (this.layerOutputs.length === 0) {
      throw new Error('Must call forward() before backward()');
    }

    let currentGradients = [...lossGradient];
    const layerGradients: NetworkBackwardResult['layerGradients'] = [];

    for (let i = this.layers.length - 1; i >= 0; i--) {
      const layer = this.layers[i];
      const result = layer.backward(currentGradients);

      layerGradients.unshift({
        layerIndex: i,
        layerName: layer.name,
        inputGradients: result.inputGradients,
        neuronGradients: result.neuronGradients,
      });

      currentGradients = result.inputGradients;
    }

    return { layerGradients, parameterCount: this.totalParameters };
  }

  /** Alias for backward() — useful for UI code that wants to be explicit about intent. */
  computeGradients(lossGradient: number[]): NetworkBackwardResult {
    return this.backward(lossGradient);
  }

  update(learningRate: number, clipGradients?: number): NetworkUpdateResult {
    const layerUpdates = this.layers.map((layer, i) => {
      const result = layer.update(learningRate, clipGradients);
      return {
        layerIndex: i,
        layerName: layer.name,
        weightUpdates: result.weightUpdates,
        biasUpdates: result.biasUpdates,
        learningRate: result.learningRate,
      };
    });

    return { layerUpdates, parametersUpdated: this.totalParameters, learningRate };
  }

  /** Convenience: backward() + update() in one call. */
  trainStep(
    lossGradient: number[],
    learningRate: number,
    clipGradients?: number
  ): { gradients: NetworkBackwardResult; updates: NetworkUpdateResult } {
    const gradients = this.backward(lossGradient);
    const updates = this.update(learningRate, clipGradients);
    return { gradients, updates };
  }

  getState(): NetworkState {
    return {
      name: this.name,
      inputDim: this.inputDim,
      outputDim: this.outputDim,
      totalParameters: this.totalParameters,
      layerCount: this.layers.length,
      layers: this.layers.map((l) => l.getState()),
      lossFunction: this.lossFunction,
    };
  }

  getArchitecture(): Array<{
    index: number;
    name: string;
    inputDim: number;
    outputDim: number;
    activation: ActivationName;
    parameters: number;
  }> {
    return this.layers.map((layer, i) => ({
      index: i,
      name: layer.name,
      inputDim: layer.inputDim,
      outputDim: layer.outputDim,
      activation: layer.activation,
      parameters: layer.parameterCount,
    }));
  }

  setLayerActivation(layerIndex: number, activation: ActivationName): void {
    if (layerIndex < 0 || layerIndex >= this.layers.length) {
      throw new Error(`Layer index ${layerIndex} out of range`);
    }
    const layer = this.layers[layerIndex];
    layer.activation = activation;
    layer.neurons.forEach((n) => {
      n.activation = activation;
    });
  }

  /** Resets temporary cache; preserves learned parameters. */
  resetCache(): void {
    this.layers.forEach((l) => l.resetCache());
    this.layerOutputs = [];
  }

  resetParameters(seed?: number): void {
    this.layers.forEach((layer, i) =>
      layer.resetParameters(seed !== undefined ? seed + i : undefined)
    );
  }

  reset(): void {
    this.resetCache();
  }

  toJSON(): SerializedNetwork {
    return {
      name: this.name,
      layers: this.layers.map((layer) => ({
        name: layer.name,
        inputDim: layer.inputDim,
        outputDim: layer.outputDim,
        activation: layer.activation,
        weights: layer.weightsMatrix,
        biases: layer.biasesVector,
      })),
      lossFunction: this.lossFunction,
    };
  }

  static fromJSON(data: SerializedNetwork): Network {
    const network = new Network({ name: data.name, lossFunction: data.lossFunction ?? 'mse' });

    data.layers.forEach((layerData) => {
      const layer = new Layer({
        name: layerData.name,
        inputDim: layerData.inputDim,
        outputDim: layerData.outputDim,
        activation: layerData.activation,
      });
      layer.setWeightsMatrix(layerData.weights);
      layer.setBiasesVector(layerData.biases);
      network.addLayer(layer);
    });

    return network;
  }

  toString(): string {
    const arch = this.layers.map((l) => l.outputDim).join(' -> ');
    return `Network('${this.name}', ${this.inputDim} -> ${arch}, params=${this.totalParameters})`;
  }
}

/** Factory mirroring create_simple_network() in the Python engine. */
export function createSimpleNetwork(opts: {
  inputDim: number;
  hiddenDims: number[];
  outputDim: number;
  activation?: ActivationName;
  seed?: number;
}): Network {
  const { inputDim, hiddenDims, outputDim, activation = 'relu', seed } = opts;
  const network = new Network({ name: 'MLP' });

  let prevDim = inputDim;
  hiddenDims.forEach((hiddenDim, i) => {
    const layer = new Layer({
      name: `hidden_${i + 1}`,
      inputDim: prevDim,
      outputDim: hiddenDim,
      activation,
      seed: seed !== undefined ? seed + i : undefined,
    });
    network.addLayer(layer);
    prevDim = hiddenDim;
  });

  const outputLayer = new Layer({
    name: 'output',
    inputDim: prevDim,
    outputDim,
    activation: 'identity',
    seed: seed !== undefined ? seed + hiddenDims.length : undefined,
  });
  network.addLayer(outputLayer);

  return network;
}
