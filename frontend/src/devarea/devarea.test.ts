/**
 * Developer Area — engine + analyzer tests.
 *
 * Verifies the analyzer registry dispatch, JS/Python/TS rules, and the
 * cross-language common analyzers. Bounded: each analyzer gets a small
 * positive (matches) and negative (does not over-match) case.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { runAnalysis, flattenFindings, summarizeByCategory, registerAnalyzer, analyzersForLanguage } from './engine'
import { JAVASCRIPT_ANALYZERS } from './analyzers/javascript'
import { PYTHON_ANALYZERS } from './analyzers/python'
import { TYPESCRIPT_ANALYZERS } from './analyzers/typescript'
import { COMMON_ANALYZERS } from './analyzers/common'

function registerAll() {
  for (const a of [...JAVASCRIPT_ANALYZERS, ...PYTHON_ANALYZERS, ...TYPESCRIPT_ANALYZERS, ...COMMON_ANALYZERS]) {
    registerAnalyzer(a)
  }
}

describe('engine', () => {
  beforeEach(registerAll)

  it('runs JS analyzers and finds eval + var + loose equality', () => {
    const code = `var x = 1;\nif (x == 1) { eval("x++"); }`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    const rules = findings.map((f) => f.ruleId)
    expect(rules).toContain('js-no-var')
    expect(rules).toContain('js-eqeqeq')
    expect(rules).toContain('js-no-eval')
  })

  it('does not flag === as loose equality', () => {
    const code = `if (x === 1) { return; }`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'js-eqeqeq')).toBe(false)
  })

  it('detects Python mutable default argument', () => {
    const code = `def f(x=[]):\n    x.append(1)\n    return x`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'py-no-mutable-default')).toBe(true)
  })

  it('detects Python bare except', () => {
    const code = `try:\n    do()\nexcept:\n    pass`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'py-no-bare-except')).toBe(true)
    expect(findings.some((f) => f.ruleId === 'py-no-except-pass')).toBe(true)
  })

  it('detects TypeScript explicit any', () => {
    const code = `function f(x: any): any { return x as any; }`
    const results = runAnalysis({ code, languageId: 'typescript' })
    const findings = flattenFindings(results)
    const anyFindings = findings.filter((f) => f.ruleId === 'ts-no-explicit-any')
    expect(anyFindings.length).toBeGreaterThanOrEqual(2)
  })

  it('common analyzers run for go (a language with no specific analyzer)', () => {
    const code = `package main\nimport "fmt"\nfunc main() {\n  api_key := "AKIAIOSFODNN7EXAMPLE"\n  fmt.Println("hi")\n  // TODO: fix\n}`
    const results = runAnalysis({ code, languageId: 'go' })
    const findings = flattenFindings(results)
    const rules = findings.map((f) => f.ruleId)
    expect(rules).toContain('common-hardcoded-secret')
    expect(rules).toContain('common-debug-print')
    expect(rules).toContain('common-todo-marker')
  })

  it('common analyzers run for rust', () => {
    const code = `fn main() {\n  let token = "supersecret12345";\n  println!("hi");\n}`
    const results = runAnalysis({ code, languageId: 'rust' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-debug-print')).toBe(true)
  })

  it('summarizeByCategory counts correctly', () => {
    const code = `var x = 1;\nif (x == 1) { eval("x"); }`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const summary = summarizeByCategory(results)
    expect(summary.bug).toBeGreaterThanOrEqual(2) // var + eqeqeq
    expect(summary.security).toBe(1) // eval
  })

  it('does not over-match localhost in non-url context', () => {
    const code = `const name = "localhost_config"`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-localhost-url')).toBe(false)
  })

  it('detects localhost URL', () => {
    const code = `fetch("http://localhost:3000/api")`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-localhost-url')).toBe(true)
  })

  it('analyzersForLanguage returns applicable analyzers', () => {
    const jsAnalyzers = analyzersForLanguage('javascript')
    expect(jsAnalyzers.length).toBeGreaterThan(5)
    const goAnalyzers = analyzersForLanguage('go')
    expect(goAnalyzers.length).toBeGreaterThan(0)
  })

  it('a throwing analyzer does not abort the whole run', () => {
    registerAnalyzer({
      id: 'test-throwing',
      label: 'Throws',
      category: 'bug',
      supportedLanguages: ['javascript'],
      analyze() { throw new Error('boom') },
    })
    const code = `var x = 1;`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    // The throwing analyzer contributes nothing, but js-no-var still fires.
    expect(findings.some((f) => f.ruleId === 'js-no-var')).toBe(true)
  })
})
