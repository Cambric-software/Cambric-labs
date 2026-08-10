/**
 * Cambric Labs — Developer Area: Code Explanation Engine
 *
 * Produces a structured, plain-language explanation of what a code snippet
 * DOES — independent of finding bugs. This is the "explain" capability
 * requested by the Developer Area spec: it walks through functions, control
 * flow, loops, and returns to build a human-readable summary.
 *
 * Heuristic and language-aware (Python, JS/TS, Java/C/C++/Go/Rust syntax
 * families). No AST, no execution — just pattern recognition that produces
 * genuinely useful prose.
 */
import type { AnalysisInput } from '../types'

export interface ExplanationBlock {
  /** Heading like "Function: greet" or "Loop". */
  heading: string
  /** 1-3 sentence explanation of this construct. */
  text: string
  /** Optional code excerpt the explanation refers to. */
  excerpt?: string
}

export interface CodeExplanation {
  languageId: string
  /** One-line summary of the whole snippet. */
  summary: string
  blocks: ExplanationBlock[]
}

interface DetectedFunction {
  name: string
  params: string[]
  returnType?: string
  body: string
  startLine: number
}

/** Detect function definitions across language families. */
function detectFunctions(code: string, languageId: string): DetectedFunction[] {
  const fns: DetectedFunction[] = []
  const lines = code.split('\n')

  if (languageId === 'python') {
    const regex = /def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^\s:]+))?\s*:/
    let m: RegExpExecArray | null
    const globalRe = new RegExp(regex.source, 'g')
    while ((m = globalRe.exec(code)) !== null) {
      const startLine = code.slice(0, m.index).split('\n').length
      const params = m[2].split(',').map((p) => p.split(':')[0].split('=')[0].trim()).filter((p) => p && p !== 'self')
      // Body = indented lines after def
      const bodyLines: string[] = []
      for (let i = startLine; i < lines.length; i++) {
        const ln = lines[i]
        if (i === startLine - 1) continue
        if (ln.trim() === '') { bodyLines.push(ln); continue }
        if (/^\s/.test(ln)) bodyLines.push(ln)
        else break
      }
      fns.push({ name: m[1], params, returnType: m[3], body: bodyLines.join('\n'), startLine })
    }
  } else {
    // C-family: function name(params) { ... }
    const regex = /function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*(\w+))?\s*\{|(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*([^{]+))?\s*\{|(\w+)\s+(\w+)\s*\(([^)]*)\)\s*\{/
    const globalRe = new RegExp(regex.source, 'g')
    let m: RegExpExecArray | null
    while ((m = globalRe.exec(code)) !== null) {
      const name = m[1] || m[4] || m[7]
      const params = (m[2] || m[5] || m[8] || '').split(',').map((p) => p.trim()).filter(Boolean)
      const returnType = m[3] || m[6] || (m[7] ? m[7] : undefined)
      const startLine = code.slice(0, m.index).split('\n').length
      // Body = lines until matching close brace (simplified: count braces)
      const bodyLines: string[] = []
      let depth = 0
      for (let i = startLine - 1; i < lines.length; i++) {
        bodyLines.push(lines[i])
        depth += (lines[i].match(/{/g) || []).length
        depth -= (lines[i].match(/}/g) || []).length
        if (depth <= 0 && i > startLine - 1) break
      }
      fns.push({ name, params, returnType: returnType?.trim(), body: bodyLines.join('\n'), startLine })
    }
  }
  return fns
}

/** Infer the purpose of a function body from its contents. */
function inferPurpose(body: string): string {
  const lower = body.toLowerCase()
  if (/return\s/.test(body) && /if\s*\(|if\s+/.test(body)) {
    return 'It branches on a condition and returns a value based on it.'
  }
  if (/for\s*\(|for\s+\w+\s+in|while\s*\(/.test(body)) {
    return 'It loops over a collection or range, processing each element.'
  }
  if (/print|console\.log|echo|println|printf|cout/.test(lower)) {
    return 'It produces output (printing or logging).'
  }
  if (/return\s+\w+/.test(body)) {
    return 'It computes and returns a value.'
  }
  if (/append|push|insert|add/.test(lower)) {
    return 'It modifies a collection by adding elements.'
  }
  if (/sort|filter|map|reduce/.test(lower)) {
    return 'It transforms a collection (sort, filter, map, or reduce).'
  }
  return 'It performs a sequence of operations on its inputs.'
}

/** Count control-flow constructs for a high-level shape summary. */
function describeShape(code: string): string {
  const ifs = (code.match(/\bif\b/g) || []).length
  const loops = (code.match(/\bfor\b|\bwhile\b/g) || []).length
  const parts: string[] = []
  if (ifs > 0) parts.push(`${ifs} conditional branch${ifs > 1 ? 'es' : ''}`)
  if (loops > 0) parts.push(`${loops} loop${loops > 1 ? 's' : ''}`)
  return parts.length ? `It contains ${parts.join(' and ')}.` : 'It is a straight-line sequence with no branching.'
}

/** Main entry: explain a code snippet. */
export function explainCode(input: AnalysisInput): CodeExplanation {
  const { code, languageId } = input
  const fns = detectFunctions(code, languageId)
  const blocks: ExplanationBlock[] = []

  if (fns.length === 0) {
    // No functions detected — explain the script-level flow
    blocks.push({
      heading: 'Script-level code',
      text: describeShape(code) + ' This snippet runs top-to-bottom without ' +
        'wrapping logic in a named function.',
      excerpt: code.split('\n').slice(0, 5).join('\n') + (code.split('\n').length > 5 ? '\n...' : ''),
    })
    return { languageId, summary: 'A script with no function definitions.', blocks }
  }

  for (const fn of fns) {
    const purpose = inferPurpose(fn.body)
    const paramStr = fn.params.length ? ` It takes ${fn.params.length} parameter${fn.params.length > 1 ? 's' : ''} (${fn.params.join(', ')}).` : ' It takes no parameters.'
    const returnStr = fn.returnType ? ` It is declared to return ${fn.returnType}.` : ''
    blocks.push({
      heading: `Function: ${fn.name}`,
      text: paramStr + returnStr + ' ' + purpose,
      excerpt: fn.body.split('\n').slice(0, 6).join('\n'),
    })
  }

  const summary = fns.length === 1
    ? `Defines one function (${fns[0].name}) that ${inferPurpose(fns[0].body).toLowerCase().replace('it ', '')}`
    : `Defines ${fns.length} functions: ${fns.map((f) => f.name).join(', ')}.`

  return { languageId, summary, blocks }
}
