/**
 * Cambric Labs — Curriculum Structure: Software Engineering
 *
 * Professional practices: version control, testing, debugging, design
 * patterns, and clean code.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const SE_TRACK_ID = 'track-software-engineering'

const seTrack: Track = {
  id: SE_TRACK_ID,
  title: 'Software Engineering',
  summary:
    'The practices that make code survive: version control, testing, ' +
    'debugging, design patterns, and clean code.',
  courseIds: ['course-version-control', 'course-testing-quality'],
  accent: 'blue',
}

const versionControl: Course = {
  id: 'course-version-control',
  trackId: SE_TRACK_ID,
  title: 'Version Control & Collaboration',
  summary: 'Git, branching, pull requests, and code review.',
  moduleIds: ['module-git', 'module-code-review'],
}

const testingQuality: Course = {
  id: 'course-testing-quality',
  trackId: SE_TRACK_ID,
  title: 'Testing & Quality',
  summary: 'Unit tests, integration tests, debugging, and design patterns.',
  moduleIds: ['module-testing', 'module-debugging', 'module-design-patterns'],
}

const moduleGit: CurriculumModule = {
  id: 'module-git',
  courseId: 'course-version-control',
  title: 'Git & Branching',
  summary: 'Commits, branches, and merging.',
  lessonIds: ['lesson-git'],
}

const moduleCodeReview: CurriculumModule = {
  id: 'module-code-review',
  courseId: 'course-version-control',
  title: 'Code Review',
  summary: 'Reviewing code before it merges.',
  lessonIds: ['lesson-what-to-review-for', 'lesson-review-workflow'],
}

const moduleTesting: CurriculumModule = {
  id: 'module-testing',
  courseId: 'course-testing-quality',
  title: 'Testing',
  summary: 'Unit and integration tests.',
  lessonIds: ['lesson-unit-testing', 'lesson-tdd'],
}

const moduleDebugging: CurriculumModule = {
  id: 'module-debugging',
  courseId: 'course-testing-quality',
  title: 'Debugging',
  summary: 'Finding and fixing the root cause.',
  lessonIds: ['lesson-debugging-method', 'lesson-debugging-toolbox'],
}

const moduleDesignPatterns: CurriculumModule = {
  id: 'module-design-patterns',
  courseId: 'course-testing-quality',
  title: 'Design Patterns',
  summary: 'Reusable solutions to recurring design problems.',
  lessonIds: [],
}

export function registerSeStructure(): void {
  registerTrackStructure(seTrack)
  registerCourseStructure(versionControl)
  registerCourseStructure(testingQuality)
  registerModuleStructure(moduleGit)
  registerModuleStructure(moduleCodeReview)
  registerModuleStructure(moduleTesting)
  registerModuleStructure(moduleDebugging)
  registerModuleStructure(moduleDesignPatterns)
}
