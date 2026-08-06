import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, GraduationCap, Code2, ChevronRight, FlaskConical, Trash2, Upload } from 'lucide-react'
import { experimentStorage, Experiment } from '../utils/storage'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  // Load experiments from localStorage
  const loadExperiments = () => {
    const exps = experimentStorage.getAll()
    setExperiments(exps)
  }
  
  useEffect(() => {
    loadExperiments()
    
    // Listen for storage changes (for cross-tab sync)
    const handleStorage = () => loadExperiments()
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])
  
  // Create new experiment
  const handleNewExperiment = () => {
    const exp = experimentStorage.create('New Experiment')
    loadExperiments()
    navigate(`/lab/${exp.id}`)
  }
  
  // Delete experiment
  const handleDelete = (id: string) => {
    experimentStorage.delete(id)
    loadExperiments()
    setShowDeleteConfirm(null)
  }
  
  // Import experiment
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const imported = experimentStorage.importExperiment(content)
      if (imported) {
        loadExperiments()
        navigate(`/lab/${imported.id}`)
      }
    }
    reader.readAsText(file)
  }
  
  // Format time ago
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }
  
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
            onClick={handleNewExperiment}
          >
            <Plus size={20} />
            New Experiment
          </button>
          <label className={styles.secondaryBtn}>
            <Upload size={20} />
            Import
            <input 
              type="file" 
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
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
        
        <div className={styles.featureCard}>
          <FlaskConical size={32} className={styles.featureIcon} />
          <h3>Lab</h3>
          <p>Build and train neural networks. See every weight, bias, and gradient.</p>
          <Link to="/cambric-labs/lab" className={styles.featureLink}>
            Open Lab <ChevronRight size={16} />
          </Link>
        </div>
      </section>
      
      <section className={styles.recent}>
        <h2 className={styles.sectionTitle}>Your Experiments</h2>
        
        {experiments.length > 0 ? (
          <div className={styles.experimentGrid}>
            {experiments.map((exp) => (
              <div key={exp.id} className={styles.experimentCard}>
                <Link 
                  to={`/lab/${exp.id}`}
                  className={styles.experimentLink}
                >
                  <div className={styles.experimentIcon}>
                    <FlaskConical size={24} />
                  </div>
                  <div className={styles.experimentInfo}>
                    <h4 className={styles.experimentName}>{exp.name}</h4>
                    <span className={styles.experimentType}>{exp.type}</span>
                  </div>
                  <span className={styles.experimentTime}>
                    {formatTimeAgo(exp.lastModified)}
                  </span>
                </Link>
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.preventDefault()
                    setShowDeleteConfirm(exp.id)
                  }}
                  title="Delete experiment"
                >
                  <Trash2 size={16} />
                </button>
                
                {showDeleteConfirm === exp.id && (
                  <div className={styles.deleteConfirm}>
                    <span>Delete this experiment?</span>
                    <div className={styles.deleteConfirmActions}>
                      <button onClick={() => handleDelete(exp.id)}>Yes</button>
                      <button onClick={() => setShowDeleteConfirm(null)}>No</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FlaskConical size={48} className={styles.emptyIcon} />
            <p>No experiments yet. Create your first one!</p>
            <button onClick={handleNewExperiment} className={styles.emptyBtn}>
              <Plus size={18} /> New Experiment
            </button>
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
    </div>
  )
}
