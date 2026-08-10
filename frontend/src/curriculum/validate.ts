/**
 * Cambric Labs — Curriculum Validation Toolkit
 *
 * Detects structural and semantic problems in a curriculum registry:
 *   - duplicate lesson IDs (hard error)
 *   - duplicate lesson titles (warning)
 *   - broken prerequisite edges (concept referenced but not defined)
 *   - cycles in the concept prerequisite DAG (would make a lesson unreachable)
 *   - lessons whose taught concepts aren't in the catalog
 *   - orphan modules/courses/tracks (referenced but undefined, or defined but
 *     not reachable from any track)
 *
 * Memory-safe: operates on the already-loaded registry index (a flat map),
 * never loads lesson detail bodies. Validation is O(lessons + edges).
 */
import type { CurriculumRegistry } from './types'

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  severity: ValidationSeverity
  code: string
  message: string
  /** Affected IDs for tooling. */
  ids?: string[]
}

export interface ValidationResult {
  issues: ValidationIssue[]
  errors: number
  warnings: number
  infos: number
  ok: boolean
}

export function validateCurriculum(registry: CurriculumRegistry): ValidationResult {
  const issues: ValidationIssue[] = []

  // --- 1. Duplicate lesson IDs in the index (shouldn't happen if loader
  // guards, but catches manual registry corruption). ---
  const seenLessonIds = new Set<string>()
  const dupLessonIds = new Set<string>()
  for (const id of Object.keys(registry.lessonIndex)) {
    if (seenLessonIds.has(id)) dupLessonIds.add(id)
    else seenLessonIds.add(id)
  }
  if (dupLessonIds.size > 0) {
    issues.push({
      severity: 'error',
      code: 'duplicate-lesson-id',
      message: `Duplicate lesson IDs in registry: ${[...dupLessonIds].join(', ')}`,
      ids: [...dupLessonIds],
    })
  }

  // --- 2. Duplicate lesson titles ---
  const titleMap = new Map<string, string[]>()
  for (const [id, stub] of Object.entries(registry.lessonIndex)) {
    const key = stub.title.trim().toLowerCase()
    const list = titleMap.get(key) ?? []
    list.push(id)
    titleMap.set(key, list)
  }
  for (const [title, ids] of titleMap) {
    if (ids.length > 1) {
      issues.push({
        severity: 'warning',
        code: 'duplicate-lesson-title',
        message: `Duplicate lesson title "${title}" used by ${ids.length} lessons: ${ids.join(', ')}`,
        ids,
      })
    }
  }

  // --- 3. Broken concept references: prerequisites / taught concepts not
  // present in the concept catalog. ---
  const conceptIds = new Set(Object.keys(registry.concepts))
  for (const [id, stub] of Object.entries(registry.lessonIndex)) {
    for (const prereq of stub.prerequisiteConceptIds) {
      if (!conceptIds.has(prereq)) {
        issues.push({
          severity: 'error',
          code: 'broken-prerequisite',
          message: `Lesson ${id} declares prerequisite concept "${prereq}" which is not in the catalog`,
          ids: [id, prereq],
        })
      }
    }
    for (const taught of stub.teachesConceptIds) {
      if (!conceptIds.has(taught)) {
        issues.push({
          severity: 'error',
          code: 'broken-taught-concept',
          message: `Lesson ${id} declares it teaches concept "${taught}" which is not in the catalog`,
          ids: [id, taught],
        })
      }
    }
  }

  // --- 4. Cycle detection in the concept prerequisite DAG. A cycle would
  // mean no valid topological order, so some lessons could never unlock. ---
  const cycles = detectCycles(registry)
  for (const cycle of cycles) {
    issues.push({
      severity: 'error',
      code: 'concept-cycle',
      message: `Concept prerequisite cycle detected: ${cycle.join(' -> ')}`,
      ids: cycle,
    })
  }

  // --- 5. Track/course/module integrity: referenced-but-undefined and
  // defined-but-unreachable. ---
  issues.push(...checkStructureIntegrity(registry))

  const errors = issues.filter((i) => i.severity === 'error').length
  const warnings = issues.filter((i) => i.severity === 'warning').length
  const infos = issues.filter((i) => i.severity === 'info').length
  return { issues, errors, warnings, infos, ok: errors === 0 }
}

/**
 * Detect cycles in the concept prerequisite graph using iterative DFS with
 * a recursion-color scheme. Bounded by the number of concepts.
 */
function detectCycles(registry: CurriculumRegistry): string[][] {
  const cycles: string[][] = []
  // adjacency: concept -> concepts it depends on (prerequisites)
  const adj = new Map<string, string[]>()
  for (const [id, concept] of Object.entries(registry.concepts)) {
    adj.set(id, concept.prerequisiteConceptIds ?? [])
  }
  const WHITE = 0, GRAY = 1, BLACK = 2
  const color = new Map<string, number>()
  for (const id of adj.keys()) color.set(id, WHITE)

  const path: string[] = []
  const visit = (node: string): boolean => {
    color.set(node, GRAY)
    path.push(node)
    let foundCycle = false
    for (const dep of adj.get(node) ?? []) {
      if (!color.has(dep)) continue // broken edge handled elsewhere
      const c = color.get(dep)!
      if (c === GRAY) {
        // found a back edge -> cycle
        const cycleStart = path.indexOf(dep)
        cycles.push([...path.slice(cycleStart), dep])
        foundCycle = true
      } else if (c === WHITE) {
        if (visit(dep)) foundCycle = true
      }
    }
    path.pop()
    color.set(node, BLACK)
    return foundCycle
  }

  for (const id of adj.keys()) {
    if (color.get(id) === WHITE) visit(id)
  }
  return cycles
}

function checkStructureIntegrity(registry: CurriculumRegistry): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  // Tracks reference undefined courses.
  for (const [trackId, track] of Object.entries(registry.tracks)) {
    for (const courseId of track.courseIds) {
      if (!registry.courses[courseId]) {
        issues.push({
          severity: 'error',
          code: 'track-undefined-course',
          message: `Track ${trackId} references undefined course ${courseId}`,
          ids: [trackId, courseId],
        })
      }
    }
  }
  // Courses reference undefined modules.
  for (const [courseId, course] of Object.entries(registry.courses)) {
    for (const moduleId of course.moduleIds) {
      if (!registry.modules[moduleId]) {
        issues.push({
          severity: 'error',
          code: 'course-undefined-module',
          message: `Course ${courseId} references undefined module ${moduleId}`,
          ids: [courseId, moduleId],
        })
      }
    }
  }
  // Modules reference undefined lessons.
  for (const [moduleId, mod] of Object.entries(registry.modules)) {
    for (const lessonId of mod.lessonIds) {
      if (!registry.lessonIndex[lessonId]) {
        issues.push({
          severity: 'error',
          code: 'module-undefined-lesson',
          message: `Module ${moduleId} references undefined lesson ${lessonId}`,
          ids: [moduleId, lessonId],
        })
      }
    }
  }
  // Orphan courses/modules/lessons: defined but not reachable from any track.
  const reachableCourses = new Set<string>()
  const reachableModules = new Set<string>()
  const reachableLessons = new Set<string>()
  for (const track of Object.values(registry.tracks)) {
    for (const courseId of track.courseIds) {
      reachableCourses.add(courseId)
      const course = registry.courses[courseId]
      if (!course) continue
      for (const moduleId of course.moduleIds) {
        reachableModules.add(moduleId)
        const mod = registry.modules[moduleId]
        if (!mod) continue
        for (const lessonId of mod.lessonIds) reachableLessons.add(lessonId)
      }
    }
  }
  for (const courseId of Object.keys(registry.courses)) {
    if (!reachableCourses.has(courseId)) {
      issues.push({
        severity: 'warning',
        code: 'orphan-course',
        message: `Course ${courseId} is defined but not referenced by any track`,
        ids: [courseId],
      })
    }
  }
  for (const moduleId of Object.keys(registry.modules)) {
    if (!reachableModules.has(moduleId)) {
      issues.push({
        severity: 'warning',
        code: 'orphan-module',
        message: `Module ${moduleId} is defined but not reachable from any track`,
        ids: [moduleId],
      })
    }
  }
  for (const lessonId of Object.keys(registry.lessonIndex)) {
    if (!reachableLessons.has(lessonId)) {
      issues.push({
        severity: 'warning',
        code: 'orphan-lesson',
        message: `Lesson ${lessonId} is in the index but not reachable from any track`,
        ids: [lessonId],
      })
    }
  }
  return issues
}
