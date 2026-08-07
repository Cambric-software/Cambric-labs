import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Zap, Play, RotateCcw, Plus, Minus, Trash2, Save, 
  ChevronDown, ChevronUp, TrendingDown, Activity, 
  Layers, Download
} from 'lucide-react'
import { NeuralNetwork, createSingleNeuron, createNetwork } from '../utils/neural'
import { experimentStorage, Experiment } from '../utils/storage'
import styles from './LabPage.module.css'

interface TrainingStep {
  cycle: number
  loss: number
  prediction: number
  target: number
  weightDeltas: number[]
  biasDelta: number
}

export default function LabPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  // Network state
  const [network, setNetwork] = useState<NeuralNetwork | null>(null)
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  
  // Inputs and outputs
  const [inputs, setInputs] = useState<number[]>([0.5, 0.3, 0.8])
  const [target, setTarget] = useState<number>(0.53)
  const [output, setOutput] = useState<number | null>(null)
  
  // Training state
  const [cycleCount, setCycleCount] = useState(0)
  const [lastLoss, setLastLoss] = useState<number | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingHistory, setTrainingHistory] = useState<TrainingStep[]>([])
  const [learningRate, setLearningRate] = useState(0.1)
  
  // Network architecture
  const [layers, setLayers] = useState<{ neuronCount: number; activation: string }[]>([
    { neuronCount: 4, activation: 'relu' },
    { neuronCount: 2, activation: 'relu' }
  ])
  const [inputCount, setInputCount] = useState(3)
  
  // UI state
  const [showNetworkConfig, setShowNetworkConfig] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [explainMode, setExplainMode] = useState<'simple' | 'technical'>('simple')
  
  const trainingRef = useRef<number | null>(null)

  // Load or create experiment
  useEffect(() => {
    if (id) {
      const exp = experimentStorage.get(id)
      if (exp) {
        setExperiment(exp)
        setCycleCount(exp.currentCycle)
        setLearningRate(exp.learningRate)
        setInputCount(exp.inputDim)
        setLayers(exp.layers.map(l => ({
          neuronCount: l.neuronCount,
          activation: l.activation
        })))
        
        // Recreate network from saved state
        const net = createNetwork(
          exp.inputDim,
          exp.layers.map(l => ({ neuronCount: l.neuronCount, activation: l.activation })),
          exp.outputDim
        )
        if (exp.currentWeights.length > 0) {
          net.setWeights(exp.currentWeights, exp.currentBiases)
        }
        setNetwork(net)
      }
    } else {
      // Create new single neuron
      const net = createSingleNeuron(3, 'relu')
      setNetwork(net)
    }
  }, [id])

  // Save experiment
  const saveExperiment = useCallback(() => {
    if (!network || !experiment) return
    
    const state = network.getState()
    experimentStorage.updateWeights(experiment.id, state.weights, state.biases)
    experimentStorage.addTrainingHistory(
      experiment.id,
      cycleCount,
      lastLoss || 0,
      state.weights,
      state.biases
    )
    
    // Show save indicator
    const saveEl = document.querySelector('[data-save-indicator]')
    if (saveEl) {
      saveEl.classList.add(styles.saved)
      setTimeout(() => saveEl.classList.remove(styles.saved), 1000)
    }
  }, [network, experiment, cycleCount, lastLoss])

  // Run forward pass
  const runForward = useCallback(() => {
    if (!network) return
    
    const result = network.forward(inputs)
    setOutput(result.outputs[0])
  }, [network, inputs])

  // Single training cycle
  const trainCycle = useCallback(() => {
    if (!network) return
    
    const result = network.trainCycle(inputs, [target])
    
    setOutput(result.predictions[0])
    setLastLoss(result.loss)
    setCycleCount(c => c + 1)
    
    // Calculate weight deltas for display
    const state = network.getState()
    const weightDeltas = result.gradients.weightGradients.flat()
    
    setTrainingHistory(prev => [...prev.slice(-99), {
      cycle: cycleCount + 1,
      loss: result.loss,
      prediction: result.predictions[0],
      target,
      weightDeltas,
      biasDelta: result.gradients.biasGradients[0]
    }])
    
    // Auto-save
    if (experiment) {
      experimentStorage.addTrainingHistory(
        experiment.id,
        cycleCount + 1,
        result.loss,
        state.weights,
        state.biases
      )
    }
  }, [network, inputs, target, learningRate, experiment, cycleCount])

  // Auto-train
  const startAutoTrain = useCallback(() => {
    if (!network || isTraining) return
    setIsTraining(true)
    
    const runCycle = () => {
      if (!isTraining) return
      
      trainCycle()
      trainingRef.current = window.setTimeout(runCycle, 50)
    }
    
    runCycle()
  }, [network, isTraining, trainCycle])

  const stopAutoTrain = useCallback(() => {
    setIsTraining(false)
    if (trainingRef.current) {
      clearTimeout(trainingRef.current)
      trainingRef.current = null
    }
  }, [])

  // Reset network
  const resetNetwork = useCallback(() => {
    if (!network) return
    network.reset()
    setOutput(null)
    setCycleCount(0)
    setLastLoss(null)
    setTrainingHistory([])
    setInputs([0.5, 0.3, 0.8])
    setTarget(0.53)
  }, [network])

  // Add layer
  const addLayer = () => {
    const newLayers = [...layers, { neuronCount: 4, activation: 'relu' }]
    setLayers(newLayers)
    rebuildNetwork(inputCount, newLayers)
  }

  // Remove layer
  const removeLayer = (index: number) => {
    if (layers.length <= 1) return
    const newLayers = layers.filter((_, i) => i !== index)
    setLayers(newLayers)
    rebuildNetwork(inputCount, newLayers)
  }

  // Update layer
  const updateLayer = (index: number, updates: Partial<{ neuronCount: number; activation: string }>) => {
    const newLayers = layers.map((l, i) => i === index ? { ...l, ...updates } : l)
    setLayers(newLayers)
    rebuildNetwork(inputCount, newLayers)
  }

  // Add input
  const addInput = () => {
    if (inputCount >= 20) return
    const newCount = inputCount + 1
    setInputCount(newCount)
    setInputs([...inputs, 0.5])
    rebuildNetwork(newCount, layers)
  }

  // Remove input
  const removeInput = () => {
    if (inputCount <= 1) return
    const newCount = inputCount - 1
    setInputCount(newCount)
    setInputs(inputs.slice(0, -1))
    rebuildNetwork(newCount, layers)
  }

  // Rebuild network with new architecture
  const rebuildNetwork = (inCount: number, layerConfig: { neuronCount: number; activation: string }[]) => {
    const net = createNetwork(
      inCount,
      layerConfig.map(l => ({ neuronCount: l.neuronCount, activation: l.activation })),
      1
    )
    setNetwork(net)
    setOutput(null)
    setCycleCount(0)
    setLastLoss(null)
    setTrainingHistory([])
  }

  // Create new experiment
  const createNewExperiment = () => {
    const exp = experimentStorage.create('New Experiment')
    setExperiment(exp)
    navigate(`/lab/${exp.id}`)
  }

  // Export experiment
  const exportExperiment = () => {
    if (!experiment) return
    const data = experimentStorage.exportExperiment(experiment.id)
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${experiment.name.replace(/\s+/g, '-').toLowerCase()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Get current network state
  const networkState = network?.getState()

  if (!network) {
    return <div className={styles.loading}>Initializing network...</div>
  }

  return (
    <div className={styles.lab}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>CAMBRIC LABS</h1>
          <span className={styles.experimentName}>
            {experiment?.name || 'Single Neuron'}
          </span>
        </div>
        <div className={styles.headerRight}>
          <button 
            className={styles.iconBtn}
            onClick={createNewExperiment}
            title="New Experiment"
          >
            <Plus size={18} />
          </button>
          <button 
            className={styles.iconBtn}
            onClick={saveExperiment}
            data-save-indicator
            disabled={!experiment}
            title="Save"
          >
            <Save size={18} />
          </button>
          <button 
            className={styles.iconBtn}
            onClick={exportExperiment}
            disabled={!experiment}
            title="Export"
          >
            <Download size={18} />
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Left Panel - Network Visualization */}
        <section className={styles.networkPanel}>
          <div className={styles.panelHeader}>
            <h2>Network Architecture</h2>
            <button 
              className={styles.collapseBtn}
              onClick={() => setShowNetworkConfig(!showNetworkConfig)}
            >
              {showNetworkConfig ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {showNetworkConfig && (
            <div className={styles.networkConfig}>
              <div className={styles.configSection}>
                <div className={styles.configRow}>
                  <label>Input Neurons:</label>
                  <div className={styles.inputGroup}>
                    <button onClick={removeInput} disabled={inputCount <= 1}>
                      <Minus size={14} />
                    </button>
                    <span>{inputCount}</span>
                    <button onClick={addInput} disabled={inputCount >= 20}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.layersList}>
                {layers.map((layer, idx) => (
                  <div key={idx} className={styles.layerConfig}>
                    <div className={styles.layerHeader}>
                      <span>Layer {idx + 1}</span>
                      {layers.length > 1 && (
                        <button 
                          className={styles.deleteBtn}
                          onClick={() => removeLayer(idx)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className={styles.layerFields}>
                      <div className={styles.field}>
                        <label>Neurons:</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={layer.neuronCount}
                          onChange={(e) => updateLayer(idx, { neuronCount: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                      <div className={styles.field}>
                        <label>Activation:</label>
                        <select
                          value={layer.activation}
                          onChange={(e) => updateLayer(idx, { activation: e.target.value })}
                        >
                          <option value="relu">ReLU</option>
                          <option value="sigmoid">Sigmoid</option>
                          <option value="tanh">Tanh</option>
                          <option value="identity">Identity</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className={styles.addLayerBtn} onClick={addLayer}>
                <Plus size={16} /> Add Layer
              </button>
            </div>
          )}
          
          <div className={styles.networkStats}>
            <div className={styles.statItem}>
              <Layers size={16} />
              <span>Layers: {layers.length + 1}</span>
            </div>
            <div className={styles.statItem}>
              <Activity size={16} />
              <span>Parameters: {networkState?.weights.flat().length || 0}</span>
            </div>
          </div>
          
          {/* Network visualization */}
          <div className={styles.networkViz}>
            <div className={styles.layerViz}>
              <div className={styles.layerLabel}>Input</div>
              <div className={styles.neurons}>
                {Array.from({ length: inputCount }).map((_, i) => (
                  <div key={i} className={styles.neuronDot} title={`Input ${i + 1}: ${inputs[i]?.toFixed(3)}`} />
                ))}
              </div>
            </div>
            
            {layers.map((layer, layerIdx) => (
              <div key={layerIdx} className={styles.layerViz}>
                <div className={styles.layerLabel}>L{layerIdx + 1}</div>
                <div className={styles.neurons}>
                  {Array.from({ length: Math.min(layer.neuronCount, 10) }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`${styles.neuronDot} ${styles.hidden}`}
                      title={`Neuron ${i + 1}`}
                    />
                  ))}
                  {layer.neuronCount > 10 && (
                    <div className={styles.moreNeurons}>+{layer.neuronCount - 10}</div>
                  )}
                </div>
              </div>
            ))}
            
            <div className={styles.layerViz}>
              <div className={styles.layerLabel}>Output</div>
              <div className={styles.neurons}>
                <div className={styles.neuronDot} />
              </div>
            </div>
          </div>
        </section>

        {/* Center Panel - Controls */}
        <section className={styles.controlPanel}>
          <h2>Inputs & Target</h2>
          
          <div className={styles.inputsSection}>
            <div className={styles.inputList}>
              {inputs.map((val, i) => (
                <div key={i} className={styles.inputRow}>
                  <label>x{i + 1}:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={val}
                    onChange={(e) => {
                      const newInputs = [...inputs]
                      newInputs[i] = parseFloat(e.target.value) || 0
                      setInputs(newInputs)
                    }}
                  />
                </div>
              ))}
            </div>
            
            <div className={styles.targetRow}>
              <label>Target (y):</label>
              <input
                type="number"
                step="0.1"
                value={target}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className={styles.controlButtons}>
            <button onClick={runForward} className={styles.forwardBtn}>
              <Play size={16} /> Forward
            </button>
            
            {isTraining ? (
              <button onClick={stopAutoTrain} className={styles.stopBtn}>
                <TrendingDown size={16} /> Stop
              </button>
            ) : (
              <button onClick={startAutoTrain} className={styles.trainBtn}>
                <Zap size={16} /> Train
              </button>
            )}
            
            <button onClick={trainCycle} className={styles.cycleBtn}>
              <Zap size={16} /> Cycle
            </button>
            
            <button onClick={resetNetwork} className={styles.resetBtn}>
              <RotateCcw size={16} />
            </button>
          </div>
          
          <div className={styles.learningRateControl}>
            <label>Learning Rate:</label>
            <input
              type="range"
              min="0.001"
              max="1"
              step="0.01"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            />
            <span>{learningRate.toFixed(3)}</span>
          </div>
          
          <div className={styles.outputSection}>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Output:</span>
              <span className={styles.outputValue}>
                {output !== null ? output.toFixed(6) : '—'}
              </span>
            </div>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Loss:</span>
              <span className={styles.outputValue}>
                {lastLoss !== null ? lastLoss.toFixed(6) : '—'}
              </span>
            </div>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Cycles:</span>
              <span className={styles.outputValue}>{cycleCount}</span>
            </div>
          </div>
        </section>

        {/* Right Panel - Details */}
        <section className={styles.detailsPanel}>
          <div className={styles.panelHeader}>
            <h2>Network Details</h2>
            <button 
              className={styles.collapseBtn}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
          
          {showDetails && networkState && (
            <div className={styles.detailsContent}>
              <div className={styles.weightsDisplay}>
                <h3>Weights</h3>
                <div className={styles.weightsGrid}>
                  {networkState.weights.slice(0, 10).map((w, i) => (
                    <div key={i} className={styles.weightItem}>
                      <span className={styles.weightLabel}>W{i + 1}:</span>
                      <span className={styles.weightValue}>
                        {w.slice(0, 3).map(v => v.toFixed(4)).join(', ')}
                        {w.length > 3 && '...'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className={styles.biasesDisplay}>
                <h3>Biases</h3>
                <div className={styles.biasesGrid}>
                  {networkState.biases.slice(0, 10).map((b, i) => (
                    <div key={i} className={styles.biasItem}>
                      <span className={styles.biasLabel}>b{i + 1}:</span>
                      <span className={styles.biasValue}>{b.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {trainingHistory.length > 0 && (
                <div className={styles.historyDisplay}>
                  <h3>Training History</h3>
                  <div className={styles.historyChart}>
                    <div className={styles.chartBars}>
                      {trainingHistory.slice(-20).map((step, i) => (
                        <div 
                          key={i}
                          className={styles.chartBar}
                          style={{ height: `${Math.min(100, step.loss * 100)}%` }}
                          title={`Cycle ${step.cycle}: Loss ${step.loss.toFixed(4)}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={styles.historyTable}>
                    <div className={styles.historyHeader}>
                      <span>Cycle</span>
                      <span>Loss</span>
                      <span>Prediction</span>
                    </div>
                    {trainingHistory.slice(-5).reverse().map((step, i) => (
                      <div key={i} className={styles.historyRow}>
                        <span>{step.cycle}</span>
                        <span>{step.loss.toFixed(6)}</span>
                        <span>{step.prediction.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={styles.explainSection}>
                <div className={styles.explainToggle}>
                  <button 
                    className={explainMode === 'simple' ? styles.active : ''}
                    onClick={() => setExplainMode('simple')}
                  >
                    Simple
                  </button>
                  <button 
                    className={explainMode === 'technical' ? styles.active : ''}
                    onClick={() => setExplainMode('technical')}
                  >
                    Technical
                  </button>
                </div>
                
                {explainMode === 'simple' ? (
                  <div className={styles.explainContent}>
                    <p><strong>How it learns:</strong> The network makes a prediction, calculates how wrong it was (loss), then adjusts weights to reduce that error.</p>
                    <p><strong>Weights:</strong> Each weight controls how much one input affects a neuron. Higher weight = more influence.</p>
                    <p><strong>Bias:</strong> The bias shifts the activation threshold, like a base tendency.</p>
                  </div>
                ) : (
                  <div className={styles.explainContent}>
                    <p><strong>Forward Pass:</strong> y = f(Wx + b) where f is activation, W is weights, x is inputs, b is bias.</p>
                    <p><strong>Loss:</strong> L = (prediction - target)² for MSE</p>
                    <p><strong>Gradient:</strong> ∂L/∂W = 2(prediction - target) × input</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
