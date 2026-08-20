import type { LearningCatalog } from '../types'

export const learningCatalog: LearningCatalog = {
  version: 1,

  tracks: [
    {
      id: 'artificial-intelligence',
      title: 'Artificial Intelligence',
      description: 'Understand neural networks and the foundations of machine learning.',
      order: 1,
      courseIds: ['neural-networks-fundamentals'],
    },
  ],

  courses: [
    {
      id: 'neural-networks-fundamentals',
      title: 'Neural Networks Fundamentals',
      description: 'A complete introduction to neural networks, from neurons to training.',
      trackId: 'artificial-intelligence',
      order: 1,
      lessonIds: [
        'what-is-neuron',
        'inputs-weights',
        'bias',
        'activation',
        'layers',
        'forward-pass',
        'loss',
        'gradients',
        'backpropagation',
        'training-loop',
        'overfitting',
        'next-steps',
      ],
    },
  ],

  lessons: [
    {
      id: 'what-is-neuron',
      title: 'What is a Neuron?',
      description: 'Learn the building block of neural networks.',
      durationMinutes: 5,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 1,
      icon: 'brain',
      prerequisites: [],
      tags: ['neural-networks', 'neurons', 'fundamentals'],
      blocks: [
        {
          type: 'text',
          id: 'what-is-neuron-text',
          simple: 'A neuron is like a tiny decision-maker. It takes numbers as input, combines them in a specific way, and produces an output. Think of it like a recipe: you have ingredients (inputs), you combine them with different amounts (weights), and you get a dish (output).',
          technical: 'A neuron computes: output = activation(sum(inputs × weights) + bias). It takes an input vector, multiplies each input by a corresponding weight, sums the results, adds a bias, and passes the result through an activation function.',
        },
        {
          type: 'formula',
          id: 'what-is-neuron-formula',
          value: 'y = f(Σᵢ wᵢxᵢ + b)',
        },
        {
          type: 'example',
          id: 'what-is-neuron-example',
          description: 'Imagine a neuron that decides if you should go outside:',
          code: `inputs: [sunny=1, warm=1, weekend=1]
weights: [0.8, 0.6, 0.9]
bias: -2.0

calculation: 0.8×1 + 0.6×1 + 0.9×1 + (-2.0) = 0.3
If positive → go outside!`,
        },
        {
          type: 'interactive',
          id: 'what-is-neuron-interactive',
          title: 'Try It Yourself',
          description: 'Experiment with the neuron in the Lab.',
          actions: [
            'Change the weights and see how output changes',
            'Try different activation functions',
            'Train the neuron and watch weights update',
          ],
          link: {
            label: 'Open Lab',
            href: '/cambric-labs/lab',
          },
        },
      ],
    },

    {
      id: 'inputs-weights',
      title: 'Inputs and Weights',
      description: 'Understand how neurons receive and process information.',
      durationMinutes: 8,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 2,
      icon: 'network',
      prerequisites: ['what-is-neuron'],
      tags: ['inputs', 'weights', 'neural-networks'],
      blocks: [
        {
          type: 'text',
          id: 'inputs-weights-text',
          simple: 'Inputs are the data you give the neuron - numbers that represent real things. Weights are how much the neuron "listens" to each input. A high weight means "this input is very important." A low or negative weight means "ignore this" or "the opposite matters."',
          technical: 'Inputs are features of your data, normalized to similar ranges. Weights are trainable parameters that scale each input\'s contribution. Initialized randomly, they\'re adjusted during training to minimize loss.',
        },
        {
          type: 'formula',
          id: 'inputs-weights-formula',
          value: 'contributionᵢ = inputᵢ × weightᵢ',
        },
        {
          type: 'example',
          id: 'inputs-weights-example',
          description: 'How weights control what the neuron learns:',
          code: `weight = 0.8 → "pay attention"
weight = 0.1 → "mostly ignore"
weight = -0.5 → "opposite effect"
weight = 0 → "completely ignore"`,
        },
      ],
    },

    {
      id: 'bias',
      title: 'The Role of Bias',
      description: 'Learn why bias is essential in neural networks.',
      durationMinutes: 5,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 3,
      icon: 'target',
      prerequisites: ['inputs-weights'],
      tags: ['bias', 'neurons', 'fundamentals'],
      blocks: [
        {
          type: 'text',
          id: 'bias-text',
          simple: 'Bias is like a base tendency. Even if all weights were zero, bias lets the neuron have a default output. Think of it like a thermostat: the bias determines what temperature the heater turns on by default.',
          technical: 'Bias shifts the activation function left or right. It allows the neuron to output non-zero values even when all inputs are zero. Mathematically: y = f(Σwx + b), where b is the bias.',
        },
        {
          type: 'formula',
          id: 'bias-formula',
          value: 'b (bias) shifts the decision boundary',
        },
        {
          type: 'example',
          id: 'bias-example',
          description: 'Bias as a threshold:',
          code: `Without bias: sum must be > 0 to activate
With bias = -2: sum only needs > 2 to activate
With bias = +2: sum activates even if negative`,
        },
      ],
    },

    {
      id: 'activation',
      title: 'Activation Functions',
      description: 'Discover how activation functions introduce non-linearity.',
      durationMinutes: 10,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 4,
      icon: 'zap',
      prerequisites: ['bias'],
      tags: ['activation', 'relu', 'sigmoid', 'tanh'],
      blocks: [
        {
          type: 'text',
          id: 'activation-text',
          simple: 'An activation function decides WHEN the neuron should "fire." Without it, stacking layers wouldn\'t work. It\'s like a light switch - only turns on above a certain threshold.',
          technical: 'Activation functions introduce non-linearity, allowing networks to learn complex patterns. Common functions: ReLU (max(0, x)), Sigmoid (0 to 1), Tanh (-1 to 1). The derivative of the activation is crucial for backpropagation.',
        },
        {
          type: 'formula',
          id: 'activation-formula',
          value: `ReLU: f(x) = max(0, x)
Sigmoid: f(x) = 1/(1+e⁻ˣ)
Tanh: f(x) = (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ)`,
        },
        {
          type: 'example',
          id: 'activation-example',
          description: 'How different activations behave:',
          code: `ReLU: 5 → 5, -3 → 0 (fast, common)
Sigmoid: 5 → 0.99, -5 → 0.01 (smooth, 0-1)
Tanh: 5 → 0.99, -5 → -0.99 (smooth, -1 to 1)`,
        },
      ],
    },

    {
      id: 'layers',
      title: 'Layers and Deep Networks',
      description: 'Stack neurons into layers to build deep networks.',
      durationMinutes: 12,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 5,
      icon: 'layers',
      prerequisites: ['activation'],
      tags: ['layers', 'deep-learning', 'architecture'],
      blocks: [
        {
          type: 'text',
          id: 'layers-text',
          simple: 'A layer is a group of neurons that work together. Each neuron in a layer sees the same inputs but has different weights. Layers stack on top of each other - outputs from one become inputs to the next.',
          technical: 'A dense layer computes: y = f(Wx + b) where W is a weight matrix, x is the input vector, b is the bias vector, and f is applied element-wise. Deep networks learn hierarchical representations.',
        },
        {
          type: 'formula',
          id: 'layers-formula',
          value: 'Layer output: y = f(W · x + b)',
        },
        {
          type: 'example',
          id: 'layers-example',
          description: 'Layer sizes and what they mean:',
          code: `Input: 784 neurons (28×28 image)
Layer 1: 128 neurons (learns edges)
Layer 2: 64 neurons (learns shapes)
Layer 3: 32 neurons (learns features)
Output: 10 neurons (digit classes)`,
        },
      ],
    },

    {
      id: 'forward-pass',
      title: 'The Forward Pass',
      description: 'See how data flows through a neural network.',
      durationMinutes: 8,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 6,
      icon: 'arrow-right',
      prerequisites: ['layers'],
      tags: ['forward-pass', 'inference', 'data-flow'],
      blocks: [
        {
          type: 'text',
          id: 'forward-pass-text',
          simple: 'The forward pass is when data enters the network and flows through each layer until it produces an output. It\'s like reading a recipe from top to bottom. Each layer transforms the data a little.',
          technical: 'During inference, input x₀ passes through each layer: x₁ = f₁(W₁x₀ + b₁), x₂ = f₂(W₂x₁ + b₂), ..., until xₙ gives the final prediction. No weight updates occur.',
        },
        {
          type: 'formula',
          id: 'forward-pass-formula',
          value: 'x₁ = f₁(W₁x₀ + b₁) → x₂ = f₂(W₂x₁ + b₂) → ... → ŷ',
        },
      ],
    },

    {
      id: 'loss',
      title: 'Measuring Error: Loss Functions',
      description: 'Understand how we measure how wrong a network is.',
      durationMinutes: 10,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 7,
      icon: 'trending-down',
      prerequisites: ['forward-pass'],
      tags: ['loss', 'mse', 'error'],
      blocks: [
        {
          type: 'text',
          id: 'loss-text',
          simple: 'Loss is how "wrong" the network\'s prediction was. If you want to predict 5 and got 3, your loss is 2 (or 4 if we square it). The network tries to make this number as small as possible.',
          technical: 'Loss functions measure the difference between predictions and targets. Mean Squared Error (MSE) is common for regression: L = (1/n)Σ(ŷ - y)². Cross-entropy is used for classification.',
        },
        {
          type: 'formula',
          id: 'loss-formula',
          value: 'MSE: L = (1/n) Σ(ŷᵢ - yᵢ)²',
        },
        {
          type: 'example',
          id: 'loss-example',
          description: 'Loss in action:',
          code: `prediction: 0.7, target: 1.0
loss: (0.7 - 1.0)² = 0.09

prediction: 0.2, target: 1.0
loss: (0.2 - 1.0)² = 0.64

Lower loss = better prediction`,
        },
      ],
    },

    {
      id: 'gradients',
      title: 'What are Gradients?',
      description: 'Learn about slopes and directions of steepest descent.',
      durationMinutes: 12,
      difficulty: 'intermediate',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 8,
      icon: 'chevron-right',
      prerequisites: ['loss'],
      tags: ['gradients', 'gradient-descent', 'optimization'],
      blocks: [
        {
          type: 'text',
          id: 'gradients-text',
          simple: 'A gradient tells you which direction makes the loss bigger and which makes it smaller. It\'s like standing on a hill - gradient points downhill. We move opposite to the gradient to reduce loss.',
          technical: 'The gradient ∂L/∂w tells us how loss changes with respect to each weight. Gradient descent updates: w = w - η(∂L/∂w) where η is the learning rate.',
        },
        {
          type: 'formula',
          id: 'gradients-formula',
          value: 'w_new = w_old - η × ∂L/∂w',
        },
        {
          type: 'example',
          id: 'gradients-example',
          description: 'Gradient descent in 1D:',
          code: `If ∂L/∂w = +2.5, loss increases when w increases
So we subtract: w = w - 0.01 × 2.5 = w - 0.025

If ∂L/∂w = -1.3, loss decreases when w increases
So we add: w = w - 0.01 × (-1.3) = w + 0.013`,
        },
      ],
    },

    {
      id: 'backpropagation',
      title: 'Backpropagation Explained',
      description: 'The algorithm that trains neural networks.',
      durationMinutes: 15,
      difficulty: 'intermediate',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 9,
      icon: 'rotate-ccw',
      prerequisites: ['gradients'],
      tags: ['backpropagation', 'chain-rule', 'training'],
      blocks: [
        {
          type: 'text',
          id: 'backpropagation-text',
          simple: 'Backpropagation is how the network learns. It goes backwards through the network, calculating how much each weight contributed to the error. Then it adjusts weights to reduce that error.',
          technical: 'Backpropagation uses the chain rule to compute gradients layer by layer: ∂L/∂w = ∂L/∂ŷ × ∂ŷ/∂x × ∂x/∂w. It efficiently computes all gradients in one backward pass.',
        },
        {
          type: 'formula',
          id: 'backpropagation-formula',
          value: 'Chain rule: ∂L/∂w = ∂L/∂ŷ × ∂ŷ/∂x × ∂x/∂w',
        },
      ],
    },

    {
      id: 'training-loop',
      title: 'The Training Loop',
      description: 'Put it all together: iterate, learn, improve.',
      durationMinutes: 10,
      difficulty: 'intermediate',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 10,
      icon: 'code',
      prerequisites: ['backpropagation'],
      tags: ['training', 'epochs', 'optimizers'],
      blocks: [
        {
          type: 'text',
          id: 'training-loop-text',
          simple: 'Training is repeating: forward pass → calculate loss → backpropagate → update weights. Do this thousands of times, and the network learns to make better predictions.',
          technical: 'The training loop: 1) Forward pass 2) Compute loss 3) Backward pass (compute gradients) 4) Update weights (optimizer.step()). Repeat for multiple epochs.',
        },
        {
          type: 'formula',
          id: 'training-loop-formula',
          value: `for epoch in range(epochs):
  for batch in dataloader:
    loss = forward(batch)
    backward(loss)
    optimizer.step()`,
        },
      ],
    },

    {
      id: 'overfitting',
      title: 'Overfitting and Underfitting',
      description: 'Learn about common problems and how to avoid them.',
      durationMinutes: 12,
      difficulty: 'intermediate',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 11,
      icon: 'check-circle',
      prerequisites: ['training-loop'],
      tags: ['overfitting', 'underfitting', 'regularization'],
      blocks: [
        {
          type: 'text',
          id: 'overfitting-text',
          simple: 'Overfitting is memorizing instead of learning - the network does great on training data but fails on new data. Underfitting is the opposite - it can\'t even learn the training data.',
          technical: 'Overfitting: train loss ↓ while val loss ↑. Solutions: regularization (L1/L2), dropout, early stopping, more data. Underfitting: both losses high. Solutions: larger model, more training, better features.',
        },
      ],
    },

    {
      id: 'next-steps',
      title: 'Next Steps',
      description: 'Where to go from here.',
      durationMinutes: 5,
      difficulty: 'beginner',
      trackId: 'artificial-intelligence',
      courseId: 'neural-networks-fundamentals',
      order: 12,
      icon: 'arrow-right',
      prerequisites: ['overfitting'],
      tags: ['next-steps', 'cnn', 'rnn', 'transformers', 'optimizers'],
      blocks: [
        {
          type: 'text',
          id: 'next-steps-text',
          simple: 'You\'ve learned the fundamentals! Now build your first network in the Lab. Try different architectures, experiment with activation functions, and watch how training changes the weights.',
          technical: 'Next: Convolutional Neural Networks (for images), Recurrent Networks (for sequences), Transformers (for text). Explore optimizers (Adam, SGD, RMSprop) and regularization techniques.',
        },
      ],
    },
  ],
}
