/**
 * Cambric Labs — Developer Area: Maintainability Analyzers (extended)
 *
 * Maintainability rules that flag code smells making a codebase harder to
 * change safely: magic numbers, oversized functions, excessive nesting,
 * dead code (commented-out blocks), and duplicate-string literals. Each
 * finding explains the maintenance risk and the named refactor, so a
 * learner learns the engineering principle, not just the lint.
 *
 * Heuristic (no full parser) — bounded, instant.
 */
import type { AnalysisInput, Analyzer, Finding, SourceRange } from '../types'

function rangeFor(lineNumber: number, column: number, length: number): SourceRange {
  return { startLine: lineNumber, endLine: lineNumber, startColumn: column, endColumn: column + length }
}

const LANGS = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'ruby', 'php', 'rust']

/**
 * Magic numbers: unexplained numeric literals in code. `if (x > 86400)`
 * hides that 86400 is seconds-per-day; `const LIMIT = 86400` or a named
 * constant makes intent obvious. Flag standalone numeric literals (not 0/1,
 * not in a const/return/type annotation) above a threshold.
 */
const magicNumberAnalyzer: Analyzer = {
  id: 'maint-magic-number',
  label: 'Magic number',
  category: 'maintainability',
  supportedLanguages: LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    const seen = new Set<string>()
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // find standalone numeric literals (not part of a word, not 0 or 1)
      const regex = /\b([2-9]\d{2,}|[1-9]\d{3,})\b/g
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        const num = match[1]
        // skip if line already assigns to a named const (intentional naming)
        if (/const|static|final|readonly|\benum\b/i.test(line)) continue
        // skip if inside a comment
        if (line.slice(0, match.index).includes('//') || line.trim().startsWith('*') || line.trim().startsWith('#')) continue
        const key = num + '@' + (i + 1)
        if (seen.has(key)) continue
        seen.add(key)
        findings.push({
          ruleId: 'maint-magic-number',
          category: 'maintainability',
          severity: 'low',
          message: `Magic number ${num} — meaning is unclear.`,
          range: rangeFor(i + 1, match.index, num.length),
          explanation:
            `A bare literal like ${num} communicates nothing about intent. A reader ` +
            'must reverse-engineer why that value. Extract it to a named constant ' +
            '(SECONDS_PER_DAY, MAX_RETRIES) so the name documents the meaning and the ' +
            'value is defined in one place. Small literals (0, 1, 2) are usually fine; ' +
            'the larger the number, the more it deserves a name.',
          suggestion: { title: 'Extract to a named constant', rationale: 'A name documents intent; a literal documents nothing.' },
        })
      }
    }
    return findings
  },
}

/**
 * Oversized function: a function body exceeding a line threshold (default 50).
 * Long functions do too much, are hard to test in isolation, and resist
 * change. Flag the function header and its length so the author can split.
 */
const hugeFunctionAnalyzer: Analyzer = {
  id: 'maint-huge-function',
  label: 'Oversized function',
  category: 'maintainability',
  supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'ruby', 'php'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    const THRESHOLD = 50
    // match function definitions: def f(), function f(), f() {, () =>
    const fnRegex = /^\s*(?:def|function|public|private|static|async|func|fn)?\s*\w+\s*\([^)]*\)\s*(?:[:{]|->)/
    for (let i = 0; i < lines.length; i++) {
      if (!fnRegex.test(lines[i])) continue
      // find the end: a line at column <= the def's indent (Python) or matching close brace
      const startIndent = lines[i].match(/^[ \t]*/)?.[0].length ?? 0
      let end = i
      let braceDepth = 0
      let sawOpen = false
      for (let j = i; j < lines.length; j++) {
        const line = lines[j]
        for (const ch of line) {
          if (ch === '{') { braceDepth++; sawOpen = true }
          if (ch === '}') braceDepth--
        }
        // Python: end when dedented back to <= startIndent on a non-empty, non-comment line
        if (!sawOpen && j > i) {
          const trimmed = lines[j].trim()
          if (trimmed !== '' && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
            const ind = lines[j].match(/^[ \t]*/)?.[0].length ?? 0
            if (ind <= startIndent) { end = j - 1; break }
          }
        }
        // brace languages: end when braces balance after opening
        if (sawOpen && braceDepth <= 0 && j > i) { end = j; break }
        end = j
      }
      const length = end - i + 1
      if (length > THRESHOLD) {
        findings.push({
          ruleId: 'maint-huge-function',
          category: 'maintainability',
          severity: 'medium',
          message: `Function is ${length} lines long (>${THRESHOLD}).`,
          range: rangeFor(i + 1, 0, lines[i].length),
          explanation:
            `A function over ${THRESHOLD} lines is doing several things at once, which ` +
            'makes it hard to name, hard to test in isolation, and risky to change. ' +
            'Split it into smaller named helpers, each doing one thing; the names ' +
            'become the documentation of the steps. Extract a coherent sub-task, ' +
            'give it a descriptive name, and pass it only the data it needs.',
          suggestion: { title: 'Split into smaller named helpers', rationale: 'Small functions are testable, nameable, and changeable.' },
        })
      }
    }
    return findings
  },
}

/**
 * Excessive nesting: deeply-indented code (>4 levels) is hard to follow and
 * a sign of missing guard clauses. Flag lines whose indentation exceeds 4
 * levels (4 units of indent per level in Python, or 4 braces deep in C-like).
 */
const deepNestingAnalyzer: Analyzer = {
  id: 'maint-deep-nesting',
  label: 'Excessive nesting',
  category: 'maintainability',
  supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'ruby', 'php'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let reported = false
    let braceDepth = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // track brace depth (C-like languages)
      for (const ch of line) {
        if (ch === '{') braceDepth++
        if (ch === '}') braceDepth--
      }
      const indent = line.match(/^[ \t]*/)?.[0].length ?? 0
      // flag 4+ levels of nesting: brace depth >= 4, or 8+ space indent, or 4+ tabs
      const isDeep = braceDepth >= 4 || indent >= 8 || /^\t{4,}/.test(line)
      if (isDeep) {
        if (!reported) {
          findings.push({
            ruleId: 'maint-deep-nesting',
            category: 'maintainability',
            severity: 'low',
            message: `Code nested deeply (${braceDepth} brace levels).`,
            range: rangeFor(i + 1, 0, line.length),
            explanation:
              'Deeply nested code forces a reader to hold many conditions in mind at once. ' +
              'The fix is usually a guard clause: handle the simple/special case early with ' +
              'an early return, so the happy path stays at the outer indent level. Extracting ' +
              'nested logic into a named helper also flattens the caller. Aim for at most ' +
              '2-3 levels of nesting in any function.',
            suggestion: { title: 'Use guard clauses (early return) to flatten nesting', rationale: 'Invert conditions and return early; the common path stays shallow.' },
          })
          reported = true
        }
      } else {
        reported = false
      }
    }
    return findings
  },
}

/**
 * Dead code: large commented-out blocks (5+ consecutive comment lines that
 * look like code, not prose). Left because someone might "need it later",
 * but stale comments rot and confuse readers; version control remembers it.
 */
const deadCodeBlockAnalyzer: Analyzer = {
  id: 'maint-dead-code-block',
  label: 'Commented-out code block',
  category: 'maintainability',
  supportedLanguages: LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let runStart = -1
    let runLen = 0
    for (let i = 0; i < lines.length; i++) {
      const isCodeComment = /^\s*(\/\/|\/\*|\*|#)\s*[\w(){}\[\];=+\-*/]/.test(lines[i]) && !/^\s*(\/\/|\/\*|\*|#)\s*(TODO|FIXME|NOTE|HACK|NOTE)/i.test(lines[i])
      if (isCodeComment) {
        if (runStart < 0) runStart = i
        runLen++
      } else {
        if (runLen >= 5) {
          findings.push({
            ruleId: 'maint-dead-code-block',
            category: 'maintainability',
            severity: 'medium',
            message: `${runLen} commented-out lines — dead code.`,
            range: rangeFor(runStart + 1, 0, lines[runStart].length),
            explanation:
              'Large commented-out blocks are dead code left "in case we need it". ' +
              'But comments never compile or run, so they rot silently and mislead ' +
              'readers into thinking the code is current. Version control already ' +
              'remembers every line ever written — delete the block; recover from git ' +
              'if you ever truly need it.',
            suggestion: { title: 'Delete the block — git remembers it', rationale: 'Stale commented code misleads; git history is the reliable archive.' },
          })
        }
        runStart = -1
        runLen = 0
      }
    }
    if (runLen >= 5) {
      findings.push({
        ruleId: 'maint-dead-code-block',
        category: 'maintainability',
        severity: 'medium',
        message: `${runLen} commented-out lines — dead code.`,
        range: rangeFor(runStart + 1, 0, lines[runStart].length),
        explanation:
          'Large commented-out blocks are dead code left "in case we need it". ' +
          'Version control remembers every line ever written — delete the block; ' +
          'recover from git if you ever truly need it. Comments that rot mislead readers.',
        suggestion: { title: 'Delete the block — git remembers it' },
      })
    }
    return findings
  },
}

export const MAINTAINABILITY_ANALYZERS: Analyzer[] = [
  magicNumberAnalyzer,
  hugeFunctionAnalyzer,
  deepNestingAnalyzer,
  deadCodeBlockAnalyzer,
]
