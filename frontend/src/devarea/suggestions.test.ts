/**
 * Developer Area — suggestions (refactor, tests, compare, explain) tests.
 */
import { describe, it, expect } from 'vitest'
import { suggestRefactors } from './suggestions/refactor'
import { generateTests } from './suggestions/tests'
import { compareLanguages, comparisonSuggestions } from './suggestions/compare'
import { explainCode } from './suggestions/explain'

describe('suggestRefactors', () => {
  it('suggests for-of for index-based array loop', () => {
    const code = `for (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}`
    const suggestions = suggestRefactors({ code, languageId: 'javascript' })
    expect(suggestions.some((s) => s.id === 'js-for-of-simplify')).toBe(true)
  })

  it('suggests template literal for string concatenation', () => {
    const code = `var msg = "Hello, " + name + "!";`
    const suggestions = suggestRefactors({ code, languageId: 'javascript' })
    expect(suggestions.some((s) => s.id === 'js-template-literal')).toBe(true)
  })

  it('detects magic numbers', () => {
    const code = `const day = 86400;`
    const suggestions = suggestRefactors({ code, languageId: 'typescript' })
    expect(suggestions.some((s) => s.id.startsWith('magic-number'))).toBe(true)
  })

  it('flags long functions', () => {
    const lines = Array.from({ length: 30 }, (_, i) => `  let x${i} = ${i};`)
    const code = `function big() {\n${lines.join('\n')}\n}`
    const suggestions = suggestRefactors({ code, languageId: 'javascript' })
    expect(suggestions.some((s) => s.id === 'long-function')).toBe(true)
  })
})

describe('generateTests', () => {
  it('generates a test per detected Python function', () => {
    const code = `def add(a, b):\n    return a + b\n\ndef sub(a, b):\n    return a - b`
    const tests = generateTests({ code, languageId: 'python' })
    expect(tests.length).toBe(2)
    expect(tests[0].title).toBe('test_add')
    expect(tests[0].code).toContain('def test_add')
  })

  it('generates a test per detected JS function', () => {
    const code = `function greet(name) { return name; }`
    const tests = generateTests({ code, languageId: 'javascript' })
    expect(tests.length).toBe(1)
    expect(tests[0].title).toBe('greet works')
    expect(tests[0].code).toContain("test('greet works'")
  })

  it('returns empty for no functions', () => {
    const code = `const x = 1;`
    const tests = generateTests({ code, languageId: 'javascript' })
    expect(tests).toEqual([])
  })
})

describe('compareLanguages', () => {
  it('compares Python function def to JS', () => {
    const code = `def greet(name):\n    return name`
    const results = compareLanguages({ code, languageId: 'python' }, 'javascript')
    expect(results.length).toBeGreaterThan(0)
    const fnResult = results.find((r) => r.pattern === 'Function definition')
    expect(fnResult).toBeDefined()
    expect(fnResult!.targetSnippet).toContain('function greet')
  })

  it('compares JS template literal to Python f-string', () => {
    const code = 'const msg = `Hello ${name}!`;'
    const results = compareLanguages({ code, languageId: 'javascript' }, 'python')
    const interp = results.find((r) => r.pattern === 'String interpolation')
    expect(interp).toBeDefined()
    expect(interp!.targetSnippet).toContain('f"')
  })

  it('returns empty when comparing to the same language', () => {
    const code = `def f(): pass`
    const results = compareLanguages({ code, languageId: 'python' }, 'python')
    expect(results).toEqual([])
  })

  it('comparisonSuggestions wraps as RefactorSuggestion', () => {
    const code = `def greet(name):\n    return name`
    const suggestions = comparisonSuggestions({ code, languageId: 'python' }, 'javascript')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.every((s) => s.category === 'comparison')).toBe(true)
  })
})

describe('explainCode', () => {
  it('explains a Python function', () => {
    const code = `def greet(name):\n    if name:\n        return "hi " + name\n    return "hi"`
    const explanation = explainCode({ code, languageId: 'python' })
    expect(explanation.blocks.length).toBe(1)
    expect(explanation.blocks[0].heading).toBe('Function: greet')
    expect(explanation.summary).toContain('greet')
  })

  it('explains a JS function', () => {
    const code = `function add(a, b) {\n  return a + b;\n}`
    const explanation = explainCode({ code, languageId: 'javascript' })
    expect(explanation.blocks[0].heading).toBe('Function: add')
    expect(explanation.summary).toContain('add')
  })

  it('handles script-level code with no functions', () => {
    const code = `const x = 1;\nconst y = 2;`
    const explanation = explainCode({ code, languageId: 'javascript' })
    expect(explanation.blocks[0].heading).toBe('Script-level code')
  })

  it('detects branching purpose in function body', () => {
    const code = `function check(x) {\n  if (x > 0) {\n    return true;\n  }\n  return false;\n}`
    const explanation = explainCode({ code, languageId: 'javascript' })
    expect(explanation.blocks[0].text).toContain('branch')
  })
})
