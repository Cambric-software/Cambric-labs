/**
 * CAMBRIC LABS - Supabase Configuration
 * Advanced Neural Network with Supabase Edge Functions
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dafgzzkerytjuvxzymnq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmd6emtlcnl0anV2eHp5bW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTE1MDUsImV4cCI6MjA5OTI4NzUwNX0.bZdxqNuy1ZyHMGzBieq7BzUd6IUEhfHEZxL-YTka3DQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============== Types ==============
export interface Layer {
  input_dim: number
  output_dim: number
  activation: string
  weights?: number[][]
  biases?: number[]
}

export interface Network {
  layers: Layer[]
  loss_function: string
  parameter_count?: number
}

export interface TrainingResult {
  success: boolean
  loss: number
  accuracy: number
  outputs: number[]
  before: Network
  after: Network
  network: Network
}

export interface TrainingHistory {
  epoch: number
  loss: number
  accuracy: number
  valLoss?: number
  valAccuracy?: number
}

export interface ExportResult {
  success: boolean
  code: string
  format: string
  metadata: {
    parameter_count: number
    layer_count: number
    loss_function: string
  }
}

// ============== Network API ==============
export const networkApi = {
  create: async (config?: {
    layers?: Layer[]
    loss_function?: string
  }): Promise<{ data: { success: boolean; network: Network; summary: string } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { 
          action: 'create',
          layers: config?.layers || [
            { input_dim: 2, output_dim: 8, activation: 'relu' },
            { input_dim: 8, output_dim: 4, activation: 'relu' },
            { input_dim: 4, output_dim: 1, activation: 'sigmoid' }
          ],
          loss_function: config?.loss_function || 'mse'
        }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  forward: async (network: Network, inputs: number[]): Promise<{ data: { outputs: number[] } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { 
          action: 'forward',
          network_data: network,
          request: { inputs }
        }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  trainCycle: async (
    network: Network, 
    inputs: number[], 
    targets: number[],
    learningRate: number = 0.01
  ): Promise<{ data: TrainingResult | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { 
          action: 'train-cycle',
          network_data: network,
          request: { inputs, targets, learning_rate: learningRate }
        }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  train: async (
    network: Network,
    X: number[][],
    y: number[][],
    config: {
      epochs?: number
      learningRate?: number
      batchSize?: number
      shuffle?: boolean
      validationSplit?: number
    } = {}
  ): Promise<{ data: { success: boolean; network: Network; history: TrainingHistory[] } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { 
          action: 'train',
          network_data: network,
          request: { 
            X, y, 
            epochs: config.epochs || 100,
            learning_rate: config.learningRate || 0.01,
            batch_size: config.batchSize || 32,
            shuffle: config.shuffle !== false,
            validation_split: config.validationSplit || 0
          }
        }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  export: async (
    network: Network,
    format: 'python' | 'javascript' | 'onnx' = 'python'
  ): Promise<{ data: ExportResult | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { 
          action: 'export',
          network_data: network,
          format
        }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  info: async (): Promise<{ data: { activations: string[]; losses: string[] } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'info' }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  }
}

// ============== Single Neuron API (legacy) ==============
export const neuronApi = {
  create: async (inputCount: number, activation: string = 'relu') => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'create', input_count: inputCount, activation }
      })
      return { data: data?.neuron ? { neuron: data.neuron } : data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  forward: async (neuron: any, inputs: number[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'forward', neuron_state: neuron, request: { inputs } }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  train: async (neuron: any, inputs: number[], targets: number[], learningRate: number = 0.01) => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'train', neuron_state: neuron, request: { inputs, targets, learning_rate: learningRate } }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  }
}

// ============== Auth Helpers ==============
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}
