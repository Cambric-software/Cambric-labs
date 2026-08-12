/**
 * Cambric Labs — Curriculum Structure (Programming Languages track)
 *
 * Teaches how programming languages differ in their core design: type
 * systems, memory models, paradigms, and idioms. Each lesson compares real
 * languages (Python, JavaScript, Rust, Java, C, Go) to build transferable
 * understanding — not surface syntax memorization.
 *
 * Structure only. Lesson content lives in per-module files under lessons/.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const LANGUAGES_TRACK_ID = 'track-programming-languages'

const languagesTrack: Track = {
  id: LANGUAGES_TRACK_ID,
  title: 'Programming Languages',
  summary:
    'How languages differ in type systems, memory models, paradigms, and ' +
    'idioms — building transferable insight rather than syntax memorization.',
  courseIds: ['course-language-design'],
  accent: 'purple',
}

const languageDesign: Course = {
  id: 'course-language-design',
  trackId: LANGUAGES_TRACK_ID,
  title: 'Language Design',
  summary: 'Type systems, memory models, and the tradeoffs that shape languages.',
  moduleIds: ['module-type-systems', 'module-memory-models'],
}

const moduleTypeSystems: CurriculumModule = {
  id: 'module-type-systems',
  courseId: 'course-language-design',
  title: 'Type Systems',
  summary: 'Static vs dynamic, strong vs weak typing, and what each catches.',
  lessonIds: ['lesson-static-vs-dynamic-typing', 'lesson-strong-vs-weak-typing'],
}

const moduleMemoryModels: CurriculumModule = {
  id: 'module-memory-models',
  courseId: 'course-language-design',
  title: 'Memory Models',
  summary: 'GC, manual memory, and ownership — how languages manage lifetime.',
  lessonIds: ['lesson-memory-management-strategies', 'lesson-ownership-and-borrowing-concepts'],
}

export function registerLanguagesStructure(): void {
  registerTrackStructure(languagesTrack)
  registerCourseStructure(languageDesign)
  registerModuleStructure(moduleTypeSystems)
  registerModuleStructure(moduleMemoryModels)
}

export const LANGUAGES_LESSON_IDS = {
  staticVsDynamic: 'lesson-static-vs-dynamic-typing',
  strongVsWeak: 'lesson-strong-vs-weak-typing',
  memoryStrategies: 'lesson-memory-management-strategies',
  ownershipBorrowing: 'lesson-ownership-and-borrowing-concepts',
} as const
