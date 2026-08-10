/**
 * Cambric Labs — Activity Renderer
 *
 * Renders an ActivityDescriptor. Dispatches on `type`:
 *  - codeChallenge: a textarea where the learner writes code; checks run
 *    against the declarative assertions (substring/regex/output).
 *  - predictOutput: a multiple-choice "predict the output" question.
 *  - fillBlank / ordering / matching: lightweight structured prompts.
 *  - sandbox: a free-form editor with no checks.
 *
 * The runner evaluates ONLY the declared checks against the text the learner
 * typed. It does NOT execute arbitrary code — the assertion model is
 * static (contains / regex / expected-output-against-author-provided-output).
 */
import { useState } from 'react'
import { Play, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import type { ActivityDescriptor, ActivityAssertion } from '../types'
import styles from './ActivityRenderer.module.css'

interface CheckResult {
  description: string
  passed: boolean
}

function evaluateAssertion(assertion: ActivityAssertion, code: string): boolean {
  switch (assertion.kind) {
    case 'contains':
      return code.includes(assertion.value)
    case 'notContains':
      return !code.includes(assertion.value)
    case 'matchesRegex':
      try {
        return new RegExp(assertion.pattern).test(code)
      } catch {
        return false
      }
    // outputEquals / outputContains require execution which we do not do;
    // fall back to a code-text check for the value (best-effort, honest).
    case 'outputEquals':
    case 'outputContains':
      return code.includes(assertion.value)
    default:
      return false
  }
}

export function ActivityRenderer({ activity }: { activity: ActivityDescriptor }) {
  if (activity.type === 'predictOutput') {
    return <PredictOutput activity={activity} />
  }
  if (activity.type === 'codeChallenge' || activity.type === 'sandbox') {
    return <CodeChallenge activity={activity} />
  }
  if (activity.type === 'fillBlank') {
    return <FillBlank activity={activity} />
  }
  // ordering / matching: render as a structured prompt (extensible later)
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{activity.title}</h3>
      <p className={styles.prompt}>{activity.prompt}</p>
      <p className={styles.comingSoon}>
        This activity type ({activity.type}) renders as a prompt. Interactive support is under development.
      </p>
    </div>
  )
}

function CodeChallenge({ activity }: { activity: ActivityDescriptor }) {
  const [code, setCode] = useState(activity.starterCode ?? '')
  const [results, setResults] = useState<CheckResult[] | null>(null)

  const runChecks = () => {
    if (!activity.checks || activity.checks.length === 0) {
      setResults([{ description: 'No automated checks; review your solution manually.', passed: true }])
      return
    }
    const evaluated = activity.checks.map((check) => ({
      description: check.description,
      passed: evaluateAssertion(check.assertion, code),
    }))
    setResults(evaluated)
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{activity.title}</h3>
      <p className={styles.prompt}>{activity.prompt}</p>
      <div className={styles.codeBlock}>
        <div className={styles.codeHeader}>
          <span>your code{activity.languageId ? `.${activity.languageId === 'python' ? 'py' : activity.languageId}` : ''}</span>
          <button className={styles.runBtn} onClick={runChecks}>
            <Play size={14} /> Check
          </button>
        </div>
        <textarea
          className={styles.codeEditor}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          rows={Math.min(12, code.split('\n').length + 1)}
        />
      </div>
      {results && (
        <ul className={styles.results}>
          {results.map((r, i) => (
            <li key={i} className={styles.resultRow}>
              {r.passed ? <CheckCircle2 size={16} className={styles.pass} /> : <XCircle size={16} className={styles.fail} />}
              <span className={r.passed ? styles.passText : styles.failText}>{r.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PredictOutput({ activity }: { activity: ActivityDescriptor }) {
  const data = (activity.data ?? {}) as {
    options?: string[]
    correctIndex?: number
    explanation?: string
  }
  const options = data.options ?? []
  const correctIndex = data.correctIndex ?? -1
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected === correctIndex

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{activity.title}</h3>
      <p className={styles.prompt}>{activity.prompt}</p>
      <div className={styles.options}>
        {options.map((opt, i) => (
          <button
            key={i}
            className={`${styles.option} ${selected === i ? styles.optionSelected : ''} ${
              answered && i === correctIndex ? styles.optionCorrect : ''
            } ${answered && selected === i && i !== correctIndex ? styles.optionWrong : ''}`}
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
          <span>{correct ? 'Correct!' : 'Not quite.'}</span>
          {data.explanation && (
            <span className={styles.explanation}><Lightbulb size={14} /> {data.explanation}</span>
          )}
        </div>
      )}
    </div>
  )
}

function FillBlank({ activity }: { activity: ActivityDescriptor }) {
  const [answer, setAnswer] = useState('')
  const expected = ((activity.data ?? {}) as { expected?: string }).expected ?? ''
  const [submitted, setSubmitted] = useState(false)
  const correct = submitted && answer.trim().toLowerCase() === expected.trim().toLowerCase()

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{activity.title}</h3>
      <p className={styles.prompt}>{activity.prompt}</p>
      <div className={styles.fillRow}>
        <input
          className={styles.fillInput}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="type your answer"
          disabled={submitted}
        />
        <button className={styles.runBtn} onClick={() => setSubmitted(true)} disabled={submitted || !answer.trim()}>
          Submit
        </button>
      </div>
      {submitted && (
        <div className={`${styles.feedback} ${correct ? styles.feedbackCorrect : styles.feedbackWrong}`}>
          {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{correct ? 'Correct!' : `Expected: ${expected}`}</span>
        </div>
      )}
    </div>
  )
}
