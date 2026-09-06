import { describe, it, expect } from 'vitest'
import { NeuralNetwork, createNetwork, createSingleNeuron } from './neural'

describe('NeuralNetwork - per-neuron independence (regression test)', () => {
  // Regression test for a real bug: forward() previously called
  // getWeightIndex(n) with n LOCAL to the current layer's loop, but
  // getWeightIndex always resolved relative to GLOBAL layer boundaries
  // starting from layer 0 -- so it returned 0 for every single call.
  // Every neuron in every layer read this.weights[0]/this.biases[0] and
  // computed an identical output. This test fails immediately if that
  // regresses.
  it('neurons within the same layer produce different outputs', () => {
    const net = new NeuralNetwork({
      inputDim: 2,
      outputDim: 1,
      layers: [
        { name: 'Layer 1', neuronCount: 6, activation: 'sigmoid' },
        { name: 'Output', neuronCount: 1, activation: 'identity' },
      ],
      optimizer: 'sgd',
      learningRate: 0.1,
    })

    const result = net.forward([0.5, -0.3])
    const layerOutputs = result.layerOutputs[1]

    const uniqueValues = new Set(layerOutputs.map((v) => v.toFixed(10)))
    expect(uniqueValues.size).toBeGreaterThan(1)
  })

  it('different neurons in the same layer have different weights after init', () => {
    const net = new NeuralNetwork({
      inputDim: 3,
      outputDim: 1,
      layers: [{ name: 'Layer 1', neuronCount: 5, activation: 'relu' }],
      optimizer: 'sgd',
      learningRate: 0.1,
    })

    const rows = net.getLayerWeights(0)
    const serialized = rows.map((row) => row.join(','))
    const uniqueRows = new Set(serialized)

    expect(uniqueRows.size).toBeGreaterThan(1)
  })
})

describe('NeuralNetwork - per-layer weight sizing (regression test)', () => {
  // Regression test for a real bug: every neuron in the network got a
  // weight vector sized to the network's ORIGINAL input dimension,
  // regardless of which layer it belonged to. Any layer whose actual
  // input size (the previous layer's neuron count) exceeded the original
  // input dimension read past the end of its weight vector -- undefined,
  // which silently became NaN the moment it was multiplied against an
  // input value. This is true for nearly any real multi-layer network,
  // including this app's own default preset.
  it('a network whose hidden layer is wider than its input never produces NaN', () => {
    // inputDim=2, but layer 1 has 4 neurons -- exactly the shape that
    // triggered the original bug.
    const net = createNetwork(
      2,
      [{ neuronCount: 4, activation: 'relu' }, { neuronCount: 2, activation: 'relu' }],
      1,
    )

    const result = net.forward([0.5, -0.3])
    expect(result.outputs.every((v) => Number.isFinite(v))).toBe(true)
    expect(result.weightedSums.every((v) => Number.isFinite(v))).toBe(true)
  })

  it('each layer\'s weight vectors are sized to that layer\'s actual input count', () => {
    const net = createNetwork(
      2,
      [{ neuronCount: 5, activation: 'relu' }, { neuronCount: 3, activation: 'relu' }],
      1,
    )

    // Layer 0: 5 neurons, each should have a weight vector of length 2 (inputDim)
    const layer0 = net.getLayerWeights(0)
    expect(layer0).toHaveLength(5)
    for (const row of layer0) {
      expect(row).toHaveLength(2)
    }

    // Layer 1: 3 neurons, each should have a weight vector of length 5
    // (layer 0's neuron count), NOT 2 (the original inputDim).
    const layer1 = net.getLayerWeights(1)
    expect(layer1).toHaveLength(3)
    for (const row of layer1) {
      expect(row).toHaveLength(5)
    }
  })

  it('trainCycle never produces NaN loss on the app\'s own default preset shape', () => {
    const net = createNetwork(
      2,
      [{ neuronCount: 4, activation: 'relu' }, { neuronCount: 2, activation: 'relu' }],
      1,
      'sgd',
      0.1,
    )

    const X = [[0, 0], [0, 1], [1, 0], [1, 1]]
    const Y = [[0], [1], [1], [0]]

    for (let epoch = 0; epoch < 50; epoch++) {
      for (let i = 0; i < X.length; i++) {
        const result = net.trainCycle(X[i], Y[i])
        expect(Number.isNaN(result.loss)).toBe(false)
      }
    }
  })
})

describe('NeuralNetwork - backprop correctness (numerical gradient check)', () => {
  it('analytical gradients match numerical (finite-difference) gradients', () => {
    const net = new NeuralNetwork({
      inputDim: 2,
      outputDim: 1,
      layers: [
        { name: 'Layer 1', neuronCount: 3, activation: 'sigmoid' },
        { name: 'Layer 2', neuronCount: 2, activation: 'sigmoid' },
        { name: 'Output', neuronCount: 1, activation: 'identity' },
      ],
      optimizer: 'sgd',
      learningRate: 0.01,
    })

    const input = [0.5, -0.3]
    const target = [1.0]
    const epsilon = 1e-5

    const state = net.getState()
    let maxAbsDiff = 0

    for (let neuronIdx = 0; neuronIdx < state.weights.length; neuronIdx++) {
      for (let inputIdx = 0; inputIdx < state.weights[neuronIdx].length; inputIdx++) {
        const original = net.getWeight(neuronIdx, inputIdx)

        net.setWeight(neuronIdx, inputIdx, original + epsilon)
        const lossPlus = net.computeLoss(net.forward(input).outputs, target)

        net.setWeight(neuronIdx, inputIdx, original - epsilon)
        const lossMinus = net.computeLoss(net.forward(input).outputs, target)

        net.setWeight(neuronIdx, inputIdx, original)

        const numericalGradient = (lossPlus - lossMinus) / (2 * epsilon)
        const analyticalResult = net.trainCycle(input, target)
        const analyticalGradient = analyticalResult.gradients.weightGradients[neuronIdx][inputIdx]

        maxAbsDiff = Math.max(maxAbsDiff, Math.abs(numericalGradient - analyticalGradient))
      }
    }

    expect(maxAbsDiff).toBeLessThan(1e-3)
  })
})

describe('NeuralNetwork - end-to-end learning', () => {
  it('learns XOR to near-zero loss with tanh + adam', () => {
    const net = createNetwork(
      2,
      [{ neuronCount: 4, activation: 'tanh' }, { neuronCount: 4, activation: 'tanh' }],
      1,
      'adam',
      0.05,
    )

    const X = [[0, 0], [0, 1], [1, 0], [1, 1]]
    const Y = [[0], [1], [1], [0]]

    let lastLoss = Infinity
    for (let epoch = 0; epoch < 1000; epoch++) {
      let epochLoss = 0
      for (let i = 0; i < X.length; i++) {
        epochLoss += net.trainCycle(X[i], Y[i]).loss
      }
      lastLoss = epochLoss
    }

    expect(lastLoss).toBeLessThan(0.05)

    // Predictions should be close to the real XOR truth table
    expect(net.forward([0, 0]).outputs[0]).toBeCloseTo(0, 1)
    expect(net.forward([0, 1]).outputs[0]).toBeCloseTo(1, 1)
    expect(net.forward([1, 0]).outputs[0]).toBeCloseTo(1, 1)
    expect(net.forward([1, 1]).outputs[0]).toBeCloseTo(0, 1)
  })

  it('a single neuron can still learn a simple linear-separable pattern', () => {
    const net = createSingleNeuron(2, 'sigmoid')
    net.updateConfig({ learningRate: 0.5 })

    // AND gate, linearly separable, should be learnable by one neuron
    const X = [[0, 0], [0, 1], [1, 0], [1, 1]]
    const Y = [[0], [0], [0], [1]]

    let lastLoss = Infinity
    for (let epoch = 0; epoch < 2000; epoch++) {
      let epochLoss = 0
      for (let i = 0; i < X.length; i++) {
        epochLoss += net.trainCycle(X[i], Y[i]).loss
      }
      lastLoss = epochLoss
    }

    expect(lastLoss).toBeLessThan(0.05)
  })
})

describe('NeuralNetwork - reset()', () => {
  it('produces correctly-sized weight vectors per layer after reset, same as construction', () => {
    const net = createNetwork(
      2,
      [{ neuronCount: 5, activation: 'relu' }, { neuronCount: 3, activation: 'relu' }],
      1,
    )

    net.reset()

    const layer0 = net.getLayerWeights(0)
    const layer1 = net.getLayerWeights(1)

    for (const row of layer0) expect(row).toHaveLength(2)
    for (const row of layer1) expect(row).toHaveLength(5)

    // Should still be usable without NaN after reset
    const result = net.forward([0.1, 0.2])
    expect(result.outputs.every((v) => Number.isFinite(v))).toBe(true)
  })
})
