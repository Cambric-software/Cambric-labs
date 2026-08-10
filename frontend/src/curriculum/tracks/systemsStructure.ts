/**
 * Cambric Labs — Curriculum Structure: Systems Programming
 *
 * Close-to-the-metal programming in C, C++, and Rust: memory management,
 * pointers, ownership, concurrency, and compilation.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const SYSTEMS_TRACK_ID = 'track-systems-programming'

const systemsTrack: Track = {
  id: SYSTEMS_TRACK_ID,
  title: 'Systems Programming',
  summary:
    'Programming close to the metal: memory, pointers, compilation, ' +
    'concurrency, and what languages like C, C++, and Rust do differently.',
  courseIds: ['course-memory-and-pointers', 'course-concurrency-systems'],
  accent: 'red',
}

const memoryAndPointers: Course = {
  id: 'course-memory-and-pointers',
  trackId: SYSTEMS_TRACK_ID,
  title: 'Memory & Pointers',
  summary: 'Stack vs heap, manual memory, and ownership.',
  moduleIds: ['module-memory-model', 'module-ownership'],
}

const concurrencySystems: Course = {
  id: 'course-concurrency-systems',
  trackId: SYSTEMS_TRACK_ID,
  title: 'Concurrency & Compilation',
  summary: 'Threads, synchronization, and how code becomes machine code.',
  moduleIds: ['module-concurrency', 'module-compilation'],
}

const moduleMemoryModel: CurriculumModule = {
  id: 'module-memory-model',
  courseId: 'course-memory-and-pointers',
  title: 'The Memory Model',
  summary: 'Stack, heap, pointers, and manual allocation.',
  lessonIds: [],
}

const moduleOwnership: CurriculumModule = {
  id: 'module-ownership',
  courseId: 'course-memory-and-pointers',
  title: 'Ownership & Borrowing',
  summary: 'Rust ownership, borrowing, and lifetimes.',
  lessonIds: [],
}

const moduleConcurrency: CurriculumModule = {
  id: 'module-concurrency',
  courseId: 'course-concurrency-systems',
  title: 'Concurrency',
  summary: 'Threads, synchronization, and safe sharing.',
  lessonIds: [],
}

const moduleCompilation: CurriculumModule = {
  id: 'module-compilation',
  courseId: 'course-concurrency-systems',
  title: 'Compilation',
  summary: 'How source code becomes machine code.',
  lessonIds: [],
}

export function registerSystemsStructure(): void {
  registerTrackStructure(systemsTrack)
  registerCourseStructure(memoryAndPointers)
  registerCourseStructure(concurrencySystems)
  registerModuleStructure(moduleMemoryModel)
  registerModuleStructure(moduleOwnership)
  registerModuleStructure(moduleConcurrency)
  registerModuleStructure(moduleCompilation)
}
