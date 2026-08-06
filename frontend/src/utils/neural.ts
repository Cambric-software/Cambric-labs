/**
 * Neural Network Engine for CAMBRIC LABS
 * Pure JavaScript implementation for local-first operation
 */

// Activation functions
type ActivationName = 'relu' | 'sigmoid' | 'tanh' | 'identity' | 'softmax'

export interface LayerConfig {
  name: string
  neuronCount: number
  activation: ActivationName
}

export interface NetworkState {
  layers: LayerConfig[]
  weights: number[][]
  biases: number[]
  inputDim: number
  outputDim: number
}

export interface TrainingResult {
  loss: number
  predictions: number[]
  weights: number[][]
  biases: number[]
  gradients: {
    weightGradients: number[][]
    biasGradients: number[]
  }
}

export interface ForwardPassResult {
  outputs: number[]
  weightedSums: number[]
  activations: number[]
  layerOutputs: number[][]
}

/**
 * Initialize weights using Xavier/He initialization
 */
function initializeWeights(inputDim: number, outputDim: number, activation: string): number[][] {
  const std = activation === 'relu' 
    ? Math.sqrt(2.0 / inputDim) 
    : Math.sqrt(1.0 / inputDim)
  
  return Array.from({ length: outputDim }, () =>
    Array.from({ length: inputDim }, () => 
      (Math.random() * 2 - 1) * std
    )
  )
}

/**
 * Initialize biases to zero
 */
function initializeBiases(neuronCount: number): number[] {
  return new Array(neuronCount).fill(0)
}

/**
 * Apply activation function
 */
function applyActivation(x: number, activation: ActivationName): number {
  switch (activation) {
    case 'relu':
      return Math.max(0, x)
    case 'sigmoid':
      return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))))
    case 'tanh':
      return Math.tanh(x)
    case 'identity':
    default:
      return x
  }
}

/**
 * Get activation derivative
 */
function getActivationDerivative(output: number, weightedSum: number, activation: ActivationName): number {
  switch (activation) {
    case 'relu':
      return weightedSum > 0 ? 1 : 0
    case 'sigmoid':
      return output * (1 - output)
    case 'tanh':
      return 1 - output * output
    case 'identity':
    default:
      return 1
  }
}

export class NeuralNetwork {
  private weights: number[][]
  private biases: number[]
  private layerConfigs: LayerConfig[]
  private inputDim: number
  private outputDim: number
  
  // Cache for backward pass
  private lastWeightedSums: number[] = []
  private lastOutputs: number[] = []
  private lastActivations: number[][] = []

  constructor(config: {
    inputDim: number
    layers: LayerConfig[]
    outputDim: number
    weights?: number[][]
    biases?: number[]
  }) {
    this.inputDim = config.inputDim
    this.outputDim = config.outputDim
    this.layerConfigs = config.layers
    
    if (config.weights && config.biases) {
      this.weights = config.weights
      this.biases = config.biases
    } else {
      // Calculate total neurons (sum of all layer neurons for simplicity)
      const totalNeurons = config.layers.reduce((sum, l) => sum + l.neuronCount, 0)
      this.weights = initializeWeights(config.inputDim, totalNeurons, 'relu')
      this.biases = initializeBiases(totalNeurons)
    }
  }

  /**
   * Get the total parameter count
   */
  get parameterCount(): number {
    return this.weights.reduce((sum, w) => sum + w.length, 0) + this.biases.length
  }

  /**
   * Get current state for serialization
   */
  getState(): NetworkState {
    return {
      layers: this.layerConfigs,
      weights: this.weights,
      biases: this.biases,
      inputDim: this.inputDim,
      outputDim: this.outputDim
    }
  }

  /**
   * Set weights from external source
   */
  setWeights(weights: number[][], biases: number[]): void {
    this.weights = weights
    this.biases = biases
  }

  /**
   * Forward pass through the network
   */
  forward(inputs: number[]): ForwardPassResult {
    if (inputs.length !== this.inputDim) {
      throw new Error(`Input dimension mismatch: expected ${this.inputDim}, got ${inputs.length}`)
    }

    this.lastWeightedSums = []
    this.lastOutputs = []
    this.lastActivations = [inputs]
    
    let currentInput = inputs

    for (const layer of this.layerConfigs) {
      const layerOutputs: number[] = []
      
      for (let n = 0; n < layer.neuronCount; n++) {
        const weightIndex = this.getWeightIndex(n)
        const weightVector = this.weights[weightIndex]
        
        // Compute weighted sum for this neuron
        let weightedSum = this.biases[weightIndex]
        for (let i = 0; i < currentInput.length; i++) {
          weightedSum += currentInput[i] * weightVector[i]
        }
        
        // Apply activation
        const output = applyActivation(weightedSum, layer.activation)
        
        this.lastWeightedSums.push(weightedSum)
        layerOutputs.push(output)
      }
      
      this.lastOutputs.push(...layerOutputs)
      this.lastActivations.push([...layerOutputs])
      currentInput = layerOutputs
    }

    return {
      outputs: currentInput,
      weightedSums: this.lastWeightedSums,
      activations: this.lastOutputs,
      layerOutputs: this.lastActivations
    }
  }

  /**
   * Compute MSE loss
   */
  computeLoss(predictions: number[], targets: number[]): number {
    let sumSquaredError = 0
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - targets[i]
      sumSquaredError += error * error
    }
    return sumSquaredError / predictions.length
  }

  /**
   * Compute loss gradient with respect to predictions
   */
  private computeOutputGradient(predictions: number[], targets: number[]): number[] {
    return predictions.map((p, i) => 2 * (p - targets[i]) / predictions.length)
  }

  /**
   * Single training cycle (forward + backward + update)
   */
  trainCycle(
    inputs: number[],
    targets: number[],
    learningRate: number = 0.01
  ): TrainingResult {
    // Forward pass
    const forwardResult = this.forward(inputs)
    const predictions = forwardResult.outputs

    // Compute loss
    const loss = this.computeLoss(predictions, targets)

    // Backward pass
    const outputGradient = this.computeOutputGradient(predictions, targets)
    const { weightGradients, biasGradients } = this.computeGradients(outputGradient)

    // Update weights
    this.updateWeights(weightGradients, biasGradients, learningRate)

    return {
      loss,
      predictions,
      weights: this.weights,
      biases: this.biases,
      gradients: { weightGradients, biasGradients }
    }
  }

  /**
   * Compute gradients via backpropagation
   */
  private computeGradients(outputGradient: number[]): { 
    weightGradients: number[][]; 
    biasGradients: number[] 
  } {
    const weightGradients: number[][] = this.weights.map(w => new Array(w.length).fill(0))
    const biasGradients: number[] = new Array(this.biases.length).fill(0)

    // Work backwards through layers
    let gradient = outputGradient

    // Process each layer in reverse
    for (let layerIdx = this.layerConfigs.length - 1; layerIdx >= 0; layerIdx--) {
      const layer = this.layerConfigs[layerIdx]
      const layerStartIdx = this.getLayerStartIndex(layerIdx)
      
      for (let n = 0; n < layer.neuronCount; n++) {
        const neuronIdx = layerStartIdx + n
        const weightVector = this.weights[neuronIdx]
        const weightedSum = this.lastWeightedSums[neuronIdx]
        const output = this.lastOutputs[neuronIdx]
        
        // Get activation derivative
        const activationDerivative = getActivationDerivative(output, weightedSum, layer.activation)

        // Gradient through activation
        const activationGradient = gradient[n] * activationDerivative

        // Compute input gradients for this neuron
        for (let i = 0; i < weightVector.length; i++) {
          // Gradient with respect to weight = input * activation gradient
          weightGradients[neuronIdx][i] = this.lastActivations[layerIdx][i] * activationGradient
        }

        // Gradient with respect to bias = activation gradient
        biasGradients[neuronIdx] = activationGradient
      }

      // Propagate gradient to previous layer
      if (layerIdx > 0) {
        const newGradient: number[] = new Array(this.layerConfigs[layerIdx - 1].neuronCount).fill(0)
        
        for (let n = 0; n < layer.neuronCount; n++) {
          const neuronIdx = layerStartIdx + n
          const weightVector = this.weights[neuronIdx]
          const weightedSum = this.lastWeightedSums[neuronIdx]
          const output = this.lastOutputs[neuronIdx]
          
          const activationDerivative = getActivationDerivative(output, weightedSum, layer.activation)
          const activationGradient = gradient[n] * activationDerivative

          // Add contribution to each input
          for (let i = 0; i < weightVector.length; i++) {
            newGradient[i] += weightVector[i] * activationGradient
          }
        }
        
        gradient = newGradient
      }
    }

    return { weightGradients, biasGradients }
  }

  /**
   * Update weights using gradient descent
   */
  private updateWeights(
    weightGradients: number[][], 
    biasGradients: number[], 
    learningRate: number
  ): void {
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        this.weights[i][j] -= learningRate * weightGradients[i][j]
      }
      this.biases[i] -= learningRate * biasGradients[i]
    }
  }

  /**
   * Get weight matrix index for a neuron
   */
  private getWeightIndex(neuronIndex: number): number {
    let index = 0
    for (let l = 0; l < this.layerConfigs.length; l++) {
      if (neuronIndex < index + this.layerConfigs[l].neuronCount) {
        return index
      }
      index += this.layerConfigs[l].neuronCount
    }
    return 0
  }

  /**
   * Get starting index for a layer
   */
  private getLayerStartIndex(layerIndex: number): number {
    let index = 0
    for (let l = 0; l < layerIndex; l++) {
      index += this.layerConfigs[l].neuronCount
    }
    return index
  }

  /**
   * Reset the network
   */
  reset(): void {
    const totalNeurons = this.layerConfigs.reduce((sum, l) => sum + l.neuronCount, 0)
    this.weights = initializeWeights(this.inputDim, totalNeurons, 'relu')
    this.biases = initializeBiases(totalNeurons)
  }
}

/**
 * Create a simple one-neuron network
 */
export function createSingleNeuron(inputCount: number, activation: ActivationName = 'relu'): NeuralNetwork {
  return new NeuralNetwork({
    inputDim: inputCount,
    outputDim: 1,
    layers: [{
      name: 'Output',
      neuronCount: 1,
      activation
    }]
  })
}

/**
 * Create a multi-neuron network
 */
export function createNetwork(
  inputDim: number,
  hiddenLayers: { neuronCount: number; activation: string }[],
  outputDim: number
): NeuralNetwork {
  return new NeuralNetwork({
    inputDim,
    outputDim,
    layers: hiddenLayers.map((layer, i) => ({
      name: `Layer ${i + 1}`,
      neuronCount: layer.neuronCount,
      activation: layer.activation as ActivationName
    }))
  })
}

export default NeuralNetwork
