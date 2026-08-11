/**
 * Curriculum-wide quality gate tests.
 *
 * These run the same validators the /cambric-labs/validate page runs, but in
 * CI so a bad commit (duplicate id, broken prereq, low-quality lesson) is
 * caught before it reaches the browser. Lazy loadLesson is used so we never
 * hold all lesson content in memory at once during the quality pass.
 */
import { describe, it, expect } from 'vitest'
import {
  registerCurriculum,
  getCurriculumRegistry,
  validateCurriculum,
  detectSemanticDuplicates,
  scoreLesson,
  loadLesson,
} from '../curriculum'

describe('curriculum structural integrity', () => {
  it('registers and validates without structural errors', () => {
    registerCurriculum()
    const registry = getCurriculumRegistry()
    const result = validateCurriculum(registry)
    const errors = result.issues.filter((i) => i.severity === 'error')
    expect(errors, errors.map((e) => e.message).join('\n')).toEqual([])
  })

  it('has no semantic duplicate lessons', () => {
    registerCurriculum()
    const registry = getCurriculumRegistry()
    const result = detectSemanticDuplicates(registry)
    expect(result.pairs, result.pairs.map((p) => `${p.aId}~${p.bId}`).join('\n')).toEqual([])
  })

  it('every lesson scores above the quality floor', async () => {
    registerCurriculum()
    const registry = getCurriculumRegistry()
    const stubs = Object.values(registry.lessonIndex)
    expect(stubs.length).toBeGreaterThan(0)
    for (const stub of stubs) {
      const detail = await loadLesson(stub.id)
      if (!detail) continue
      const report = scoreLesson(detail)
      expect(report.composite, `low quality: ${stub.id}`).toBeGreaterThanOrEqual(0.6)
    }
  })

  it('lesson count is non-trivial', () => {
    registerCurriculum()
    const registry = getCurriculumRegistry()
    expect(Object.keys(registry.lessonIndex).length).toBeGreaterThanOrEqual(16)
  })
})
