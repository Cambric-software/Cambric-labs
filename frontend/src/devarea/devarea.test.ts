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
import { SQL_ANALYZERS } from './analyzers/sql'
import { HTML_ANALYZERS, CSS_ANALYZERS } from './analyzers/htmlCss'
import { ERROR_ANALYZERS } from './analyzers/errors'
import { SECURITY_ANALYZERS } from './analyzers/security'
import { PERFORMANCE_ANALYZERS } from './analyzers/performance'

function registerAll() {
  for (const a of [
    ...JAVASCRIPT_ANALYZERS, ...PYTHON_ANALYZERS, ...TYPESCRIPT_ANALYZERS,
    ...COMMON_ANALYZERS, ...SQL_ANALYZERS, ...HTML_ANALYZERS, ...CSS_ANALYZERS,
    ...ERROR_ANALYZERS, ...SECURITY_ANALYZERS, ...PERFORMANCE_ANALYZERS,
  ]) {
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

  it('SQL: detects SELECT * and missing WHERE', () => {
    const code = `SELECT * FROM users;`
    const results = runAnalysis({ code, languageId: 'sql' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sql-no-select-star')).toBe(true)
    expect(findings.some((f) => f.ruleId === 'sql-missing-where')).toBe(true)
  })

  it('SQL: flags DELETE without WHERE as critical bug', () => {
    const code = `DELETE FROM users;`
    const results = runAnalysis({ code, languageId: 'sql' })
    const findings = flattenFindings(results)
    const del = findings.find((f) => f.ruleId === 'sql-destructive-no-where')
    expect(del).toBeDefined()
    expect(del!.severity).toBe('critical')
  })

  it('SQL: detects string-concatenation injection risk', () => {
    const code = "SELECT * FROM users WHERE name = ' + name + '"
    const results = runAnalysis({ code, languageId: 'sql' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sql-injection-risk')).toBe(true)
  })

  it('HTML: detects img without alt', () => {
    const code = `<img src="logo.png">`
    const results = runAnalysis({ code, languageId: 'html' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'html-img-needs-alt')).toBe(true)
  })

  it('HTML: does not flag img that has alt', () => {
    const code = `<img src="logo.png" alt="Logo">`
    const results = runAnalysis({ code, languageId: 'html' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'html-img-needs-alt')).toBe(false)
  })

  it('HTML: detects inline style', () => {
    const code = `<div style="color: red;">hi</div>`
    const results = runAnalysis({ code, languageId: 'html' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'html-avoid-inline-style')).toBe(true)
  })

  it('CSS: detects !important', () => {
    const code = `.x { color: red !important; }`
    const results = runAnalysis({ code, languageId: 'css' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'css-avoid-important')).toBe(true)
  })

  it('CSS: detects empty rule', () => {
    const code = `.empty {}`
    const results = runAnalysis({ code, languageId: 'css' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'css-empty-rule')).toBe(true)
  })
})

describe('error analyzers', () => {
  beforeEach(registerAll)

  it('detects unbalanced parenthesis in JS', () => {
    const code = `function f() {\n  console.log("missing close"\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-unbalanced-delimiters' && f.category === 'error')).toBe(true)
  })

  it('does not flag balanced delimiters', () => {
    const code = `const arr = [1, 2, 3];\nconst obj = { a: 1 };`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-unbalanced-delimiters')).toBe(false)
  })

  it('ignores delimiters inside strings and comments', () => {
    const code = `const s = "a(b"; // comment with {\nconst x = [1];`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-unbalanced-delimiters')).toBe(false)
  })

  it('detects unterminated string literal in JS', () => {
    const code = `const s = "never closed`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-unbalanced-delimiters' && f.message.includes('Unterminated string'))).toBe(true)
  })

  it('detects unterminated block comment', () => {
    const code = `/* this comment never closes`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'common-unbalanced-delimiters' && f.message.includes('block comment'))).toBe(true)
  })

  it('detects leading comma in JS array literal', () => {
    const code = `const arr = [, 1, 2];`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'js-leading-comma')).toBe(true)
  })

  it('detects duplicate parameter names in JS', () => {
    const code = `function f(a, a) { return a; }`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'js-duplicate-params')).toBe(true)
  })

  it('detects Python mixed tab/space indentation', () => {
    const code = `def f():\n\t  return 1`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'py-tab-space-mix')).toBe(true)
  })

  it('does not flag pure-space Python indentation', () => {
    const code = `def f():\n    return 1`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'py-tab-space-mix')).toBe(false)
  })

  it('detects Python return outside function', () => {
    const code = `return 42`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'py-return-outside-function')).toBe(true)
  })

  it('does not flag return inside a function', () => {
    const code = `def f():\n    return 42`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'py-return-outside-function')).toBe(false)
  })

  it('detects SQL trailing comma before FROM', () => {
    const code = `SELECT a, b, FROM users`
    const results = runAnalysis({ code, languageId: 'sql' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sql-trailing-comma')).toBe(true)
  })

  it('does not flag valid SQL', () => {
    const code = `SELECT a, b FROM users`
    const results = runAnalysis({ code, languageId: 'sql' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sql-trailing-comma')).toBe(false)
  })

  it('error category is now populated for JS', () => {
    const code = `const arr = [, 1];`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const summary = summarizeByCategory(results)
    expect(summary.error).toBeGreaterThan(0)
  })
})

describe('security analyzers', () => {
  beforeEach(registerAll)

  it('detects XSS via innerHTML with dynamic content', () => {
    const code = `el.innerHTML = userInput`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-xss-innerhtml')).toBe(true)
  })

  it('does not flag innerHTML with a static string literal', () => {
    const code = `el.innerHTML = '<p>static</p>'`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-xss-innerhtml')).toBe(false)
  })

  it('detects command injection via exec with concatenation', () => {
    const code = `exec('ls ' + userInput)`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-command-injection')).toBe(true)
  })

  it('does not flag exec with a static command', () => {
    const code = `exec('ls -la')`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-command-injection')).toBe(false)
  })

  it('detects path traversal via readFile with concatenation', () => {
    const code = `fs.readFile('/data/' + req.query.name, cb)`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-path-traversal')).toBe(true)
  })

  it('does not flag readFile with a static path', () => {
    const code = `fs.readFile('/data/config.json', cb)`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-path-traversal')).toBe(false)
  })

  it('detects weak crypto MD5', () => {
    const code = `const h = crypto.createHash('md5').update(pw).digest('hex')`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-weak-crypto')).toBe(true)
  })

  it('detects weak crypto SHA1 in Python', () => {
    const code = `import hashlib\nh = hashlib.sha1(pw.encode()).hexdigest()`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-weak-crypto')).toBe(true)
  })

  it('detects open redirect', () => {
    const code = `app.get('/go', (req, res) => res.redirect(req.query.next))`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'sec-open-redirect')).toBe(true)
  })

  it('security category is populated for XSS code', () => {
    const code = `el.innerHTML = userInput`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const summary = summarizeByCategory(results)
    expect(summary.security).toBeGreaterThan(0)
  })
})

describe('performance analyzers', () => {
  beforeEach(registerAll)

  it('detects nested loop (quadratic risk) in JS', () => {
    const code = `for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    sum += a[i][j];\n  }\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-nested-loop')).toBe(true)
  })

  it('does not flag a single loop', () => {
    const code = `for (let i = 0; i < n; i++) {\n  sum += i;\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-nested-loop')).toBe(false)
  })

  it('detects list concatenation in Python loop', () => {
    const code = `for x in items:\n    result = result + [x]`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-list-concat-in-loop')).toBe(true)
  })

  it('does not flag list.append in loop', () => {
    const code = `for x in items:\n    result.append(x)`
    const results = runAnalysis({ code, languageId: 'python' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-list-concat-in-loop')).toBe(false)
  })

  it('detects sequential await in JS loop', () => {
    const code = `for (const id of ids) {\n  const r = await fetch('/api/' + id);\n  results.push(r);\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-sequential-await-in-loop')).toBe(true)
  })

  it('does not flag Promise.all await', () => {
    const code = `for (const id of ids) {\n  promises.push(fetch('/api/' + id));\n}\nconst results = await Promise.all(promises);`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-sequential-await-in-loop')).toBe(false)
  })

  it('detects RegExp constructed in loop', () => {
    const code = `for (const line of lines) {\n  const re = new RegExp(pattern);\n  if (re.test(line)) found++;\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-regex-in-loop')).toBe(true)
  })

  it('does not flag RegExp outside loop', () => {
    const code = `const re = new RegExp(pattern);\nfor (const line of lines) {\n  if (re.test(line)) found++;\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const findings = flattenFindings(results)
    expect(findings.some((f) => f.ruleId === 'perf-regex-in-loop')).toBe(false)
  })

  it('performance category is populated for nested loop', () => {
    const code = `for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    sum += 1;\n  }\n}`
    const results = runAnalysis({ code, languageId: 'javascript' })
    const summary = summarizeByCategory(results)
    expect(summary.performance).toBeGreaterThan(0)
  })
})
