import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, CheckCircle, Play } from 'lucide-react'
import styles from './LearnPage.module.css'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  completed?: boolean
}

const lessons: Lesson[] = [
  {
    id: 'what-is-neuron',
    title: 'What is a Neuron?',
    description: 'Learn the building block of neural networks.',
    duration: '5 min',
  },
  {
    id: 'inputs-weights',
    title: 'Inputs and Weights',
    description: 'Understand how neurons receive and process information.',
    duration: '8 min',
  },
  {
    id: 'bias',
    title: 'The Role of Bias',
    description: 'Learn why bias is essential in neural networks.',
    duration: '5 min',
  },
  {
    id: 'activation',
    title: 'Activation Functions',
    description: 'Discover how activation functions introduce non-linearity.',
    duration: '10 min',
  },
  {
    id: 'layers',
    title: 'Layers and Deep Networks',
    description: 'Stack neurons into layers to build deep networks.',
    duration: '12 min',
  },
  {
    id: 'forward-pass',
    title: 'The Forward Pass',
    description: 'See how data flows through a neural network.',
    duration: '8 min',
  },
  {
    id: 'loss',
    title: 'Measuring Error: Loss Functions',
    description: 'Understand how we measure how wrong a network is.',
    duration: '10 min',
  },
  {
    id: 'gradients',
    title: 'What are Gradients?',
    description: 'Learn about slopes and directions of steepest descent.',
    duration: '12 min',
  },
  {
    id: 'backpropagation',
    title: 'Backpropagation Explained',
    description: 'The algorithm that trains neural networks.',
    duration: '15 min',
  },
  {
    id: 'training-loop',
    title: 'The Training Loop',
    description: 'Put it all together: iterate, learn, improve.',
    duration: '10 min',
  },
  {
    id: 'overfitting',
    title: 'Overfitting and Underfitting',
    description: 'Learn about common problems and how to avoid them.',
    duration: '12 min',
  },
  {
    id: 'next-steps',
    title: 'Next Steps',
    description: 'Where to go from here.',
    duration: '5 min',
  },
]

export function LearnPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <BookOpen size={32} className={styles.headerIcon} />
          <div>
            <h1>Learn</h1>
            <p>A structured curriculum to understand neural networks from scratch.</p>
          </div>
        </div>
        
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '8%' }} />
          </div>
          <span>1 of 12 lessons completed</span>
        </div>
      </header>
      
      <section className={styles.curriculum}>
        <h2>Curriculum</h2>
        
        <div className={styles.lessonList}>
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              to={`/cambric-labs/learn/${lesson.id}`}
              className={styles.lessonCard}
            >
              <div className={styles.lessonNumber}>
                {lesson.completed ? (
                  <CheckCircle size={20} className={styles.completedIcon} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className={styles.lessonContent}>
                <h3>{lesson.title}</h3>
                <p>{lesson.description}</p>
              </div>
              
              <div className={styles.lessonMeta}>
                <span className={styles.duration}>{lesson.duration}</span>
                {index === 0 && (
                  <span className={styles.startBadge}>
                    <Play size={12} />
                    Start
                  </span>
                )}
              </div>
              
              <ChevronRight size={20} className={styles.arrow} />
            </Link>
          ))}
        </div>
      </section>
      
      <section className={styles.resources}>
        <h2>Additional Resources</h2>
        
        <div className={styles.resourceGrid}>
          <div className={styles.resourceCard}>
            <h4>Visual Glossary</h4>
            <p>Quick reference for neural network concepts.</p>
          </div>
          
          <div className={styles.resourceCard}>
            <h4>Math Reference</h4>
            <p>Equations and formulas explained.</p>
          </div>
          
          <div className={styles.resourceCard}>
            <h4>Code Examples</h4>
            <p>See the concepts in action.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
