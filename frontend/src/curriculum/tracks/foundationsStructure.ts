/**
 * Cambric Labs — Curriculum Structure: Computing Foundations
 *
 * The absolute-beginner track: what a computer IS before you program one.
 * Covers binary, CPU, memory, files, processes, terminals, compilers vs
 * interpreters. Taught primarily in pseudocode / language-neutral terms.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const FOUNDATIONS_TRACK_ID = 'track-computing-foundations'

const foundationsTrack: Track = {
  id: FOUNDATIONS_TRACK_ID,
  title: 'Computing Foundations',
  summary:
    'What a computer is and how it runs your code — before you write any. ' +
    'Binary, CPU, memory, files, terminals, compilers, and interpreters.',
  courseIds: ['course-how-computers-work', 'course-running-code'],
  accent: 'cyan',
}

const howComputersWork: Course = {
  id: 'course-how-computers-work',
  trackId: FOUNDATIONS_TRACK_ID,
  title: 'How Computers Work',
  summary: 'The machine underneath the code: CPU, memory, storage, and binary.',
  moduleIds: ['module-binary-and-data', 'module-hardware'],
}

const runningCode: Course = {
  id: 'course-running-code',
  trackId: FOUNDATIONS_TRACK_ID,
  title: 'How Code Runs',
  summary: 'From source text to running program: editors, compilers, interpreters, and the terminal.',
  moduleIds: ['module-source-to-program', 'module-terminal-and-files'],
}

const moduleBinaryAndData: CurriculumModule = {
  id: 'module-binary-and-data',
  courseId: 'course-how-computers-work',
  title: 'Binary & Data',
  summary: 'How computers represent everything with 0s and 1s.',
  lessonIds: ['lesson-binary'],
}

const moduleHardware: CurriculumModule = {
  id: 'module-hardware',
  courseId: 'course-how-computers-work',
  title: 'CPU & Memory',
  summary: 'The processor, RAM, and how they cooperate.',
  lessonIds: ['lesson-cpu-cycle', 'lesson-ram-and-storage', 'lesson-hexadecimal'],
}

const moduleSourceToProgram: CurriculumModule = {
  id: 'module-source-to-program',
  courseId: 'course-running-code',
  title: 'From Source to Program',
  summary: 'Editors, compilers, interpreters, and runtimes.',
  lessonIds: ['lesson-compilers-vs-interpreters', 'lesson-packages-and-runtime'],
}

const moduleTerminalAndFiles: CurriculumModule = {
  id: 'module-terminal-and-files',
  courseId: 'course-running-code',
  title: 'Files & the Terminal',
  summary: 'The file system, the command line, and processes.',
  lessonIds: ['lesson-filesystem', 'lesson-command-line'],
}

export function registerFoundationsStructure(): void {
  registerTrackStructure(foundationsTrack)
  registerCourseStructure(howComputersWork)
  registerCourseStructure(runningCode)
  registerModuleStructure(moduleBinaryAndData)
  registerModuleStructure(moduleHardware)
  registerModuleStructure(moduleSourceToProgram)
  registerModuleStructure(moduleTerminalAndFiles)
}
