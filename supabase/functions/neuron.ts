/**
 * CAMBRIC LABS - Neural Network Edge Function
 */

const activations = {
  relu: (x) => Math.max(0, x),
  sigmoid: (x) => 1 / (1 + Math.exp(-x)),
  tanh: (x) => Math.tanh(x),
  identity: (x) => x,
}

const losses = {
  mse: (pred, target) => (pred - target) ** 2,
  mae: (pred, target) => Math.abs(pred - target),
}

function createNeuron(inputCount, activation = 'relu') {
  const weights = Array.from({ length: inputCount }, () => Math.random() * 0.5 - 0.25)
  return {
    input_count: inputCount,
    weights,
    bias: Math.random() * 0.5 - 0.25,
    activation,
    loss_function: 'mse',
  }
}

function forwardNeuron(neuron, inputs) {
  let weightedSum = neuron.bias
  for (let i = 0; i < neuron.input_count; i++) {
    weightedSum += inputs[i] * neuron.weights[i]
  }
  const actFn = activations[neuron.activation] || activations.identity
  return actFn(weightedSum)
}

function trainNeuron(neuron, inputs, target, lr = 0.01) {
  let weightedSum = neuron.bias
  for (let i = 0; i < neuron.input_count; i++) {
    weightedSum += inputs[i] * neuron.weights[i]
  }
  const actFn = activations[neuron.activation] || activations.identity
  const output = actFn(weightedSum)
  const lossFn = losses[neuron.loss_function || 'mse'] || losses.mse
  const loss = lossFn(output, target)
  const gradient = 2 * (output - target) * (neuron.activation === 'relu' ? (weightedSum > 0 ? 1 : 0) : 1)
  const newWeights = neuron.weights.map((w, i) => w - lr * gradient * inputs[i])
  const newBias = neuron.bias - lr * gradient
  return { neuron: { ...neuron, weights: newWeights, bias: newBias }, loss, gradient }
}

Deno.serve(async (req) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean).slice(-1)[0]
    const body = req.method !== 'GET' ? await req.json() : {}
    
    if (path === 'create') {
      const neuron = createNeuron(body.input_count || 3, body.activation || 'relu')
      return new Response(JSON.stringify({ success: true, neuron }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    if (path === 'forward') {
      const { neuron_state, request } = body
      const inputs = request?.inputs || body.inputs
      if (!neuron_state || !inputs) throw new Error('Missing neuron_state or inputs')
      const output = forwardNeuron(neuron_state, inputs)
      return new Response(JSON.stringify({ output, details: { weighted_sum: neuron_state.weights.reduce((s, w, i) => s + w * inputs[i], 0) + neuron_state.bias, bias: neuron_state.bias } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    if (path === 'train') {
      const { neuron_state, request } = body
      const inputs = request?.inputs || body.inputs
      const targets = request?.targets || body.targets
      const lr = request?.learning_rate || body.learning_rate || 0.01
      if (!neuron_state || !inputs || !targets) throw new Error('Missing required fields')
      const before = { weights: [...neuron_state.weights], bias: neuron_state.bias }
      const result = trainNeuron(neuron_state, inputs, targets[0] || targets, lr)
      return new Response(JSON.stringify({ success: true, loss: result.loss, before, after: { weights: result.neuron.weights, bias: result.neuron.bias }, gradient: result.gradient, neuron: result.neuron }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    
    return new Response(JSON.stringify({ error: 'Not found', endpoints: ['create', 'forward', 'train'] }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
