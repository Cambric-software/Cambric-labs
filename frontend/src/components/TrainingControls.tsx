import { SkipForward } from 'lucide-react'
import styles from './TrainingControls.module.css'

interface TrainingControlsProps {
  learningRate: number
  onLearningRateChange: (rate: number) => void
  onCycle: () => void
  currentCycle: number
  loss: number | null
  isTraining: boolean
}

export function TrainingControls({
  learningRate,
  onLearningRateChange,
  onCycle,
  currentCycle,
  loss,
  isTraining,
}: TrainingControlsProps) {
  return (
    <div className={styles.container}>
      {/* CYCLE Button */}
      <div className={styles.cycleSection}>
        <button className={styles.cycleBtn} onClick={onCycle} disabled={isTraining}>
          <SkipForward size={20} />
          CYCLE
        </button>
        <p className={styles.cycleHint}>One training step</p>
      </div>
      
      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Cycle</span>
          <span className={styles.statValue}>{currentCycle}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Loss</span>
          <span className={`${styles.statValue} ${loss !== null ? styles.lossValue : ''}`}>
            {loss?.toFixed(6) ?? '--'}
          </span>
        </div>
      </div>
      
      {/* Learning Rate */}
      <div className={styles.learningRate}>
        <label htmlFor="lr">Learning Rate</label>
        <input
          id="lr"
          type="range"
          min="0.001"
          max="1"
          step="0.001"
          value={learningRate}
          onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
        />
        <span className={styles.lrValue}>{learningRate.toFixed(3)}</span>
      </div>
      
      {/* Status */}
      <div className={styles.status}>
        <div className={`${styles.statusDot} ${isTraining ? styles.training : ''}`} />
        <span>{isTraining ? 'Training...' : 'Ready'}</span>
      </div>
    </div>
  )
}
