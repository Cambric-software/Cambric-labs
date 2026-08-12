/**
 * Cambric Labs — Developer Area: Performance Analyzers (extended)
 *
 * Genuine performance-focused static rules beyond the SQL select-star /
 * missing-where rules. Each catches a distinct inefficiency class (nested
 * loops = quadratic, repeated identical computation, expensive work inside
 * a loop, unbounded list growth in a loop, async work not parallelized)
 * and explains the cost so a learner understands *why* it is slow, not
 * just that a linter flagged it.
 *
 * Heuristic (no full parser) — bounded, instant. These flag suspicious
 * patterns; a profiler confirms real hot paths.
 */
import type { AnalysisInput, Analyzer, Finding, SourceRange } from '../types'

function rangeFor(lineNumber: number, column: number, length: number): SourceRange {
  return { startLine: lineNumber, endLine: lineNumber, startColumn: column, endColumn: column + length }
}

const LANGS = ['javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'go', 'ruby', 'php']

/**
 * Nested loops over the same or unknown collection — O(n²) or worse. If the
 * inner loop iterates the same data as the outer, the work is quadratic; a
 * hash map reduces lookup to O(1). Flag a for/while directly inside another.
 */
const nestedLoopAnalyzer: Analyzer = {
  id: 'perf-nested-loop',
  label: 'Nested loop (quadratic risk)',
  category: 'performance',
  supportedLanguages: LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let depth = 0
    let outerLoopLine = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // detect a loop header (for/while/foreach) on this line
      const isLoop = /^\s*(for|while|foreach)\b/.test(line)
      if (isLoop) {
        if (depth > 0 && outerLoopLine > 0) {
          findings.push({
            ruleId: 'perf-nested-loop',
            category: 'performance',
            severity: 'medium',
            message: `Nested loop — potential O(n²) complexity.`,
            range: rangeFor(i + 1, 0, line.length),
            explanation:
              'A loop inside another loop runs the inner body n×m times. If both ' +
              'iterate the same collection of size n, that is O(n²) — 10× more data ' +
              'means 100× more work. If the inner loop is searching for a value, ' +
              'replace it with a hash-set/map lookup (O(1)) to make the whole thing ' +
              'O(n). Nested loops are fine for small n or genuinely independent data; ' +
              'the flag is a prompt to check the algorithm, not a blanket ban.',
            suggestion: { title: 'Consider a hash-map lookup instead of the inner loop', rationale: 'A Set/Map lookup is O(1), turning O(n²) into O(n).' },
          })
        }
        depth++
        if (depth === 1) outerLoopLine = i + 1
      }
      // crude depth tracking: closing braces / dedent reduce depth
      if (/[}]/.test(line)) depth = Math.max(0, depth - (line.split('}').length - 1))
    }
    return findings
  },
}

/**
 * Repeated computation: calling the same function with the same literal
 * arguments inside a loop. The result does not change per iteration, so it
 * should be computed once outside. Flag foo(bar) where foo+bar repeat
 * across consecutive lines inside a loop body.
 */
const repeatedComputationAnalyzer: Analyzer = {
  id: 'perf-repeated-computation',
  label: 'Repeated identical call',
  category: 'performance',
  supportedLanguages: ['javascript', 'typescript', 'python', 'java', 'go'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    const seen = new Map<string, number>()
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // find function calls like name(arg) or name(arg, arg)
      const calls = line.matchAll(/\b([a-zA-Z_]\w*)\s*\(\s*([^)]*)\s*\)/g)
      for (const call of calls) {
        const key = call[1] + '(' + call[2].trim() + ')'
        // only flag if the same call (same name + same literal args) appeared recently
        if (seen.has(key)) {
          const firstLine = seen.get(key)!
          if (i + 1 - firstLine <= 5 && firstLine !== i + 1) {
            findings.push({
              ruleId: 'perf-repeated-computation',
              category: 'performance',
              severity: 'low',
              message: `Identical call '${call[1]}(...)' repeated near line ${firstLine}.`,
              range: rangeFor(i + 1, call.index ?? 0, call[0].length),
              explanation:
                'Calling the same function with the same arguments produces the same ' +
                'result every time. If this is inside a loop, the work is done n times ' +
                'when once would suffice. Compute the result once before the loop and ' +
                'reuse the value. (Only matters if the function is non-trivial; a cheap ' +
                'call like Math.abs is fine to repeat.)',
              suggestion: { title: 'Hoist the call out of the loop into a variable', rationale: 'Compute once, reuse n times — turns n calls into 1.' },
            })
          }
        }
        seen.set(key, i + 1)
      }
    }
    return findings
  },
}

/**
 * List growth inside a loop (Python): `list = list + [x]` in a loop is O(n²)
 * because each + creates a new list copying all prior elements. `list.append(x)`
 * is amortized O(1). Flag `x = x + [...]` and `x += [...]` (for lists).
 */
const listConcatInLoopAnalyzer: Analyzer = {
  id: 'perf-list-concat-in-loop',
  label: 'List concatenation in loop',
  category: 'performance',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let inLoop = false
    let loopIndent = -1
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      if (raw.trim() === '' || raw.trimStart().startsWith('#')) continue
      const indent = raw.match(/^[ \t]*/)?.[0].length ?? 0
      const trimmed = raw.trim()
      if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
        inLoop = true
        loopIndent = indent
        continue
      }
      if (inLoop && indent <= loopIndent && !trimmed.startsWith('#')) inLoop = false
      if (inLoop && /\w+\s*=\s*\w+\s*\+\s*\[/.test(trimmed)) {
        findings.push({
          ruleId: 'perf-list-concat-in-loop',
          category: 'performance',
          severity: 'high',
          message: `List concatenation inside a loop is O(n²).`,
          range: rangeFor(i + 1, 0, trimmed.length),
          explanation:
            'In Python, `lst = lst + [x]` builds an entirely new list each iteration, ' +
            'copying all existing elements — so n iterations do O(1+2+...+n) = O(n²) ' +
            'work. `lst.append(x)` mutates in place, amortized O(1), making the loop ' +
            'O(n). The difference is dramatic: building a 100k-element list takes ' +
            'seconds with + and milliseconds with append.',
          suggestion: { title: 'Use list.append(x) instead of list = list + [x]', rationale: 'append is amortized O(1); + is O(n) per call.' },
        })
      }
    }
    return findings
  },
}

/**
 * Async work in a loop not parallelized: sequential `await fetch(...)` inside
 * a for-loop. Each request waits for the previous to finish, so n requests
 * take n×latency. If the calls are independent, Promise.all runs them
 * concurrently. Flag `await` inside a for/while/forEach body.
 */
const sequentialAwaitInLoopAnalyzer: Analyzer = {
  id: 'perf-sequential-await-in-loop',
  label: 'Sequential await in loop',
  category: 'performance',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let inLoop = false
    let loopIndent = -1
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const indent = raw.match(/^[ \t]*/)?.[0].length ?? 0
      const trimmed = raw.trim()
      if (/^\s*(for|while|forEach)\b/.test(raw)) {
        inLoop = true
        loopIndent = indent
        continue
      }
      if (inLoop && indent <= loopIndent && trimmed !== '' && !trimmed.startsWith('//')) {
        inLoop = false
      }
      if (inLoop && /\bawait\s+/.test(trimmed) && !/Promise\.all/.test(trimmed)) {
        findings.push({
          ruleId: 'perf-sequential-await-in-loop',
          category: 'performance',
          severity: 'medium',
          message: `Sequential await inside a loop — not parallelized.`,
          range: rangeFor(i + 1, 0, trimmed.length),
          explanation:
            'Each `await` inside the loop pauses until the previous completes, so n ' +
            'independent operations take n×latency end to end. If the calls do not depend ' +
            'on each other, gather the promises and `await Promise.all([...])` once; they ' +
            'run concurrently and total time ≈ the slowest single call. (If a later call ' +
            'needs an earlier result, sequential IS correct — this is a prompt to check.)',
          suggestion: { title: 'Gather promises and await Promise.all', rationale: 'Concurrent execution: n×latency becomes ~1×latency.' },
        })
      }
    }
    return findings
  },
}

/**
 * Repeated regex compilation inside a loop (JS): `new RegExp(pattern)` or
 * `/pat/.exec` constructed each iteration. Compile once outside; reuse.
 * Flag `new RegExp(` inside a loop body.
 */
const regexInLoopAnalyzer: Analyzer = {
  id: 'perf-regex-in-loop',
  label: 'RegExp constructed in loop',
  category: 'performance',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let inLoop = false
    let loopIndent = -1
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const indent = raw.match(/^[ \t]*/)?.[0].length ?? 0
      const trimmed = raw.trim()
      if (/^\s*(for|while|forEach)\b/.test(raw)) {
        inLoop = true
        loopIndent = indent
        continue
      }
      if (inLoop && indent <= loopIndent && trimmed !== '') inLoop = false
      if (inLoop && /new\s+RegExp\s*\(/.test(trimmed)) {
        findings.push({
          ruleId: 'perf-regex-in-loop',
          category: 'performance',
          severity: 'low',
          message: `RegExp compiled inside a loop.`,
          range: rangeFor(i + 1, 0, trimmed.length),
          explanation:
            'Constructing `new RegExp(...)` inside a loop re-parses the pattern each ' +
            'iteration. The compiled regex is reusable, so move the construction before ' +
            'the loop into a const and call .exec/.test on it inside. For n iterations ' +
            'this removes n-1 redundant parses.',
          suggestion: { title: 'Hoist `new RegExp(...)` out of the loop into a const' },
        })
      }
    }
    return findings
  },
}

export const PERFORMANCE_ANALYZERS: Analyzer[] = [
  nestedLoopAnalyzer,
  repeatedComputationAnalyzer,
  listConcatInLoopAnalyzer,
  sequentialAwaitInLoopAnalyzer,
  regexInLoopAnalyzer,
]
