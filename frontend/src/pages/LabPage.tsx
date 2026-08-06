import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { 
  Play, Settings, 
  Layers, Activity, Eye, HelpCircle,
  Minus, Plus
} from 'lucide-react'
import { api } from '../api/client'
import { NeuronVisualization } from '../components/NeuronVisualization'
import { ForwardPassAnimation } from '../components/ForwardPassAnimation'
import { TrainingControls } from '../components/TrainingControls'
import { TrainingGraph } from '../components/TrainingGraph'
import styles from './LabPage.module.css'

interface NeuronState {
  input_count: number
  weights: number[]
  bias: number
  activation: string
  last_output: number | null
  last_weighted_sum: number | null
}

export function LabPage() {
  useParams()
  const [searchParams] = useSearchParams()
  const experimentType = searchParams.get('type') || 'one-neuron'
  
  // Neuron state
  const [neuron, setNeuron] = useState<NeuronState | null>(null)
  const [inputs, setInputs] = useState<number[]>([0.5, 0.5, 0.5])
  const [learningRate, setLearningRate] = useState(0.1)
  
  // Training state
  const [currentCycle, setCurrentCycle] = useState(0)
  const [loss, setLoss] = useState<number | null>(null)
  const [trainingHistory, setTrainingHistory] = useState<{cycle: number, loss: number}[]>([])
  const [showForwardAnimation, setShowForwardAnimation] = useState(false)
  const [showWhy, setShowWhy] = useState<string | null>(null)
  const [explanation, setExplanation] = useState<{simple: string; technical: string; analogy?: string} | null>(null)
  
  // Initialize neuron
  useEffect(() => {
    if (experimentType === 'one-neuron') {
      // Create a simple 3-input neuron
      api.createNeuron({
        input_count: 3,
        bias: 0.0,
        activation: 'relu'
      }).then((response) => {
        if (response.neuron) {
          setNeuron(response.neuron)
        }
      }).catch(console.error)
    }
  }, [experimentType])
  
  // Compute forward pass
  const computeForward = () => {
    if (!neuron) return
    
    api.neuronForward(neuron, { inputs }).then((result) => {
      setNeuron(result.neuron_state)
    }).catch(console.error)
  }
  
  // Single training cycle
  const runCycle = () => {
    if (!neuron) return
    
    const targets = [1.0] // Target output
    api.neuronTrainStep(neuron, {
      inputs,
      targets,
      learning_rate: learningRate
    }).then((result) => {
      setNeuron(result.after)
      setCurrentCycle((c) => c + 1)
      setLoss(result.loss)
      setTrainingHistory((h) => [...h, { cycle: currentCycle + 1, loss: result.loss }])
    }).catch(console.error)
  }
  
  // Get explanation
  const getExplanation = async (concept: string) => {
    try {
      const response = await fetch(`/api/concepts/${concept}`)
      const data = await response.json()
      setExplanation(data)
      setShowWhy(concept)
    } catch (error) {
      console.error('Failed to get explanation:', error)
    }
  }
  
  const updateInput = (index: number, value: number) => {
    const newInputs = [...inputs]
    newInputs[index] = value
    setInputs(newInputs)
  }
  
  const updateWeight = (index: number, value: number) => {
    if (!neuron) return
    const newWeights = [...neuron.weights]
    newWeights[index] = value
    setNeuron({ ...neuron, weights: newWeights })
  }
  
  if (!neuron) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Initializing neural network...</p>
      </div>
    )
  }
  
  return (
    <div className={styles.lab}>
      <div className={styles.workspace}>
        {/* Network Visualization Panel */}
        <div className={styles.visualizationPanel}>
          <div className={styles.panelHeader}>
            <h2>
              <Layers size={18} />
              One Neuron
            </h2>
            <button 
              className={styles.whyBtn}
              onClick={() => getExplanation('neuron')}
            >
              <HelpCircle size={16} />
              Why?
            </button>
          </div>
          
          <NeuronVisualization
            inputs={inputs}
            weights={neuron.weights}
            bias={neuron.bias}
            activation={neuron.activation}
            output={neuron.last_output}
            weightedSum={neuron.last_weighted_sum}
          />
          
          <div className={styles.controls}>
            <button 
              className={styles.watchBtn}
              onClick={() => setShowForwardAnimation(true)}
            >
              <Eye size={16} />
              Watch Forward Pass
            </button>
          </div>
        </div>
        
        {/* Inspector Panel */}
        <div className={styles.inspectorPanel}>
          <div className={styles.panelHeader}>
            <h2>
              <Settings size={18} />
              Inspector
            </h2>
          </div>
          
          <div className={styles.inspectorContent}>
            {/* Inputs Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Inputs</h3>
                <button 
                  className={styles.smallWhyBtn}
                  onClick={() => getExplanation('input')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <div className={styles.inputGrid}>
                {inputs.map((value, i) => (
                  <div key={i} className={styles.inputItem}>
                    <label>X{i + 1}</label>
                    <div className={styles.inputControl}>
                      <button onClick={() => updateInput(i, Math.max(0, value - 0.1))}>
                        <Minus size={14} />
                      </button>
                      <span className={styles.valueDisplay}>{value.toFixed(2)}</span>
                      <button onClick={() => updateInput(i, Math.min(1, value + 0.1))}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={value}
                      onChange={(e) => updateInput(i, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Weights Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Weights</h3>
                <button 
                  className={styles.smallWhyBtn}
                  onClick={() => getExplanation('weight')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <div className={styles.weightGrid}>
                {neuron.weights.map((weight, i) => (
                  <div key={i} className={styles.weightItem}>
                    <label>W{i + 1}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={weight.toFixed(3)}
                      onChange={(e) => updateWeight(i, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Bias Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Bias</h3>
                <button 
                  className={styles.smallWhyBtn}
                  onClick={() => getExplanation('bias')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <div className={styles.biasItem}>
                <label>B</label>
                <input
                  type="number"
                  step="0.01"
                  value={neuron.bias.toFixed(3)}
                  onChange={(e) => setNeuron({ ...neuron, bias: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            {/* Activation Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3>Activation</h3>
                <button 
                  className={styles.smallWhyBtn}
                  onClick={() => getExplanation('activation')}
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <select
                value={neuron.activation}
                onChange={(e) => setNeuron({ ...neuron, activation: e.target.value })}
                className={styles.activationSelect}
              >
                <option value="relu">ReLU</option>
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
                <option value="identity">Identity</option>
              </select>
            </div>
            
            {/* Output Section */}
            <div className={styles.section}>
              <h3>Output</h3>
              <div className={styles.outputDisplay}>
                <span className={styles.outputValue}>
                  {neuron.last_output?.toFixed(6) ?? '--'}
                </span>
              </div>
              <button className={styles.computeBtn} onClick={computeForward}>
                <Play size={16} />
                Compute Output
              </button>
            </div>
          </div>
        </div>
        
        {/* Training Panel */}
        <div className={styles.trainingPanel}>
          <div className={styles.panelHeader}>
            <h2>
              <Activity size={18} />
              Training
            </h2>
          </div>
          
          <TrainingControls
            learningRate={learningRate}
            onLearningRateChange={setLearningRate}
            onCycle={runCycle}
            currentCycle={currentCycle}
            loss={loss}
            isTraining={false}
          />
          
          {trainingHistory.length > 0 && (
            <TrainingGraph data={trainingHistory} />
          )}
        </div>
      </div>
      
      {/* Why Modal */}
      {showWhy && explanation && (
        <div className={styles.whyModal} onClick={() => setShowWhy(null)}>
          <div className={styles.whyContent} onClick={(e) => e.stopPropagation()}>
            <h3>Why is there a {showWhy}?</h3>
            
            <div className={styles.explanationLevels}>
              <div className={styles.level}>
                <h4>Simple</h4>
                <p>{explanation.simple}</p>
              </div>
              <div className={styles.level}>
                <h4>Technical</h4>
                <p>{explanation.technical}</p>
              </div>
            </div>
            
            {explanation.analogy && (
              <div className={styles.level}>
                <h4>Analogy</h4>
                <p>{explanation.analogy}</p>
              </div>
            )}
            
            <button className={styles.closeWhy} onClick={() => setShowWhy(null)}>
              Got it
            </button>
          </div>
        </div>
      )}
      
      {/* Forward Pass Animation Modal */}
      {showForwardAnimation && (
        <ForwardPassAnimation
          inputs={inputs}
          weights={neuron.weights}
          bias={neuron.bias}
          activation={neuron.activation}
          onClose={() => setShowForwardAnimation(false)}
        />
      )}
    </div>
  )
}
