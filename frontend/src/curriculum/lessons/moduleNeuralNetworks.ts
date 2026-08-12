/**
 * Cambric Labs — Module: Neural Networks (AI)
 *
 * Two lessons: how a neuron computes (forward pass) and how it learns
 * (gradient descent and backpropagation).
 */
import type { LessonDetail } from '../types'

export const neuralNetworksLessons: LessonDetail[] = [
  {
    id: 'lesson-neuron-forward-pass',
    title: 'A Neuron: Weighted Sum, Then Squash',
    moduleId: 'module-neural-networks',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 13,
    summary:
      'A neuron multiplies each input by a weight, sums them, adds a bias, ' +
      'and applies an activation function. Stacking neurons in layers makes ' +
      'a network.',
    teachesConceptIds: ['neural-network', 'activation-function', 'weights', 'bias', 'vector'],
    prerequisiteConceptIds: ['vector', 'matrix', 'function', 'supervised-learning'],
    objectives: [
      'Compute the output of a single neuron by hand.',
      'Explain why a non-linear activation is essential.',
      'Combine neurons into a dense layer as a matrix multiply.',
      'Distinguish weights from biases.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A neural network is a stack of tiny arithmetic units called ' +
          'neurons. Each neuron does one thing: multiply each input by a ' +
          'weight, sum them, add a bias, and pass the result through a ' +
          'non-linear "activation function." That single recipe, repeated ' +
          'and stacked, is enough to approximate remarkably complex functions.',
      },
      {
        kind: 'heading',
        text: 'The neuron formula',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A single neuron with two inputs.',
        code: 'def neuron(x1, x2, w1, w2, b):\n    z = x1*w1 + x2*w2 + b   # weighted sum + bias\n    return relu(z)            # activation\n\ndef relu(z):\n    return max(0, z)\n\nprint(neuron(2, 3, 0.5, -1, 0.1))  # relu(2*0.5 + 3*-1 + 0.1) = relu(-1.9) = 0',
        output: '0',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Weights scale, biases shift',
        text:
          'A weight (w) scales how much each input contributes. The bias (b) ' +
          'shifts the sum independently of the inputs — it is a threshold. ' +
          'Together they position the neuron\'s decision boundary; training ' +
          'is the search for the right weights and biases.',
      },
      {
        kind: 'heading',
        text: 'Why the activation must be non-linear',
      },
      {
        kind: 'paragraph',
        text:
          'Without a non-linear activation, a stack of linear neurons is just ' +
          'one big linear function — composing linear with linear is linear. ' +
          'The non-linearity (relu, sigmoid, tanh) is what lets the network ' +
          'represent curved, complex decision boundaries. Remove it and the ' +
          'network cannot approximate anything a single line could not.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Linear of linear is linear',
        text:
          'Two linear layers without an activation compose to one linear ' +
          'layer: f(g(x)) = a(bx+c)+d = abx + (ac+d), still linear. So a ' +
          'deep linear network is no more expressive than a shallow one. The ' +
          'activation function is what makes depth meaningful.',
      },
      {
        kind: 'heading',
        text: 'A layer is a matrix multiply',
      },
      {
        kind: 'paragraph',
        text:
          'A dense layer of m neurons, each reading n inputs, is just a ' +
          'matrix multiply: output = activation(W · x + b), where W is an ' +
          'm×n weight matrix and b is an m-vector of biases. This is why ' +
          'GPUs (fast at matrix multiply) dominate deep learning.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'A 2-neuron layer from 3 inputs, as a matrix multiply.',
        code: 'import numpy as np\n\n# 3 inputs\nx = np.array([1.0, 2.0, -1.0])\n# 2 neurons, each with 3 weights (a 2x3 matrix) and a bias\nW = np.array([[0.5, -0.5, 1.0],\n              [0.1,  0.2, 0.3]])\nb = np.array([0.0, 0.1])\n\nz = W @ x + b          # weighted sums + bias, shape (2,)\nprint(z)               # [ 0.0  0.2]\nprint(np.maximum(0, z)) # relu → [0.0 0.2]',
        output: '[0. 0.2]\n[0.  0.2]',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'Matrix multiply = parallel neurons',
        text:
          'The W @ x line computes BOTH neurons at once. Each row of W is one ' +
          'neuron\'s weights. GPUs do these matrix multiplies in parallel for ' +
          'millions of neurons — that is the whole reason deep learning runs ' +
          'on GPUs.',
      },
      {
        kind: 'heading',
        text: 'Common activations',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'ReLU, sigmoid, tanh — different squashing curves.',
        code: 'def relu(z):    return max(0, z)          # 0 below 0, identity above; default for hidden layers\ndef sigmoid(z): return 1/(1+2.718**-z)  # 0..1 S-curve; for binary output\ndef tanh(z):    return (2.718**z - 2.718**-z)/(2.718**z + 2.718**-z)  # -1..1',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Hand-rolled vs numpy: the math is identical; numpy vectorises it ' +
          'for speed and clarity at scale.',
        snippets: [
          'z = x1*w1 + x2*w2 + b  # one neuron, scalar',
          'z = W @ x + b          # whole layer, vectorised',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'A neuron computes: multiply, sum, bias, squash',
      steps: [
        { caption: 'Inputs x1=2, x2=3. Weights w1=0.5, w2=-1. Bias b=0.1.' },
        { caption: 'Multiply: 2*0.5=1.0, 3*-1=-3.0.' },
        { caption: 'Sum + bias: 1.0 + -3.0 + 0.1 = -1.9.' },
        { caption: 'Activate: relu(-1.9) = 0 (clamped to 0).' },
        { caption: 'Output: 0. The neuron "decided" the weighted evidence was below threshold.' },
      ],
    },
    activity: {
      type: 'predictOutput',
      title: 'Compute the neuron output',
      prompt:
        'neuron(1, 1, 2, 3, 1) with relu. What is z before activation, and ' +
        'what is the output?',
      languageId: 'python',
      starterCode: 'def relu(z): return max(0, z)\ndef neuron(x1, x2, w1, w2, b):\n    z = x1*w1 + x2*w2 + b\n    return relu(z)\nprint(neuron(1, 1, 2, 3, 1))',
      checks: [
        { description: 'z = 2+3+1 = 6, relu(6) = 6', assertion: { kind: 'outputEquals', value: '6' } },
      ],
    },
    comprehensionChecks: [
      {
        question: 'Why must the activation function be non-linear?',
        options: [
          'To make the network faster.',
          'Without non-linearity, composing linear layers yields another linear function, so depth adds no expressiveness.',
          'To reduce memory.',
          'Because the CPU requires it.',
        ],
        correctIndex: 1,
        explanation:
          'Linear composed with linear is linear: a deep linear network is no ' +
          'more expressive than a shallow one. Non-linear activations (relu, ' +
          'sigmoid) let the network approximate curved, complex functions — ' +
          'that is what makes depth useful.',
      },
      {
        question: 'In a dense layer expressed as W @ x + b, what do the rows of W represent?',
        options: [
          'Input features.',
          'Each row is one neuron\'s weights — the matrix computes all neurons in parallel.',
          'The biases.',
          'The activations.',
        ],
        correctIndex: 1,
        explanation:
          'Each row of W holds one neuron\'s weights. The matrix multiply ' +
          'computes every neuron\'s weighted sum at once, which is why GPUs ' +
          '(fast at matmul) dominate deep learning.',
      },
    ],
  },

  {
    id: 'lesson-gradient-descent',
    title: 'Gradient Descent: Learning by Walking Downhill',
    moduleId: 'module-neural-networks',
    languageId: 'python',
    difficulty: 4,
    estimatedMinutes: 14,
    summary:
      'Training nudges weights in the direction that reduces loss. The ' +
      'gradient points uphill, so we step opposite it; backprop computes ' +
      'the gradient for every weight at once.',
    teachesConceptIds: ['gradient-descent', 'loss-function', 'backpropagation', 'overfitting', 'neural-network'],
    prerequisiteConceptIds: ['neural-network', 'weights', 'loss-function', 'derivative'],
    objectives: [
      'Describe gradient descent as stepping opposite the loss gradient.',
      'Explain the learning rate and why it matters.',
      'Outline how backprop computes gradients for all weights.',
      'Recognise overfitting and name the mitigations.',
    ],
    content: [
      {
        kind: 'paragraph',
        text:
          'A network starts with random weights and gets almost everything ' +
          'wrong. Training measures the wrongness (the loss), computes which ' +
          'way to nudge each weight to reduce it (the gradient), and takes a ' +
          'small step opposite the gradient. Repeat thousands of times and ' +
          'the loss falls — the network "learns."',
      },
      {
        kind: 'heading',
        text: 'Loss: how wrong are we?',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'Mean squared error: average squared error across samples.',
        code: 'def mse_loss(predictions, targets):\n    return sum((p - t)**2 for p, t in zip(predictions, targets)) / len(predictions)\n\nprint(mse_loss([2.0, 3.0], [1.0, 4.0]))  # ((2-1)^2 + (3-4)^2) / 2 = 1.0',
        output: '1.0',
      },
      {
        kind: 'callout',
        variant: 'info',
        title: 'Loss is the objective',
        text:
          'The loss function turns "the network is wrong" into a number you ' +
          'can minimise. MSE for regression, cross-entropy for classification. ' +
          'Training is literally "reduce the loss number"; the gradient tells ' +
          'you which way is downhill.',
      },
      {
        kind: 'heading',
        text: 'The gradient points uphill — step opposite',
      },
      {
        kind: 'paragraph',
        text:
          'The gradient of the loss with respect to a weight is "how does the ' +
          'loss change if I nudge this weight?" It points UPHILL (toward more ' +
          'loss). To REDUCE loss, step in the OPPOSITE direction: weight = ' +
          'weight - learning_rate * gradient.',
      },
      {
        kind: 'codeWithOutput',
        languageId: 'python',
        caption: 'One-variable gradient descent on f(x) = (x-3)^2, minimum at x=3.',
        code: 'def loss(x): return (x - 3) ** 2\ndef grad(x): return 2 * (x - 3)   # derivative\n\nx = 0.0            # start anywhere\nlr = 0.1           # learning rate\nfor _ in range(50):\n    x = x - lr * grad(x)   # step opposite the gradient\nprint(x)   # ≈ 3.0, the minimum',
        output: '2.9999999999999987',
      },
      {
        kind: 'callout',
        variant: 'tip',
        title: 'The learning rate is the step size',
        text:
          'Too small: training crawls, may never reach the minimum in time. ' +
          'Too large: steps overshoot, bouncing around or diverging (loss ' +
          'explodes). Tuning the learning rate is one of the most impactful ' +
          'hyperparameters; 0.001 is a common starting point for Adam.',
      },
      {
        kind: 'heading',
        text: 'Backprop: gradients for ALL weights at once',
      },
      {
        kind: 'paragraph',
        text:
          'Computing the gradient for one weight by hand is laborious; a ' +
          'network has millions. Backpropagation uses the chain rule from ' +
          'calculus to compute the gradient for EVERY weight in one backward ' +
          'pass through the network. It is the algorithm that makes deep ' +
          'learning tractable — without it, training a million-weight ' +
          'network would be hopeless.',
      },
      {
        kind: 'code',
        languageId: 'python',
        caption: 'PyTorch computes gradients automatically via backprop.',
        code: 'import torch\n\nx = torch.tensor(0.0, requires_grad=True)\nfor _ in range(50):\n    loss = (x - 3) ** 2\n    loss.backward()             # backprop: computes x.grad\n    with torch.no_grad():\n        x -= 0.1 * x.grad       # step opposite the gradient\n        x.grad = None             # clear for next iteration\nprint(x)   # ≈ 3.0',
      },
      {
        kind: 'heading',
        text: 'Overfitting: memorising instead of generalising',
      },
      {
        kind: 'paragraph',
        text:
          'If training drives loss to zero, the network may have MEMORISED ' +
          'the training data — including its noise — and fail on new data. ' +
          'This is overfitting. The cure is to hold out a test set the ' +
          'network never trains on, and stop when TEST loss stops improving. ' +
          'Regularisation (weight decay, dropout) also restrains the model.',
      },
      {
        kind: 'callout',
        variant: 'warning',
        title: 'Train loss down, test loss up = overfitting',
        text:
          'If training loss keeps falling but test loss starts rising, the ' +
          'network is memorising training specifics that do not generalise. ' +
          'Stop early, add regularisation, get more data, or simplify the ' +
          'model. A model that is perfect on training but bad on test is ' +
          'worthless in practice.',
      },
      {
        kind: 'compare',
        languageIds: ['python', 'python'],
        caption:
          'Hand-rolled 1-D descent vs PyTorch autograd for a full network. ' +
          'Backprop is the chain rule, automated.',
        snippets: [
          'x = x - lr * grad(x)   # manual 1-D gradient step',
          'loss.backward()       # autograd computes gradients for all weights',
        ],
      },
    ],
    animation: {
      type: 'dataFlow',
      title: 'Gradient descent on (x-3)^2',
      steps: [
        { caption: 'Start at x=0. Loss = 9. Grad = 2*(0-3) = -6.' },
        { caption: 'Step opposite grad: x = 0 - 0.1*(-6) = 0.6. Loss = 5.76.' },
        { caption: 'Grad at 0.6 = -4.8. x = 0.6 - 0.1*(-4.8) = 1.08. Loss falls.' },
        { caption: 'Repeat. Each step moves toward x=3 where loss=0.' },
        { caption: 'After ~50 steps: x ≈ 3.0, the minimum. The gradient shrank to zero as we approached.' },
      ],
    },
    activity: {
      type: 'multipleChoice',
      title: 'Learning rate too large',
      prompt:
        'If the learning rate is far too large, what happens to the loss ' +
        'during training?',
      languageId: 'pseudo',
      data: {
        question: 'If the learning rate is far too large, what happens?',
        options: [
          'It falls faster.',
          'It oscillates wildly or explodes (diverges) as steps overshoot the minimum repeatedly.',
          'It stays the same.',
          'The model trains perfectly.',
        ],
        correctIndex: 1,
        explanation:
          'A too-large learning rate overshoots: the step is so big it lands ' +
          'on a HIGHER loss than before, then overshoots back. The loss ' +
          'oscillates or explodes. The learning rate must be small enough to ' +
          'descend, not bounce.',
      },
      checks: [],
    },
    comprehensionChecks: [
      {
        question: 'Why do we step OPPOSITE the gradient, not along it?',
        options: [
          'The gradient is unreliable.',
          'The gradient points toward higher loss; stepping opposite descends the loss surface toward a minimum.',
          'Stepping along the gradient is forbidden.',
          'The gradient is zero.',
        ],
        correctIndex: 1,
        explanation:
          'The gradient points in the direction of steepest INCREASE in loss. ' +
          'To REDUCE loss we step opposite the gradient. This is the whole ' +
          'mechanism of gradient descent.',
      },
      {
        question: 'What is overfitting, and what is the primary symptom?',
        options: [
          'Training loss is high.',
          'The model memorises training data (including noise); the symptom is training loss falling while test loss rises.',
          'The model is too small.',
          'The learning rate is too low.',
        ],
        correctIndex: 1,
        explanation:
          'Overfitting is memorising training specifics that do not ' +
          'generalise. The tell-tale sign is training loss falling while ' +
          'held-out test loss rises — the model is getting better at the ' +
          'training data and worse at the real task.',
      },
    ],
  },
]
