import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  BookOpen, ChevronRight, ChevronLeft, CheckCircle, 
  Play, ArrowRight, RotateCcw, Zap, Target, TrendingDown,
  Layers, Network, Code, Brain
} from 'lucide-react'
import styles from './LearnPage.module.css'

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  icon: React.ReactNode
  content: {
    simple: string
    technical: string
    formula?: string
    example?: {
      description: string
      code?: string
    }
  }
  interactive?: boolean
}

const lessons: Lesson[] = [
  {
    id: 'what-is-neuron',
    title: 'What is a Neuron?',
    description: 'Learn the building block of neural networks.',
    duration: '5 min',
    icon: <Brain size={24} />,
    content: {
      simple: `A neuron is like a tiny decision-maker. It takes numbers as input, combines them in a specific way, and produces an output. Think of it like a recipe: you have ingredients (inputs), you combine them with different amounts (weights), and you get a dish (output).`,
      technical: `A neuron computes: output = activation(sum(inputs × weights) + bias). It takes an input vector, multiplies each input by a corresponding weight, sums the results, adds a bias, and passes the result through an activation function.`,
      formula: 'y = f(Σᵢ wᵢxᵢ + b)',
      example: {
        description: 'Imagine a neuron that decides if you should go outside:',
        code: `inputs: [sunny=1, warm=1, weekend=1]
weights: [0.8, 0.6, 0.9]
bias: -2.0

calculation: 0.8×1 + 0.6×1 + 0.9×1 + (-2.0) = 0.3
If positive → go outside!`
      }
    },
    interactive: true
  },
  {
    id: 'inputs-weights',
    title: 'Inputs and Weights',
    description: 'Understand how neurons receive and process information.',
    duration: '8 min',
    icon: <Network size={24} />,
    content: {
      simple: `Inputs are the data you give the neuron - numbers that represent real things. Weights are how much the neuron "listens" to each input. A high weight means "this input is very important." A low or negative weight means "ignore this" or "the opposite matters."`,
      technical: `Inputs are features of your data, normalized to similar ranges. Weights are trainable parameters that scale each input's contribution. Initialized randomly, they're adjusted during training to minimize loss.`,
      formula: 'contributionᵢ = inputᵢ × weightᵢ',
      example: {
        description: 'How weights control what the neuron learns:',
        code: `weight = 0.8 → "pay attention"
weight = 0.1 → "mostly ignore"
weight = -0.5 → "opposite effect"
weight = 0 → "completely ignore"`
      }
    }
  },
  {
    id: 'bias',
    title: 'The Role of Bias',
    description: 'Learn why bias is essential in neural networks.',
    duration: '5 min',
    icon: <Target size={24} />,
    content: {
      simple: `Bias is like a base tendency. Even if all weights were zero, bias lets the neuron have a default output. Think of it like a thermostat: the bias determines what temperature the heater turns on by default.`,
      technical: `Bias shifts the activation function left or right. It allows the neuron to output non-zero values even when all inputs are zero. Mathematically: y = f(Σwx + b), where b is the bias.`,
      formula: 'b (bias) shifts the decision boundary',
      example: {
        description: 'Bias as a threshold:',
        code: `Without bias: sum must be > 0 to activate
With bias = -2: sum only needs > 2 to activate
With bias = +2: sum activates even if negative`
      }
    }
  },
  {
    id: 'activation',
    title: 'Activation Functions',
    description: 'Discover how activation functions introduce non-linearity.',
    duration: '10 min',
    icon: <Zap size={24} />,
    content: {
      simple: `An activation function decides WHEN the neuron should "fire." Without it, stacking layers wouldn't work. It's like a light switch - only turns on above a certain threshold.`,
      technical: `Activation functions introduce non-linearity, allowing networks to learn complex patterns. Common functions: ReLU (max(0, x)), Sigmoid (0 to 1), Tanh (-1 to 1). The derivative of the activation is crucial for backpropagation.`,
      formula: 'ReLU: f(x) = max(0, x)\nSigmoid: f(x) = 1/(1+e⁻ˣ)\nTanh: f(x) = (eˣ-e⁻ˣ)/(eˣ+e⁻ˣ)',
      example: {
        description: 'How different activations behave:',
        code: `ReLU: 5 → 5, -3 → 0 (fast, common)
Sigmoid: 5 → 0.99, -5 → 0.01 (smooth, 0-1)
Tanh: 5 → 0.99, -5 → -0.99 (smooth, -1 to 1)`
      }
    }
  },
  {
    id: 'layers',
    title: 'Layers and Deep Networks',
    description: 'Stack neurons into layers to build deep networks.',
    duration: '12 min',
    icon: <Layers size={24} />,
    content: {
      simple: `A layer is a group of neurons that work together. Each neuron in a layer sees the same inputs but has different weights. Layers stack on top of each other - outputs from one become inputs to the next.`,
      technical: `A dense layer computes: y = f(Wx + b) where W is a weight matrix, x is the input vector, b is the bias vector, and f is applied element-wise. Deep networks learn hierarchical representations.`,
      formula: 'Layer output: y = f(W · x + b)',
      example: {
        description: 'Layer sizes and what they mean:',
        code: `Input: 784 neurons (28×28 image)
Layer 1: 128 neurons (learns edges)
Layer 2: 64 neurons (learns shapes)  
Layer 3: 32 neurons (learns features)
Output: 10 neurons (digit classes)`
      }
    }
  },
  {
    id: 'forward-pass',
    title: 'The Forward Pass',
    description: 'See how data flows through a neural network.',
    duration: '8 min',
    icon: <ArrowRight size={24} />,
    content: {
      simple: `The forward pass is when data enters the network and flows through each layer until it produces an output. It's like reading a recipe from top to bottom. Each layer transforms the data a little.`,
      technical: `During inference, input x₀ passes through each layer: x₁ = f₁(W₁x₀ + b₁), x₂ = f₂(W₂x₁ + b₂), ..., until xₙ gives the final prediction. No weight updates occur.`,
      formula: 'x₁ = f₁(W₁x₀ + b₁) → x₂ = f₂(W₂x₁ + b₂) → ... → ŷ'
    }
  },
  {
    id: 'loss',
    title: 'Measuring Error: Loss Functions',
    description: 'Understand how we measure how wrong a network is.',
    duration: '10 min',
    icon: <TrendingDown size={24} />,
    content: {
      simple: `Loss is how "wrong" the network's prediction was. If you want to predict 5 and got 3, your loss is 2 (or 4 if we square it). The network tries to make this number as small as possible.`,
      technical: `Loss functions measure the difference between predictions and targets. Mean Squared Error (MSE) is common for regression: L = (1/n)Σ(ŷ - y)². Cross-entropy is used for classification.`,
      formula: 'MSE: L = (1/n) Σ(ŷᵢ - yᵢ)²',
      example: {
        description: 'Loss in action:',
        code: `prediction: 0.7, target: 1.0
loss: (0.7 - 1.0)² = 0.09

prediction: 0.2, target: 1.0
loss: (0.2 - 1.0)² = 0.64

Lower loss = better prediction`
      }
    }
  },
  {
    id: 'gradients',
    title: 'What are Gradients?',
    description: 'Learn about slopes and directions of steepest descent.',
    duration: '12 min',
    icon: <ChevronRight size={24} />,
    content: {
      simple: `A gradient tells you which direction makes the loss bigger and which makes it smaller. It's like standing on a hill - gradient points downhill. We move opposite to the gradient to reduce loss.`,
      technical: `The gradient ∂L/∂w tells us how loss changes with respect to each weight. Gradient descent updates: w = w - η(∂L/∂w) where η is the learning rate.`,
      formula: 'w_new = w_old - η × ∂L/∂w',
      example: {
        description: 'Gradient descent in 1D:',
        code: `If ∂L/∂w = +2.5, loss increases when w increases
So we subtract: w = w - 0.01 × 2.5 = w - 0.025

If ∂L/∂w = -1.3, loss decreases when w increases
So we add: w = w - 0.01 × (-1.3) = w + 0.013`
      }
    }
  },
  {
    id: 'backpropagation',
    title: 'Backpropagation Explained',
    description: 'The algorithm that trains neural networks.',
    duration: '15 min',
    icon: <RotateCcw size={24} />,
    content: {
      simple: `Backpropagation is how the network learns. It goes backwards through the network, calculating how much each weight contributed to the error. Then it adjusts weights to reduce that error.`,
      technical: `Backpropagation uses the chain rule to compute gradients layer by layer: ∂L/∂w = ∂L/∂ŷ × ∂ŷ/∂x × ∂x/∂w. It efficiently computes all gradients in one backward pass.`,
      formula: 'Chain rule: ∂L/∂w = ∂L/∂ŷ × ∂ŷ/∂x × ∂x/∂w'
    }
  },
  {
    id: 'training-loop',
    title: 'The Training Loop',
    description: 'Put it all together: iterate, learn, improve.',
    duration: '10 min',
    icon: <Code size={24} />,
    content: {
      simple: `Training is repeating: forward pass → calculate loss → backpropagate → update weights. Do this thousands of times, and the network learns to make better predictions.`,
      technical: `The training loop: 1) Forward pass 2) Compute loss 3) Backward pass (compute gradients) 4) Update weights (optimizer.step()). Repeat for multiple epochs.`,
      formula: 'for epoch in range(epochs):\n  for batch in dataloader:\n    loss = forward(batch)\n    backward(loss)\n    optimizer.step()'
    }
  },
  {
    id: 'overfitting',
    title: 'Overfitting and Underfitting',
    description: 'Learn about common problems and how to avoid them.',
    duration: '12 min',
    icon: <CheckCircle size={24} />,
    content: {
      simple: `Overfitting is memorizing instead of learning - the network does great on training data but fails on new data. Underfitting is the opposite - it can't even learn the training data.`,
      technical: `Overfitting: train loss ↓ while val loss ↑. Solutions: regularization (L1/L2), dropout, early stopping, more data. Underfitting: both losses high. Solutions: larger model, more training, better features.`
    }
  },
  {
    id: 'next-steps',
    title: 'Next Steps',
    description: 'Where to go from here.',
    duration: '5 min',
    icon: <ArrowRight size={24} />,
    content: {
      simple: `You've learned the fundamentals! Now build your first network in the Lab. Try different architectures, experiment with activation functions, and watch how training changes the weights.`,
      technical: `Next: Convolutional Neural Networks (for images), Recurrent Networks (for sequences), Transformers (for text). Explore optimizers (Adam, SGD, RMSprop) and regularization techniques.`
    }
  }
]

export function LearnPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  
  const currentLessonIndex = lessons.findIndex(l => l.id === lessonId)
  const currentLesson = lessons[currentLessonIndex]
  
  const [explainMode, setExplainMode] = useState<'simple' | 'technical'>('simple')
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  
  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cambric_lesson_progress')
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)))
    }
  }, [])
  
  const markComplete = (id: string) => {
    const newCompleted = new Set(completedLessons)
    newCompleted.add(id)
    setCompletedLessons(newCompleted)
    localStorage.setItem('cambric_lesson_progress', JSON.stringify([...newCompleted]))
  }
  
  if (lessonId && currentLesson) {
    const isCompleted = completedLessons.has(currentLesson.id)
    
    return (
      <div className={styles.lessonPage}>
        <header className={styles.lessonHeader}>
          <button onClick={() => navigate('/cambric-labs/learn')} className={styles.backBtn}>
            <ChevronLeft size={20} />
            Back to Curriculum
          </button>
          
          <div className={styles.lessonNav}>
            {currentLessonIndex > 0 && (
              <Link to={`/cambric-labs/learn/${lessons[currentLessonIndex - 1].id}`} className={styles.navBtn}>
                <ChevronLeft size={16} />
                Previous
              </Link>
            )}
            {currentLessonIndex < lessons.length - 1 && (
              <Link to={`/cambric-labs/learn/${lessons[currentLessonIndex + 1].id}`} className={styles.navBtn}>
                Next
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </header>
        
        <main className={styles.lessonContent}>
          <div className={styles.lessonTitleSection}>
            <div className={styles.lessonIcon}>{currentLesson.icon}</div>
            <div>
              <h1>{currentLesson.title}</h1>
              <span className={styles.duration}>{currentLesson.duration}</span>
            </div>
            {isCompleted && <span className={styles.completedBadge}><CheckCircle size={16} /> Completed</span>}
          </div>
          
          <div className={styles.explainToggle}>
            <button 
              className={explainMode === 'simple' ? styles.active : ''}
              onClick={() => setExplainMode('simple')}
            >
              Simple Explanation
            </button>
            <button 
              className={explainMode === 'technical' ? styles.active : ''}
              onClick={() => setExplainMode('technical')}
            >
              Technical Details
            </button>
          </div>
          
          <div className={styles.explanationBox}>
            {explainMode === 'simple' ? (
              <p>{currentLesson.content.simple}</p>
            ) : (
              <p>{currentLesson.content.technical}</p>
            )}
          </div>
          
          {currentLesson.content.formula && (
            <div className={styles.formulaBox}>
              <h3>Formula</h3>
              <code>{currentLesson.content.formula}</code>
            </div>
          )}
          
          {currentLesson.content.example && (
            <div className={styles.exampleBox}>
              <h3>Example</h3>
              <p>{currentLesson.content.example.description}</p>
              {currentLesson.content.example.code && (
                <pre><code>{currentLesson.content.example.code}</code></pre>
              )}
            </div>
          )}
          
          {currentLesson.interactive && (
            <div className={styles.interactiveBox}>
              <h3>Try It Yourself</h3>
              <p>Go to the Lab and experiment with:</p>
              <ul>
                <li>Change the weights and see how output changes</li>
                <li>Try different activation functions</li>
                <li>Train the neuron and watch weights update</li>
              </ul>
              <Link to="/cambric-labs/lab" className={styles.tryBtn}>
                Open Lab <ArrowRight size={16} />
              </Link>
            </div>
          )}
          
          <div className={styles.lessonActions}>
            {!isCompleted && (
              <button onClick={() => markComplete(currentLesson.id)} className={styles.completeBtn}>
                <CheckCircle size={18} />
                Mark as Complete
              </button>
            )}
          </div>
        </main>
      </div>
    )
  }
  
  // Curriculum view
  const completedCount = completedLessons.size
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <BookOpen size={32} className={styles.headerIcon} />
          <div>
            <h1>Learn Neural Networks</h1>
            <p>A complete curriculum from basics to advanced concepts.</p>
          </div>
        </div>
        
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(completedCount / lessons.length) * 100}%` }} 
            />
          </div>
          <span>{completedCount} of {lessons.length} lessons completed</span>
        </div>
      </header>
      
      <section className={styles.curriculum}>
        <h2>Lessons</h2>
        
        <div className={styles.lessonList}>
          {lessons.map((lesson, index) => {
            const isComplete = completedLessons.has(lesson.id)
            const isNext = !isComplete && (index === 0 || completedLessons.has(lessons[index - 1].id))
            
            return (
              <Link
                key={lesson.id}
                to={`/cambric-labs/learn/${lesson.id}`}
                className={`${styles.lessonCard} ${isComplete ? styles.completed : ''} ${isNext ? styles.next : ''}`}
              >
                <div className={styles.lessonNumber}>
                  {isComplete ? (
                    <CheckCircle size={20} className={styles.completedIcon} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                <div className={styles.lessonIconSmall}>{lesson.icon}</div>
                
                <div className={styles.lessonContent}>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                </div>
                
                <div className={styles.lessonMeta}>
                  <span className={styles.duration}>{lesson.duration}</span>
                  {isNext && (
                    <span className={styles.nextBadge}>
                      <Play size={12} />
                      Start Here
                    </span>
                  )}
                </div>
                
                <ChevronRight size={20} className={styles.arrow} />
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
