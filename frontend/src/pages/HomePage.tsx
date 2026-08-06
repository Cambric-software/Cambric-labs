import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderOpen, GraduationCap, Code2, ChevronRight, FlaskConical } from 'lucide-react'
import { CreateExperimentModal } from '../components/CreateExperimentModal'
import styles from './HomePage.module.css'

interface Experiment {
  id: string
  name: string
  lastModified: string
  type: string
}

export function HomePage() {
  const [showNewModal, setShowNewModal] = useState(false)
  
  // Mock recent experiments
  const recentExperiments: Experiment[] = [
    { id: '1', name: 'Shape Classifier', lastModified: '2 hours ago', type: 'Image' },
    { id: '2', name: 'XOR Experiment', lastModified: '1 day ago', type: 'Numerical' },
    { id: '3', name: 'Audio Experiment', lastModified: '3 days ago', type: 'Audio' },
    { id: '4', name: 'My First Network', lastModified: '1 week ago', type: 'Numerical' },
  ]
  
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            <FlaskConical size={40} className={styles.titleIcon} />
            CAMBRIC LABS
          </h1>
          <p className={styles.tagline}>Learn AI by building it.</p>
          <p className={styles.description}>
            A serious neural network laboratory where you can see exactly 
            what's happening inside the machine.
          </p>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.primaryBtn}
            onClick={() => setShowNewModal(true)}
          >
            <Plus size={20} />
            New Experiment
          </button>
          <button className={styles.secondaryBtn}>
            <FolderOpen size={20} />
            Open Experiment
          </button>
        </div>
      </section>
      
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <GraduationCap size={32} className={styles.featureIcon} />
          <h3>Learn</h3>
          <p>Start from zero. Understand neurons, weights, biases, and training step by step.</p>
          <Link to="/cambric-labs/learn" className={styles.featureLink}>
            Start Learning <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className={styles.featureCard}>
          <Code2 size={32} className={styles.featureIcon} />
          <h3>Your Neuron</h3>
          <p>Write your own neuron code. Test it against the built-in implementation.</p>
          <Link to="/cambric-labs/admin" className={styles.featureLink}>
            Open Editor <ChevronRight size={16} />
          </Link>
        </div>
      </section>
      
      <section className={styles.recent}>
        <h2 className={styles.sectionTitle}>Recent Experiments</h2>
        
        {recentExperiments.length > 0 ? (
          <div className={styles.experimentGrid}>
            {recentExperiments.map((exp) => (
              <Link 
                key={exp.id} 
                to={`/cambric-labs/lab/${exp.id}`}
                className={styles.experimentCard}
              >
                <div className={styles.experimentIcon}>
                  <FlaskConical size={24} />
                </div>
                <div className={styles.experimentInfo}>
                  <h4 className={styles.experimentName}>{exp.name}</h4>
                  <span className={styles.experimentType}>{exp.type}</span>
                </div>
                <span className={styles.experimentTime}>{exp.lastModified}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No experiments yet. Create your first one!</p>
          </div>
        )}
      </section>
      
      <section className={styles.principles}>
        <h2 className={styles.sectionTitle}>Our Philosophy</h2>
        <div className={styles.principle}>
          <blockquote>
            "Do not hide AI behind a black box. Let the developer see exactly 
            what is happening."
          </blockquote>
          <p>
            Every number displayed corresponds to actual computation. Every 
            animation represents real data flow. CAMBRIC LABS never sacrifices 
            technical truth for visual appearance.
          </p>
        </div>
      </section>
      
      {showNewModal && (
        <CreateExperimentModal onClose={() => setShowNewModal(false)} />
      )}
    </div>
  )
}
