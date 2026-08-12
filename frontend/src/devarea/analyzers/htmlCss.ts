/**
 * Cambric Labs — Developer Area: HTML & CSS Analyzers
 *
 * Static rules for markup and styles. HTML findings focus on accessibility
 * and integrity; CSS findings focus on maintainability and performance.
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

/** <img> without an alt attribute — breaks screen readers and SEO. */
const imgWithoutAltAnalyzer: Analyzer = {
  id: 'html-img-needs-alt',
  label: 'img needs alt',
  category: 'gap',
  supportedLanguages: ['html'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /<img\b[^>]*>/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      if (!/\balt\s*=/.test(match[0])) {
        const line = lineOf(code, match.index)
        findings.push({
          ruleId: 'html-img-needs-alt',
          category: 'gap',
          severity: 'medium',
          message: `<img> is missing an alt attribute.`,
          range: rangeForLine(line, match[0].length),
          explanation:
            'The alt attribute describes an image for screen readers (used ' +
            'by visually impaired users) and when the image fails to load. ' +
            'A missing alt makes content inaccessible. Use alt="" for ' +
            'decorative images.',
          suggestion: { title: 'Add a descriptive alt attribute' },
        })
      }
    }
    return findings
  },
}

/** Inline style attributes — hard to maintain and override. */
const inlineStyleAnalyzer: Analyzer = {
  id: 'html-avoid-inline-style',
  label: 'Avoid inline style',
  category: 'maintainability',
  supportedLanguages: ['html'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /\bstyle\s*=\s*["'][^"']+["']/gi
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'html-avoid-inline-style',
        category: 'maintainability',
        severity: 'low',
        message: `Inline style attribute is hard to maintain.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          'Inline styles mix presentation with structure and cannot be ' +
          'overridden cleanly with CSS classes. Move the styling to a class ' +
          'in a stylesheet so it can be reused and themed.',
        suggestion: { title: 'Move the style to a CSS class' },
      })
    }
    return findings
  },
}

/** !important overuse — indicates a specificity battle. */
const importantAnalyzer: Analyzer = {
  id: 'css-avoid-important',
  label: 'Avoid !important',
  category: 'maintainability',
  supportedLanguages: ['css'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /!important/gi
    let match: RegExpExecArray | null
    let count = 0
    while ((match = regex.exec(code)) !== null && count < 3) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'css-avoid-important',
        category: 'maintainability',
        severity: 'low',
        message: `!important overrides specificity.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          '!important forces a declaration to win the cascade regardless of ' +
          'specificity. When overused it creates a specificity arms race that ' +
          'makes styles impossible to override cleanly. Fix the selector ' +
          'specificity instead of forcing the issue.',
        suggestion: { title: 'Increase selector specificity instead' },
      })
      count++
    }
    return findings
  },
}

/** A CSS rule with an empty body — does nothing, likely a typo. */
const emptyRuleAnalyzer: Analyzer = {
  id: 'css-empty-rule',
  label: 'Empty rule',
  category: 'gap',
  supportedLanguages: ['css'],
  analyze({ code }: AnalysisInput): Finding[] {
    const findings: Finding[] = []
    const regex = /[^{}]+\{\s*\}/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const line = lineOf(code, match.index)
      findings.push({
        ruleId: 'css-empty-rule',
        category: 'gap',
        severity: 'low',
        message: `Empty CSS rule does nothing.`,
        range: rangeForLine(line, match[0].length),
        explanation:
          'A CSS rule with no declarations has no effect. It is usually a ' +
          'leftover from refactoring or a typo. Remove it or fill in the ' +
          'intended properties.',
        suggestion: { title: 'Remove the empty rule' },
      })
    }
    return findings
  },
}

export const HTML_ANALYZERS: Analyzer[] = [imgWithoutAltAnalyzer, inlineStyleAnalyzer]
export const CSS_ANALYZERS: Analyzer[] = [importantAnalyzer, emptyRuleAnalyzer]
