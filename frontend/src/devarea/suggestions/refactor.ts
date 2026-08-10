/**
 * Cambric Labs — Developer Area: Refactoring & Simplification Engine
 *
 * Produces higher-level suggestions beyond per-finding fixes: it identifies
 * structural patterns that can be made simpler or clearer, and explains the
 * reasoning. Heuristic and language-aware; never executes code.
 */
import type { AnalysisInput, RefactorSuggestion } from '../types'

/** Detect a JS for-loop over an array that could be a for-of / forEach. */
function jsForIndexOverArray(code: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const regex = /for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(\w+)\.length\s*;\s*\1\+\+\s*\)\s*\{([^}]*)\}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    const idx = match[1]
    const arr = match[2]
    const body = match[3]
    if (body.includes(`${arr}[${idx}]`)) {
      suggestions.push({
        id: 'js-for-of-simplify',
        title: 'Simplify array loop to for-of',
        category: 'simplification',
        rationale:
          `You index ${arr}[${idx}] inside a manual counter loop. A for-of loop ` +
          `reads each element directly, removing the index bookkeeping and the ` +
          `off-by-one risk entirely.`,
        before: match[0],
        after: `for (const item of ${arr}) {\n  // use item\n}`,
        effort: 'trivial',
      })
    }
  }
  return suggestions
}

/** Detect repeated string concatenation that could be a template literal. */
function jsTemplateLiteral(code: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  // "a" + b + "c" style chains (at least two + with a string operand)
  const regex = /"([^"]*)"\s*\+\s*(\w+)\s*\+\s*"([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    suggestions.push({
      id: 'js-template-literal',
      title: 'Use a template literal',
      category: 'simplification',
      rationale:
        'Chaining + between strings and variables is noisy and error-prone. A ' +
        'template literal interpolates values with ${}, making intent clear.',
      before: match[0],
      after: `\`${match[1]}\${${match[2]}}${match[3]}\``,
      effort: 'trivial',
    })
  }
  return suggestions
}

/** Detect a long-ish function (heuristic: many statements) — maintainability. */
function longFunction(code: string, languageId: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const defKeyword = languageId === 'python' ? 'def' : 'function'
  const regex = new RegExp(`${defKeyword}\\s+(\\w+)\\s*\\([^)]*\\)\\s*[:{]`, 'g')
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    // Count statements (lines ending with ; or :) as a rough proxy.
    const rest = code.slice(match.index)
    const stmtCount = (rest.match(/[;}]\s*\n/g) || rest.match(/:\s*\n/g) || []).length
    if (stmtCount > 25) {
      suggestions.push({
        id: 'long-function',
        title: `Function ${match[1]} is long (${stmtCount}+ statements)`,
        category: 'refactor',
        rationale:
          'A function doing many things is hard to test and reason about. ' +
          'Extract cohesive groups of statements into named helper functions so ' +
          'each does one thing and has a clear contract.',
        effort: 'medium',
      })
    }
  }
  return suggestions
}

/** Detect magic numbers that would benefit from named constants. */
function magicNumbers(code: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const regex = /(?<![.\w])\b(86400|3600|1000|3\.14159|2\.71828)\b/g
  let match: RegExpExecArray | null
  let count = 0
  while ((match = regex.exec(code)) !== null && count < 5) {
    const names: Record<string, string> = {
      '86400': 'SECONDS_PER_DAY',
      '3600': 'SECONDS_PER_HOUR',
      '1000': 'MS_PER_SECOND',
      '3.14159': 'Math.PI',
      '2.71828': 'Math.E',
    }
    suggestions.push({
      id: `magic-number-${count}`,
      title: `Replace magic number ${match[0]} with a named constant`,
      category: 'refactor',
      rationale:
        'A bare number hides its meaning. Naming it (e.g. SECONDS_PER_DAY) makes ' +
        'intent obvious and centralizes the value if it ever changes.',
      before: match[0],
      after: names[match[0]] ?? `NAMED_CONSTANT`,
      effort: 'trivial',
    })
    count++
  }
  return suggestions
}

/** Detect obvious duplicate adjacent lines (copy-paste smell). */
function duplicateLines(code: string): RefactorSuggestion[] {
  const suggestions: RefactorSuggestion[] = []
  const lines = code.split('\n')
  const seen = new Map<string, number>()
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.length < 8) continue
    const prev = seen.get(trimmed)
    if (prev !== undefined && i - prev <= 3) {
      suggestions.push({
        id: `dup-line-${i}`,
        title: 'Near-duplicate lines detected',
        category: 'refactor',
        rationale:
          'Two almost-identical lines close together often signal copy-paste that ' +
          'could be a loop or a helper. Consider extracting the shared shape.',
        before: lines[prev],
        after: '// extract a helper or loop over the values',
        effort: 'low',
      })
    }
    seen.set(trimmed, i)
  }
  return suggestions
}

/** Main entry: gather all refactor/simplification suggestions for an input. */
export function suggestRefactors(input: AnalysisInput): RefactorSuggestion[] {
  const { code, languageId } = input
  const suggestions: RefactorSuggestion[] = []
  if (languageId === 'javascript' || languageId === 'typescript') {
    suggestions.push(...jsForIndexOverArray(code))
    suggestions.push(...jsTemplateLiteral(code))
  }
  suggestions.push(...longFunction(code, languageId))
  suggestions.push(...magicNumbers(code))
  suggestions.push(...duplicateLines(code))
  return suggestions
}
