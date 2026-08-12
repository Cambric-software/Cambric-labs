import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BookOpen, ChevronRight, ChevronLeft, CheckCircle, ArrowRight, Clock,
  Zap, Target, ListTree, Sparkles, Lock,
} from 'lucide-react'
import {
  getCurriculumRegistry, loadLesson, registerCurriculum,
} from '../curriculum'
import { useLearningStore, recommendNextLesson } from '../curriculum/learningStore'
import {
  LessonBlocks, AnimationRenderer, ActivityRenderer, ComprehensionChecks,
} from '../curriculum/components'
import type { LessonDetail } from '../curriculum'
import styles from './LearnPage.module.css'

// Register the curriculum (tracks/courses/modules/lessons) once at module load.
registerCurriculum()

const ACCENT_VAR: Record<string, string> = {
  blue: 'var(--lab-accent-blue)',
  green: 'var(--lab-accent-green)',
  red: 'var(--lab-accent-red)',
  orange: 'var(--lab-accent-orange)',
  purple: 'var(--lab-accent-purple)',
  cyan: 'var(--lab-accent-cyan)',
}

export function LearnPage() {
  const { lessonId } = useParams()
  if (lessonId) {
    return <LessonView lessonId={lessonId} />
  }
  return <CurriculumBrowser />
}

function CurriculumBrowser() {
  const registry = useMemo(() => getCurriculumRegistry(), [])
  const learning = useLearningStore()
  const [sessionMinutes, setSessionMinutes] = useState<number | null>(
    learning.sessionMinutes,
  )
  const [collapsedCourses, setCollapsedCourses] = useState<Set<string>>(new Set())

  const tracks = Object.values(registry.tracks)
  const recommended = useMemo(
    () => recommendNextLesson(registry, learning),
    [registry, learning],
  )

  const toggleCourse = (courseId: string) => {
    setCollapsedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  const completedCount = learning.completedLessonIds.size
  const totalLessons = Object.keys(registry.lessonIndex).length

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <BookOpen size={32} className={styles.headerIcon} />
          <div>
            <h1>Learn Programming</h1>
            <p>A concept-driven curriculum. Skills transfer across languages.</p>
          </div>
        </div>

        <div className={styles.sessionRow}>
          <span className={styles.sessionLabel}>
            <Clock size={14} /> Session:
          </span>
          {[null, 5, 10, 15].map((mins) => (
            <button
              key={String(mins)}
              className={`${styles.sessionBtn} ${sessionMinutes === mins ? styles.sessionActive : ''}`}
              onClick={() => {
                setSessionMinutes(mins)
                learning.setSessionMinutes(mins)
              }}
            >
              {mins == null ? 'Any' : `${mins} min`}
            </button>
          ))}
        </div>

        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${totalLessons ? (completedCount / totalLessons) * 100 : 0}%` }}
            />
          </div>
          <span>{completedCount} of {totalLessons} lessons completed</span>
        </div>
      </header>

      {recommended && (
        <div className={styles.recommended}>
          <div className={styles.recommendedHead}>
            <Sparkles size={18} />
            <span>Recommended next</span>
          </div>
          <Link to={`/cambric-labs/learn/${recommended.id}`} className={styles.recommendedCard}>
            <div className={styles.lessonContent}>
              <h3>{recommended.title}</h3>
              <p>{recommended.summary}</p>
            </div>
            <div className={styles.lessonMeta}>
              <span className={styles.duration}><Clock size={12} /> {recommended.estimatedMinutes} min</span>
              <span className={styles.nextBadge}><Zap size={12} /> Start</span>
            </div>
            <ChevronRight size={20} className={styles.arrow} />
          </Link>
        </div>
      )}

      <section className={styles.curriculum}>
        {tracks.map((track) => {
          const accent = ACCENT_VAR[track.accent] ?? 'var(--lab-accent-blue)'
          return (
            <div key={track.id} className={styles.track} style={{ borderLeftColor: accent }}>
              <h2 className={styles.trackTitle} style={{ color: accent }}>{track.title}</h2>
              <p className={styles.trackSummary}>{track.summary}</p>
              <div className={styles.courseList}>
                {track.courseIds.map((courseId) => {
                  const course = registry.courses[courseId]
                  if (!course) return null
                  const collapsed = collapsedCourses.has(courseId)
                  return (
                    <div key={courseId} className={styles.course}>
                      <button className={styles.courseHead} onClick={() => toggleCourse(courseId)}>
                        {collapsed ? <ChevronRight size={16} /> : <ChevronDown />}
                        <span className={styles.courseTitle}>{course.title}</span>
                        <span className={styles.courseSummary}>{course.summary}</span>
                      </button>
                      {!collapsed && (
                        <div className={styles.moduleList}>
                          {course.moduleIds.map((moduleId) => {
                            const mod = registry.modules[moduleId]
                            if (!mod) return null
                            return (
                              <div key={moduleId} className={styles.module}>
                                <div className={styles.moduleHead}>
                                  <ListTree size={14} /> {mod.title}
                                </div>
                                <div className={styles.lessonList}>
                                  {mod.lessonIds.map((lid, idx) => {
                                    const stub = registry.lessonIndex[lid]
                                    if (!stub) return null
                                    const complete = learning.isLessonComplete(lid)
                                    const locked = !learning.arePrerequisitesMet(stub.prerequisiteConceptIds)
                                    const fitsSession = sessionMinutes == null || stub.estimatedMinutes <= sessionMinutes
                                    return (
                                      <Link
                                        key={lid}
                                        to={`/cambric-labs/learn/${lid}`}
                                        className={`${styles.lessonCard} ${complete ? styles.completed : ''} ${locked ? styles.locked : ''} ${!fitsSession ? styles.tooLong : ''}`}
                                      >
                                        <div className={styles.lessonNumber}>
                                          {complete ? <CheckCircle size={18} /> : locked ? <Lock size={16} /> : <span>{idx + 1}</span>}
                                        </div>
                                        <div className={styles.lessonContent}>
                                          <h3>{stub.title}</h3>
                                          <p>{stub.summary}</p>
                                        </div>
                                        <div className={styles.lessonMeta}>
                                          <span className={styles.duration}><Clock size={12} /> {stub.estimatedMinutes} min</span>
                                          {!fitsSession && <span className={styles.tooLongBadge}>long</span>}
                                        </div>
                                        <ChevronRight size={20} className={styles.arrow} />
                                      </Link>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

function ChevronDown() {
  return <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
}

function LessonView({ lessonId }: { lessonId: string }) {
  const registry = useMemo(() => getCurriculumRegistry(), [])
  const learning = useLearningStore()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<LessonDetail | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    setLesson(undefined)
    loadLesson(lessonId).then((l) => {
      if (active) setLesson(l ?? null)
    })
    return () => { active = false }
  }, [lessonId])

  // Build a sequential learning path: lessons ordered by their position
  // within modules, modules within courses, courses within tracks, tracks
  // by their registration order. This gives coherent prev/next navigation
  // (the next lesson is the one after the current in the same module,
  // or the first lesson of the next module) rather than jumping globally.
  const orderedStubs = useMemo(() => {
    const tracks = Object.values(registry.tracks)
    const ordered: { id: string }[] = []
    for (const track of tracks) {
      for (const courseId of track.courseIds) {
        const course = registry.courses[courseId]
        if (!course) continue
        for (const moduleId of course.moduleIds) {
          const mod = registry.modules[moduleId]
          if (!mod) continue
          for (const lid of mod.lessonIds) {
            if (registry.lessonIndex[lid]) ordered.push({ id: lid })
          }
        }
      }
    }
    return ordered
  }, [registry])

  const currentIndex = orderedStubs.findIndex((s) => s.id === lessonId)
  const prevLesson = currentIndex > 0 ? orderedStubs[currentIndex - 1] : undefined
  const nextLesson = currentIndex >= 0 && currentIndex < orderedStubs.length - 1
    ? orderedStubs[currentIndex + 1]
    : undefined

  // Locate the lesson's position in the track/course/module hierarchy for
  // a breadcrumb so the learner knows where they are.
  const breadcrumb = useMemo(() => {
    if (!lesson) return null
    for (const track of Object.values(registry.tracks)) {
      for (const courseId of track.courseIds) {
        const course = registry.courses[courseId]
        if (!course) continue
        for (const moduleId of course.moduleIds) {
          const mod = registry.modules[moduleId]
          if (!mod) continue
          if (mod.lessonIds.includes(lesson.id)) {
            return { track: track.title, course: course.title, module: mod.title }
          }
        }
      }
    }
    return null
  }, [lesson, registry])

  if (lesson === undefined) {
    return <div className={styles.lessonPage}><p className={styles.loading}>Loading lesson…</p></div>
  }
  if (lesson === null) {
    return (
      <div className={styles.lessonPage}>
        <p>Lesson not found.</p>
        <Link to="/cambric-labs/learn" className={styles.backBtn}>Back to curriculum</Link>
      </div>
    )
  }

  const isComplete = learning.isLessonComplete(lesson.id)
  const language = registry.languages[lesson.languageId]

  return (
    <div className={styles.lessonPage}>
      <header className={styles.lessonHeader}>
        <button onClick={() => navigate('/cambric-labs/learn')} className={styles.backBtn}>
          <ChevronLeft size={20} /> Back to Curriculum
        </button>

        {breadcrumb && (
          <div className={styles.breadcrumb}>
            <span>{breadcrumb.track}</span>
            <ChevronRight size={12} />
            <span>{breadcrumb.course}</span>
            <ChevronRight size={12} />
            <span>{breadcrumb.module}</span>
          </div>
        )}

        <div className={styles.lessonNav}>
          {prevLesson && (
            <Link to={`/cambric-labs/learn/${prevLesson.id}`} className={styles.navBtn}>
              <ChevronLeft size={16} /> Previous
            </Link>
          )}
          {nextLesson && (
            <Link to={`/cambric-labs/learn/${nextLesson.id}`} className={styles.navBtn}>
              Next <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </header>

      <main className={styles.lessonContent}>
        <div className={styles.lessonTitleSection}>
          <div>
            <h1>{lesson.title}</h1>
            <div className={styles.lessonMetaRow}>
              <span className={styles.duration}><Clock size={14} /> {lesson.estimatedMinutes} min</span>
              {language && <span className={styles.langBadge}>{language.name}</span>}
              <span className={styles.difficultyBadge}>Difficulty {lesson.difficulty}/5</span>
            </div>
          </div>
          {isComplete && <span className={styles.completedBadge}><CheckCircle size={16} /> Completed</span>}
        </div>

        {lesson.objectives.length > 0 && (
          <div className={styles.objectivesBox}>
            <h3><Target size={16} /> Learning objectives</h3>
            <ul>
              {lesson.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
            </ul>
          </div>
        )}

        <LessonBlocks blocks={lesson.content} />

        {lesson.animation && (
          <div className={styles.sectionSpacing}>
            <AnimationRenderer animation={lesson.animation} />
          </div>
        )}

        {lesson.activity && (
          <div className={styles.sectionSpacing}>
            <ActivityRenderer activity={lesson.activity} />
          </div>
        )}

        {lesson.comprehensionChecks && lesson.comprehensionChecks.length > 0 && (
          <div className={styles.sectionSpacing}>
            <ComprehensionChecks checks={lesson.comprehensionChecks} />
          </div>
        )}

        <div className={styles.lessonActions}>
          {!isComplete ? (
            <button
              className={styles.completeBtn}
              onClick={() => learning.completeLesson(lesson.id, lesson.teachesConceptIds)}
            >
              <CheckCircle size={18} /> Mark as Complete
            </button>
          ) : (
            <span className={styles.completedBadge}><CheckCircle size={16} /> Completed</span>
          )}
          {nextLesson && (
            <Link to={`/cambric-labs/learn/${nextLesson.id}`} className={styles.completeBtn}>
              Continue <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
