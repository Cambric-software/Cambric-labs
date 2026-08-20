export { learningCatalog } from './data/catalog'
export {
  getCourseLessons,
  getLesson,
  getNextLesson,
  getPreviousLesson,
  getTrackCourses,
} from './catalog'
export {
  getCompletedLessonIds,
  getCourseProgress,
  getLearningProgress,
  markLessonComplete,
  markLessonStarted,
} from './storage/progress'
export type {
  Lesson,
  LessonBlock,
  LessonDifficulty,
  LearningCatalog,
  LearningCourse,
  LearningTrack,
} from './types'
