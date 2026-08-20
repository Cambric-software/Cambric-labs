import type { LearningCatalog, Lesson } from './types'

export function getLesson(catalog: LearningCatalog, lessonId: string): Lesson | undefined {
  return catalog.lessons.find((lesson) => lesson.id === lessonId)
}

export function getCourseLessons(catalog: LearningCatalog, courseId: string): Lesson[] {
  return catalog.lessons
    .filter((lesson) => lesson.courseId === courseId)
    .sort((a, b) => a.order - b.order)
}

export function getTrackCourses(catalog: LearningCatalog, trackId: string) {
  return catalog.courses
    .filter((course) => course.trackId === trackId)
    .sort((a, b) => a.order - b.order)
}

export function getNextLesson(catalog: LearningCatalog, lessonId: string): Lesson | undefined {
  const current = getLesson(catalog, lessonId)
  if (!current) return undefined

  return getCourseLessons(catalog, current.courseId)
    .find((lesson) => lesson.order === current.order + 1)
}

export function getPreviousLesson(catalog: LearningCatalog, lessonId: string): Lesson | undefined {
  const current = getLesson(catalog, lessonId)
  if (!current || current.order <= 1) return undefined

  return getCourseLessons(catalog, current.courseId)
    .find((lesson) => lesson.order === current.order - 1)
}
