/**
 * Cambric Labs — Curriculum package barrel.
 *
 * Single import surface for the rest of the app:
 *   import { registerCurriculum, getCurriculumRegistry, ... } from '@/curriculum'
 */
export * from './types'
export * from './loader'
export { LANGUAGES, LANGUAGE_BY_ID, getLanguage, listLanguages, listAnalyzableLanguages } from './languages/registry'
export { CONCEPTS, CONCEPT_BY_ID, getConcept, listConcepts } from './concepts/catalog'
export { registerCurriculum } from './lessons/index'
export { FUNDAMENTALS_TRACK_ID, FUNDAMENTALS_LESSON_IDS } from './tracks/fundamentalsStructure'
