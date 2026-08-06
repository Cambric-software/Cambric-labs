/**
 * Local Storage Utilities for CAMBRIC LABS
 * Implements local-first experiment storage
 */

const STORAGE_KEY = 'cambric_experiments'
const CURRENT_EXPERIMENT_KEY = 'cambric_current_experiment'

export interface NeuronData {
  id: string
  weights: number[]
  bias: number
  activation: string
  inputCount: number
}

export interface LayerData {
  id: string
  name: string
  neuronCount: number
  activation: string
  weights: number[][]
  biases: number[]
}

export interface DatasetExample {
  inputs: number[]
  target: number[]
}

export interface Dataset {
  id: string
  name: string
  inputDim: number
  outputDim: number
  examples: DatasetExample[]
  groups: { [key: string]: number[] }
}

export interface TrainingHistory {
  cycle: number
  loss: number
  accuracy?: number
  weights: number[][]
  biases: number[]
  timestamp: number
}

export interface Experiment {
  id: string
  name: string
  createdAt: number
  lastModified: number
  type: 'numerical' | 'image' | 'text' | 'audio' | 'pose'
  
  // Network architecture
  layers: LayerData[]
  inputDim: number
  outputDim: number
  lossFunction: string
  
  // Datasets
  datasets: Dataset[]
  
  // Training
  trainingHistory: TrainingHistory[]
  learningRate: number
  currentCycle: number
  
  // Current state
  currentWeights: number[][]
  currentBiases: number[]
  currentLoss: number | null
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function loadExperiments(): Experiment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load experiments:', e)
  }
  return []
}

function saveExperiments(experiments: Experiment[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments))
  } catch (e) {
    console.error('Failed to save experiments:', e)
  }
}

export const experimentStorage = {
  /**
   * Get all experiments
   */
  getAll(): Experiment[] {
    return loadExperiments()
  },

  /**
   * Get a specific experiment by ID
   */
  get(id: string): Experiment | null {
    const experiments = loadExperiments()
    return experiments.find(e => e.id === id) || null
  },

  /**
   * Create a new experiment
   */
  create(name: string, type: Experiment['type'] = 'numerical'): Experiment {
    const experiment: Experiment = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      lastModified: Date.now(),
      type,
      layers: [{
        id: generateId(),
        name: 'Hidden Layer 1',
        neuronCount: 4,
        activation: 'relu',
        weights: [[0.1, 0.2, 0.3], [0.1, 0.2, 0.3], [0.1, 0.2, 0.3], [0.1, 0.2, 0.3]],
        biases: [0, 0, 0, 0]
      }],
      inputDim: 3,
      outputDim: 1,
      lossFunction: 'mse',
      datasets: [],
      trainingHistory: [],
      learningRate: 0.01,
      currentCycle: 0,
      currentWeights: [[0.1, 0.2, 0.3], [0.1, 0.2, 0.3], [0.1, 0.2, 0.3], [0.1, 0.2, 0.3]],
      currentBiases: [0, 0, 0, 0],
      currentLoss: null
    }

    const experiments = loadExperiments()
    experiments.unshift(experiment)
    saveExperiments(experiments)
    
    return experiment
  },

  /**
   * Update an existing experiment
   */
  update(id: string, updates: Partial<Experiment>): Experiment | null {
    const experiments = loadExperiments()
    const index = experiments.findIndex(e => e.id === id)
    
    if (index === -1) return null
    
    experiments[index] = {
      ...experiments[index],
      ...updates,
      lastModified: Date.now()
    }
    
    saveExperiments(experiments)
    return experiments[index]
  },

  /**
   * Delete an experiment
   */
  delete(id: string): boolean {
    const experiments = loadExperiments()
    const filtered = experiments.filter(e => e.id !== id)
    
    if (filtered.length === experiments.length) return false
    
    saveExperiments(filtered)
    return true
  },

  /**
   * Update network weights after training
   */
  updateWeights(id: string, weights: number[][], biases: number[]): boolean {
    const exp = this.get(id)
    if (!exp) return false
    
    exp.currentWeights = weights
    exp.currentBiases = biases
    exp.lastModified = Date.now()
    
    const experiments = loadExperiments()
    const index = experiments.findIndex(e => e.id === id)
    if (index !== -1) {
      experiments[index] = exp
      saveExperiments(experiments)
    }
    
    return true
  },

  /**
   * Add training history entry
   */
  addTrainingHistory(
    id: string, 
    cycle: number, 
    loss: number, 
    weights: number[][],
    biases: number[],
    accuracy?: number
  ): boolean {
    const exp = this.get(id)
    if (!exp) return false
    
    exp.trainingHistory.push({
      cycle,
      loss,
      accuracy,
      weights: weights.map(w => [...w]),
      biases: [...biases],
      timestamp: Date.now()
    })
    exp.currentCycle = cycle
    exp.currentLoss = loss
    exp.currentWeights = weights.map(w => [...w])
    exp.currentBiases = [...biases]
    
    const experiments = loadExperiments()
    const index = experiments.findIndex(e => e.id === id)
    if (index !== -1) {
      experiments[index] = exp
      saveExperiments(experiments)
    }
    
    return true
  },

  /**
   * Add dataset to experiment
   */
  addDataset(id: string, dataset: Omit<Dataset, 'id'>): Dataset | null {
    const exp = this.get(id)
    if (!exp) return null
    
    const newDataset: Dataset = {
      ...dataset,
      id: generateId()
    }
    
    exp.datasets.push(newDataset)
    exp.lastModified = Date.now()
    
    const experiments = loadExperiments()
    const index = experiments.findIndex(e => e.id === id)
    if (index !== -1) {
      experiments[index] = exp
      saveExperiments(experiments)
    }
    
    return newDataset
  },

  /**
   * Export experiment as JSON
   */
  exportExperiment(id: string): string | null {
    const exp = this.get(id)
    if (!exp) return null
    return JSON.stringify(exp, null, 2)
  },

  /**
   * Import experiment from JSON
   */
  importExperiment(jsonString: string): Experiment | null {
    try {
      const imported = JSON.parse(jsonString) as Experiment
      imported.id = generateId()
      imported.createdAt = Date.now()
      imported.lastModified = Date.now()
      
      const experiments = loadExperiments()
      experiments.unshift(imported)
      saveExperiments(experiments)
      
      return imported
    } catch (e) {
      console.error('Failed to import experiment:', e)
      return null
    }
  },

  /**
   * Get current working experiment
   */
  getCurrentExperiment(): string | null {
    return localStorage.getItem(CURRENT_EXPERIMENT_KEY)
  },

  /**
   * Set current working experiment
   */
  setCurrentExperiment(id: string | null): void {
    if (id) {
      localStorage.setItem(CURRENT_EXPERIMENT_KEY, id)
    } else {
      localStorage.removeItem(CURRENT_EXPERIMENT_KEY)
    }
  }
}

export default experimentStorage
