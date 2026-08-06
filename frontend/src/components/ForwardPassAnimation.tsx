import { useState, useEffect } from 'react'
import { X, Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import styles from './ForwardPassAnimation.module.css'

interface ForwardPassAnimationProps {
  inputs: number[]
  weights: number[]
  bias: number
  activation: string
  onClose: () => void
}

interface Step {
  id: number
  title: string
  equation: string
  values: { label: string; value: number }[]
  result: number
  type: 'multiply' | 'add' | 'sum' | 'activate' | 'final'
}

export function ForwardPassAnimation({
  inputs,
  weights,
  bias,
  activation,
  onClose,
}: ForwardPassAnimationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [speed, setSpeed] = useState(1)
  
  // Build animation steps
  const steps: Step[] = []
  
  // Multiply steps
  inputs.forEach((input, i) => {
    const product = input * weights[i]
    steps.push({
      id: i,
      title: `Multiply Input ${i + 1} × Weight ${i + 1}`,
      equation: `${input.toFixed(3)} × ${weights[i].toFixed(3)}`,
      values: [
        { label: `Input ${i + 1}`, value: input },
        { label: `Weight ${i + 1}`, value: weights[i] },
      ],
      result: product,
      type: 'multiply',
    })
  })
  
  // Sum step
  const contributions = inputs.map((inp, i) => inp * weights[i])
  const sum = contributions.reduce((a, b) => a + b, 0)
  steps.push({
    id: inputs.length,
    title: 'Sum All Contributions',
    equation: contributions.map((c) => `${c.toFixed(4)}`).join(' + '),
    values: contributions.map((c, i) => ({ label: `Contrib ${i + 1}`, value: c })),
    result: sum,
    type: 'sum',
  })
  
  // Add bias step
  const withBias = sum + bias
  steps.push({
    id: inputs.length + 1,
    title: 'Add Bias',
    equation: `${sum.toFixed(4)} + ${bias.toFixed(3)}`,
    values: [
      { label: 'Sum', value: sum },
      { label: 'Bias', value: bias },
    ],
    result: withBias,
    type: 'add',
  })
  
  // Activation step
  let activated: number
  switch (activation) {
    case 'relu':
      activated = Math.max(0, withBias)
      break
    case 'sigmoid':
      activated = 1 / (1 + Math.exp(-withBias))
      break
    case 'tanh':
      activated = Math.tanh(withBias)
      break
    default:
      activated = withBias
  }
  
  steps.push({
    id: inputs.length + 2,
    title: `Apply ${activation.toUpperCase()}`,
    equation: `${activation}(${withBias.toFixed(4)}) = ${activated.toFixed(6)}`,
    values: [
      { label: 'Input', value: withBias },
      { label: activation, value: activated },
    ],
    result: activated,
    type: 'activate',
  })
  
  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2000 / speed)
    
    return () => clearInterval(interval)
  }, [isPlaying, speed, steps.length])
  
  const handlePlay = () => setIsPlaying(!isPlaying)
  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }
  const handleRestart = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }
  
  const step = steps[currentStep]
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Watch Forward Pass</h2>
          <div className={styles.speedControl}>
            <span>Speed:</span>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          {/* Progress indicator */}
          <div className={styles.progress}>
            {steps.map((_, i) => (
              <div
                key={i}
                className={`${styles.progressDot} ${i <= currentStep ? styles.active : ''}`}
              />
            ))}
          </div>
          
          {/* Current step */}
          <div className={styles.stepCard}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className={`${styles.stepType} ${styles[step.type]}`}>
                {step.type}
              </span>
            </div>
            
            <h3 className={styles.stepTitle}>{step.title}</h3>
            
            <div className={styles.equation}>
              {step.equation}
            </div>
            
            <div className={styles.values}>
              {step.values.map((v, idx) => (
                <div key={idx} className={styles.valueBox}>
                  <span className={styles.valueLabel}>{v.label}</span>
                  <span className={styles.valueNumber}>{v.value.toFixed(4)}</span>
                </div>
              ))}
            </div>
            
            <div className={styles.result}>
              <span className={styles.resultLabel}>Result:</span>
              <span className={styles.resultNumber}>{step.result.toFixed(6)}</span>
            </div>
          </div>
          
          {/* Visual representation */}
          <div className={styles.visualization}>
            {step.type === 'multiply' && (
              <div className={styles.multiplyVisual}>
                <span className={styles.inputNum}>{inputs[currentStep].toFixed(2)}</span>
                <span className={styles.operator}>×</span>
                <span className={styles.weightNum}>{weights[currentStep].toFixed(2)}</span>
                <span className={styles.equals}>=</span>
                <span className={styles.resultNum}>{step.result.toFixed(4)}</span>
              </div>
            )}
            
            {step.type === 'sum' && (
              <div className={styles.sumVisual}>
                {contributions.map((c, i) => (
                  <span key={i} className={styles.contrib}>{c.toFixed(4)}</span>
                ))}
                <span className={styles.plus}>+</span>
                <span className={styles.equals}>=</span>
                <span className={styles.resultNum}>{step.result.toFixed(4)}</span>
              </div>
            )}
            
            {step.type === 'add' && (
              <div className={styles.addVisual}>
                <span className={styles.sumNum}>{sum.toFixed(4)}</span>
                <span className={styles.plus}>+</span>
                <span className={styles.biasNum}>{bias.toFixed(2)}</span>
                <span className={styles.equals}>=</span>
                <span className={styles.resultNum}>{step.result.toFixed(4)}</span>
              </div>
            )}
            
            {step.type === 'activate' && (
              <div className={styles.activateVisual}>
                <span className={styles.inputNum}>{withBias.toFixed(4)}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.funcName}>{activation.toUpperCase()}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.resultNum}>{step.result.toFixed(6)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.controls}>
          <button onClick={handleRestart} title="Restart">
            <RotateCcw size={20} />
          </button>
          <button onClick={handlePlay} className={styles.playBtn}>
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button onClick={handleStep} title="Step forward" disabled={currentStep >= steps.length - 1}>
            <SkipForward size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
