/**
 * Cambric Labs — Developer Area: SQL Analyzers
 *
 * Static rules for SQL that catch correctness, performance, and security
 * issues. Educational framing: each finding explains *why* the pattern is
 * risky so a learner understands the data, not just the rule.
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

/** SELECT * — fetches all columns, wasting bandwidth and breaking refactors. */
const selectStarAnalyzer: Analyzer = {
  id: 'sql-no-select-star',
  label: 'Avoid SELECT *',
  category: 'performance',
  supportedLanguages: ['sql'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /SELECT\s+\*/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sql-no-select-star',
        category: 'performance',
        severity: 'medium',
        message: `SELECT * fetches every column.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          'SELECT * returns all columns, including ones you do not need. ' +
          'This wastes memory and bandwidth, and breaks code if a column is ' +
          'added or renamed later. List only the columns you use.',
        suggestion: { title: 'List explicit column names' },
      })
    }
    return findings
  },
}

/** String-concatenated SQL — classic SQL injection vector. */
const stringConcatSqlAnalyzer: Analyzer = {
  id: 'sql-injection-risk',
  label: 'SQL injection risk',
  category: 'security',
  supportedLanguages: ['sql'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // Heuristic: a WHERE clause referencing something that looks interpolated
    // e.g. WHERE name = '" + name + "'  or  WHERE id = ' || id
    const regex = /(WHERE|VALUES|SET)\s+[^;]*['"]?\s*(\+|\|\||\$\{)/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'sql-injection-risk',
        category: 'security',
        severity: 'critical',
        message: `Possible SQL injection: query built by string concatenation.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          'Building SQL by concatenating strings lets attacker-controlled ' +
          'input become part of the query. A malicious value like \' OR 1=1 -- ' +
          'can return all rows or drop a table. Use parameterized queries / ' +
          'prepared statements so values are data, never code.',
        suggestion: {
          title: 'Use a parameterized query',
          rationale: 'Bind values as parameters, not string parts.',
        },
      })
    }
    return findings
  },
}

/** SELECT without a WHERE — reads the entire table. */
const missingWhereAnalyzer: Analyzer = {
  id: 'sql-missing-where',
  label: 'Missing WHERE',
  category: 'performance',
  supportedLanguages: ['sql'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    // Match SELECT ... FROM ... ; with no WHERE before the semicolon/end
    const regex = /SELECT\s+[^;]*\sFROM\s+\w+\s*(?:;|$)/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      if (!/\bWHERE\b/i.test(match[0])) {
        const line = lineOf(code, match.index)
        findings.push({
          ruleId: 'sql-missing-where',
          category: 'performance',
          severity: 'medium',
          message: `SELECT without WHERE scans the whole table.`,
          range: rangeForLine(line, match[0].length),
          explanation:
            'A SELECT with no WHERE clause reads every row in the table. As ' +
            'the table grows this becomes catastrophically slow. Add a WHERE ' +
            'clause to limit the rows, or confirm a full scan is intended.',
          suggestion: { title: 'Add a WHERE clause to filter rows' },
        })
      }
    }
    return findings
  },
}

/** UPDATE/DELETE without WHERE — affects every row. */
const destructiveNoWhereAnalyzer: Analyzer = {
  id: 'sql-destructive-no-where',
  label: 'Destructive without WHERE',
  category: 'bug',
  supportedLanguages: ['sql'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /\b(UPDATE|DELETE)\b[^;]*(?:;|$)/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      if (!/\bWHERE\b/i.test(match[0])) {
        const line = lineOf(code, match.index)
        const stmt = match[0].trim().split(/\s/)[0].toUpperCase()
        findings.push({
          ruleId: 'sql-destructive-no-where',
          category: 'bug',
          severity: 'critical',
          message: `${stmt} without WHERE affects every row.`,
          range: rangeForLine(line, match[0].length),
          explanation:
            `A ${stmt} with no WHERE clause modifies or deletes every row in ` +
            'the table. This is almost always a mistake and can destroy data. ' +
            'Always include a WHERE clause; test it with a SELECT first.',
          suggestion: { title: 'Add a WHERE clause immediately' },
        })
      }
    }
    return findings
  },
}

export const SQL_ANALYZERS: Analyzer[] = [
  selectStarAnalyzer,
  stringConcatSqlAnalyzer,
  missingWhereAnalyzer,
  destructiveNoWhereAnalyzer,
]
