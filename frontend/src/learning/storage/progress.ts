import type { LearningCatalog } from '../types'

const STORAGE_KEY = 'cambric_learning_progress_v1'

export interface LessonProgress {
  completed: boolean
  startedAt?: string
  completedAt?: string
  lastOpenedAt?: string
}

export interface LearningProgress {
  version: 1
  lessons: Record<string, LessonProgress>
}

const EMPTY_PROGRESS: LearningProgress = {
  version: 1,
  lessons: {},
}

function readProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_PROGRESS

    const parsed = JSON.parse(raw) as LearningProgress

    if (
      parsed?.version !== 1 ||
      typeof parsed.lessons !== 'object' ||
      parsed.lessons === null
    ) {
      return EMPTY_PROGRESS
    }

    return parsed
  } catch {
    return EMPTY_PROGRESS
  }
}

function writeProgress(progress: LearningProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getLearningProgress(): LearningProgress {
  return readProgress()
}

export function getCompletedLessonIds(): string[] {
  return Object.entries(readProgress().lessons)
    .filter(([, progress]) => progress.completed)
    .map(([lessonId]) => lessonId)
}

export function markLessonStarted(lessonId: string): void {
  const progress = readProgress()
  const current = progress.lessons[lessonId]

  progress.lessons[lessonId] = {
    ...current,
    completed: current?.completed ?? false,
    startedAt: current?.startedAt ?? new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
  }

  writeProgress(progress)
}

export function markLessonComplete(lessonId: string): void {
  const progress = readProgress()

  progress.lessons[lessonId] = {
    ...progress.lessons[lessonId],
    completed: true,
    startedAt: progress.lessons[lessonId]?.startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
    lastOpenedAt: new Date().toISOString(),
  }

  writeProgress(progress)
}

export function getCourseProgress(catalog: LearningCatalog, courseId: string) {
  const lessons = catalog.lessons.filter((lesson) => lesson.courseId === courseId)
  const completed = lessons.filter(
    (lesson) => readProgress().lessons[lesson.id]?.completed,
  ).length

  return {
    completed,
    total: lessons.length,
    percentage: lessons.length === 0 ? 0 : Math.round((completed / lessons.length) * 100),
  }
}
