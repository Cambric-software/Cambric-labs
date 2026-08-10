/**
 * Cambric Labs — Developer Area: TypeScript-specific Analyzers
 *
 * Rules that only make sense for TypeScript (type annotations and compiler
 * directives). The general JS rules (loose equality, var, eval, etc.) also
 * apply to TS via the javascript analyzer's supportedLanguages; this module
 * adds type-safety-specific findings that teach *why* abandoning the type
 * checker defeats the purpose of choosing TypeScript.
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

/** `any` as an explicit type annotation — opts out of the type checker. */
const explicitAnyAnalyzer: Analyzer = {
  id: 'ts-no-explicit-any',
  label: 'No explicit any',
  category: 'maintainability',
  supportedLanguages: ['typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // : any  OR  <any>  OR  as any  — catch annotation/angle/cast forms
    const regex = /:\s*any\b|<any>|as\s+any\b/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'ts-no-explicit-any',
        category: 'maintainability',
        severity: 'medium',
        message: `Explicit \`any\` disables type checking here.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'TypeScript exists to catch type errors before runtime. Using ' +
          '`any` opts out of that safety net, so a typo or wrong shape will ' +
          'compile silently and crash later. Prefer a precise type, `unknown` ' +
          '(which forces a check before use), or a generic.',
        suggestion: { title: 'Replace any with unknown or a precise type' },
      })
    }
    return findings
  },
}

/** `@ts-ignore` / `@ts-expect-error` left in place — suppressed errors accumulate. */
const tsIgnoreAnalyzer: Analyzer = {
  id: 'ts-no-ts-ignore',
  label: 'No @ts-ignore',
  category: 'suspicious',
  supportedLanguages: ['typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /@ts-ignore|@ts-expect-error/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'ts-no-ts-ignore',
        category: 'suspicious',
        severity: 'medium',
        message: `Compiler directive \`${match[0]}\` suppresses a type error.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'Suppressing a type error hides it rather than fixing it. ' +
          '@ts-expect-error is safer than @ts-ignore because it fails the build ' +
          'if the error disappears, but either way the suppressed error should ' +
          'be fixed so the directive can be removed.',
        suggestion: { title: 'Fix the underlying type error; remove the directive' },
      })
    }
    return findings
  },
}

/** Non-null assertion `!` — asserts a value is not null/undefined with no check. */
const nonNullAssertionAnalyzer: Analyzer = {
  id: 'ts-non-null-assertion',
  label: 'Non-null assertion (!)',
  category: 'suspicious',
  supportedLanguages: ['typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // Match `x!.` or `x!` before .length etc. — exclude != and !== and !==
    const regex = /(\w)(!)(?!=)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'ts-non-null-assertion',
        category: 'suspicious',
        severity: 'low',
        message: `Non-null assertion \`!\` overrides the null check.`,
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'The `!` operator tells the compiler "trust me, this is not null" ' +
          'without any runtime check. If it is null at runtime, you get a crash. ' +
          'Prefer a guard (`if (x) {...}`) or optional chaining (`x?.prop`) so the ' +
          'null case is handled rather than asserted away.',
        suggestion: { title: 'Guard with if, or use optional chaining ?.' },
      })
    }
    return findings
  },
}

export const TYPESCRIPT_ANALYZERS: Analyzer[] = [
  explicitAnyAnalyzer,
  tsIgnoreAnalyzer,
  nonNullAssertionAnalyzer,
]
