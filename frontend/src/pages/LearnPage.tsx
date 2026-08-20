import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  Search,
  Sparkles,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getCourseLessons,
  getLesson,
  getNextLesson,
  getPreviousLesson,
  getCompletedLessonIds,
  getCourseProgress,
  learningCatalog,
  markLessonComplete,
  markLessonStarted,
} from '../learning'
import type { Lesson } from '../learning'
import { LessonIcon, LessonRenderer } from '../learning/components/LessonRenderer'

import styles from './LearnPage.module.css'

type ViewMode = 'simple' | 'technical'

function LessonCard({
  lesson,
  completed,
  onClick,
}: {
  lesson: Lesson
  completed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`${styles.lessonCard} ${completed ? styles.completed : ''}`}
      onClick={onClick}
    >
      <div className={styles.lessonIcon}>
        <LessonIcon name={lesson.icon} size={22} />
      </div>

      <div className={styles.lessonInfo}>
        <div className={styles.lessonTitleRow}>
          <h3>{lesson.title}</h3>
          {completed && <CheckCircle size={18} className={styles.completedIcon} />}
        </div>

        <p>{lesson.description}</p>

        <div className={styles.lessonMeta}>
          <span>
            <Clock size={14} />
            {lesson.durationMinutes} min
          </span>
          <span>{lesson.difficulty}</span>
          <span>{lesson.blocks.length} sections</span>
        </div>
      </div>

      <ArrowRight size={20} className={styles.cardArrow} />
    </button>
  )
}

function LearnPage() {
  const navigate = useNavigate()
  const { lessonId } = useParams<{ lessonId?: string }>()

  const [mode, setMode] = useState<ViewMode>('simple')
  const [completedIds, setCompletedIds] = useState<string[]>(() =>
    getCompletedLessonIds(),
  )
  const [search, setSearch] = useState('')

  const course = learningCatalog.courses[0]

  const lessons = useMemo(
    () => getCourseLessons(learningCatalog, course.id),
    [course.id],
  )

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return lessons

    return lessons.filter((lesson) =>
      [
        lesson.title,
        lesson.description,
        lesson.difficulty,
        ...lesson.tags,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [lessons, search])

  const selectedLesson = lessonId
    ? getLesson(learningCatalog, lessonId)
    : undefined

  useEffect(() => {
    if (selectedLesson) {
      markLessonStarted(selectedLesson.id)
    }
  }, [selectedLesson?.id])

  const progress = getCourseProgress(learningCatalog, course.id)

  const completeLesson = () => {
    if (!selectedLesson) return

    markLessonComplete(selectedLesson.id)
    setCompletedIds(getCompletedLessonIds())
  }

  if (selectedLesson) {
    const previousLesson = getPreviousLesson(learningCatalog, selectedLesson.id)
    const nextLesson = getNextLesson(learningCatalog, selectedLesson.id)
    const completed = completedIds.includes(selectedLesson.id)

    return (
      <div className={styles.page}>
        <div className={styles.lessonHeader}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/cambric-labs/learn')}
          >
            <ArrowLeft size={18} />
            All Lessons
          </button>

          <div className={styles.lessonHeaderTitle}>
            <div className={styles.headerIcon}>
              <LessonIcon name={selectedLesson.icon} size={24} />
            </div>

            <div>
              <span>Neural Networks Fundamentals</span>
              <h1>{selectedLesson.title}</h1>
            </div>
          </div>

          <div className={styles.headerMeta}>
            <span>
              <Clock size={15} />
              {selectedLesson.durationMinutes} min
            </span>
            <span>{selectedLesson.difficulty}</span>
          </div>
        </div>

        <div className={styles.lessonToolbar}>
          <div className={styles.modeSwitch}>
            <button
              type="button"
              className={mode === 'simple' ? styles.activeMode : ''}
              onClick={() => setMode('simple')}
            >
              Simple
            </button>

            <button
              type="button"
              className={mode === 'technical' ? styles.activeMode : ''}
              onClick={() => setMode('technical')}
            >
              Technical
            </button>
          </div>

          <div className={styles.lessonPosition}>
            Lesson {selectedLesson.order} of {lessons.length}
          </div>
        </div>

        <main className={styles.lessonContent}>
          <LessonRenderer
            blocks={selectedLesson.blocks}
            mode={mode}
          />

          <div className={styles.completionPanel}>
            {completed ? (
              <>
                <CheckCircle size={28} />
                <div>
                  <strong>Lesson completed</strong>
                  <p>You can review this lesson or continue to the next one.</p>
                </div>
              </>
            ) : (
              <>
                <Sparkles size={28} />
                <div>
                  <strong>Ready to complete this lesson?</strong>
                  <p>Mark it complete when you understand the material.</p>
                </div>

                <button
                  type="button"
                  className={styles.completeButton}
                  onClick={completeLesson}
                >
                  Mark Complete
                  <CheckCircle size={17} />
                </button>
              </>
            )}
          </div>

          <div className={styles.lessonNavigation}>
            {previousLesson ? (
              <button
                type="button"
                onClick={() =>
                  navigate(`/cambric-labs/learn/${previousLesson.id}`)
                }
              >
                <ArrowLeft size={18} />
                <span>
                  <small>Previous</small>
                  {previousLesson.title}
                </span>
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                type="button"
                onClick={() =>
                  navigate(`/cambric-labs/learn/${nextLesson.id}`)
                }
              >
                <span>
                  <small>Next</small>
                  {nextLesson.title}
                </span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.catalogHeader}>
        <div>
          <div className={styles.eyebrow}>
            <Sparkles size={15} />
            CAMBRIC LEARNING SYSTEM
          </div>

          <h1>Learn</h1>

          <p>
            Build real understanding through structured, interactive
            development and AI education.
          </p>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.progressTop}>
            <span>Course Progress</span>
            <strong>{progress.percentage}%</strong>
          </div>

          <div className={styles.progressBar}>
            <div style={{ width: `${progress.percentage}%` }} />
          </div>

          <small>
            {progress.completed} of {progress.total} lessons completed
          </small>
        </div>
      </header>

      <section className={styles.courseHeader}>
        <div>
          <span>Artificial Intelligence</span>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
        </div>

        <div className={styles.courseStats}>
          <span>{lessons.length} lessons</span>
          <span>
            {lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0)}{' '}
            minutes
          </span>
        </div>
      </section>

      <div className={styles.catalogToolbar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lessons..."
            aria-label="Search lessons"
          />
        </div>
      </div>

      <main className={styles.lessonList}>
        {filteredLessons.map((lesson) => {
          const completed = completedIds.includes(lesson.id)

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={completed}
              onClick={() =>
                navigate(`/cambric-labs/learn/${lesson.id}`)
              }
            />
          )
        })}

        {filteredLessons.length === 0 && (
          <div className={styles.emptyState}>
            <Search size={30} />
            <h3>No lessons found</h3>
            <p>Try another search term.</p>
          </div>
        )}
      </main>

      <div className={styles.foundationNote}>
        <Lock size={16} />
        Your learning progress is stored locally on this device.
      </div>
    </div>
  )
}

export { LearnPage }
export default LearnPage
