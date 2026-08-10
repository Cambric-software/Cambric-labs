import { useMemo, useState } from 'react'
import {
  Code2, Play, AlertTriangle, Bug, ShieldAlert, Gauge, Wrench,
  FlaskConical, FileCode, Lightbulb, Beaker, ChevronDown, ChevronRight,
} from 'lucide-react'
import {
  registerDevAreaAnalyzers, runAnalysis, flattenFindings, summarizeByCategory,
  suggestRefactors, generateTests, comparisonSuggestions,
} from '../devarea'
import { listLanguages } from '../curriculum'
import type { Finding, FindingCategory, RefactorSuggestion, GeneratedTest } from '../devarea'
import styles from './AdminPage.module.css'

// Wire built-in analyzers into the engine once at module load.
registerDevAreaAnalyzers()

const SAMPLE_CODE: Record<string, string> = {
  javascript: `function greet(name) {
  var message = "Hello, " + name + "!"
  console.log(message);
  return message;
}

function parse(input) {
  return eval(input);  // dangerous
}

try {
  doSomething();
} catch (e) {}  // swallowed error

// TODO: validate input`,
  typescript: `function calc(a, b) {
  var result = a + b;
  if (result == 10) {
    return true;
  }
  return false;
}

function load(data) {
  document.write(data);
}`,
  python: `def add_to_list(item, target=[]):
    target.append(item)
    return target

def find(value):
    try:
        return data[value]
    except:
        pass

def is_empty(x):
    if x == None:
        return True
    return False

import os
global cache
cache = {}

from utils import *`,
}

type TabId = 'analyze' | 'custom'

const CATEGORY_META: Record<FindingCategory, { icon: typeof Bug; label: string; color: string }> = {
  bug: { icon: Bug, label: 'Bugs', color: 'var(--lab-accent-red)' },
  error: { icon: AlertTriangle, label: 'Errors', color: 'var(--lab-accent-orange)' },
  gap: { icon: FileCode, label: 'Gaps', color: 'var(--lab-accent-cyan)' },
  suspicious: { icon: AlertTriangle, label: 'Suspicious', color: 'var(--lab-accent-orange)' },
  integrity: { icon: ShieldAlert, label: 'Integrity', color: 'var(--lab-accent-red)' },
  security: { icon: ShieldAlert, label: 'Security', color: 'var(--lab-accent-purple)' },
  performance: { icon: Gauge, label: 'Performance', color: 'var(--lab-accent-blue)' },
  maintainability: { icon: Wrench, label: 'Maintainability', color: 'var(--lab-accent-green)' },
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'var(--lab-accent-red)',
  high: 'var(--lab-accent-orange)',
  medium: 'var(--lab-accent-blue)',
  low: 'var(--lab-accent-green)',
  info: 'var(--lab-text-secondary)',
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>('analyze')
  const [languageId, setLanguageId] = useState<string>('javascript')
  const [code, setCode] = useState<string>(SAMPLE_CODE['javascript'])
  const [hasRun, setHasRun] = useState(false)
  const [compareTarget, setCompareTarget] = useState<string>('python')

  const languages = useMemo(() => listLanguages().filter((l) => l.analyzable), [])

  const results = useMemo(() => {
    if (!hasRun) return []
    return runAnalysis({ code, languageId })
  }, [hasRun, code, languageId])

  const findings = useMemo(() => flattenFindings(results), [results])
  const summary = useMemo(() => summarizeByCategory(results), [results])
  const refactors = useMemo(
    () => (hasRun ? suggestRefactors({ code, languageId }) : []),
    [hasRun, code, languageId],
  )
  const tests = useMemo(
    () => (hasRun ? generateTests({ code, languageId }) : []),
    [hasRun, code, languageId],
  )
  const comparisons = useMemo(
    () => {
      if (!hasRun) return []
      const target = compareTarget === languageId
        ? languages.find((l) => l.id !== languageId)?.id ?? compareTarget
        : compareTarget
      return comparisonSuggestions({ code, languageId }, target)
    },
    [hasRun, code, languageId, compareTarget, languages],
  )

  const onSelectLanguage = (id: string) => {
    setLanguageId(id)
    setCode(SAMPLE_CODE[id] ?? '')
    setHasRun(false)
  }

  const onLoadSample = () => {
    setCode(SAMPLE_CODE[languageId] ?? '')
    setHasRun(false)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>
          <Code2 size={28} />
          Developer Area
        </h1>
      </header>

      <div className={styles.content}>
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'analyze' ? styles.active : ''}`}
            onClick={() => setActiveTab('analyze')}
          >
            <FileCode size={18} />
            Code Analysis
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <FlaskConical size={18} />
            Custom Code
          </button>
        </nav>

        <div className={styles.panel}>
          {activeTab === 'analyze' && (
            <AnalysisWorkspace
              languageId={languageId}
              languages={languages}
              code={code}
              hasRun={hasRun}
              findings={findings}
              summary={summary}
              refactors={refactors}
              tests={tests}
              comparisons={comparisons}
              compareTarget={compareTarget}
              onSelectCompareTarget={setCompareTarget}
              onSelectLanguage={onSelectLanguage}
              onLoadSample={onLoadSample}
              onCodeChange={(c) => { setCode(c); setHasRun(false) }}
              onRun={() => setHasRun(true)}
            />
          )}

          {activeTab === 'custom' && (
            <CustomCode
              languageId={languageId}
              languages={languages}
              code={code}
              onSelectLanguage={onSelectLanguage}
              onCodeChange={(c) => { setCode(c); setHasRun(false) }}
              onRun={() => { setActiveTab('analyze'); setHasRun(true) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface AnalysisWorkspaceProps {
  languageId: string
  languages: { id: string; name: string; extension: string }[]
  code: string
  hasRun: boolean
  findings: Finding[]
  summary: Record<FindingCategory, number>
  refactors: RefactorSuggestion[]
  tests: GeneratedTest[]
  comparisons: RefactorSuggestion[]
  compareTarget: string
  onSelectCompareTarget: (id: string) => void
  onSelectLanguage: (id: string) => void
  onLoadSample: () => void
  onCodeChange: (code: string) => void
  onRun: () => void
}

function AnalysisWorkspace(props: AnalysisWorkspaceProps) {
  const {
    languageId, languages, code, hasRun, findings, summary, refactors, tests,
    comparisons, compareTarget, onSelectCompareTarget,
    onSelectLanguage, onLoadSample, onCodeChange, onRun,
  } = props
  const totalFindings = findings.length

  return (
    <div className={styles.workspace}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span>Language</span>
          <select value={languageId} onChange={(e) => onSelectLanguage(e.target.value)}>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name} (.{l.extension})</option>
            ))}
          </select>
        </label>
        <button className={styles.sampleBtn} onClick={onLoadSample}>Load sample</button>
        <button className={styles.runBtn} onClick={onRun}>
          <Play size={16} /> Run Analysis
        </button>
      </div>

      <div className={styles.editorSection}>
        <div className={styles.editorHeader}>
          <span>source.{languages.find((l) => l.id === languageId)?.extension ?? 'txt'}</span>
        </div>
        <textarea
          className={styles.editor}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          placeholder="// Paste or write code to analyze..."
        />
      </div>

      {hasRun && (
        <div className={styles.results}>
          <div className={styles.summaryGrid}>
            {(Object.keys(CATEGORY_META) as FindingCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat]
              const count = summary[cat] ?? 0
              const Icon = meta.icon
              return (
                <div
                  key={cat}
                  className={styles.summaryCard}
                  style={{ borderColor: count > 0 ? meta.color : 'var(--lab-border)' }}
                >
                  <Icon size={18} style={{ color: meta.color }} />
                  <span className={styles.summaryLabel}>{meta.label}</span>
                  <span className={styles.summaryCount}>{count}</span>
                </div>
              )
            })}
          </div>

          <h3 className={styles.sectionTitle}>
            Findings <span className={styles.countBadge}>{totalFindings}</span>
          </h3>
          {findings.length === 0 ? (
            <p className={styles.empty}>
              No issues detected. This does not guarantee correctness — analysis is heuristic.
            </p>
          ) : (
            <ul className={styles.findingsList}>
              {findings.map((f, i) => (
                <FindingRow key={`${f.ruleId}-${i}`} finding={f} />
              ))}
            </ul>
          )}

          <h3 className={styles.sectionTitle}>
            <Lightbulb size={18} /> Refactor &amp; Simplification
          </h3>
          {refactors.length === 0 ? (
            <p className={styles.empty}>No refactor suggestions for this code.</p>
          ) : (
            <ul className={styles.findingsList}>
              {refactors.map((r, i) => (
                <li key={`${r.id}-${i}`} className={styles.refactorItem}>
                  <div className={styles.refactorHead}>{r.title}</div>
                  <p className={styles.refactorRationale}>{r.rationale}</p>
                  {r.before && (
                    <pre className={styles.snippet}><code>{r.before}</code></pre>
                  )}
                  {r.after && (
                    <pre className={styles.snippetAlt}><code>{r.after}</code></pre>
                  )}
                </li>
              ))}
            </ul>
          )}

          <h3 className={styles.sectionTitle}>
            <Beaker size={18} /> Generated Tests
          </h3>
          {tests.length === 0 ? (
            <p className={styles.empty}>No functions detected to generate tests for. Define a function.</p>
          ) : (
            <div className={styles.testsGrid}>
              {tests.map((t, i) => (
                <div key={i} className={styles.testCard}>
                  <div className={styles.testHead}>{t.title}</div>
                  <pre className={styles.snippet}><code>{t.code}</code></pre>
                  <ul className={styles.assertList}>
                    {t.asserts.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <h3 className={styles.sectionTitle}>
            <FileCode size={18} /> Language Comparison
          </h3>
          <div className={styles.compareBar}>
            <label className={styles.field}>
              <span>Compare to</span>
              <select
                value={compareTarget}
                onChange={(e) => onSelectCompareTarget(e.target.value)}
              >
                {languages
                  .filter((l) => l.id !== languageId)
                  .map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
              </select>
            </label>
          </div>
          {comparisons.length === 0 ? (
            <p className={styles.empty}>
              No recognized patterns to compare, or same source language selected.
              Try a snippet with a function, string interpolation, loop, or map.
            </p>
          ) : (
            <ul className={styles.findingsList}>
              {comparisons.map((r, i) => (
                <li key={`${r.id}-${i}`} className={styles.refactorItem}>
                  <div className={styles.refactorHead}>{r.title}</div>
                  <p className={styles.refactorRationale}>{r.rationale}</p>
                  {r.before && (
                    <pre className={styles.snippet}><code>{r.before}</code></pre>
                  )}
                  {r.after && (
                    <pre className={styles.snippetAlt}><code>{r.after}</code></pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function FindingRow({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false)
  const color = SEVERITY_COLOR[finding.severity] ?? 'var(--lab-text-secondary)'
  return (
    <li className={styles.findingItem}>
      <button className={styles.findingHead} onClick={() => setOpen(!open)}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className={styles.severityDot} style={{ background: color }} />
        <span className={styles.findingMessage}>{finding.message}</span>
        {finding.range && (
          <span className={styles.findingLoc}>L{finding.range.startLine}</span>
        )}
      </button>
      {open && (
        <div className={styles.findingBody}>
          <p className={styles.findingRule}>
            Rule: <code>{finding.ruleId}</code> &middot; {finding.category}
          </p>
          {finding.explanation && <p className={styles.findingExplain}>{finding.explanation}</p>}
          {finding.suggestion && (
            <p className={styles.findingSuggestion}>
              <Wrench size={14} /> {finding.suggestion.title}
              {finding.suggestion.rationale && <> &mdash; {finding.suggestion.rationale}</>}
            </p>
          )}
          {finding.suggestion?.code && (
            <pre className={styles.snippet}><code>{finding.suggestion.code}</code></pre>
          )}
        </div>
      )}
    </li>
  )
}

interface CustomCodeProps {
  languageId: string
  languages: { id: string; name: string; extension: string }[]
  code: string
  onSelectLanguage: (id: string) => void
  onCodeChange: (code: string) => void
  onRun: () => void
}

function CustomCode(props: CustomCodeProps) {
  const { languageId, languages, code, onSelectLanguage, onCodeChange, onRun } = props
  return (
    <div className={styles.customNeuron}>
      <h2>Analyze Your Own Code</h2>
      <p className={styles.description}>
        Paste any snippet and analyze it. Choose a language, edit the code, then run analysis
        to see bugs, gaps, security, and maintainability findings plus refactor suggestions
        and generated tests.
      </p>

      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span>Language</span>
          <select value={languageId} onChange={(e) => onSelectLanguage(e.target.value)}>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </label>
        <button className={styles.runBtn} onClick={onRun}>
          <Play size={16} /> Run Analysis
        </button>
      </div>

      <div className={styles.editorSection}>
        <div className={styles.editorHeader}>
          <span>source.{languages.find((l) => l.id === languageId)?.extension ?? 'txt'}</span>
        </div>
        <textarea
          className={styles.editor}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck={false}
          placeholder="Paste your code here..."
        />
      </div>
    </div>
  )
}
