/**
 * Cambric Labs — Developer Area barrel.
 *
 * Registers all built-in analyzers and re-exports the public API the
 * Developer Area UI consumes. Importing this module once (at app boot)
 * wires every analyzer into the engine.
 */
import { registerAnalyzer } from './engine'
import { JAVASCRIPT_ANALYZERS } from './analyzers/javascript'
import { PYTHON_ANALYZERS } from './analyzers/python'
import { TYPESCRIPT_ANALYZERS } from './analyzers/typescript'
import { COMMON_ANALYZERS } from './analyzers/common'
import { SQL_ANALYZERS } from './analyzers/sql'
import { HTML_ANALYZERS, CSS_ANALYZERS } from './analyzers/htmlCss'
import { ERROR_ANALYZERS } from './analyzers/errors'
import { SECURITY_ANALYZERS } from './analyzers/security'
import { PERFORMANCE_ANALYZERS } from './analyzers/performance'
import { MAINTAINABILITY_ANALYZERS } from './analyzers/maintainability'

let registered = false

/** Register all built-in analyzers. Idempotent — safe to call once at boot. */
export function registerDevAreaAnalyzers(): void {
  if (registered) return
  registered = true
  for (const analyzer of [
    ...JAVASCRIPT_ANALYZERS, ...PYTHON_ANALYZERS, ...TYPESCRIPT_ANALYZERS,
    ...COMMON_ANALYZERS, ...SQL_ANALYZERS, ...HTML_ANALYZERS, ...CSS_ANALYZERS,
    ...ERROR_ANALYZERS, ...SECURITY_ANALYZERS, ...PERFORMANCE_ANALYZERS,
    ...MAINTAINABILITY_ANALYZERS,
  ]) {
    registerAnalyzer(analyzer)
  }
}

export * from './types'
export * from './engine'
export { suggestRefactors } from './suggestions/refactor'
export { generateTests } from './suggestions/tests'
export { compareLanguages, comparisonSuggestions } from './suggestions/compare'
export type { ComparisonResult } from './suggestions/compare'
export { explainCode } from './suggestions/explain'
export type { CodeExplanation, ExplanationBlock } from './suggestions/explain'
export { JAVASCRIPT_ANALYZERS } from './analyzers/javascript'
export { PYTHON_ANALYZERS } from './analyzers/python'
export { TYPESCRIPT_ANALYZERS } from './analyzers/typescript'
export { COMMON_ANALYZERS } from './analyzers/common'
export { SQL_ANALYZERS } from './analyzers/sql'
export { HTML_ANALYZERS, CSS_ANALYZERS } from './analyzers/htmlCss'
export { ERROR_ANALYZERS } from './analyzers/errors'
export { SECURITY_ANALYZERS } from './analyzers/security'
export { PERFORMANCE_ANALYZERS } from './analyzers/performance'
export { MAINTAINABILITY_ANALYZERS } from './analyzers/maintainability'
