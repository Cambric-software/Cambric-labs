import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  Zap, Play, RotateCcw, Plus, Minus, Trash2, Save, 
  TrendingDown, Layers, Download, Home, Database
} from 'lucide-react'
import { NeuralNetwork, createNetwork } from '../utils/neural'
import { experimentStorage } from '../utils/storage'
import styles from './LabPage.module.css'

interface DatasetExample {
  id: string
  inputs: number[]
  target: number
}

export default function LabPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [network, setNetwork] = useState<NeuralNetwork | null>(null)
  const [experiment, setExperiment] = useState<any>(null)
  
  const [inputs, setInputs] = useState<number[]>([0.5, 0.5])
  const [target, setTarget] = useState<number>(0.7)
  const [output, setOutput] = useState<number | null>(null)
  
  const [cycleCount, setCycleCount] = useState(0)
  const [lastLoss, setLastLoss] = useState<number | null>(null)
  const [isTraining, setIsTraining] = useState(false)
  const [learningRate, setLearningRate] = useState(0.1)
  const [epochs, setEpochs] = useState(100)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  
  const [dataset, setDataset] = useState<DatasetExample[]>([
    { id: '1', inputs: [0.2, 0.4], target: 0.3 },
    { id: '2', inputs: [0.6, 0.8], target: 0.7 },
    { id: '3', inputs: [0.1, 0.9], target: 0.5 },
  ])
  
  const [layers, setLayers] = useState<{ neuronCount: number; activation: string }[]>([
    { neuronCount: 4, activation: 'relu' },
    { neuronCount: 2, activation: 'relu' }
  ])
  const [inputCount, setInputCount] = useState(2)
  
  const [optimizer, setOptimizer] = useState<'sgd' | 'momentum' | 'adam' | 'rmsprop'>('sgd')
  const [activeTab, setActiveTab] = useState<'train' | 'data' | 'network'>('train')
  
  const trainingRef = useRef<number | null>(null)

  const createNewNetwork = () => {
    const net = createNetwork(inputCount, layers, 1, optimizer, learningRate)
    setNetwork(net)
    setOutput(null)
    setCycleCount(0)
    setLastLoss(null)
  }

  useEffect(() => {
    if (id) {
      const exp = experimentStorage.get(id)
      if (exp) {
        setExperiment(exp)
        setCycleCount(exp.currentCycle || 0)
        setLearningRate(exp.learningRate || 0.1)
        setInputCount(exp.inputDim || 2)
        setLayers(exp.layers?.map((l: any) => ({
          neuronCount: l.neuronCount,
          activation: l.activation
        })) || [{ neuronCount: 4, activation: 'relu' }])
        
        const net = createNetwork(
          exp.inputDim || 2,
          exp.layers?.map((l: any) => ({ neuronCount: l.neuronCount, activation: l.activation })) || [{ neuronCount: 4, activation: 'relu' }],
          1,
          optimizer,
          learningRate
        )
        if (exp.currentWeights?.length > 0) {
          net.setWeights(exp.currentWeights, exp.currentBiases || [])
        }
        setNetwork(net)
      } else {
        createNewNetwork()
      }
    } else {
      createNewNetwork()
    }
  }, [id])

  useEffect(() => {
    if (network) {
      network.updateConfig({ optimizer, learningRate })
    }
  }, [optimizer, learningRate, network])

  const runForward = useCallback(() => {
    if (!network) return
    const result = network.forward(inputs)
    setOutput(result.outputs[0])
  }, [network, inputs])

  const trainCycle = useCallback(() => {
    if (!network) return
    
    const result = network.trainCycle(inputs, [target])
    
    setOutput(result.predictions[0])
    setLastLoss(result.loss)
    setCycleCount(c => c + 1)
  }, [network, inputs, target])

  const startAutoTrain = useCallback(() => {
    if (!network || isTraining) return
    setIsTraining(true)
    
    const runCycle = () => {
      trainCycle()
      trainingRef.current = window.setTimeout(runCycle, 10)
    }
    
    runCycle()
  }, [network, isTraining, trainCycle])

  const trainOnDataset = useCallback(() => {
    if (!network || isTraining) return
    setIsTraining(true)
    setCurrentEpoch(0)
    
    let epoch = 0
    const trainEpoch = () => {
      if (epoch >= epochs) {
        setIsTraining(false)
        return
      }
      
      const shuffled = [...dataset].sort(() => Math.random() - 0.5)
      let exampleIndex = 0
      
      const trainExample = () => {
        if (exampleIndex >= shuffled.length) {
          epoch++
          setCurrentEpoch(epoch)
          trainingRef.current = window.setTimeout(trainEpoch, 20)
          return
        }
        
        const example = shuffled[exampleIndex]
        network.trainCycle(example.inputs, [example.target])
        exampleIndex++
        
        const result = network.forward(example.inputs)
        setOutput(result.outputs[0])
        setInputs(example.inputs)
        setTarget(example.target)
        
        trainingRef.current = window.setTimeout(trainExample, 10)
      }
      
      trainExample()
    }
    
    trainEpoch()
  }, [network, isTraining, dataset, epochs])

  const stopAutoTrain = useCallback(() => {
    setIsTraining(false)
    if (trainingRef.current) {
      clearTimeout(trainingRef.current)
      trainingRef.current = null
    }
  }, [])

  const resetNetwork = useCallback(() => {
    if (!network) return
    network.reset()
    setOutput(null)
    setCycleCount(0)
    setLastLoss(null)
    setCurrentEpoch(0)
  }, [network])

  const addLayer = () => {
    const newLayers = [...layers, { neuronCount: 4, activation: 'relu' }]
    setLayers(newLayers)
    const net = createNetwork(inputCount, newLayers, 1, optimizer, learningRate)
    setNetwork(net)
  }

  const removeLayer = (index: number) => {
    if (layers.length <= 1) return
    const newLayers = layers.filter((_, i) => i !== index)
    setLayers(newLayers)
    const net = createNetwork(inputCount, newLayers, 1, optimizer, learningRate)
    setNetwork(net)
  }
  
  const updateLayer = (index: number, updates: Partial<{ neuronCount: number; activation: string }>) => {
    const newLayers = layers.map((l, i) => i === index ? { ...l, ...updates } : l)
    setLayers(newLayers)
    const net = createNetwork(inputCount, newLayers, 1, optimizer, learningRate)
    setNetwork(net)
  }

  const addInput = () => {
    if (inputCount >= 10) return
    const newCount = inputCount + 1
    setInputCount(newCount)
    setInputs([...inputs, 0.5])
    const newLayers = [{ neuronCount: newCount, activation: layers[0]?.activation || 'relu' }, ...layers.slice(1)]
    const net = createNetwork(newCount, newLayers, 1, optimizer, learningRate)
    setNetwork(net)
  }

  const removeInput = () => {
    if (inputCount <= 1) return
    const newCount = inputCount - 1
    setInputCount(newCount)
    setInputs(inputs.slice(0, -1))
    const newLayers = [{ neuronCount: newCount, activation: layers[0]?.activation || 'relu' }, ...layers.slice(1)]
    const net = createNetwork(newCount, newLayers, 1, optimizer, learningRate)
    setNetwork(net)
  }

  const createNewExperiment = () => {
    const exp = experimentStorage.create('New Experiment')
    navigate(`/lab/${exp.id}`)
    window.location.reload()
  }

  const saveExperiment = () => {
    if (!network || !experiment) return
    const state = network.getState()
    experimentStorage.updateWeights(experiment.id, state.weights, state.biases)
  }

  const exportExperiment = () => {
    if (!experiment) return
    const data = experimentStorage.exportExperiment(experiment.id)
    if (data) {
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `experiment.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const addDatasetExample = () => {
    const newExample: DatasetExample = {
      id: Date.now().toString(),
      inputs: Array(inputCount).fill(0.5),
      target: 0.5
    }
    setDataset([...dataset, newExample])
  }

  const removeDatasetExample = (id: string) => {
    setDataset(dataset.filter(d => d.id !== id))
  }

  const updateDatasetExample = (id: string, updates: Partial<DatasetExample>) => {
    setDataset(dataset.map(d => d.id === id ? { ...d, ...updates } : d))
  }

  const stats = network?.getStats()

  if (!network) {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.lab}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.homeLink}>
            <Home size={18} />
          </Link>
          <div>
            <h1>Lab</h1>
            <span className={styles.experimentName}>
              {experiment?.name || 'Untitled'}
            </span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.actionBtn} onClick={createNewExperiment}>
            <Plus size={18} />
            <span>New</span>
          </button>
          <button className={styles.actionBtn} onClick={saveExperiment} disabled={!experiment}>
            <Save size={18} />
            <span>Save</span>
          </button>
          <button className={styles.actionBtn} onClick={exportExperiment} disabled={!experiment}>
            <Download size={18} />
          </button>
        </div>
      </header>

      <nav className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'train' ? styles.active : ''}`} onClick={() => setActiveTab('train')}>
          <Zap size={18} /> Train
        </button>
        <button className={`${styles.tab} ${activeTab === 'data' ? styles.active : ''}`} onClick={() => setActiveTab('data')}>
          <Database size={18} /> Data
        </button>
        <button className={`${styles.tab} ${activeTab === 'network' ? styles.active : ''}`} onClick={() => setActiveTab('network')}>
          <Layers size={18} /> Network
        </button>
      </nav>

      <main className={styles.main}>
        {activeTab === 'train' && (
          <div className={styles.trainSection}>
            <section className={styles.card}>
              <h2>Input Values</h2>
              <div className={styles.inputGrid}>
                {inputs.map((val, i) => (
                  <div key={i} className={styles.inputItem}>
                    <label>x{i + 1}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={val}
                      onChange={(e) => {
                        const newInputs = [...inputs]
                        newInputs[i] = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0))
                        setInputs(newInputs)
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.targetInput}>
                <label>Target Output</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={target}
                  onChange={(e) => setTarget(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                />
              </div>
            </section>

            <section className={styles.card}>
              <h2>Results</h2>
              <div className={styles.resultsGrid}>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Prediction</span>
                  <span className={styles.resultValue}>
                    {output !== null ? output.toFixed(4) : '—'}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Loss</span>
                  <span className={styles.resultValue}>
                    {lastLoss !== null ? lastLoss.toFixed(6) : '—'}
                  </span>
                </div>
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Cycles</span>
                  <span className={styles.resultValue}>{cycleCount}</span>
                </div>
                {currentEpoch > 0 && (
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Epoch</span>
                    <span className={styles.resultValue}>{currentEpoch}/{epochs}</span>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <h2>Training Controls</h2>
              
              <div className={styles.settings}>
                <div className={styles.settingItem}>
                  <label>Learning Rate</label>
                  <input
                    type="range"
                    min="0.001"
                    max="0.5"
                    step="0.01"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  />
                  <span>{learningRate.toFixed(3)}</span>
                </div>
                
                <div className={styles.settingItem}>
                  <label>Optimizer</label>
                  <select value={optimizer} onChange={(e) => setOptimizer(e.target.value as any)}>
                    <option value="sgd">SGD</option>
                    <option value="momentum">Momentum</option>
                    <option value="adam">Adam</option>
                    <option value="rmsprop">RMSprop</option>
                  </select>
                </div>
                
                <div className={styles.settingItem}>
                  <label>Epochs</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={epochs}
                    onChange={(e) => setEpochs(parseInt(e.target.value) || 100)}
                  />
                </div>
              </div>
              
              <div className={styles.controlButtons}>
                <button onClick={runForward} className={styles.btnSecondary}>
                  <Play size={18} /> Forward
                </button>
                
                <button onClick={trainCycle} className={styles.btnSecondary}>
                  <Zap size={18} /> Cycle
                </button>
                
                {isTraining ? (
                  <button onClick={stopAutoTrain} className={styles.btnDanger}>
                    <TrendingDown size={18} /> Stop
                  </button>
                ) : (
                  <>
                    <button onClick={startAutoTrain} className={styles.btnPrimary}>
                      <Zap size={18} /> Train
                    </button>
                    <button onClick={trainOnDataset} className={styles.btnPrimary}>
                      <Database size={18} /> Train All
                    </button>
                  </>
                )}
                
                <button onClick={resetNetwork} className={styles.btnGhost}>
                  <RotateCcw size={18} />
                </button>
              </div>
            </section>

            <section className={styles.card}>
              <h2>Network Info</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span>Inputs</span>
                  <span>{inputCount}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Layers</span>
                  <span>{layers.length}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Parameters</span>
                  <span>{stats?.totalParameters || '?'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span>Weight Range</span>
                  <span>
                    {stats ? `${stats.weightMin.toFixed(2)} to ${stats.weightMax.toFixed(2)}` : '—'}
                  </span>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'data' && (
          <div className={styles.dataSection}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Training Data</h2>
                <button onClick={addDatasetExample} className={styles.btnSmall}>
                  <Plus size={16} /> Add Example
                </button>
              </div>
              
              <p className={styles.hint}>
                Add examples to train your network. Each example has input values and a target output.
              </p>
              
              <div className={styles.datasetList}>
                {dataset.map((example, idx) => (
                  <div key={example.id} className={styles.datasetItem}>
                    <div className={styles.datasetHeader}>
                      <span>Example {idx + 1}</span>
                      <button onClick={() => removeDatasetExample(example.id)} className={styles.btnIconDanger}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className={styles.datasetInputs}>
                      {example.inputs.map((val, i) => (
                        <input
                          key={i}
                          type="number"
                          step="0.1"
                          value={val}
                          onChange={(e) => updateDatasetExample(example.id, {
                            inputs: example.inputs.map((v, j) => j === i ? parseFloat(e.target.value) || 0 : v)
                          })}
                          placeholder={`x${i + 1}`}
                        />
                      ))}
                    </div>
                    <div className={styles.datasetTarget}>
                      <label>Target:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={example.target}
                        onChange={(e) => updateDatasetExample(example.id, {
                          target: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {dataset.length === 0 && (
                <div className={styles.emptyState}>
                  <Database size={48} />
                  <p>No training examples yet</p>
                  <button onClick={addDatasetExample} className={styles.btnPrimary}>
                    <Plus size={18} /> Add First Example
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'network' && (
          <div className={styles.networkSection}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Input Layer</h2>
                <div className={styles.layerControls}>
                  <button onClick={removeInput} disabled={inputCount <= 1}>
                    <Minus size={14} />
                  </button>
                  <span>{inputCount}</span>
                  <button onClick={addInput} disabled={inputCount >= 10}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </section>

            {layers.map((layer, idx) => (
              <section key={idx} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Hidden Layer {idx + 1}</h2>
                  <div className={styles.layerControls}>
                    <button onClick={() => removeLayer(idx)} disabled={layers.length <= 1}>
                      <Trash2 size={14} />
                    </button>
                    <span>{layer.neuronCount}</span>
                    <button onClick={() => updateLayer(idx, { neuronCount: layer.neuronCount + 1 })}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.activationSelect}>
                  <label>Activation:</label>
                  <select 
                    value={layer.activation}
                    onChange={(e) => updateLayer(idx, { activation: e.target.value })}
                  >
                    <option value="relu">ReLU</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                    <option value="leaky_relu">Leaky ReLU</option>
                    <option value="identity">Identity</option>
                  </select>
                </div>
              </section>
            ))}

            <button onClick={addLayer} className={styles.btnSecondary}>
              <Plus size={18} /> Add Layer
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
