import { useState } from 'react'
import { X, Circle, BookOpen, Image, Type, Music, Hash, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './CreateExperimentModal.module.css'

interface CreateExperimentModalProps {
  onClose: () => void
}

type StartingPoint = {
  id: string
  name: string
  description: string
  icon: typeof Circle
  recommended?: boolean
}

const startingPoints: StartingPoint[] = [
  {
    id: 'one-neuron',
    name: 'One Neuron',
    description: 'Start with a single neuron. Perfect for beginners.',
    icon: Circle,
    recommended: true,
  },
  {
    id: 'blank',
    name: 'Blank Network',
    description: 'Start with an empty canvas and build your own architecture.',
    icon: Network,
  },
  {
    id: 'guided',
    name: 'Guided Experiment',
    description: 'Follow a step-by-step tutorial to build your first network.',
    icon: BookOpen,
  },
  {
    id: 'image',
    name: 'Image Classifier',
    description: 'Build a network for image classification tasks.',
    icon: Image,
  },
  {
    id: 'text',
    name: 'Text Classifier',
    description: 'Create a model for text categorization.',
    icon: Type,
  },
  {
    id: 'audio',
    name: 'Audio Classifier',
    description: 'Build a network for audio/sound classification.',
    icon: Music,
  },
  {
    id: 'numerical',
    name: 'Numerical Model',
    description: 'Create a regression model for numerical predictions.',
    icon: Hash,
  },
  {
    id: 'custom',
    name: 'Custom Network',
    description: 'Define your own architecture from scratch.',
    icon: Network,
  },
]

export function CreateExperimentModal({ onClose }: CreateExperimentModalProps) {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [experimentName, setExperimentName] = useState('')
  
  const handleCreate = () => {
    if (selected) {
      // In a real app, this would create the experiment via API
      navigate(`/cambric-labs/lab/new?type=${selected}&name=${encodeURIComponent(experimentName)}`)
    }
  }
  
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>New Experiment</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.nameInput}>
            <label htmlFor="exp-name">Experiment Name</label>
            <input
              id="exp-name"
              type="text"
              placeholder="My Experiment"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className={styles.section}>
            <h3>Choose Starting Point</h3>
            <p className={styles.hint}>Select how you want to begin your experiment.</p>
            
            <div className={styles.grid}>
              {startingPoints.map((point) => {
                const Icon = point.icon
                return (
                  <button
                    key={point.id}
                    className={`${styles.option} ${selected === point.id ? styles.selected : ''}`}
                    onClick={() => setSelected(point.id)}
                  >
                    <Icon size={24} className={styles.optionIcon} />
                    <span className={styles.optionName}>{point.name}</span>
                    {point.recommended && (
                      <span className={styles.recommended}>Recommended</span>
                    )}
                    <p className={styles.optionDesc}>{point.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={!selected}
          >
            Create Experiment
          </button>
        </div>
      </div>
    </div>
  )
}
