/**
 * Cambric Labs — Lesson Block Renderer
 *
 * Renders the discriminated-union LessonBlock[] content model into React.
 * One renderer serves every lesson type, so adding a lesson never requires
 * new UI code — only new data.
 */
import type { LessonBlock } from '../types'
import styles from './LessonBlocks.module.css'

const CALLOUT_CLASS: Record<string, string> = {
  info: styles.calloutInfo,
  warning: styles.calloutWarning,
  success: styles.calloutSuccess,
  tip: styles.calloutTip,
  danger: styles.calloutDanger,
}

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className={styles.container}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  )
}

function BlockView({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className={styles.paragraph}>{block.text}</p>
    case 'heading':
      return <h3 className={styles.heading}>{block.text}</h3>
    case 'callout':
      return (
        <div className={`${styles.callout} ${CALLOUT_CLASS[block.variant] ?? styles.calloutInfo}`}>
          {block.title && <div className={styles.calloutTitle}>{block.title}</div>}
          <p>{block.text}</p>
        </div>
      )
    case 'code':
      return (
        <div className={styles.codeBlock}>
          {block.caption && <div className={styles.codeCaption}>{block.caption}</div>}
          <pre className={styles.code}><code>{block.code}</code></pre>
        </div>
      )
    case 'codeWithOutput':
      return (
        <div className={styles.codeBlock}>
          {block.caption && <div className={styles.codeCaption}>{block.caption}</div>}
          <pre className={styles.code}><code>{block.code}</code></pre>
          <div className={styles.outputLabel}>Output</div>
          <pre className={styles.output}><code>{block.output}</code></pre>
        </div>
      )
    case 'compare':
      return (
        <div className={styles.compare}>
          {block.caption && <div className={styles.codeCaption}>{block.caption}</div>}
          <div className={styles.compareGrid}>
            <div>
              <div className={styles.langLabel}>{block.languageIds[0]}</div>
              <pre className={styles.code}><code>{block.snippets[0]}</code></pre>
            </div>
            <div>
              <div className={styles.langLabel}>{block.languageIds[1]}</div>
              <pre className={styles.code}><code>{block.snippets[1]}</code></pre>
            </div>
          </div>
        </div>
      )
    case 'steps':
      return (
        <div className={styles.steps}>
          {block.caption && <div className={styles.codeCaption}>{block.caption}</div>}
          <ol className={styles.stepList}>
            {block.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
        </div>
      )
    default:
      return null
  }
}
