/**
 * Cambric Labs — Curriculum Structure: Backend & Databases
 *
 * Servers, APIs, databases, and data persistence.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const BACKEND_TRACK_ID = 'track-backend-databases'

const backendTrack: Track = {
  id: BACKEND_TRACK_ID,
  title: 'Backend & Databases',
  summary:
    'Servers, APIs, databases, and the systems that persist and serve data ' +
    'behind every application.',
  courseIds: ['course-servers-apis', 'course-databases'],
  accent: 'green',
}

const serversApis: Course = {
  id: 'course-servers-apis',
  trackId: BACKEND_TRACK_ID,
  title: 'Servers & APIs',
  summary: 'Building backends: routing, middleware, authentication, and caching.',
  moduleIds: ['module-server-basics', 'module-auth-security', 'module-caching-scaling'],
}

const databases: Course = {
  id: 'course-databases',
  trackId: BACKEND_TRACK_ID,
  title: 'Databases',
  summary: 'SQL, relational design, indexes, transactions, and NoSQL.',
  moduleIds: ['module-sql', 'module-relational-design', 'module-nosql'],
}

const moduleServerBasics: CurriculumModule = {
  id: 'module-server-basics',
  courseId: 'course-servers-apis',
  title: 'Servers & Routing',
  summary: 'HTTP servers, routes, and middleware.',
  lessonIds: ['lesson-http-servers', 'lesson-middleware'],
}

const moduleAuthSecurity: CurriculumModule = {
  id: 'module-auth-security',
  courseId: 'course-servers-apis',
  title: 'Auth & Security',
  summary: 'Authentication, authorization, and rate limiting.',
  lessonIds: ['lesson-authentication-passwords-sessions', 'lesson-authorization-and-vulnerabilities'],
}

const moduleCachingScaling: CurriculumModule = {
  id: 'module-caching-scaling',
  courseId: 'course-servers-apis',
  title: 'Caching & Scaling',
  summary: 'Caching, queues, and background jobs.',
  lessonIds: ['lesson-caching', 'lesson-horizontal-scaling'],
}

const moduleSql: CurriculumModule = {
  id: 'module-sql',
  courseId: 'course-databases',
  title: 'SQL Fundamentals',
  summary: 'SELECT, INSERT, JOIN, and querying relational data.',
  lessonIds: ['lesson-sql'],
}

const moduleRelationalDesign: CurriculumModule = {
  id: 'module-relational-design',
  courseId: 'course-databases',
  title: 'Relational Design',
  summary: 'Normalization, indexes, and transactions.',
  lessonIds: ['lesson-normalization', 'lesson-indexes-transactions'],
}

const moduleNosql: CurriculumModule = {
  id: 'module-nosql',
  courseId: 'course-databases',
  title: 'NoSQL',
  summary: 'Document, key-value, and graph databases.',
  lessonIds: ['lesson-document-databases', 'lesson-key-value-and-cap'],
}

export function registerBackendStructure(): void {
  registerTrackStructure(backendTrack)
  registerCourseStructure(serversApis)
  registerCourseStructure(databases)
  registerModuleStructure(moduleServerBasics)
  registerModuleStructure(moduleAuthSecurity)
  registerModuleStructure(moduleCachingScaling)
  registerModuleStructure(moduleSql)
  registerModuleStructure(moduleRelationalDesign)
  registerModuleStructure(moduleNosql)
}
