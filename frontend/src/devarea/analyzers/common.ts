/**
 * Cambric Labs — Developer Area: Cross-Language Common Analyzers
 *
 * Rules that apply across many languages: hardcoded secrets, leftover debug
 * prints, TODO/FIXME markers, very long lines, and trailing whitespace. Each
 * analyzer declares the languages it supports explicitly so the engine only
 * runs it for relevant inputs.
 *
 * These are deliberately conservative: they look for patterns that are risky
 * in ANY language, so they can cover the 14 analyzable languages that lack
 * language-specific analyzer modules (ruby, go, php, java, c, cpp, rust,
 * bash, sql, html, css) plus reinforce the JS/TS/Python set.
 */
import type { AnalysisInput, Analyzer, Finding, SourceRange } from '../types'

function lineOf(source: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++
  }
  return line
}

function rangeForLine(lineNumber: number, length: number): SourceRange {
  return { startLine: lineNumber, endLine: lineNumber, startColumn: 0, endColumn: length }
}

/** All languages the common analyzers support. */
const ALL_LANGS = [
  'javascript', 'typescript', 'python', 'ruby', 'go', 'php', 'java', 'c',
  'cpp', 'rust', 'bash', 'sql', 'html', 'css', 'yaml',
]

/**
 * Hardcoded secrets: API keys, passwords, tokens embedded in source.
 * Looks for common secret-like assignments across languages.
 */
const hardcodedSecretAnalyzer: Analyzer = {
  id: 'common-hardcoded-secret',
  label: 'Hardcoded secret',
  category: 'security',
  supportedLanguages: ALL_LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    // Match assignments like: key = "AKIA...", password = "secret", API_KEY = "...".
    // Handles =, := (Go), : (YAML/Python), => (PHP arrow) separators.
    const secretRegex = /\b(api[_-]?key|secret|password|passwd|token|auth[_-]?token|access[_-]?key|private[_-]?key)\b\s*(?::=|=>|[:=])\s*["'`][^"'`]{8,}["'`]/gi
    for (let i = 0; i < lines.length; i++) {
      const m = secretRegex.exec(lines[i])
      if (m) {
        findings.push({
          ruleId: 'common-hardcoded-secret',
          category: 'security',
          severity: 'critical',
          message: `Possible hardcoded secret: "${m[1]}".`,
          range: rangeForLine(i + 1, lines[i].length),
          explanation:
            'Embedding secrets in source code means anyone with repo access ' +
            'has the credential. Secrets in version history persist even after ' +
            'deletion. Use environment variables or a secrets manager, and rotate ' +
            'any secret that was ever committed.',
          suggestion: {
            title: 'Move the secret to an environment variable',
            rationale: 'Never commit credentials; inject them at runtime.',
          },
        })
      }
    }
    return findings
  },
}

/**
 * Leftover debug print statements: console.log, print, System.out.println,
 * fmt.Println, puts, echo, printf, cerr. Flagged 'suspicious' — usually not
 * wanted in production.
 */
const debugPrintAnalyzer: Analyzer = {
  id: 'common-debug-print',
  label: 'Leftover debug print',
  category: 'suspicious',
  supportedLanguages: ALL_LANGS,
  analyze({ code, languageId }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const patterns: Record<string, RegExp> = {
      javascript: /console\.(log|debug|info|warn)\s*\(/,
      typescript: /console\.(log|debug|info|warn)\s*\(/,
      python: /^\s*print\s*\(/m,
      ruby: /^\s*(puts|p|print)\s/m,
      go: /fmt\.(Println|Printf|Print)\s*\(/,
      php: /(echo|print_r|var_dump)\s*\(/,
      java: /System\.out\.print/,
      c: /printf\s*\(/,
      cpp: /std::cout\s*<<|printf\s*\(/,
      rust: /println!\s*\(|eprintln!\s*\(/,
      bash: /^\s*echo\s/m,
    }
    const regex = patterns[languageId]
    if (!regex) return findings
    const lines = code.split('\n')
    // Use global flag for iterative exec
    const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
    for (let i = 0; i < lines.length; i++) {
      globalRegex.lastIndex = 0
      if (globalRegex.test(lines[i])) {
        findings.push({
          ruleId: 'common-debug-print',
          category: 'suspicious',
          severity: 'low',
          message: `Debug print statement left in code.`,
          range: rangeForLine(i + 1, lines[i].length),
          explanation:
            'Print statements are useful during development but produce noise ' +
            'in production logs (and may leak sensitive data). Remove them or ' +
            'route through a proper logger with levels so they can be silenced.',
          suggestion: { title: 'Remove or replace with a leveled logger' },
        })
      }
    }
    return findings
  },
}

/**
 * TODO/FIXME/XXX/HACK markers across all languages. Works for both # and //
 * comment styles.
 */
const todoMarkerAnalyzer: Analyzer = {
  id: 'common-todo-marker',
  label: 'Unfinished work marker',
  category: 'gap',
  supportedLanguages: ALL_LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /\b(TODO|FIXME|XXX|HACK|BUG)\b/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'common-todo-marker',
        category: 'gap',
        severity: 'low',
        message: `Unfinished work marker: ${match[0]}.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          'These markers flag known-incomplete or risky code. Track them in ' +
          'an issue tracker so they are resolved rather than forgotten.',
        suggestion: { title: 'Resolve or file a tracking issue' },
      })
    }
    return findings
  },
}

/**
 * Very long lines (>120 chars). Hurts readability and diff review.
 */
const longLineAnalyzer: Analyzer = {
  id: 'common-long-line',
  label: 'Long line',
  category: 'maintainability',
  supportedLanguages: ALL_LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > 120) {
        findings.push({
          ruleId: 'common-long-line',
          category: 'maintainability',
          severity: 'low',
          message: `Line ${i + 1} is ${lines[i].length} characters (over 120).`,
          range: rangeForLine(i + 1, lines[i].length),
          explanation:
            'Long lines force horizontal scrolling and make diffs harder to ' +
            'review. Most style guides cap lines at 80–120 characters. Break long ' +
            'expressions across lines or extract intermediate variables.',
          suggestion: { title: 'Wrap or break the line' },
        })
      }
    }
    return findings
  },
}

/**
 * Hardcoded localhost / 127.0.0.1 / 0.0.0.0 URLs in production code.
 * Flagged 'suspicious' — may be dev-only leftovers.
 */
const localhostUrlAnalyzer: Analyzer = {
  id: 'common-localhost-url',
  label: 'Hardcoded localhost',
  category: 'suspicious',
  supportedLanguages: ALL_LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /\b(https?:\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'common-localhost-url',
        category: 'suspicious',
        severity: 'low',
        message: `Hardcoded localhost URL: ${match[0]}.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          'Hardcoded localhost URLs are fine for local development but break ' +
          'in other environments. Make the host configurable via an environment ' +
          'variable or a config file.',
        suggestion: { title: 'Make the host configurable' },
      })
    }
    return findings
  },
}

export const COMMON_ANALYZERS: Analyzer[] = [
  hardcodedSecretAnalyzer,
  debugPrintAnalyzer,
  todoMarkerAnalyzer,
  longLineAnalyzer,
  localhostUrlAnalyzer,
]
