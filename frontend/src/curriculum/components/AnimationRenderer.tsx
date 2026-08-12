/**
 * Cambric Labs — Animation Renderer
 *
 * Renders an AnimationDescriptor as an interactive step-through player. The
 * learner advances one step at a time; each step shows its caption plus any
 * highlighted code lines. This supports short-session learning: a learner
 * can absorb one animation step even with only a minute.
 *
 * For 'compare' animations, steps carry a payload with `side` and `sideLabel`
 * so the renderer can highlight which side of the comparison is active —
 * making cross-language / cross-strategy comparisons visually clear.
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'
import type { AnimationDescriptor, AnimationStep } from '../types'
import styles from './AnimationRenderer.module.css'

type CompareSide = 'left' | 'right' | 'both'

interface ComparePayload {
  side?: CompareSide
  sideLabel?: string
}

function getCompareSide(step: AnimationStep): ComparePayload {
  const p = step.payload as ComparePayload | undefined
  return { side: p?.side, sideLabel: p?.sideLabel }
}

function isCompare(animation: AnimationDescriptor): boolean {
  return animation.type === 'compare'
}

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

  if (isCompare(animation)) {
    return (
      <ComparePlayer
        animation={animation}
        step={step}
        total={total}
        current={current}
        onPrev={prev}
        onNext={next}
        onReset={reset}
        onPlayAll={playAll}
      />
    )
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

/**
 * Side-by-side player for 'compare' animations. Each step belongs to a
 * side (left/right/both); the active side is highlighted so the learner
 * can visually track which approach the caption refers to.
 */
function ComparePlayer({
  animation,
  step,
  total,
  current,
  onPrev,
  onNext,
  onReset,
  onPlayAll,
}: {
  animation: AnimationDescriptor
  step: number
  total: number
  current: AnimationStep
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onPlayAll: () => void
}) {
  // Collect the unique side labels (left then right) from all steps.
  const sides: { side: 'left' | 'right'; label: string }[] = []
  for (const s of animation.steps) {
    const { side, sideLabel } = getCompareSide(s)
    if ((side === 'left' || side === 'right') && sideLabel) {
      if (!sides.some((x) => x.side === side && x.label === sideLabel)) {
        sides.push({ side, label: sideLabel })
      }
    }
  }
  // Deduplicate: keep only the first label per side.
  const leftLabels = sides.filter((s) => s.side === 'left').map((s) => s.label)
  const rightLabels = sides.filter((s) => s.side === 'right').map((s) => s.label)
  const leftLabel = leftLabels.join(' / ') || 'Side A'
  const rightLabel = rightLabels.join(' / ') || 'Side B'

  const { side: activeSide } = getCompareSide(current)
  const isBoth = activeSide === 'both'

  return (
    <div className={styles.player}>
      <div className={styles.header}>
        <span className={styles.title}>{animation.title}</span>
        <span className={styles.counter}>Step {step + 1} / {total}</span>
      </div>

      <div className={styles.compareStage}>
        <div className={`${styles.compareSide} ${activeSide === 'left' ? styles.compareSideActive : ''}`}>
          <div className={styles.compareSideLabel}>{leftLabel}</div>
          <div className={styles.compareSideContent}>
            {activeSide === 'left' || isBoth ? current.caption : ''}
          </div>
        </div>
        <div className={styles.compareDivider} />
        <div className={`${styles.compareSide} ${activeSide === 'right' ? styles.compareSideActive : ''}`}>
          <div className={styles.compareSideLabel}>{rightLabel}</div>
          <div className={styles.compareSideContent}>
            {activeSide === 'right' || isBoth ? (isBoth ? current.caption : current.caption) : ''}
          </div>
        </div>
      </div>

      {current.highlightLines && current.highlightLines.length > 0 && (
        <div className={styles.highlight}>
          <span className={styles.highlightLabel}>Highlighted lines:</span>
          <span className={styles.highlightNums}>{current.highlightLines.join(', ')}</span>
        </div>
      )}

      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={onReset} disabled={step === 0} title="Restart">
          <RotateCcw size={16} />
        </button>
        <button className={styles.ctrlBtn} onClick={onPrev} disabled={step === 0} title="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className={styles.ctrlBtn} onClick={onPlayAll} title="Play all">
          <Play size={16} />
        </button>
        <button className={styles.ctrlBtn} onClick={onNext} disabled={step >= total - 1} title="Next">
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
