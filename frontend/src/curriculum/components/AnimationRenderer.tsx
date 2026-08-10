/**
 * Cambric Labs — Animation Renderer
 *
 * Renders an AnimationDescriptor as an interactive step-through player. The
 * learner advances one step at a time; each step shows its caption plus any
 * highlighted code lines. This supports short-session learning: a learner
 * can absorb one animation step even with only a minute.
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'
import type { AnimationDescriptor } from '../types'
import styles from './AnimationRenderer.module.css'

export function AnimationRenderer({ animation }: { animation: AnimationDescriptor }) {
  const [step, setStep] = useState(0)
  const total = animation.steps.length
  const current = animation.steps[step]

  const next = () => setStep((s) => Math.min(total - 1, s + 1))
  const prev = () => setStep((s) => Math.max(0, s - 1))
  const reset = () => setStep(0)
  const playAll = () => {
    let i = 0
    const tick = () => {
      setStep(i)
      i++
      if (i < total) setTimeout(tick, 1200)
    }
    tick()
  }

  return (
    <div className={styles.player}>
      <div className={styles.header}>
        <span className={styles.title}>{animation.title}</span>
        <span className={styles.counter}>Step {step + 1} / {total}</span>
      </div>

      <div className={styles.stage}>
        <div className={styles.caption}>{current.caption}</div>
        {current.highlightLines && current.highlightLines.length > 0 && (
          <div className={styles.highlight}>
            <span className={styles.highlightLabel}>Highlighted lines:</span>
            <span className={styles.highlightNums}>{current.highlightLines.join(', ')}</span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={reset} disabled={step === 0} title="Restart">
          <RotateCcw size={16} />
        </button>
        <button className={styles.ctrlBtn} onClick={prev} disabled={step === 0} title="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className={styles.ctrlBtn} onClick={playAll} title="Play all">
          <Play size={16} />
        </button>
        <button className={styles.ctrlBtn} onClick={next} disabled={step >= total - 1} title="Next">
          <ChevronRight size={16} />
        </button>
        <div className={styles.progress}>
          {animation.steps.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${i <= step ? styles.dotDone : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
