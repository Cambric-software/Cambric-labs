/**
 * Cambric Labs — Curriculum Structure: AI & Machine Learning
 *
 * From statistics and linear algebra through neural networks to LLMs.
 */
import { registerCourseStructure, registerModuleStructure, registerTrackStructure } from '../loader'
import type { Course, CurriculumModule, Track } from '../types'

export const AI_TRACK_ID = 'track-ai-machine-learning'

const aiTrack: Track = {
  id: AI_TRACK_ID,
  title: 'AI & Machine Learning',
  summary:
    'From statistics and linear algebra through neural networks and ' +
    'training to transformers and large language models.',
  courseIds: ['course-ml-foundations', 'course-deep-learning'],
  accent: 'purple',
}

const mlFoundations: Course = {
  id: 'course-ml-foundations',
  trackId: AI_TRACK_ID,
  title: 'ML Foundations',
  summary: 'Statistics, linear algebra, and what machine learning is.',
  moduleIds: ['module-statistics', 'module-linear-algebra', 'module-ml-intro'],
}

const deepLearning: Course = {
  id: 'course-deep-learning',
  trackId: AI_TRACK_ID,
  title: 'Deep Learning & LLMs',
  summary: 'Neural networks, training, transformers, embeddings, and LLMs.',
  moduleIds: ['module-neural-networks', 'module-transformers'],
}

const moduleStatistics: CurriculumModule = {
  id: 'module-statistics',
  courseId: 'course-ml-foundations',
  title: 'Statistics',
  summary: 'Summarizing and reasoning about data.',
  lessonIds: ['lesson-descriptive-statistics', 'lesson-statistical-reasoning'],
}

const moduleLinearAlgebra: CurriculumModule = {
  id: 'module-linear-algebra',
  courseId: 'course-ml-foundations',
  title: 'Linear Algebra',
  summary: 'Vectors and matrices for ML.',
  lessonIds: ['lesson-vectors', 'lesson-matrices-and-linear-maps'],
}

const moduleMlIntro: CurriculumModule = {
  id: 'module-ml-intro',
  courseId: 'course-ml-foundations',
  title: 'What Is ML?',
  summary: 'Learning from data instead of rules.',
  lessonIds: ['lesson-what-is-ml'],
}

const moduleNeuralNetworks: CurriculumModule = {
  id: 'module-neural-networks',
  courseId: 'course-deep-learning',
  title: 'Neural Networks',
  summary: 'Layers, weights, and training.',
  lessonIds: ['lesson-neuron-forward-pass', 'lesson-gradient-descent'],
}

const moduleTransformers: CurriculumModule = {
  id: 'module-transformers',
  courseId: 'course-deep-learning',
  title: 'Transformers & LLMs',
  summary: 'Attention, embeddings, and large language models.',
  lessonIds: ['lesson-attention-mechanism', 'lesson-transformer-architecture'],
}

export function registerAiStructure(): void {
  registerTrackStructure(aiTrack)
  registerCourseStructure(mlFoundations)
  registerCourseStructure(deepLearning)
  registerModuleStructure(moduleStatistics)
  registerModuleStructure(moduleLinearAlgebra)
  registerModuleStructure(moduleMlIntro)
  registerModuleStructure(moduleNeuralNetworks)
  registerModuleStructure(moduleTransformers)
}
