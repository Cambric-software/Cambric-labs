/**
 * Cambric Labs — Curriculum Structure (Programming Fundamentals track)
 *
 * Registers the Track -> Course -> Module chain for programming
 * fundamentals, taught primarily in Python (with cross-language compare
 * blocks where the concept genuinely differs across languages).
 *
 * This file only registers STRUCTURE (ids + ordering). Lesson content lives
 * in per-module files under lessons/, which register their own loaders.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const FUNDAMENTALS_TRACK_ID = 'track-programming-fundamentals'

const fundamentalsTrack: Track = {
  id: FUNDAMENTALS_TRACK_ID,
  title: 'Programming Fundamentals',
  summary:
    'The shared foundation of programming: variables, types, control flow, ' +
    'functions, and collections — taught so concepts transfer across languages.',
  courseIds: ['course-values-and-control-flow', 'course-functions-and-data'],
  accent: 'blue',
}

const valuesAndControlFlow: Course = {
  id: 'course-values-and-control-flow',
  trackId: FUNDAMENTALS_TRACK_ID,
  title: 'Values, Types & Control Flow',
  summary: 'How programs store data and decide what to do next.',
  moduleIds: ['module-variables', 'module-control-flow'],
}

const functionsAndData: Course = {
  id: 'course-functions-and-data',
  trackId: FUNDAMENTALS_TRACK_ID,
  title: 'Functions & Data Structures',
  summary: 'Reusable logic and the structures that hold your data.',
  moduleIds: ['module-functions', 'module-collections'],
}

const moduleVariables: CurriculumModule = {
  id: 'module-variables',
  courseId: 'course-values-and-control-flow',
  title: 'Variables & Values',
  summary: 'Storing and naming values, and understanding what a type is.',
  lessonIds: ['lesson-variables-intro', 'lesson-variables-types'],
}

const moduleControlFlow: CurriculumModule = {
  id: 'module-control-flow',
  courseId: 'course-values-and-control-flow',
  title: 'Control Flow',
  summary: 'Conditionals, boolean logic, and loops.',
  lessonIds: ['lesson-conditionals', 'lesson-loops', 'lesson-loop-control', 'lesson-boolean-operators'],
}

const moduleFunctions: CurriculumModule = {
  id: 'module-functions',
  courseId: 'course-functions-and-data',
  title: 'Functions',
  summary: 'Reusable, named blocks that take inputs and return results.',
  lessonIds: ['lesson-functions-intro', 'lesson-recursion'],
}

const moduleCollections: CurriculumModule = {
  id: 'module-collections',
  courseId: 'course-functions-and-data',
  title: 'Collections',
  summary: 'Lists, strings, and maps — the structures that hold many values.',
  lessonIds: ['lesson-lists', 'lesson-strings', 'lesson-dictionaries'],
}

export function registerFundamentalsStructure(): void {
  registerTrackStructure(fundamentalsTrack)
  registerCourseStructure(valuesAndControlFlow)
  registerCourseStructure(functionsAndData)
  registerModuleStructure(moduleVariables)
  registerModuleStructure(moduleControlFlow)
  registerModuleStructure(moduleFunctions)
  registerModuleStructure(moduleCollections)
}

export const FUNDAMENTALS_LESSON_IDS = {
  variablesIntro: 'lesson-variables-intro',
  variablesTypes: 'lesson-variables-types',
  conditionals: 'lesson-conditionals',
  loops: 'lesson-loops',
  loopControl: 'lesson-loop-control',
  functionsIntro: 'lesson-functions-intro',
  lists: 'lesson-lists',
  strings: 'lesson-strings',
  dictionaries: 'lesson-dictionaries',
} as const
