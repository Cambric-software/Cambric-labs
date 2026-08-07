/**
 * Neural Network Engine for CAMBRIC LABS
 * Advanced implementation with multiple optimizers, regularization, and full control
 */

// Activation functions
export type ActivationName = 'relu' | 'sigmoid' | 'tanh' | 'identity' | 'leaky_relu' | 'elu'
export type OptimizerName = 'sgd' | 'momentum' | 'adam' | 'rmsprop'
export type LossName = 'mse' | 'mae' | 'binary_crossentropy'

export interface LayerConfig {
  name: string
  neuronCount: number
  activation: ActivationName
}

export interface NetworkConfig {
  inputDim: number
  outputDim: number
  layers: LayerConfig[]
  optimizer: OptimizerName
  learningRate: number
  momentum?: number
  beta1?: number  // Adam beta1
  beta2?: number  // Adam beta2
  epsilon?: number
  lossFunction?: LossName
  regularization?: {
    type: 'l1' | 'l2' | 'none'
    lambda: number
  }
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
  weightUpdateMagnitudes: {
    weight: number
    bias: number
  }
}

export interface ForwardPassResult {
  outputs: number[]
  weightedSums: number[]
  activations: number[]
  layerOutputs: number[][]
}

export interface NetworkStats {
  totalParameters: number
  weightMean: number
  weightStd: number
  weightMin: number
  weightMax: number
  biasMean: number
  biasStd: number
  gradientMagnitude: number
}

/**
 * Apply activation function with derivative
 */
function applyActivation(x: number, activation: ActivationName): number {
  switch (activation) {
    case 'relu':
      return Math.max(0, x)
    case 'leaky_relu':
      return x > 0 ? x : 0.01 * x
    case 'elu':
      return x > 0 ? x : Math.exp(x) - 1
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
    case 'leaky_relu':
      return weightedSum > 0 ? 1 : 0.01
    case 'elu':
      return weightedSum > 0 ? 1 : Math.exp(weightedSum)
    case 'sigmoid':
      return output * (1 - output)
    case 'tanh':
      return 1 - output * output
    case 'identity':
    default:
      return 1
  }
}

/**
 * Initialize weights using Xavier/He initialization
 */
function initializeWeights(inputDim: number, outputDim: number, activation: ActivationName): number[][] {
  let std: number
  if (activation === 'relu' || activation === 'leaky_relu' || activation === 'elu') {
    std = Math.sqrt(2.0 / inputDim)
  } else {
    std = Math.sqrt(1.0 / inputDim)
  }
  
  return Array.from({ length: outputDim }, () =>
    Array.from({ length: inputDim }, () => 
      (Math.random() * 2 - 1) * std
    )
  )
}

/**
 * Initialize biases to small values
 */
function initializeBiases(neuronCount: number): number[] {
  return Array.from({ length: neuronCount }, () => (Math.random() - 0.5) * 0.01)
}

/**
 * Compute statistics for weights/biases
 */
function computeStats(values: number[]): { mean: number; std: number; min: number; max: number } {
  const n = values.length
  if (n === 0) return { mean: 0, std: 0, min: 0, max: 0 }
  
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)
  const min = Math.min(...values)
  const max = Math.max(...values)
  
  return { mean, std, min, max }
}

export class NeuralNetwork {
  private weights: number[][]
  private biases: number[]
  private layerConfigs: LayerConfig[]
  private inputDim: number
  private outputDim: number
  private config: NetworkConfig
  
  // Optimizer state
  private velocityW: number[][] = []
  private velocityB: number[] = []
  private adamMW: number[][] = []
  private adamVW: number[][] = []
  private adamMb: number[] = []
  private adamVb: number[] = []
  private iterCount: number = 0
  
  // Cache for backward pass
  private lastWeightedSums: number[] = []
  private lastOutputs: number[] = []
  private lastActivations: number[][] = []
  private lastLayerInputs: number[][] = []

  constructor(config: NetworkConfig) {
    this.inputDim = config.inputDim
    this.outputDim = config.outputDim
    this.layerConfigs = config.layers
    this.config = { ...config }
    
    // Calculate total neurons and initialize
    const totalNeurons = config.layers.reduce((sum, l) => sum + l.neuronCount, 0)
    this.weights = initializeWeights(config.inputDim, totalNeurons, config.layers[0]?.activation || 'relu')
    this.biases = initializeBiases(totalNeurons)
    
    // Initialize optimizer state
    this.initOptimizerState()
  }

  private initOptimizerState(): void {
    const opt = this.config.optimizer
    
    if (opt === 'momentum' || opt === 'adam' || opt === 'rmsprop') {
      this.velocityW = this.weights.map(w => new Array(w.length).fill(0))
      this.velocityB = new Array(this.biases.length).fill(0)
    }
    
    if (opt === 'adam') {
      this.adamMW = this.weights.map(w => new Array(w.length).fill(0))
      this.adamVW = this.weights.map(w => new Array(w.length).fill(0))
      this.adamMb = new Array(this.biases.length).fill(0)
      this.adamVb = new Array(this.biases.length).fill(0)
    }
  }

  /**
   * Get network statistics
   */
  getStats(): NetworkStats {
    const allWeights = this.weights.flat()
    const weightStats = computeStats(allWeights)
    const biasStats = computeStats(this.biases)
    
    return {
      totalParameters: this.weights.reduce((sum, w) => sum + w.length, 0) + this.biases.length,
      weightMean: weightStats.mean,
      weightStd: weightStats.std,
      weightMin: weightStats.min,
      weightMax: weightStats.max,
      biasMean: biasStats.mean,
      biasStd: biasStats.std,
      gradientMagnitude: 0 // Will be updated during training
    }
  }

  /**
   * Get layer weights
   */
  getLayerWeights(layerIndex: number): number[][] {
    const startIdx = this.getLayerStartIndex(layerIndex)
    const neuronCount = this.layerConfigs[layerIndex].neuronCount
    return this.weights.slice(startIdx, startIdx + neuronCount)
  }

  /**
   * Get layer biases
   */
  getLayerBiases(layerIndex: number): number[] {
    const startIdx = this.getLayerStartIndex(layerIndex)
    const neuronCount = this.layerConfigs[layerIndex].neuronCount
    return this.biases.slice(startIdx, startIdx + neuronCount)
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
   * Update configuration
   */
  updateConfig(config: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...config }
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
    this.lastLayerInputs = [inputs]
    
    let currentInput = inputs

    for (let layerIdx = 0; layerIdx < this.layerConfigs.length; layerIdx++) {
      const layer = this.layerConfigs[layerIdx]
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
      this.lastLayerInputs.push([...currentInput])
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
   * Compute loss
   */
  computeLoss(predictions: number[], targets: number[]): number {
    switch (this.config.lossFunction || 'mse') {
      case 'mae':
        return predictions.reduce((sum, p, i) => sum + Math.abs(p - targets[i]), 0) / predictions.length
      case 'binary_crossentropy':
        const eps = 1e-15
        return predictions.reduce((sum, p, i) => {
          const pClamped = Math.max(eps, Math.min(1 - eps, p))
          const t = targets[i]
          return sum - (t * Math.log(pClamped) + (1 - t) * Math.log(1 - pClamped))
        }, 0) / predictions.length
      case 'mse':
      default:
        return predictions.reduce((sum, p, i) => {
          const error = p - targets[i]
          return sum + error * error
        }, 0) / predictions.length
    }
  }

  /**
   * Compute loss gradient with respect to predictions
   */
  private computeOutputGradient(predictions: number[], targets: number[]): number[] {
    switch (this.config.lossFunction || 'mse') {
      case 'mae':
        return predictions.map((p, i) => Math.sign(p - targets[i]) / predictions.length)
      case 'mse':
      default:
        return predictions.map((p, i) => 2 * (p - targets[i]) / predictions.length)
    }
  }

  /**
   * Single training cycle (forward + backward + update)
   */
  trainCycle(inputs: number[], targets: number[]): TrainingResult {
    const lr = this.config.learningRate
    
    // Forward pass
    const forwardResult = this.forward(inputs)
    const predictions = forwardResult.outputs

    // Compute loss
    const loss = this.computeLoss(predictions, targets)

    // Backward pass
    const outputGradient = this.computeOutputGradient(predictions, targets)
    const { weightGradients, biasGradients } = this.computeGradients(outputGradient)

    // Apply regularization to gradients
    this.applyRegularization(weightGradients)

    // Compute update magnitudes before applying
    const weightUpdateMag = Math.sqrt(weightGradients.flat().reduce((s, g) => s + g * g, 0))
    const biasUpdateMag = Math.sqrt(biasGradients.reduce((s, g) => s + g * g, 0))

    // Update weights using selected optimizer
    this.updateWeights(weightGradients, biasGradients, lr)

    // Increment iteration counter for Adam
    this.iterCount++

    return {
      loss,
      predictions,
      weights: this.weights.map(w => [...w]),
      biases: [...this.biases],
      gradients: { weightGradients, biasGradients },
      weightUpdateMagnitudes: {
        weight: weightUpdateMag,
        bias: biasUpdateMag
      }
    }
  }

  /**
   * Apply L1/L2 regularization to gradients
   */
  private applyRegularization(weightGradients: number[][]): void {
    const reg = this.config.regularization
    if (!reg || reg.type === 'none' || reg.lambda === 0) return
    
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        const w = this.weights[i][j]
        if (reg.type === 'l1') {
          weightGradients[i][j] += reg.lambda * Math.sign(w)
        } else if (reg.type === 'l2') {
          weightGradients[i][j] += reg.lambda * w
        }
      }
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

    let gradient = outputGradient

    for (let layerIdx = this.layerConfigs.length - 1; layerIdx >= 0; layerIdx--) {
      const layer = this.layerConfigs[layerIdx]
      const layerStartIdx = this.getLayerStartIndex(layerIdx)
      
      for (let n = 0; n < layer.neuronCount; n++) {
        const neuronIdx = layerStartIdx + n
        const weightedSum = this.lastWeightedSums[neuronIdx]
        const output = this.lastOutputs[neuronIdx]
        
        const activationDerivative = getActivationDerivative(output, weightedSum, layer.activation)
        const activationGradient = gradient[n] * activationDerivative

        for (let i = 0; i < this.weights[neuronIdx].length; i++) {
          weightGradients[neuronIdx][i] = this.lastActivations[layerIdx][i] * activationGradient
        }

        biasGradients[neuronIdx] = activationGradient
      }

      if (layerIdx > 0) {
        const newGradient: number[] = new Array(this.layerConfigs[layerIdx - 1].neuronCount).fill(0)
        
        for (let n = 0; n < layer.neuronCount; n++) {
          const neuronIdx = layerStartIdx + n
          const weightedSum = this.lastWeightedSums[neuronIdx]
          const output = this.lastOutputs[neuronIdx]
          
          const activationDerivative = getActivationDerivative(output, weightedSum, layer.activation)
          const activationGradient = gradient[n] * activationDerivative

          for (let i = 0; i < this.weights[neuronIdx].length; i++) {
            newGradient[i] += this.weights[neuronIdx][i] * activationGradient
          }
        }
        
        gradient = newGradient
      }
    }

    return { weightGradients, biasGradients }
  }

  /**
   * Update weights using the selected optimizer
   */
  private updateWeights(weightGradients: number[][], biasGradients: number[], lr: number): void {
    const beta1 = this.config.beta1 || 0.9
    const beta2 = this.config.beta2 || 0.999
    const epsilon = this.config.epsilon || 1e-8
    const momentum = this.config.momentum || 0.9
    
    switch (this.config.optimizer) {
      case 'sgd':
        for (let i = 0; i < this.weights.length; i++) {
          for (let j = 0; j < this.weights[i].length; j++) {
            this.weights[i][j] -= lr * weightGradients[i][j]
          }
          this.biases[i] -= lr * biasGradients[i]
        }
        break
        
      case 'momentum':
        for (let i = 0; i < this.weights.length; i++) {
          for (let j = 0; j < this.weights[i].length; j++) {
            this.velocityW[i][j] = momentum * this.velocityW[i][j] - lr * weightGradients[i][j]
            this.weights[i][j] += this.velocityW[i][j]
          }
          this.velocityB[i] = momentum * this.velocityB[i] - lr * biasGradients[i]
          this.biases[i] += this.velocityB[i]
        }
        break
        
      case 'rmsprop':
        const decayRate = 0.9
        for (let i = 0; i < this.weights.length; i++) {
          for (let j = 0; j < this.weights[i].length; j++) {
            this.velocityW[i][j] = decayRate * this.velocityW[i][j] + (1 - decayRate) * weightGradients[i][j] ** 2
            this.weights[i][j] -= (lr / Math.sqrt(this.velocityW[i][j] + epsilon)) * weightGradients[i][j]
          }
          this.velocityB[i] = decayRate * this.velocityB[i] + (1 - decayRate) * biasGradients[i] ** 2
          this.biases[i] -= (lr / Math.sqrt(this.velocityB[i] + epsilon)) * biasGradients[i]
        }
        break
        
      case 'adam':
        this.iterCount++
        const t = this.iterCount
        
        for (let i = 0; i < this.weights.length; i++) {
          for (let j = 0; j < this.weights[i].length; j++) {
            // Update biased first moment estimate
            this.adamMW[i][j] = beta1 * this.adamMW[i][j] + (1 - beta1) * weightGradients[i][j]
            // Update biased second raw moment estimate
            this.adamVW[i][j] = beta2 * this.adamVW[i][j] + (1 - beta2) * weightGradients[i][j] ** 2
            
            // Compute bias-corrected first moment estimate
            const mHat = this.adamMW[i][j] / (1 - Math.pow(beta1, t))
            // Compute bias-corrected second raw moment estimate
            const vHat = this.adamVW[i][j] / (1 - Math.pow(beta2, t))
            
            // Update parameters
            this.weights[i][j] -= lr * mHat / (Math.sqrt(vHat) + epsilon)
          }
          
          // Update biased moment estimates for biases
          this.adamMb[i] = beta1 * this.adamMb[i] + (1 - beta1) * biasGradients[i]
          this.adamVb[i] = beta2 * this.adamVb[i] + (1 - beta2) * biasGradients[i] ** 2
          
          // Compute bias-corrected estimates
          const mHatB = this.adamMb[i] / (1 - Math.pow(beta1, t))
          const vHatB = this.adamVb[i] / (1 - Math.pow(beta2, t))
          
          // Update biases
          this.biases[i] -= lr * mHatB / (Math.sqrt(vHatB) + epsilon)
        }
        break
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
   * Reset the network with fresh weights
   */
  reset(): void {
    const totalNeurons = this.layerConfigs.reduce((sum, l) => sum + l.neuronCount, 0)
    this.weights = initializeWeights(this.inputDim, totalNeurons, this.layerConfigs[0]?.activation || 'relu')
    this.biases = initializeBiases(totalNeurons)
    this.iterCount = 0
    this.initOptimizerState()
  }

  /**
   * Set individual weight
   */
  setWeight(neuronIdx: number, inputIdx: number, value: number): void {
    this.weights[neuronIdx][inputIdx] = value
  }

  /**
   * Set individual bias
   */
  setBias(neuronIdx: number, value: number): void {
    this.biases[neuronIdx] = value
  }

  /**
   * Get individual weight
   */
  getWeight(neuronIdx: number, inputIdx: number): number {
    return this.weights[neuronIdx][inputIdx]
  }

  /**
   * Get individual bias
   */
  getBias(neuronIdx: number): number {
    return this.biases[neuronIdx]
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
    }],
    optimizer: 'sgd',
    learningRate: 0.01
  })
}

/**
 * Create a multi-neuron network
 */
export function createNetwork(
  inputDim: number,
  hiddenLayers: { neuronCount: number; activation: string }[],
  outputDim: number,
  optimizer: OptimizerName = 'sgd',
  learningRate: number = 0.01
): NeuralNetwork {
  return new NeuralNetwork({
    inputDim,
    outputDim,
    layers: hiddenLayers.map((layer, i) => ({
      name: `Layer ${i + 1}`,
      neuronCount: layer.neuronCount,
      activation: layer.activation as ActivationName
    })),
    optimizer,
    learningRate
  })
}

export default NeuralNetwork
