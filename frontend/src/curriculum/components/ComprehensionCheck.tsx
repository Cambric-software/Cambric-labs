/**
 * Cambric Labs — Comprehension Check Renderer
 *
 * Renders a check-for-understanding multiple-choice question with one
 * correct answer. Reveals the explanation after the learner answers so the
 * "why" lands immediately, reinforcing learning.
 */
import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { ComprehensionCheck } from '../types'
import styles from './ComprehensionCheck.module.css'

export function ComprehensionChecks({ checks }: { checks: ComprehensionCheck[] }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>Check Your Understanding</h3>
      <div className={styles.list}>
        {checks.map((check, i) => (
          <CheckRow key={i} index={i} check={check} />
        ))}
      </div>
    </div>
  )
}

function CheckRow({ index, check }: { index: number; check: ComprehensionCheck }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected === check.correctIndex

  return (
    <div className={styles.row}>
      <p className={styles.question}>
        <span className={styles.qNum}>Q{index + 1}</span>
        {check.question}
      </p>
      <div className={styles.options}>
        {check.options.map((opt, i) => (
          <button
            key={i}
            className={`${styles.option} ${selected === i ? styles.optionSelected : ''} ${
              answered && i === check.correctIndex ? styles.optionCorrect : ''
            } ${answered && selected === i && i !== check.correctIndex ? styles.optionWrong : ''}`}
            onClick={() => setSelected(i)}
            disabled={answered}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered && (
        <div className={`${styles.feedback} ${correct ? styles.feedbackCorrect : styles.feedbackWrong}`}>
          {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <div className={styles.feedbackText}>
            <strong>{correct ? 'Correct!' : 'Not quite.'}</strong>
            <span>{check.explanation}</span>
          </div>
        </div>
      )}
    </div>
  )
}
