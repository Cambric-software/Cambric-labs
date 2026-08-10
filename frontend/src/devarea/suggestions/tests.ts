/**
 * Cambric Labs — Developer Area: Test Generation (heuristic)
 *
 * Generates skeleton tests for top-level functions detected in the source.
 * This is intentionally heuristic: it does not execute the code. It reads
 * function signatures and emits one test per function with sensible default
 * assertions the user then fills in. The goal is to bootstrap the testing
 * habit, not to produce a verified suite.
 */
import type { AnalysisInput, GeneratedTest } from '../types'

interface DetectedFunction {
  name: string
  params: string[]
}

/** Detect top-level function definitions for a given language. */
function detectFunctions(code: string, languageId: string): DetectedFunction[] {
  const functions: DetectedFunction[] = []
  if (languageId === 'python') {
    const regex = /def\s+(\w+)\s*\(([^)]*)\)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const params = match[2]
        .split(',')
        .map((p) => p.split(':')[0].split('=')[0].trim())
        .filter((p) => p && p !== 'self')
      functions.push({ name: match[1], params })
    }
  } else if (languageId === 'javascript' || languageId === 'typescript') {
    const regex = /function\s+(\w+)\s*\(([^)]*)\)/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(code)) !== null) {
      const params = match[2]
        .split(',')
        .map((p) => p.split(':')[0].split('=')[0].trim())
        .filter((p) => p)
      functions.push({ name: match[1], params })
    }
  }
  return functions
}

/** Generate a skeleton test per detected function. */
export function generateTests(input: AnalysisInput): GeneratedTest[] {
  const { code, languageId } = input
  const functions = detectFunctions(code, languageId)
  if (functions.length === 0) return []

  if (languageId === 'python') {
    return functions.map((fn) => ({
      title: `test_${fn.name}`,
      languageId: 'python',
      asserts: [`calls ${fn.name} without raising`, `${fn.name} returns the expected type`],
      code:
        `def test_${fn.name}():\n` +
        `    # TODO: replace with real inputs/expected outputs\n` +
        `    args = ${JSON.stringify(fn.params.map(() => null))}\n` +
        `    result = ${fn.name}(*args)  # fill in real arguments\n` +
        `    assert result is not None  # TODO: assert the actual expected value\n`,
    }))
  }

  // JS/TS default
  return functions.map((fn) => ({
    title: `${fn.name} works`,
    languageId,
    asserts: [`calling ${fn.name} does not throw`, `${fn.name} returns a defined value`],
    code:
      `test('${fn.name} works', () => {\n` +
      `  // TODO: replace with real inputs/expected outputs\n` +
      `  const result = ${fn.name}(${fn.params.map(() => 'undefined').join(', ')});\n` +
      `  expect(result).toBeDefined(); // TODO: assert the actual expected value\n` +
      `});\n`,
  }))
}
