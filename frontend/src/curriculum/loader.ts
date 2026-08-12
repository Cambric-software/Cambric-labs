/**
 * Cambric Labs — Curriculum Loader
 *
 * Aggregates the static registries (languages, concepts, tracks, courses,
 * modules) and a lazily-loaded lesson index into one CurriculumRegistry.
 *
 * Memory safety: only lightweight LessonStubs are kept in memory at all
 * times. Full lesson content is fetched on demand via a per-module loader
 * map, so we never hold thousands of full lessons in memory at once.
 *
 * Lesson modules register themselves via registerModuleLoader(); each
 * module is a small, self-contained file that exports its lessons + a stub
 * projection. This keeps each generated/authored unit small and bounded.
 */
import type {
  Course,
  CurriculumModule,
  CurriculumRegistry,
  LessonDetail,
  LessonStub,
  Track,
} from './types'
import { CONCEPT_BY_ID, listConcepts } from './concepts/catalog'
import { LANGUAGE_BY_ID, listLanguages } from './languages/registry'

type ModuleLoader = () => Promise<LessonDetail[]>
type StubProvider = () => LessonStub[]

const moduleLoaders = new Map<string, ModuleLoader>()
const stubProviders = new Map<string, StubProvider>()

/**
 * Register a module's full-content loader (called lazily when a lesson in
 * the module is first opened). Idempotent.
 */
export function registerModuleLoader(moduleId: string, loader: ModuleLoader): void {
  moduleLoaders.set(moduleId, loader)
}

/**
 * Register a module's stub provider (synchronous, lightweight). Stubs are
 * cheap, so they are eagerly assembled into the index at load time.
 */
export function registerModuleStubs(moduleId: string, provider: StubProvider): void {
  stubProviders.set(moduleId, provider)
}

const TRACKS: Track[] = []
const COURSES: Course[] = []
const MODULES: CurriculumModule[] = []

/** Register a track/course/module chain at runtime (idempotent by id). */
export function registerTrackStructure(track: Track): void {
  if (!TRACKS.some((t) => t.id === track.id)) TRACKS.push(track)
}
export function registerCourseStructure(course: Course): void {
  if (!COURSES.some((c) => c.id === course.id)) COURSES.push(course)
}
export function registerModuleStructure(mod: CurriculumModule): void {
  if (!MODULES.some((m) => m.id === mod.id)) MODULES.push(mod)
}

let cachedRegistry: CurriculumRegistry | null = null

/** Build (once) and return the full curriculum registry. */
export function getCurriculumRegistry(): CurriculumRegistry {
  if (cachedRegistry) return cachedRegistry

  const lessonIndex: Record<string, LessonStub> = {}
  for (const provider of stubProviders.values()) {
    for (const stub of provider()) {
      // Guard against duplicate lesson ids across modules.
      if (lessonIndex[stub.id]) {
        throw new Error(`Duplicate lesson id registered: ${stub.id}`)
      }
      lessonIndex[stub.id] = stub
    }
  }

  cachedRegistry = {
    languages: LANGUAGE_BY_ID,
    tracks: Object.fromEntries(TRACKS.map((t) => [t.id, t])),
    courses: Object.fromEntries(COURSES.map((c) => [c.id, c])),
    modules: Object.fromEntries(MODULES.map((m) => [m.id, m])),
    concepts: CONCEPT_BY_ID,
    lessonIndex,
  }
  return cachedRegistry
}

/** Look up a lesson stub by id. */
export function getLessonStub(id: string): LessonStub | undefined {
  return getCurriculumRegistry().lessonIndex[id]
}

/** Resolve the module a lesson belongs to (via stub). */
export function getModuleForLesson(lessonId: string): CurriculumModule | undefined {
  const stub = getLessonStub(lessonId)
  if (!stub) return undefined
  return getCurriculumRegistry().modules[stub.moduleId]
}

const lessonCache = new Map<string, LessonDetail>()

/** Load the full content of a single lesson (lazy, cached). */
export async function loadLesson(lessonId: string): Promise<LessonDetail | undefined> {
  const cached = lessonCache.get(lessonId)
  if (cached) return cached

  const stub = getLessonStub(lessonId)
  if (!stub) return undefined

  const loader = moduleLoaders.get(stub.moduleId)
  if (!loader) return undefined

  const lessons = await loader()
  const detail = lessons.find((lesson) => lesson.id === lessonId)
  if (detail) lessonCache.set(lessonId, detail)
  return detail
}

/** Reset all caches. Intended for tests only. */
export function resetCurriculumCachesForTests(): void {
  cachedRegistry = null
  lessonCache.clear()
}

/** Convenience accessors for UI code. */
export function listTracks(): Track[] {
  return Object.values(getCurriculumRegistry().tracks)
}
export function listAllLanguages() {
  return listLanguages()
}
export function listAllConcepts() {
  return listConcepts()
}
export function lessonCount(): number {
  return Object.keys(getCurriculumRegistry().lessonIndex).length
}
