/**
 * Cambric Labs — Curriculum Validation Dashboard (dev tooling)
 *
 * Runs structural validation, semantic duplicate detection, and per-lesson
 * quality scoring against the live curriculum. Quality scoring loads each
 * lesson detail lazily (one at a time) to stay memory-bounded — never holds
 * all lesson bodies in memory simultaneously.
 *
 * Route: /cambric-labs/validate (not in main nav — dev tooling).
 */
import { useCallback, useState } from 'react'
import { ShieldCheck, Copy, Gauge, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import {
  registerCurriculum, getCurriculumRegistry, validateCurriculum,
  detectSemanticDuplicates, scoreLesson, loadLesson,
} from '../curriculum'
import type { ValidationResult, DuplicateResult, QualityReport, ValidationIssue } from '../curriculum'
import styles from './ValidatePage.module.css'

registerCurriculum()

type Phase = 'idle' | 'structural' | 'duplicates' | 'quality' | 'done'

export function ValidatePage() {
  const registry = getCurriculumRegistry()
  const [phase, setPhase] = useState<Phase>('idle')
  const [structural, setStructural] = useState<ValidationResult | null>(null)
  const [dups, setDups] = useState<DuplicateResult | null>(null)
  const [quality, setQuality] = useState<QualityReport[]>([])
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)

  const runAll = useCallback(async () => {
    setRunning(true)
    setPhase('structural')
    const sv = validateCurriculum(registry)
    setStructural(sv)

    setPhase('duplicates')
    const dr = detectSemanticDuplicates(registry)
    setDups(dr)

    setPhase('quality')
    const reports: QualityReport[] = []
    const stubs = Object.values(registry.lessonIndex)
    for (let i = 0; i < stubs.length; i++) {
      const detail = await loadLesson(stubs[i].id)  // lazy: one at a time
      if (detail) reports.push(scoreLesson(detail))
      setProgress(i + 1)
    }
    setQuality(reports.sort((a, b) => a.composite - b.composite))
    setPhase('done')
    setRunning(false)
  }, [registry])

  const lessonCount = Object.keys(registry.lessonIndex).length
  const avgQuality = quality.length
    ? quality.reduce((s, r) => s + r.composite, 0) / quality.length
    : 0

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1><ShieldCheck size={28} /> Curriculum Validation</h1>
        <p>
          {lessonCount} lessons &middot; {Object.keys(registry.concepts).length} concepts &middot;
          {' '}{Object.keys(registry.languages).length} languages
        </p>
        <button className={styles.runBtn} onClick={runAll} disabled={running}>
          <RefreshCw size={16} className={running ? styles.spinning : undefined} />
          {running ? `Running (${phase})…` : 'Run full validation'}
        </button>
      </header>

      {phase === 'quality' && (
        <div className={styles.progressRow}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(progress / lessonCount) * 100}%` }} />
          </div>
          <span>{progress} / {lessonCount} scored</span>
        </div>
      )}

      {structural && (
        <Section icon={<CheckCircle2 size={18} />} title="Structural validation">
          <div className={styles.statRow}>
            <Stat label="Errors" value={structural.errors} tone={structural.errors > 0 ? 'bad' : 'good'} />
            <Stat label="Warnings" value={structural.warnings} tone={structural.warnings > 0 ? 'warn' : 'good'} />
            <Stat label="Infos" value={structural.infos} tone="neutral" />
            <Stat label="Status" value={structural.ok ? 'OK' : 'FAIL'} tone={structural.ok ? 'good' : 'bad'} />
          </div>
          {structural.issues.length > 0 && (
            <ul className={styles.issueList}>
              {structural.issues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
            </ul>
          )}
        </Section>
      )}

      {dups && (
        <Section icon={<Copy size={18} />} title="Semantic duplicate detection">
          <div className={styles.statRow}>
            <Stat label="Near-duplicates (≥0.85)" value={dups.nearDuplicates} tone={dups.nearDuplicates > 0 ? 'bad' : 'good'} />
            <Stat label="Suspicious (0.6–0.85)" value={dups.suspicious} tone={dups.suspicious > 0 ? 'warn' : 'good'} />
            <Stat label="Pairs flagged" value={dups.pairs.length} tone="neutral" />
          </div>
          {dups.pairs.length > 0 && (
            <ul className={styles.dupList}>
              {dups.pairs.map((p, i) => (
                <li key={i} className={styles.dupRow}>
                  <span className={styles.simBadge} data-tone={p.similarity >= 0.85 ? 'bad' : 'warn'}>
                    {(p.similarity * 100).toFixed(0)}%
                  </span>
                  <span className={styles.dupTitle}>{p.titleA}</span>
                  <span className={styles.dupVs}>vs</span>
                  <span className={styles.dupTitle}>{p.titleB}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {quality.length > 0 && (
        <Section icon={<Gauge size={18} />} title={`Lesson quality scoring (avg ${(avgQuality * 100).toFixed(0)}%)`}>
          <ul className={styles.qualityList}>
            {quality.map((r) => {
              const pct = Math.round(r.composite * 100)
              return (
                <li key={r.lessonId} className={styles.qualityRow}>
                  <span className={styles.qLabel}>{r.lessonId}</span>
                  <div className={styles.qBar}>
                    <div
                      className={styles.qFill}
                      style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--lab-accent-green)' : pct >= 50 ? 'var(--lab-accent-orange)' : 'var(--lab-accent-red)' }}
                    />
                  </div>
                  <span className={styles.qScore}>{pct}%</span>
                </li>
              )
            })}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{icon} {title}</h2>
      {children}
    </section>
  )
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone: 'good' | 'warn' | 'bad' | 'neutral' }) {
  return (
    <div className={`${styles.stat} ${styles[`stat_${tone}`]}`}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const Icon = issue.severity === 'error' ? XCircle : issue.severity === 'warning' ? AlertTriangle : CheckCircle2
  return (
    <li className={`${styles.issueRow} ${styles[`issue_${issue.severity}`]}`}>
      <Icon size={16} />
      <span className={styles.issueCode}>{issue.code}</span>
      <span className={styles.issueMsg}>{issue.message}</span>
    </li>
  )
}
