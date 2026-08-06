/**
 * CAMBRIC LABS API Client
 * 
 * Handles all API communication with the backend.
 */

const API_BASE = '/api'

interface CreateNeuronRequest {
  input_count: number
  weights?: number[]
  bias?: number
  activation?: string
  seed?: number
}

interface ForwardRequest {
  inputs: number[]
}

interface TrainStepRequest {
  inputs: number[]
  targets: number[]
  learning_rate: number
}

interface CreateExperimentRequest {
  name: string
  network?: {
    name: string
    layers: Array<{
      name: string
      input_dim: number
      output_dim: number
      activation: string
    }>
    loss_function?: string
  }
  dataset_id?: string
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }
    
    return response.json()
  }
  
  // Neuron endpoints
  async createNeuron(config: CreateNeuronRequest): Promise<{ success: boolean; neuron: any }> {
    return this.request('/neuron/create', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }
  
  async neuronForward(neuronState: any, request: ForwardRequest): Promise<any> {
    return this.request('/neuron/forward', {
      method: 'POST',
      body: JSON.stringify({ neuron_state: neuronState, request }),
    })
  }
  
  async neuronTrainStep(
    neuronState: any,
    request: TrainStepRequest
  ): Promise<any> {
    return this.request('/neuron/train', {
      method: 'POST',
      body: JSON.stringify({ neuron_state: neuronState, request }),
    })
  }
  
  async explainActivation(activation: string): Promise<any> {
    return this.request(`/neuron/explain/${activation}`)
  }
  
  // Network endpoints
  async createNetwork(config: {
    name: string
    layers: Array<{
      name: string
      input_dim: number
      output_dim: number
      activation: string
    }>
    loss_function?: string
  }): Promise<{ success: boolean; network: any }> {
    return this.request('/network/create', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }
  
  async networkForward(networkData: any, inputs: number[]): Promise<any> {
    return this.request('/network/forward', {
      method: 'POST',
      body: JSON.stringify({ network_data: networkData, request: { inputs } }),
    })
  }
  
  async trainNetworkCycle(
    networkData: any,
    request: TrainStepRequest
  ): Promise<any> {
    return this.request('/network/train-cycle', {
      method: 'POST',
      body: JSON.stringify({ network_data: networkData, request }),
    })
  }
  
  async trainNetwork(
    networkData: any,
    request: {
      X: number[][]
      y: number[][]
      cycles: number
      learning_rate: number
      batch_size?: number
      shuffle?: boolean
      validation_split?: number
    }
  ): Promise<any> {
    return this.request('/network/train', {
      method: 'POST',
      body: JSON.stringify({ network_data: networkData, request }),
    })
  }
  
  // Information endpoints
  async listActivations(): Promise<{ activations: string[]; details: any }> {
    return this.request('/activations')
  }
  
  async listLosses(): Promise<{ losses: string[]; details: any }> {
    return this.request('/losses')
  }
  
  // Experiment endpoints
  async createExperiment(config: CreateExperimentRequest): Promise<any> {
    return this.request('/experiments', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }
  
  async listExperiments(): Promise<{ experiments: any[] }> {
    return this.request('/experiments')
  }
  
  async getExperiment(id: string): Promise<any> {
    return this.request(`/experiments/${id}`)
  }
  
  async deleteExperiment(id: string): Promise<{ success: boolean }> {
    return this.request(`/experiments/${id}`, { method: 'DELETE' })
  }
  
  // Dataset endpoints
  async createDataset(config: {
    name: string
    description?: string
    input_dim: number
    output_dim: number
    examples: Array<{ inputs: number[]; targets: number[] }>
  }): Promise<any> {
    return this.request('/datasets', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  }
  
  async listDatasets(): Promise<{ datasets: any[] }> {
    return this.request('/datasets')
  }
  
  async getDataset(id: string): Promise<any> {
    return this.request(`/datasets/${id}`)
  }
  
  // Export endpoints
  async exportModel(networkData: any): Promise<any> {
    return this.request('/export/model', {
      method: 'POST',
      body: JSON.stringify(networkData),
    })
  }
  
  async exportCode(networkData: any): Promise<{ code: string }> {
    return this.request('/export/code', {
      method: 'POST',
      body: JSON.stringify(networkData),
    })
  }
  
  // Educational endpoints
  async getConcept(concept: string): Promise<any> {
    return this.request(`/concepts/${concept}`)
  }
}

export const api = new ApiClient()
