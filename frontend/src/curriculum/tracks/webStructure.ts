/**
 * Cambric Labs — Curriculum Structure: Web Development
 *
 * Frontend and the web platform: HTML, CSS, JavaScript in the browser,
 * the DOM, HTTP, REST, and frontend architecture.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const WEB_TRACK_ID = 'track-web-development'

const webTrack: Track = {
  id: WEB_TRACK_ID,
  title: 'Web Development',
  summary:
    'Building for the browser: HTML structure, CSS presentation, JavaScript ' +
    'interactivity, the DOM, HTTP, and frontend architecture.',
  courseIds: ['course-web-fundamentals', 'course-client-js'],
  accent: 'orange',
}

const webFundamentals: Course = {
  id: 'course-web-fundamentals',
  trackId: WEB_TRACK_ID,
  title: 'Web Fundamentals',
  summary: 'HTML, CSS, and how the web delivers pages.',
  moduleIds: ['module-html', 'module-css', 'module-http'],
}

const clientJs: Course = {
  id: 'course-client-js',
  trackId: WEB_TRACK_ID,
  title: 'JavaScript in the Browser',
  summary: 'The DOM, events, async, and organizing frontend code.',
  moduleIds: ['module-dom-events', 'module-async-js', 'module-frontend-arch'],
}

const moduleHtml: CurriculumModule = {
  id: 'module-html',
  courseId: 'course-web-fundamentals',
  title: 'HTML',
  summary: 'The structure of a web page.',
  lessonIds: ['lesson-html'],
}

const moduleCss: CurriculumModule = {
  id: 'module-css',
  courseId: 'course-web-fundamentals',
  title: 'CSS',
  summary: 'Styling and layout rules.',
  lessonIds: [],
}

const moduleHttp: CurriculumModule = {
  id: 'module-http',
  courseId: 'course-web-fundamentals',
  title: 'HTTP & REST',
  summary: 'How browsers and servers talk.',
  lessonIds: [],
}

const moduleDomEvents: CurriculumModule = {
  id: 'module-dom-events',
  courseId: 'course-client-js',
  title: 'The DOM & Events',
  summary: 'Reading and changing the page; responding to user actions.',
  lessonIds: [],
}

const moduleAsyncJs: CurriculumModule = {
  id: 'module-async-js',
  courseId: 'course-client-js',
  title: 'Async JavaScript',
  summary: 'Promises, async/await, and the event loop.',
  lessonIds: [],
}

const moduleFrontendArch: CurriculumModule = {
  id: 'module-frontend-arch',
  courseId: 'course-client-js',
  title: 'Frontend Architecture',
  summary: 'Components, state, and organizing browser apps.',
  lessonIds: [],
}

export function registerWebStructure(): void {
  registerTrackStructure(webTrack)
  registerCourseStructure(webFundamentals)
  registerCourseStructure(clientJs)
  registerModuleStructure(moduleHtml)
  registerModuleStructure(moduleCss)
  registerModuleStructure(moduleHttp)
  registerModuleStructure(moduleDomEvents)
  registerModuleStructure(moduleAsyncJs)
  registerModuleStructure(moduleFrontendArch)
}
