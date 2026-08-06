import styles from './NeuronVisualization.module.css'

interface NeuronVisualizationProps {
  inputs: number[]
  weights: number[]
  bias: number
  activation: string
  output: number | null
  weightedSum: number | null
}

export function NeuronVisualization({
  inputs,
  weights,
  bias,
  activation,
  output,
  weightedSum,
}: NeuronVisualizationProps) {
  const activationColors: Record<string, string> = {
    relu: 'var(--lab-accent-green)',
    sigmoid: 'var(--lab-accent-blue)',
    tanh: 'var(--lab-accent-purple)',
    identity: 'var(--lab-accent-cyan)',
  }
  
  const color = activationColors[activation] || 'var(--lab-accent-blue)'
  
  return (
    <div className={styles.container}>
      {/* Inputs */}
      <div className={styles.inputs}>
        {inputs.map((value, i) => (
          <div key={i} className={styles.inputNode}>
            <span className={styles.inputLabel}>X{i + 1}</span>
            <span className={styles.inputValue}>{value.toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      {/* Connections */}
      <div className={styles.connections}>
        {inputs.map((_, i) => (
          <svg key={i} className={styles.connectionLine} viewBox="0 0 100 200">
            <defs>
              <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 10 20 Q 50 100 90 100"
              fill="none"
              stroke={`url(#grad-${i})`}
              strokeWidth={Math.abs(weights[i]) * 4 + 1}
              className={styles.path}
            />
          </svg>
        ))}
      </div>
      
      {/* Weight labels on connections */}
      <div className={styles.weightLabels}>
        {weights.map((w, i) => (
          <div 
            key={i} 
            className={styles.weightLabel}
            style={{ top: `${(i + 0.5) * (100 / inputs.length)}%` }}
          >
            <span className={styles.weightBadge} style={{ borderColor: color }}>
              W{i + 1}={w.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      
      {/* Neuron */}
      <div className={styles.neuronContainer}>
        <div className={styles.neuron} style={{ borderColor: color }}>
          <div className={styles.neuronInner}>
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle
                cx="30"
                cy="30"
                r="25"
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.3"
              />
              <circle
                cx="30"
                cy="30"
                r="18"
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.5"
              />
              <circle
                cx="30"
                cy="30"
                r="10"
                fill={color}
                opacity={output !== null ? Math.min(1, Math.abs(output || 0.1)) : 0.3}
                className={styles.neuronGlow}
              />
            </svg>
          </div>
          <div className={styles.neuronInfo}>
            <span className={styles.activationLabel}>{activation.toUpperCase()}</span>
          </div>
        </div>
        
        {weightedSum !== null && (
          <div className={styles.calculations}>
            <div className={styles.calcItem}>
              <span className={styles.calcLabel}>Σ</span>
              <span className={styles.calcValue}>{weightedSum.toFixed(4)}</span>
            </div>
            <div className={styles.calcItem}>
              <span className={styles.calcLabel}>+B</span>
              <span className={styles.calcValue}>{bias.toFixed(2)}</span>
            </div>
            <div className={styles.calcArrow}>↓</div>
          </div>
        )}
      </div>
      
      {/* Output */}
      <div className={styles.output}>
        <div className={styles.outputLine} style={{ backgroundColor: color }} />
        <div className={styles.outputNode}>
          <span className={styles.outputLabel}>Output</span>
          <span className={styles.outputValue} style={{ color }}>
            {output?.toFixed(6) ?? '--'}
          </span>
        </div>
      </div>
    </div>
  )
}
