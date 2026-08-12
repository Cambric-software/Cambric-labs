/**
 * Cambric Labs — Learning Progress Store (Zustand)
 *
 * Tracks which concepts a learner has mastered and which lessons are
 * complete, persisted to localStorage. Drives adaptive scheduling: a
 * lesson is "available" once its prerequisite concepts are mastered, and
 * "recommended" if it teaches an unmastered concept.
 *
 * Also tracks a short-session budget so a learner with 5-10 minutes can be
 * routed to lessons that fit that window.
 */
import { create } from 'zustand'
import type { CurriculumRegistry, LessonStub } from './types'

export interface LearningState {
  completedLessonIds: Set<string>
  masteredConceptIds: Set<string>
  /** Concept a learner is actively working on (for adaptive ordering). */
  activeConceptId: string | null
  /** Preferred short-session minutes (null = no constraint). */
  sessionMinutes: number | null
  completeLesson: (lessonId: string, taughtConceptIds: string[]) => void
  isLessonComplete: (lessonId: string) => boolean
  isConceptMastered: (conceptId: string) => boolean
  arePrerequisitesMet: (prerequisiteConceptIds: string[]) => boolean
  resetProgress: () => void
  setSessionMinutes: (minutes: number | null) => void
}

const STORAGE_KEY = 'cambric_learning_progress_v1'

interface PersistShape {
  completedLessonIds: string[]
  masteredConceptIds: string[]
  sessionMinutes: number | null
}

function loadPersisted(): PersistShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistShape>
      return {
        completedLessonIds: parsed.completedLessonIds ?? [],
        masteredConceptIds: parsed.masteredConceptIds ?? [],
        sessionMinutes: parsed.sessionMinutes ?? null,
      }
    }
  } catch {
    // ignore corrupt storage
  }
  return { completedLessonIds: [], masteredConceptIds: [], sessionMinutes: null }
}

function persist(state: LearningState) {
  const data: PersistShape = {
    completedLessonIds: [...state.completedLessonIds],
    masteredConceptIds: [...state.masteredConceptIds],
    sessionMinutes: state.sessionMinutes,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // storage may be full or unavailable; progress stays in-memory
  }
}

const initial = loadPersisted()

export const useLearningStore = create<LearningState>((set, get) => ({
  completedLessonIds: new Set(initial.completedLessonIds),
  masteredConceptIds: new Set(initial.masteredConceptIds),
  activeConceptId: null,
  sessionMinutes: initial.sessionMinutes,
  completeLesson: (lessonId, taughtConceptIds) => {
    set((state) => {
      const completed = new Set(state.completedLessonIds)
      completed.add(lessonId)
      const mastered = new Set(state.masteredConceptIds)
      for (const conceptId of taughtConceptIds) mastered.add(conceptId)
      const next = { ...state, completedLessonIds: completed, masteredConceptIds: mastered }
      persist(next)
      return next
    })
  },
  isLessonComplete: (lessonId) => get().completedLessonIds.has(lessonId),
  isConceptMastered: (conceptId) => get().masteredConceptIds.has(conceptId),
  arePrerequisitesMet: (prerequisiteConceptIds) =>
    prerequisiteConceptIds.every((id) => get().masteredConceptIds.has(id)),
  resetProgress: () => {
    const next = {
      ...get(),
      completedLessonIds: new Set<string>(),
      masteredConceptIds: new Set<string>(),
      activeConceptId: null,
    }
    persist(next)
    set(next)
  },
  setSessionMinutes: (minutes) => {
    const next = { ...get(), sessionMinutes: minutes }
    persist(next)
    set(next)
  },
}))

/**
 * Adaptive recommendation: among available lessons, return the next one to
 * study. A lesson is "available" if its prerequisites are met. The next
 * lesson is the first available, uncompleted lesson that fits the session
 * budget (if any) and teaches at least one unmastered concept.
 */
export function recommendNextLesson(
  registry: CurriculumRegistry,
  state: LearningState,
): LessonStub | undefined {
  const stubs = Object.values(registry.lessonIndex)
  const available = stubs.filter(
    (stub) => state.arePrerequisitesMet(stub.prerequisiteConceptIds),
  )
  const budget = state.sessionMinutes
  // Prefer lessons that teach an unmastered concept and fit the budget.
  const candidates = available.filter((stub) => {
    if (state.completedLessonIds.has(stub.id)) return false
    if (budget != null && stub.estimatedMinutes > budget) return false
    const teachesUnmastered = stub.teachesConceptIds.some(
      (c) => !state.masteredConceptIds.has(c),
    )
    return teachesUnmastered
  })
  if (candidates.length > 0) {
    // Lowest difficulty first, then shortest, for a smooth ramp.
    return candidates.sort(
      (a, b) => a.difficulty - b.difficulty || a.estimatedMinutes - b.estimatedMinutes,
    )[0]
  }
  // Fall back to any available uncompleted lesson (ignore budget).
  return available
    .filter((stub) => !state.completedLessonIds.has(stub.id))
    .sort((a, b) => a.difficulty - b.difficulty || a.estimatedMinutes - b.estimatedMinutes)[0]
}
