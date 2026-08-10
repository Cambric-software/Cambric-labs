/**
 * Cambric Labs — Developer Area: Language Comparison
 *
 * Produces cross-language comparisons for a snippet's apparent idiom, so a
 * learner can see how the same intent reads in another language. This is
 * heuristic: it recognizes a few common patterns (function definition,
 * string interpolation, loop over range, map literal) and shows the
 * equivalent form in the target language.
 *
 * Deliberately small and pattern-based — no AST. The goal is teaching
 * transfer, not perfect translation.
 */
import type { AnalysisInput, RefactorSuggestion } from '../types'

export interface ComparisonResult {
  sourceLanguage: string
  targetLanguage: string
  pattern: string
  sourceSnippet: string
  targetSnippet: string
  note: string
}

interface Pattern {
  id: string
  label: string
  /** Regex tested against the source; first match wins. */
  detect: RegExp
  /** Produces the equivalent in the target language from the match. */
  translate: (match: RegExpExecArray, target: string) => string
}

const PATTERNS: Pattern[] = [
  {
    id: 'py-function-def',
    label: 'Function definition',
    detect: /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^\s:]+))?\s*:/,
    translate(match, target) {
      const name = match[1]
      const params = match[2]
      if (target === 'typescript' || target === 'javascript') {
        return `function ${name}(${params}) {\n  // ...\n}`
      }
      return match[0]
    },
  },
  {
    id: 'js-function-decl',
    label: 'Function declaration',
    detect: /function\s+(\w+)\s*\(([^)]*)\)\s*\{/,
    translate(match, target) {
      const name = match[1]
      const params = match[2]
      if (target === 'python') {
        return `def ${name}(${params}):\n    # ...`
      }
      return match[0]
    },
  },
  {
    id: 'py-f-string',
    label: 'String interpolation',
    detect: /f["']([^"']*)\{(\w+)\}([^"']*)["']/,
    translate(match, target) {
      const prefix = match[1]
      const expr = match[2]
      const suffix = match[3]
      if (target === 'typescript' || target === 'javascript') {
        return `\`${prefix}\${${expr}}${suffix}\``
      }
      return match[0]
    },
  },
  {
    id: 'js-template-literal',
    label: 'String interpolation',
    detect: /`([^`]*)\$\{(\w+)\}([^`]*)`/,
    translate(match, target) {
      const prefix = match[1]
      const expr = match[2]
      const suffix = match[3]
      if (target === 'python') {
        return `f"${prefix}{${expr}}${suffix}"`
      }
      return match[0]
    },
  },
  {
    id: 'py-for-range',
    label: 'Loop over a range',
    detect: /for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*:/,
    translate(match, target) {
      const varName = match[1]
      const rangeArgs = match[2].split(',').map((s) => s.trim())
      const start = rangeArgs[0] ?? '0'
      const stop = rangeArgs[1] ?? rangeArgs[0] ?? 'n'
      if (target === 'typescript' || target === 'javascript') {
        return `for (let ${varName} = ${start}; ${varName} < ${stop}; ${varName}++) {\n  // ...\n}`
      }
      return match[0]
    },
  },
  {
    id: 'py-dict-literal',
    label: 'Map / dictionary literal',
    detect: /\{\s*"(\w+)"\s*:\s*([^,}]+)/,
    translate(match, target) {
      const key = match[1]
      const value = match[2].trim()
      if (target === 'typescript' || target === 'javascript') {
        return `{ ${key}: ${value} }`
      }
      return match[0]
    },
  },
  {
    id: 'js-object-literal',
    label: 'Object / map literal',
    detect: /\{\s*(\w+)\s*:\s*([^,}]+)/,
    translate(match, target) {
      const key = match[1]
      const value = match[2].trim()
      if (target === 'python') {
        return `{ "${key}": ${value} }`
      }
      return match[0]
    },
  },
]

export function compareLanguages(
  input: AnalysisInput,
  targetLanguage: string,
): ComparisonResult[] {
  if (input.languageId === targetLanguage) return []
  const results: ComparisonResult[] = []
  for (const pattern of PATTERNS) {
    const m = pattern.detect.exec(input.code)
    if (m) {
      results.push({
        sourceLanguage: input.languageId,
        targetLanguage,
        pattern: pattern.label,
        sourceSnippet: m[0],
        targetSnippet: pattern.translate(m, targetLanguage),
        note: `The same intent in ${targetLanguage}. Syntax differs; the concept transfers.`,
      })
    }
  }
  return results
}

/** Wrap as RefactorSuggestion so the UI can list comparisons alongside refactors. */
export function comparisonSuggestions(input: AnalysisInput, targetLanguage: string): RefactorSuggestion[] {
  return compareLanguages(input, targetLanguage).map((r, i) => ({
    id: `compare-${r.sourceLanguage}-to-${r.targetLanguage}-${i}`,
    title: `${r.pattern}: ${r.sourceLanguage} → ${r.targetLanguage}`,
    category: 'comparison',
    rationale: r.note,
    before: r.sourceSnippet,
    after: r.targetSnippet,
    effort: 'trivial',
  }))
}
