/**
 * CAMBRIC LABS - Supabase Configuration
 * 
 * This module configures the Supabase client for the frontend.
 * Uses environment variables for sensitive configuration.
 * 
 * Uses Supabase Edge Functions for the neural network backend.
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dafgzzkerytjuvxzymnq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhZmd6emtlcnl0anV2eHp5bW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3MTE1MDUsImV4cCI6MjA5OTI4NzUwNX0.bZdxqNuy1ZyHMGzBieq7BzUd6IUEhfHEZxL-YTka3DQ'

// Edge Functions URL
export const EDGE_FUNCTIONS_URL = `${supabaseUrl}/functions/v1`

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Neural Network API via Edge Functions
export const neuronApi = {
  create: async (inputCount: number, activation: string = 'relu') => {
    const { data, error } = await supabase.functions.invoke('neuron', {
      body: { input_count: inputCount, activation }
    })
    return { data, error }
  },

  forward: async (neuron: any, inputs: number[]) => {
    const { data, error } = await supabase.functions.invoke('neuron', {
      body: { 
        neuron_state: neuron, 
        request: { inputs } 
      }
    })
    return { data, error }
  },

  train: async (neuron: any, inputs: number[], targets: number[], learningRate: number = 0.01) => {
    const { data, error } = await supabase.functions.invoke('neuron', {
      body: { 
        neuron_state: neuron, 
        request: { inputs, targets, learning_rate: learningRate } 
      }
    })
    return { data, error }
  }
}

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
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

// Auth state listener
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}
