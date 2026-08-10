/**
 * Cambric Labs — Developer Area: Python Analyzers
 *
 * Heuristic static rules for Python. Same educational framing as the JS
 * analyzers: report the issue and explain *why* it is risky.
 */
import type { AnalysisInput, Analyzer, Finding, SourceRange } from '../types'

function lineOf(source: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++
  }
  return line
}

function rangeFor(lineNumber: number, column: number, length: number): SourceRange {
  return { startLine: lineNumber, endLine: lineNumber, startColumn: column, endColumn: column + length }
}

/** `except:` bare except catches everything including SystemExit/KeyboardInterrupt. */
const bareExceptAnalyzer: Analyzer = {
  id: 'py-no-bare-except',
  label: 'Bare except',
  category: 'bug',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /except\s*:/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-no-bare-except',
        category: 'bug',
        severity: 'high',
        message: `Bare except catches everything, including interrupts.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'A bare `except:` catches BaseException, so it swallows ' +
          'KeyboardInterrupt (Ctrl-C) and SystemExit. Catch the specific ' +
          'exception you expect, or at least use `except Exception:`.',
        suggestion: { title: 'Catch a specific exception type', rationale: 'Specificity prevents masking serious failures.' },
      })
    }
    return findings
  },
}

/** `except: pass` — silently swallowing an error. */
const exceptPassAnalyzer: Analyzer = {
  id: 'py-no-except-pass',
  label: 'Silent except pass',
  category: 'bug',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /except[^\n]*:\s*\n\s*pass/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-no-except-pass',
        category: 'bug',
        severity: 'high',
        message: `except ... pass hides errors.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Catching an exception and immediately passing discards it with no ' +
          'trace. The program continues in an unknown state. Log it, re-raise, ' +
          'or handle it — do not pretend it did not happen.',
        suggestion: { title: 'Log or re-raise the exception' },
      })
    }
    return findings
  },
}

/** Mutable default argument: def f(x=[]). The list is shared across calls. */
const mutableDefaultAnalyzer: Analyzer = {
  id: 'py-no-mutable-default',
  label: 'Mutable default arg',
  category: 'bug',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /def\s+\w+\s*\([^)]*=\s*(\[\]|\{\}|set\(\))/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-no-mutable-default',
        category: 'bug',
        severity: 'high',
        message: `Mutable default argument is shared across calls.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Default argument values are evaluated ONCE when the function is ' +
          'defined, not on each call. So `def f(x=[])` shares one list object ' +
          'across every call — appending in one call persists into the next. ' +
          'Use None as a sentinel and create the mutable inside.',
        suggestion: {
          title: 'Use None as a sentinel default',
          code: 'def f(x=None):\n    if x is None:\n        x = []',
          rationale: 'Creating the object inside the body gives each call its own.',
        },
      })
    }
    return findings
  },
}

/** `==` comparison with None: should be `is None`. */
const noneEqAnalyzer: Analyzer = {
  id: 'py-is-none',
  label: 'Use is None',
  category: 'suspicious',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /==\s*None|!=\s*None/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-is-none',
        category: 'suspicious',
        severity: 'low',
        message: `Compare to None with is / is not, not == / !=.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'None is a singleton; identity (is) is the correct check. == can be ' +
          'overridden by a class __eq__ and behave unexpectedly. PEP 8 recommends ' +
          '`is None` / `is not None`.',
        suggestion: { title: 'Use `is None` / `is not None`' },
      })
    }
    return findings
  },
}

/** Global statement usage: usually a maintainability / hidden-state smell. */
const globalAnalyzer: Analyzer = {
  id: 'py-avoid-global',
  label: 'Avoid global',
  category: 'maintainability',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /^\s*global\s+\w+/gm
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-avoid-global',
        category: 'maintainability',
        severity: 'low',
        message: `global makes state hard to reason about.`,
        range: rangeFor(line, match.index, match[0].trim().length),
        explanation:
          'Mutating global state from inside a function hides data flow: any ' +
          'caller can change it, and tests cannot isolate it. Prefer returning a ' +
          'value and letting the caller update its own scope, or use a class.',
        suggestion: { title: 'Return a value instead of mutating global state' },
      })
    }
    return findings
  },
}

/** `import *`: pollutes the namespace and hides where names come from. */
const starImportAnalyzer: Analyzer = {
  id: 'py-no-star-import',
  label: 'Avoid star import',
  category: 'maintainability',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /from\s+\S+\s+import\s+\*/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-no-star-import',
        category: 'maintainability',
        severity: 'low',
        message: `Star import hides name origins and can collide.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          '`from x import *` dumps every name from x into your namespace. It is ' +
          'unclear where any name came from, and two star imports can silently ' +
          'overwrite each other. Import only what you use.',
        suggestion: { title: 'Import explicit names instead' },
      })
    }
    return findings
  },
}

/** broad except Exception followed by pass — pattern combining both prior smells. */
const broadExceptionAnalyzer: Analyzer = {
  id: 'py-broad-exception',
  label: 'Broad except',
  category: 'suspicious',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /except\s+Exception\s*:/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'py-broad-exception',
        category: 'suspicious',
        severity: 'medium',
        message: `Broad except Exception catches unintended errors.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Catching Exception grabs every runtime error, including ones you did ' +
          'not anticipate (TypeError, KeyError, ...). This masks bugs. Catch the ' +
          'specific exception types you know how to handle.',
        suggestion: { title: 'Narrow the except clause' },
      })
    }
    return findings
  },
}

export const PYTHON_ANALYZERS: Analyzer[] = [
  bareExceptAnalyzer,
  exceptPassAnalyzer,
  mutableDefaultAnalyzer,
  noneEqAnalyzer,
  globalAnalyzer,
  starImportAnalyzer,
  broadExceptionAnalyzer,
]
