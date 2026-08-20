export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type LessonBlock =
  | {
      type: 'text'
      id: string
      simple?: string
      technical?: string
    }
  | {
      type: 'formula'
      id: string
      value: string
    }
  | {
      type: 'example'
      id: string
      description: string
      code?: string
    }
  | {
      type: 'interactive'
      id: string
      title: string
      description: string
      actions: string[]
      link?: {
        label: string
        href: string
      }
    }

export interface Lesson {
  id: string
  title: string
  description: string
  durationMinutes: number
  difficulty: LessonDifficulty
  trackId: string
  courseId: string
  order: number
  icon: string
  prerequisites: string[]
  blocks: LessonBlock[]
  tags: string[]
}

export interface LearningCourse {
  id: string
  title: string
  description: string
  trackId: string
  order: number
  lessonIds: string[]
}

export interface LearningTrack {
  id: string
  title: string
  description: string
  order: number
  courseIds: string[]
}

export interface LearningCatalog {
  version: number
  tracks: LearningTrack[]
  courses: LearningCourse[]
  lessons: Lesson[]
}
