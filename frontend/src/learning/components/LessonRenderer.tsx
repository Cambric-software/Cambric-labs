import {
  ArrowRight,
  Brain,
  CheckCircle,
  ChevronRight,
  Code,
  Layers,
  Network,
  RotateCcw,
  Target,
  TrendingDown,
  Zap,
} from 'lucide-react'
import type { LessonBlock } from '../types'
import styles from './LessonRenderer.module.css'

const icons = {
  brain: Brain,
  network: Network,
  target: Target,
  zap: Zap,
  layers: Layers,
  'arrow-right': ArrowRight,
  'trending-down': TrendingDown,
  'chevron-right': ChevronRight,
  'rotate-ccw': RotateCcw,
  code: Code,
  'check-circle': CheckCircle,
} as const

export function LessonIcon({ name, size = 24 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] ?? Brain
  return <Icon size={size} />
}

interface LessonRendererProps {
  blocks: LessonBlock[]
  mode: 'simple' | 'technical'
}

export function LessonRenderer({ blocks, mode }: LessonRendererProps) {
  return (
    <>
      {blocks.map((block) => {
        if (block.type === 'text') {
          const text = mode === 'simple' ? block.simple : block.technical

          return text ? (
            <div key={block.id} className={styles.explanationBox}>
              <p>{text}</p>
            </div>
          ) : null
        }

        if (block.type === 'formula') {
          return (
            <div key={block.id} className={styles.formulaBox}>
              <h3>Formula</h3>
              <code>{block.value}</code>
            </div>
          )
        }

        if (block.type === 'example') {
          return (
            <div key={block.id} className={styles.exampleBox}>
              <h3>Example</h3>
              <p>{block.description}</p>
              {block.code && (
                <pre>
                  <code>{block.code}</code>
                </pre>
              )}
            </div>
          )
        }

        return (
          <div key={block.id} className={styles.interactiveBox}>
            <h3>{block.title}</h3>
            <p>{block.description}</p>
            <ul>
              {block.actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>

            {block.link && (
              <a href={block.link.href} className={styles.tryBtn}>
                {block.link.label}
                <ArrowRight size={16} />
              </a>
            )}
          </div>
        )
      })}
    </>
  )
}
