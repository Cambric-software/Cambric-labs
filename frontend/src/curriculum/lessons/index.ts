/**
 * Cambric Labs — Curriculum Module Registration
 *
 * Wires each authored lesson module into the loader so the registry can:
 *  - eagerly build a lightweight stub index (cheap; safe to keep in memory)
 *  - lazily fetch full lesson content only when a lesson is opened
 *
 * Each module registers its OWN stubs + a dynamic-import loader so the full
 * content of modules a learner never visits is never loaded. This is the
 * memory-safety boundary: adding more modules here does not increase
 * baseline memory, only the per-module loader map grows.
 */
import { registerModuleLoader, registerModuleStubs } from '../loader'
import type { LessonDetail, LessonStub } from '../types'
import { registerFundamentalsStructure } from '../tracks/fundamentalsStructure'
import { registerFoundationsStructure } from '../tracks/foundationsStructure'
import { registerDsaStructure } from '../tracks/dsaStructure'
import { registerWebStructure } from '../tracks/webStructure'
import { registerBackendStructure } from '../tracks/backendStructure'
import { registerSystemsStructure } from '../tracks/systemsStructure'
import { registerSeStructure } from '../tracks/seStructure'
import { registerAiStructure } from '../tracks/aiStructure'

// Lesson module imports (full content). These are statically imported only
// to derive stubs + to power the loader; the loader itself can swap to
// dynamic import later without touching call sites.
import { lessonVariablesIntro } from './lessonVariablesIntro'
import { lessonVariablesTypes } from './lessonVariablesTypes'
import { lessonConditionals } from './lessonConditionals'
import { lessonLoops } from './lessonLoops'
import { lessonBooleanOperators } from './lessonBooleanOperators'
import { lessonFunctionsIntro } from './lessonFunctionsIntro'
import { lessonRecursion } from './lessonRecursion'
import { lessonLists } from './lessonLists'
import { lessonStrings } from './lessonStrings'
import { lessonDictionaries } from './lessonDictionaries'

/** Project a full LessonDetail down to a lightweight LessonStub. */
function toStub(lesson: LessonDetail): LessonStub {
  return {
    id: lesson.id,
    title: lesson.title,
    moduleId: lesson.moduleId,
    languageId: lesson.languageId,
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimatedMinutes,
    summary: lesson.summary,
    teachesConceptIds: lesson.teachesConceptIds,
    prerequisiteConceptIds: lesson.prerequisiteConceptIds,
  }
}

/** Group lessons by their owning module id. */
function groupByModule(lessons: LessonDetail[]): Map<string, LessonDetail[]> {
  const byModule = new Map<string, LessonDetail[]>()
  for (const lesson of lessons) {
    const list = byModule.get(lesson.moduleId) ?? []
    list.push(lesson)
    byModule.set(lesson.moduleId, list)
  }
  return byModule
}

/** Register a module's stubs (sync, eager, lightweight). */
function registerStubs(moduleId: string, lessons: LessonDetail[]): void {
  registerModuleStubs(moduleId, () => lessons.map(toStub))
}

/**
 * Register a module's full-content loader. Kept async-compatible: a future
 * migration to per-file dynamic imports can replace the body with an
 * await import(...) without changing the signature or call sites.
 */
function registerLoader(moduleId: string, lessons: LessonDetail[]): void {
  registerModuleLoader(moduleId, async () => lessons)
}

export function registerCurriculum(): void {
  registerFundamentalsStructure()
  registerFoundationsStructure()
  registerDsaStructure()
  registerWebStructure()
  registerBackendStructure()
  registerSystemsStructure()
  registerSeStructure()
  registerAiStructure()

  const allLessons: LessonDetail[] = [
    lessonVariablesIntro,
    lessonVariablesTypes,
    lessonConditionals,
    lessonLoops,
    lessonBooleanOperators,
    lessonFunctionsIntro,
    lessonRecursion,
    lessonLists,
    lessonStrings,
    lessonDictionaries,
  ]

  for (const [moduleId, lessons] of groupByModule(allLessons)) {
    registerStubs(moduleId, lessons)
    registerLoader(moduleId, lessons)
  }
}
