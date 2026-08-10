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

let registered = false

/** Register all built-in analyzers. Idempotent — safe to call once at boot. */
export function registerDevAreaAnalyzers(): void {
  if (registered) return
  registered = true
  for (const analyzer of [...JAVASCRIPT_ANALYZERS, ...PYTHON_ANALYZERS]) {
    registerAnalyzer(analyzer)
  }
}

export * from './types'
export * from './engine'
export { suggestRefactors } from './suggestions/refactor'
export { generateTests } from './suggestions/tests'
export { JAVASCRIPT_ANALYZERS } from './analyzers/javascript'
export { PYTHON_ANALYZERS } from './analyzers/python'
