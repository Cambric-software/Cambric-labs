import { useState, useEffect, useCallback } from 'react'
import { Zap, BookOpen, Code, Play, RotateCcw, Plus, Minus } from 'lucide-react'
import { neuronApi } from '../supabase'
import styles from './LabPage.module.css'

interface Neuron {
  input_count: number
  weights: number[]
  bias: number
  activation: string
  loss_function?: string
}

export default function LabPage() {
  const [neuron, setNeuron] = useState<Neuron | null>(null)
  const [inputs, setInputs] = useState<number[]>([0.5, 0.3, 0.8])
  const [output, setOutput] = useState<number | null>(null)
  const [cycleCount, setCycleCount] = useState(0)
  const [lastLoss, setLastLoss] = useState<number | null>(null)
  const [lastGradient, setLastGradient] = useState<number | null>(null)
  const [showForwardAnimation, setShowForwardAnimation] = useState(false)
  const [explainMode, setExplainMode] = useState<'simple' | 'technical'>('simple')

  const createNeuron = useCallback(async (inputCount: number = 3, activation: string = 'relu') => {
    try {
      const { data, error } = await neuronApi.create(inputCount, activation)
      if (error) throw error
      if (data?.neuron) {
        setNeuron(data.neuron)
        return
      }
    } catch (err) {
      console.error('Edge function not available, using local neuron')
    }
    const fallbackNeuron: Neuron = {
      input_count: inputCount,
      weights: Array.from({ length: inputCount }, () => Math.random() * 0.5 - 0.25),
      bias: Math.random() * 0.5 - 0.25,
      activation,
      loss_function: 'mse',
    }
    setNeuron(fallbackNeuron)
  }, [])

  useEffect(() => {
    createNeuron()
  }, [createNeuron])

  const runForward = useCallback(() => {
    if (!neuron) return
    setShowForwardAnimation(true)
    setTimeout(() => {
      let weightedSum = neuron.bias
      for (let i = 0; i < neuron.input_count; i++) {
        weightedSum += inputs[i] * neuron.weights[i]
      }
      const activationFn = (x: number) => {
        switch (neuron.activation) {
          case 'relu': return Math.max(0, x)
          case 'sigmoid': return 1 / (1 + Math.exp(-x))
          case 'tanh': return Math.tanh(x)
          default: return x
        }
      }
      setOutput(activationFn(weightedSum))
      setShowForwardAnimation(false)
    }, 500)
  }, [neuron, inputs])

  const trainCycle = useCallback(async () => {
    if (!neuron) return
    const target = inputs.reduce((a, b) => a + b, 0) / inputs.length
    try {
      const { data, error } = await neuronApi.train(neuron, inputs, [target], 0.01)
      if (error) throw error
      if (data) {
        setNeuron(data.neuron)
        setLastLoss(data.loss)
        setLastGradient(data.gradient)
        setCycleCount(c => c + 1)
        setOutput(null)
        return
      }
    } catch (err) {
      console.error('Edge function not available, using local training')
    }
    const learningRate = 0.01
    let weightedSum = neuron.bias
    for (let i = 0; i < neuron.input_count; i++) {
      weightedSum += inputs[i] * neuron.weights[i]
    }
    const pred = weightedSum
    const loss = (pred - target) ** 2
    const gradient = 2 * (pred - target)
    const newNeuron: Neuron = {
      ...neuron,
      weights: neuron.weights.map((w, i) => w - learningRate * gradient * inputs[i]),
      bias: neuron.bias - learningRate * gradient,
    }
    setNeuron(newNeuron)
    setLastLoss(loss)
    setLastGradient(gradient)
    setCycleCount(c => c + 1)
    setOutput(null)
  }, [neuron, inputs])

  const resetNeuron = () => {
    createNeuron(neuron?.input_count || 3, neuron?.activation || 'relu')
    setOutput(null)
    setCycleCount(0)
    setLastLoss(null)
    setLastGradient(null)
  }

  const addInput = () => {
    if (neuron && neuron.input_count < 10) {
      setNeuron({
        ...neuron,
        input_count: neuron.input_count + 1,
        weights: [...neuron.weights, Math.random() * 0.5 - 0.25],
      })
      setInputs([...inputs, Math.random()])
    }
  }

  const removeInput = () => {
    if (neuron && neuron.input_count > 1) {
      setNeuron({
        ...neuron,
        input_count: neuron.input_count - 1,
        weights: neuron.weights.slice(0, -1),
      })
      setInputs(inputs.slice(0, -1))
    }
  }

  if (!neuron) {
    return <div className={styles.loading}>Loading neuron...</div>
  }

  return (
    <div className={styles.lab}>
      <header className={styles.header}>
        <h1>CAMBRIC LABS</h1>
        <p className={styles.subtitle}>Neural Network Laboratory</p>
      </header>

      <div className={styles.mainContent}>
        <section className={styles.neuronSection}>
          <h2>Your Neuron</h2>
          <div className={styles.neuronVisual}>
            <div className={styles.inputs}>
              {inputs.map((val, i) => (
                <div key={i} className={styles.inputNode}>
                  <span className={styles.label}>Input {i + 1}</span>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const newInputs = [...inputs]
                      newInputs[i] = parseFloat(e.target.value) || 0
                      setInputs(newInputs)
                    }}
                    step="0.1"
                  />
                  <span className={styles.weight}>W{i + 1}: {neuron.weights[i]?.toFixed(3) || '0.000'}</span>
                </div>
              ))}
            </div>
            <div className={styles.neuron}>
              <div className={styles.neuronInner}>
                <Zap size={24} />
                <span>NEURON</span>
              </div>
              <div className={styles.neuronStats}>
                <span>Activation: {neuron.activation.toUpperCase()}</span>
                <span>Bias: {neuron.bias.toFixed(3)}</span>
              </div>
            </div>
            <div className={styles.output}>
              <span className={styles.label}>Output</span>
              <div className={styles.outputValue}>
                {output !== null ? output.toFixed(4) : '—'}
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <button onClick={runForward} disabled={showForwardAnimation}>
              <Play size={16} /> Forward Pass
            </button>
            <button onClick={trainCycle} className={styles.primary}>
              <Zap size={16} /> CYCLE
            </button>
            <button onClick={resetNeuron}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div className={styles.inputControls}>
            <button onClick={removeInput} disabled={neuron.input_count <= 1}>
              <Minus size={16} />
            </button>
            <span>{neuron.input_count} Inputs</span>
            <button onClick={addInput} disabled={neuron.input_count >= 10}>
              <Plus size={16} />
            </button>
          </div>
        </section>

        <section className={styles.trainingSection}>
          <h2>Training Status</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Cycles</span>
              <span className={styles.statValue}>{cycleCount}</span>
            </div>
            {lastLoss !== null && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Last Loss</span>
                <span className={styles.statValue}>{lastLoss.toFixed(6)}</span>
              </div>
            )}
            {lastGradient !== null && (
              <div className={styles.stat}>
                <span className={styles.statLabel}>Gradient</span>
                <span className={styles.statValue}>{lastGradient.toFixed(6)}</span>
              </div>
            )}
          </div>
          {lastLoss !== null && (
            <div className={styles.weightChanges}>
              <h3>Weight Changes</h3>
              {neuron.weights.map((w, i) => (
                <div key={i} className={styles.weightChange}>
                  <span>Weight {i + 1}: {w.toFixed(4)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className={styles.learnSection}>
          <div className={styles.learnHeader}>
            <button className={explainMode === 'simple' ? styles.active : ''} onClick={() => setExplainMode('simple')}>
              <BookOpen size={16} /> Simple
            </button>
            <button className={explainMode === 'technical' ? styles.active : ''} onClick={() => setExplainMode('technical')}>
              <Code size={16} /> Technical
            </button>
          </div>
          <div className={styles.explanation}>
            <h3>What is a Neuron?</h3>
            {explainMode === 'simple' ? (
              <p>A neuron is like a tiny decision maker. It takes numbers (inputs), multiplies them by weights (how much to pay attention), adds them up, and decides what to output.</p>
            ) : (
              <p>A neuron computes a weighted sum of inputs: y = f(Σwᵢxᵢ + b), where f is the activation function, w are weights, x are inputs, and b is the bias.</p>
            )}
            <h3>What is Training?</h3>
            {explainMode === 'simple' ? (
              <p>Training means adjusting the weights so the neuron makes better decisions. We show it an example, see what it outputs, and nudge the weights slightly in the right direction.</p>
            ) : (
              <p>Training uses gradient descent to minimize loss. We compute the gradient of loss with respect to each weight and update: w = w - lr * ∂L/∂w</p>
            )}
            <h3>What is a Cycle?</h3>
            {explainMode === 'simple' ? (
              <p>One cycle shows the neuron one training example, calculates how wrong it was, and adjusts the weights a tiny bit.</p>
            ) : (
              <p>A training cycle computes one forward pass, calculates loss, computes gradients via backpropagation, and applies weight updates.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
