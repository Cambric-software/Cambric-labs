/**
 * CAMBRIC LABS - Supabase Configuration v2
 * With device detection and resource estimation
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dafgzzkerytjuvxzymnq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmd6emtlcnl0anV2eHp5bW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTE1MDUsImV4cCI6MjA5OTI4NzUwNX0.bZdxqNuy1ZyHMGzBieq7BzUd6IUEhfHEZxL-YTka3DQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============== Device Detection ==============
export interface DeviceCapabilities {
  cores: number
  memory: number  // GB
  isMobile: boolean
  tier: 'low' | 'medium' | 'high' | 'extreme'
}

export function detectDevice(): DeviceCapabilities {
  const cores = (navigator as any).hardwareConcurrency || 4
  const memory = (navigator as any).deviceMemory || 4
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  
  const score = cores * memory
  let tier: DeviceCapabilities['tier'] = 'low'
  if (score >= 32) tier = 'extreme'
  else if (score >= 16) tier = 'high'
  else if (score >= 8) tier = 'medium'
  
  return { cores, memory, isMobile, tier }
}

// ============== Resource Estimation ==============
export const ResourceEstimator = {
  estimateMemoryMB(params: number): number {
    return (params * 4 * 4) / (1024 * 1024) // Weights + biases + gradients + activations
  },
  
  getMaxParameters(device: DeviceCapabilities): number {
    const limits: Record<string, number> = {
      low: 100000,
      medium: 1000000,
      high: 10000000,
      extreme: 100000000
    }
    return limits[device.tier] || limits.medium
  },
  
  calculateParams(layers: { input_dim: number; output_dim: number }[]): number {
    return layers.reduce((sum, l) => sum + l.input_dim * l.output_dim + l.output_dim, 0)
  },
  
  getTierInfo(tier: string): { maxParams: number; description: string; color: string } {
    const info: Record<string, any> = {
      low: { maxParams: 100000, description: 'Basic', color: '#F85149' },
      medium: { maxParams: 1000000, description: 'Standard', color: '#D29922' },
      high: { maxParams: 10000000, description: 'Powerful', color: '#3FB950' },
      extreme: { maxParams: 100000000, description: 'Workstation', color: '#A371F7' }
    }
    return info[tier] || info.medium
  },
  
  formatNumber(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  },
  
  formatMemory(mb: number): string {
    if (mb >= 1024) return (mb / 1024).toFixed(1) + ' GB'
    return mb.toFixed(1) + ' MB'
  }
}

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
  network: Network
  cycleTimeMs?: string
}

export interface TrainingHistory {
  epoch: number
  loss: number
  accuracy: number
  valLoss?: number
  valAccuracy?: number
}

export interface DeviceInfo {
  device: DeviceCapabilities
  tier: string
  maxParameters: number
  limits: Record<string, { maxParams: number; description: string }>
}

export interface ValidationResult {
  valid: boolean
  warnings: string[]
  stats: {
    parameters: number
    memoryMB: number
    layerCount: number
    estimatedForwardPass: string
    estimatedTrainingPerEpoch: string
  }
}

// ============== Network API ==============
export const networkApi = {
  getDeviceInfo: async (device: DeviceCapabilities): Promise<{ data: DeviceInfo | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'device-info', device }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  validate: async (layers: Layer[], device: DeviceCapabilities): Promise<{ data: ValidationResult | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'validate', layers, device }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  create: async (config?: {
    layers?: Layer[]
    loss_function?: string
    device?: DeviceCapabilities
  }): Promise<{ data: { success: boolean; network: Network; summary: string; stats: any } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: {
          action: 'network/create',
          layers: config?.layers,
          loss_function: config?.loss_function || 'mse',
          device: config?.device || detectDevice()
        }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  forward: async (network: Network, inputs: number[]): Promise<{ data: { outputs: number[]; inferenceTimeMs: string } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'network/forward', network_data: network, request: { inputs } }
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
          action: 'network/train-cycle',
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
  ): Promise<{ data: { success: boolean; network: Network; history: TrainingHistory[]; stats: any } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: {
          action: 'network/train',
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
    format: 'python' | 'javascript' = 'python'
  ): Promise<{ data: { success: boolean; code: string; metadata: any } | null; error: any }> => {
    try {
      const { data, error } = await supabase.functions.invoke('network', {
        body: { action: 'export', network_data: network, format }
      })
      return { data, error }
    } catch (e) {
      return { data: null, error: e }
    }
  },

  info: async (): Promise<{ data: { activations: string[]; losses: string[]; deviceTiers: string[]; version: string } | null; error: any }> => {
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

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}


// ============== Single Neuron API (legacy support) ==============
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
