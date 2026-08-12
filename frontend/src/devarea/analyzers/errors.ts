/**
 * Cambric Labs — Developer Area: Error-Detection Analyzers
 *
 * The 'error' category catches issues that will prevent the code from
 * running at all (syntax errors, unbalanced delimiters, undefined
 * references at parse time) — distinct from 'bug' (code runs but is
 * wrong). These analyzers detect problems a compiler/interpreter would
 * reject before execution.
 *
 * Heuristic, text-based, no full parser dependency — runs instantly and
 * stays memory-bounded. False positives are possible on edge cases; the
 * explanations teach the underlying rule so users learn the syntax.
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

/** Languages with brace-delimited blocks and string literals using ", ', ` */
const BRACE_LANGS = ['javascript', 'typescript', 'java', 'c', 'cpp', 'rust', 'go', 'php', 'css']

/**
 * Unbalanced braces, brackets, or parentheses. A mismatched delimiter is a
 * syntax error in every brace-language. Walks the source tracking nesting
 * depth, ignoring delimiters inside string and char literals.
 */
const unbalancedDelimitersAnalyzer: Analyzer = {
  id: 'common-unbalanced-delimiters',
  label: 'Unbalanced delimiters',
  category: 'error',
  supportedLanguages: BRACE_LANGS,
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const stack: { ch: string; line: number; col: number }[] = []
    let i = 0
    let line = 1
    let col = 0
    let inString: '"' | "'" | '`' | null = null
    let inLineComment = false
    let inBlockComment = false

    while (i < code.length) {
      const c = code[i]
      const next = code[i + 1] ?? ''

      if (c === '\n') {
        line++
        col = 0
        inLineComment = false
        i++
        continue
      }
      col++

      // comments take precedence over strings (except for the closer)
      if (inLineComment) { i++; continue }
      if (inBlockComment) {
        if (c === '*' && next === '/') { inBlockComment = false; i += 2; col++; continue }
        i++; continue
      }
      if (!inString) {
        if (c === '/' && next === '/') { inLineComment = true; i += 2; col++; continue }
        if (c === '/' && next === '*') { inBlockComment = true; i += 2; col++; continue }
      }

      // string literals
      if (inString) {
        if (c === '\\') { i += 2; col++; continue } // escape
        if (c === inString) { inString = null; i++; continue }
        i++; continue
      } else {
        if (c === '"' || c === "'" || c === '`') { inString = c; i++; continue }
      }

      if (c === '{' || c === '[' || c === '(') {
        stack.push({ ch: c, line, col })
      } else if (c === '}' || c === ']' || c === ')') {
        const open = stack.pop()
        const expected = c === '}' ? '{' : c === ']' ? '[' : '('
        if (!open || open.ch !== expected) {
          findings.push({
            ruleId: 'common-unbalanced-delimiters',
            category: 'error',
            severity: 'critical',
            message: `Unbalanced '${c}' — no matching opener found.`,
            range: rangeFor(line, col - 1, 1),
            explanation:
              `A closing '${c}' appears without a matching '${expected}'. ` +
              'The parser will reject this as a syntax error; the code ' +
              'cannot run until delimiters are balanced. Check for a ' +
              'missing or extra opener earlier in the file.',
            suggestion: { title: `Add or remove the matching '${expected}'` },
          })
          break // one mismatch reported; further scanning is unreliable
        }
      }
      i++
    }

    if (inString) {
      findings.push({
        ruleId: 'common-unbalanced-delimiters',
        category: 'error',
        severity: 'critical',
        message: `Unterminated string literal — no closing quote.`,
        range: rangeFor(line, 0, 1),
        explanation:
          'A string literal was opened but never closed before end of ' +
          'input. The parser treats everything after the opening quote as ' +
          'string content, then fails. Close the string with the matching ' +
          'quote, or escape internal quotes.',
        suggestion: { title: 'Add the closing quote' },
      })
    }
    if (inBlockComment) {
      findings.push({
        ruleId: 'common-unbalanced-delimiters',
        category: 'error',
        severity: 'critical',
        message: `Unterminated block comment — no closing */`,
        range: rangeFor(line, 0, 1),
        explanation:
          'A block comment was opened with /* but never closed. ' +
          'Everything after the opener is treated as comment, and the ' +
          'parser reaches end-of-input inside the comment. Close it with */.',
        suggestion: { title: 'Add the closing */' },
      })
    }
    for (const unclosed of stack) {
      const closer = unclosed.ch === '{' ? '}' : unclosed.ch === '[' ? ']' : ')'
      findings.push({
        ruleId: 'common-unbalanced-delimiters',
        category: 'error',
        severity: 'critical',
        message: `Unbalanced '${unclosed.ch}' — no matching '${closer}'.`,
        range: rangeFor(unclosed.line, unclosed.col - 1, 1),
        explanation:
          `An opening '${unclosed.ch}' on line ${unclosed.line} was never ` +
          `closed with '${closer}'. The parser reports a syntax error at ` +
          'end of input. Add the missing closer.',
        suggestion: { title: `Add the closing '${closer}'` },
      })
    }
    return findings
  },
}

/**
 * Python indentation inconsistency. Python uses indentation as syntax;
 * inconsistent dedent/indent within a block (mixing tabs and spaces, or
 * an unexpected dedent) is a syntax error (IndentationError).
 * Here we flag lines that mix tabs and spaces in leading whitespace.
 */
const pythonIndentationAnalyzer: Analyzer = {
  id: 'py-tab-space-mix',
  label: 'Mixed tab/space indentation',
  category: 'error',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const indent = lines[i].match(/^[ \t]*/)?.[0] ?? ''
      if (indent.length > 0 && /\t/.test(indent) && / /.test(indent)) {
        findings.push({
          ruleId: 'py-tab-space-mix',
          category: 'error',
          severity: 'high',
          message: 'Indentation mixes tabs and spaces.',
          range: rangeFor(i + 1, 0, indent.length),
          explanation:
            'Python treats a tab as moving to the next 8-column tab stop, ' +
            'so mixing tabs and spaces in the same block produces ' +
            'inconsistent nesting that the parser rejects as IndentationError. ' +
            'Use only spaces (PEP 8 recommends 4) or only tabs, never both.',
          suggestion: { title: 'Use only spaces for indentation', rationale: 'PEP 8: spaces are preferred; 4 per level.' },
        })
      }
    }
    return findings
  },
}

/**
 * JavaScript/TypeScript: trailing comma in function parameters or a stray
 * comma at the start of an array/object literal. A leading comma in an
 * array or object literal is a syntax error (ReferenceError or parse fail).
 */
const leadingCommaAnalyzer: Analyzer = {
  id: 'js-leading-comma',
  label: 'Leading comma in literal',
  category: 'error',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // [, or {, or (,  — a comma right after an opening delimiter
    const regex = /[\[{(]\s*,/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'js-leading-comma',
        category: 'error',
        severity: 'high',
        message: 'Leading comma in array/object/params.',
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'A comma immediately after an opening bracket is a syntax error: ' +
          'there is nothing before the comma to separate. Remove the ' +
          'leading comma. (Trailing commas are allowed; leading are not.)',
        suggestion: { title: 'Remove the leading comma' },
      })
    }
    return findings
  },
}

/**
 * Python: `return` outside a function. At module level `return` is a
 * SyntaxError. Heuristic: flag a `return` whose line has no greater
 * indentation than a recent `def` at column 0.
 */
const pyReturnOutsideFunctionAnalyzer: Analyzer = {
  id: 'py-return-outside-function',
  label: 'Return outside function',
  category: 'error',
  supportedLanguages: ['python'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const lines = code.split('\n')
    let inDef = false
    let defIndent = -1
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      if (raw.trim() === '' || raw.trimStart().startsWith('#')) continue
      const indent = raw.match(/^[ \t]*/)?.[0].length ?? 0
      const trimmed = raw.trim()
      if (trimmed.startsWith('def ') || trimmed.startsWith('async def ')) {
        inDef = true
        defIndent = indent
        continue
      }
      // dedent to or below the def means we left the function
      if (inDef && indent <= defIndent && !trimmed.startsWith('def')) {
        inDef = false
      }
      if (trimmed.startsWith('return') && !inDef) {
        findings.push({
          ruleId: 'py-return-outside-function',
          category: 'error',
          severity: 'critical',
          message: '`return` outside a function.',
          range: rangeFor(i + 1, 0, 6),
          explanation:
            '`return` at module level is a SyntaxError — there is no ' +
            'caller to return to. Move the statement inside a function, ' +
            'or replace it with a module-level expression if you meant ' +
            'to produce a value.',
          suggestion: { title: 'Move return inside a def block' },
        })
      }
    }
    return findings
  },
}

/**
 * JavaScript/TypeScript: duplicate parameter names in a function. `function f(a, a)` is a SyntaxError
 * in strict mode and a silent bug otherwise.
 */
const duplicateParamAnalyzer: Analyzer = {
  id: 'js-duplicate-params',
  label: 'Duplicate parameter names',
  category: 'error',
  supportedLanguages: ['javascript', 'typescript'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // match function (...) or (...) =>  param lists
    const fnRegex = /(?:function\s*\w*|const\s+\w+\s*=\s*|(?:async\s+)?(?:\([^)]*\)|\w+)\s*=>)\s*\(([^)]*)\)/g
    let fnMatch: RegExpExecArray | null
    while ((fnMatch = fnRegex.exec(code)) !== null) {
      const params = fnMatch[1].split(',').map((p) => p.trim().split(':')[0].trim().split('=')[0].trim()).filter(Boolean)
      const seen = new Set<string>()
      for (const p of params) {
        if (seen.has(p)) {
          const line = lineOf(code, fnMatch.index)
          findings.push({
            ruleId: 'js-duplicate-params',
            category: 'error',
            severity: 'high',
            message: `Duplicate parameter name '${p}'.`,
            range: rangeFor(line, 0, fnMatch[0].length),
            explanation:
              `Parameter '${p}' appears more than once in the same ` +
              'parameter list. In strict mode this is a SyntaxError; in ' +
              'sloppy mode the later binding silently shadows the earlier. ' +
              'Rename one of the parameters.',
            suggestion: { title: `Rename the duplicate parameter '${p}'` },
          })
        }
        seen.add(p)
      }
    }
    return findings
  },
}

/**
 * SQL: trailing comma in column list or values. `SELECT a, b, FROM t` and
 * `VALUES (1, 2, )` are syntax errors. Heuristic flag.
 */
const sqlTrailingCommaAnalyzer: Analyzer = {
  id: 'sql-trailing-comma',
  label: 'Trailing comma in SQL list',
  category: 'error',
  supportedLanguages: ['sql'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // a comma followed by whitespace then a closing paren or FROM/WHERE/AS/etc keyword
    const regex = /,\s*(?=[)]|\b(?:from|where|values|select|into|order|group|having)\b)/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sql-trailing-comma',
        category: 'error',
        severity: 'high',
        message: 'Trailing comma before SQL keyword or close-paren.',
        range: rangeFor(line, match.index, match[0].length),
        explanation:
          'A comma immediately before a closing paren or a clause keyword ' +
          '(FROM, WHERE, VALUES) leaves an empty element the parser does not ' +
          'expect. SQL reports a syntax error. Remove the trailing comma.',
        suggestion: { title: 'Remove the trailing comma' },
      })
    }
    return findings
  },
}

export const ERROR_ANALYZERS: Analyzer[] = [
  unbalancedDelimitersAnalyzer,
  pythonIndentationAnalyzer,
  leadingCommaAnalyzer,
  pyReturnOutsideFunctionAnalyzer,
  duplicateParamAnalyzer,
  sqlTrailingCommaAnalyzer,
]
