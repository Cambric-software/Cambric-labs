/**
 * Cambric Labs — Developer Area: JavaScript/TypeScript Analyzers
 *
 * Real static-analysis rules for JS/TS. Each analyzer inspects source text
 * with cheap, deterministic scans and reports findings with explanations
 * and suggested fixes. These are intentionally heuristic (no full parser
 * dependency) so they run instantly in-browser and stay memory-bounded.
 *
 * Rules implemented here are well-established lint concepts reframed as
 * educational explanations: the Developer Area teaches *why* a pattern is
 * risky, not just that it is disallowed.
 */
import type { AnalysisInput, Analyzer, Finding, SourceRange } from '../types'

/** Find the 1-based line index for a character offset. */
function lineOf(source: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === '\n') line++
  }
  return line
}

/** Build a SourceRange for a match on a given line. */
function rangeFor(lineNumber: number, column: number, length: number): SourceRange {
  return {
    startLine: lineNumber,
    endLine: lineNumber,
    startColumn: column,
    endColumn: column + length,
  }
}

/**
 * == / != loose equality. The classic JS footgun: "1" == 1 is true due to
 * coercion. Suggests === / !==. Flagged as 'bug' because it causes real
 * logic errors far more often than it is intentionally wanted.
 */
const looseEqualityAnalyzer: Analyzer = {
  id: 'js-eqeqeq',
  label: 'Strict equality',
  category: 'bug',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // Match == or != but skip ===, !==, ==>, >=, <=, !=> etc.
    const regex = /(^|[^=!<>])==([^=])/gm
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      const col = match.index + match[1].length
      findings.push({
        ruleId: 'js-eqeqeq',
        category: 'bug',
        severity: 'high',
        message: `Use === instead of == to avoid type coercion surprises.`,
        range: rangeFor(line, col, 2),
        explanation:
          'JavaScript coerces operands with ==, so "1" == 1 is true and ' +
          'null == undefined is true. These implicit conversions are the source ' +
          'of many real bugs. === compares without coercion.',
        suggestion: {
          title: 'Use strict equality',
          rationale: '=== never coerces, so values must be the same type AND value.',
        },
      })
    }
    return findings
  },
}

/**
 * var declarations. var is function-scoped and hoisted, leading to subtle
 * bugs (especially in loops). Recommends let/const. Flagged 'bug' severity
 * high because var-in-loop closures are a classic real-world defect.
 */
const varAnalyzer: Analyzer = {
  id: 'js-no-var',
  label: 'Avoid var',
  category: 'bug',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /(^|[^.\w])var\s+/gm
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      const col = match.index + match[1].length
      findings.push({
        ruleId: 'js-no-var',
        category: 'bug',
        severity: 'medium',
        message: `Prefer let/const over var.`,
        range: rangeFor(line, col, 3),
        explanation:
          'var is function-scoped and hoisted, so it leaks across blocks and ' +
          'loop iterations. let/const are block-scoped, which matches how the ' +
          'code reads. Use const by default; let only when reassigning.',
        suggestion: {
          title: 'Replace var with const or let',
          rationale: 'Block scoping prevents accidental leakage and reuse.',
        },
      })
    }
    return findings
  },
}

/**
 * debugger statements left in code. Flagged 'suspicious' — usually an
 * oversight from local debugging shipped to production.
 */
const debuggerAnalyzer: Analyzer = {
  id: 'js-no-debugger',
  label: 'Stray debugger',
  category: 'suspicious',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /(^|[^.\w])debugger\s*;?/gm
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-no-debugger',
        category: 'suspicious',
        severity: 'medium',
        message: `Remove stray debugger statement.`,
        range: rangeFor(line, match.index, 8),
        explanation:
          'A debugger statement halts execution when devtools are open. ' +
          'Leaving it in shipped code is almost always an oversight.',
        suggestion: { title: 'Delete the debugger statement' },
      })
    }
    return findings
  },
}

/**
 * eval usage. eval executes arbitrary strings as code — a security risk
 * and a performance hazard (defeats the JIT). Flagged 'security'.
 */
const evalAnalyzer: Analyzer = {
  id: 'js-no-eval',
  label: 'Avoid eval',
  category: 'security',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /(^|[^.\w])eval\s*\(/gm
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-no-eval',
        category: 'security',
        severity: 'critical',
        message: `eval executes arbitrary strings as code.`,
        range: rangeFor(line, match.index + match[1].length, 4),
        explanation:
          'eval runs a string as code, which lets attacker-controlled input ' +
          'become executable. It also blocks compiler optimizations. Almost ' +
          'every real use of eval has a safer alternative (JSON.parse, ' +
          'lookups in an object/Map).',
        suggestion: {
          title: 'Replace eval with a safe lookup',
          rationale: 'Avoid executing untrusted strings; use data, not code.',
        },
      })
    }
    return findings
  },
}

/**
 * TODO / FIXME / XXX markers. Flagged 'gap' — they signal incomplete work.
 */
const todoAnalyzer: Analyzer = {
  id: 'js-todo',
  label: 'Unfinished work markers',
  category: 'gap',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /\b(TODO|FIXME|XXX|HACK)\b/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-todo',
        category: 'gap',
        severity: 'low',
        message: `Unfinished work marker: ${match[0]}.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'These markers flag known-incomplete or risky code. Track them so ' +
          'they are resolved rather than forgotten.',
        suggestion: { title: 'Resolve or file a tracking issue' },
      })
    }
    return findings
  },
}

/**
 * Empty catch blocks. Swallowing errors silently makes bugs invisible.
 * Flagged 'bug' because it actively hides failures.
 */
const emptyCatchAnalyzer: Analyzer = {
  id: 'js-no-empty-catch',
  label: 'Empty catch',
  category: 'bug',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /catch\s*\([^)]*\)\s*\{\s*\}/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-no-empty-catch',
        category: 'bug',
        severity: 'high',
        message: `Empty catch block swallows errors silently.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Catching an error and doing nothing hides it completely — the program ' +
          'keeps running in a broken state with no clue why. At minimum, log the ' +
          'error; usually, re-throw or handle it explicitly.',
        suggestion: {
          title: 'Log or rethrow the caught error',
          rationale: 'Never discard an error you do not understand.',
        },
      })
    }
    return findings
  },
}

/**
 * Document.write usage. Flagged 'integrity' — it can corrupt the DOM if
 * called after the document finished loading, wiping the page.
 */
const documentWriteAnalyzer: Analyzer = {
  id: 'js-no-document-write',
  label: 'Avoid document.write',
  category: 'integrity',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /document\s*\.\s*write\s*\(/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-no-document-write',
        category: 'integrity',
        severity: 'high',
        message: `document.write can corrupt the document.`,
        range: rangeFor(line, match.index, 14),
        explanation:
          'document.write inserts HTML into the document stream. If called after ' +
          'the page loaded, it wipes the existing document. Use DOM APIs ' +
          '(createElement/append) or textContent instead.',
        suggestion: { title: 'Use DOM APIs to update the page' },
      })
    }
    return findings
  },
}

/**
 * typeof undefined comparison. `typeof x === "undefined"` is fine, but
 * comparing a variable to undefined with == is the loose-equality trap.
 * Here we flag `== undefined` / `!= undefined` specifically (not ===).
 */
const looseUndefinedAnalyzer: Analyzer = {
  id: 'js-no-loose-undefined',
  label: 'Loose undefined comparison',
  category: 'bug',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /(^|[^=!])(==|!=)\s*undefined/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-no-loose-undefined',
        category: 'bug',
        severity: 'medium',
        message: `Loose comparison with undefined.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'null == undefined is true under loose equality, which is rarely the ' +
          'intent. Prefer === undefined or === null to be explicit.',
        suggestion: { title: 'Use === undefined or === null' },
      })
    }
    return findings
  },
}

export const JAVASCRIPT_ANALYZERS: Analyzer[] = [
  looseEqualityAnalyzer,
  varAnalyzer,
  debuggerAnalyzer,
  evalAnalyzer,
  todoAnalyzer,
  emptyCatchAnalyzer,
  documentWriteAnalyzer,
  looseUndefinedAnalyzer,
]
