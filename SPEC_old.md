# CAMBRIC LABS - Technical Specification

## 1. Concept & Vision

CAMBRIC LABS is an educational and experimental neural-network laboratory where developers learn by building. The philosophy is **transparency over magic**: every number displayed corresponds to actual computation, every animation represents real data flow.

The application transforms abstract neural-network concepts into tangible, interactive experiences. A beginner progresses from understanding a single neuron to comprehending backpropagation. An advanced developer uses the same environment for rapid prototyping.

---

## 2. Design Language

### Aesthetic Direction
**Technical Laboratory** — Clean, precise, engineering-focused. Think oscilloscope meets modern IDE. The interface communicates "real machine" not "AI toy."

### Color Palette
```
--lab-bg-primary: #0D1117        /* Deep space black */
--lab-bg-secondary: #161B22      /* Panel background */
--lab-bg-tertiary: #21262D       /* Elevated surfaces */
--lab-border: #30363D            /* Subtle borders */
--lab-text-primary: #E6EDF3      /* Primary text */
--lab-text-secondary: #8B949E    /* Secondary text */
--lab-text-muted: #484F58        /* Muted labels */
--lab-accent-blue: #58A6FF       /* Primary actions */
--lab-accent-green: #3FB950      /* Success/positive */
--lab-accent-red: #F85149        /* Error/negative */
--lab-accent-orange: #D29922     /* Warnings */
--lab-accent-purple: #A371F7     /* Special features */
--lab-accent-cyan: #39C5CF       /* Data flow */
--lab-grid: #21262D              /* Grid lines */
```

### Typography
- **Primary**: JetBrains Mono (monospace) — For code, numbers, technical content
- **Secondary**: Inter (sans-serif) — For UI labels, explanations
- **Scale**: 12px base, 14px body, 16px headings, 24px titles

### Spatial System
- **Base unit**: 4px
- **Spacing scale**: 4, 8, 12, 16, 24, 32, 48, 64
- **Border radius**: 4px (inputs), 8px (cards), 12px (panels)
- **Panel padding**: 24px

### Motion Philosophy
- **Purpose**: Visualize data flow, not decoration
- **Timing**: 200ms for micro-interactions, 400ms for transitions, 800ms for data flow animations
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Data flow**: Animated paths show signal propagation through neurons

### Visual Assets
- Custom SVG neuron icons (not generic AI imagery)
- Mathematical notation rendered with proper typography
- Grid backgrounds for network visualizations
- Real-time graphs using actual data points

---

## 3. Layout & Structure

### Application Shell
```
┌─────────────────────────────────────────────────────────────┐
│ CAMBRIC LABS              [Learn] [Labs] [Admin]  [⚙️]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     MAIN CONTENT AREA                       │
│                                                             │
│  ┌─────────────┐  ┌───────────────────────────────────────┐  │
│  │   SIDEBAR   │  │           WORKSPACE                   │  │
│  │             │  │                                        │  │
│  │ • Network   │  │  [Visual representation of the        │  │
│  │ • Dataset   │  │   current experiment, neuron,         │  │
│  │ • Training  │  │   layer, or educational content]      │  │
│  │ • Results   │  │                                        │  │
│  │ • Code      │  │                                        │  │
│  │ • Settings  │  │                                        │  │
│  │             │  │                                        │  │
│  └─────────────┘  └───────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [Status: Ready] | Cycles: 0 | Loss: -- | Accuracy: --      │
└─────────────────────────────────────────────────────────────┘
```

### Page Routes
- `/cambric-labs/` — Home screen
- `/cambric-labs/lab` — Main laboratory
- `/cambric-labs/lab/:experiment-id` — Specific experiment
- `/cambric-labs/learn` — Educational curriculum
- `/cambric-labs/learn/:lesson-id` — Specific lesson
- `/cambric-labs/admin/` — Developer area (auth required)
- `/cambric-labs/admin/code-explorer` — Source code browser
- `/cambric-labs/admin/your-neuron` — Custom neuron editor

### Responsive Strategy
- Desktop-first (primary use case)
- Tablet: Collapsible sidebar
- Mobile: Limited support, focus on viewing existing experiments

---

## 4. Features & Interactions

### 4.1 Home Screen
**Elements:**
- Logo with tagline
- Primary actions: [New Experiment] [Open Experiment] [Learn] [Your Neuron]
- Recent experiments list (from localStorage)
- Quick stats (experiments created, hours spent)

**Interactions:**
- Click "New Experiment" → Experiment type selector modal
- Click "Open Experiment" → File picker for .cambric project files
- Hover experiment card → Show preview tooltip
- Click experiment → Navigate to lab with loaded experiment

### 4.2 New Experiment Modal
**Starting Points:**
- One Neuron (recommended for beginners)
- Blank Network
- Guided Experiment
- Image Classifier Template
- Text Classifier Template
- Audio Classifier Template
- Numerical Model Template
- Custom Network

**Interaction:** Select starting point → Configure basic settings → Create experiment

### 4.3 One Neuron Mode (Core Feature)
**Visualization:**
```
             INPUTS
    Input 1 ─────────────┐
                        │
    Input 2 ─────────────┤
                        ▼
                    ┌────────┐
                    │ NEURON │
                    └───┬────┘
                        │
                        ▼
                      OUTPUT
```

**Displayed Properties:**
| Element | Display | Editable | Clickable |
|---------|---------|----------|-----------|
| Input values | Current values with slider | Yes | "Why?" explanation |
| Weights | W1, W2, W3 with values | Yes | "Why?" explanation |
| Bias | B value | Yes | "Why?" explanation |
| Activation | Function name + graph | Yes | "Why?" explanation |
| Weighted sum | Calculated value | No | Step-by-step breakdown |
| Output | Final result | No | Explanation |

**Interactions:**
- Click any weight → Edit value inline OR open explanation panel
- Click "Watch Forward Pass" → Animated step-by-step calculation
- Drag to adjust input values → Real-time output update
- Click neuron → Detailed neuron inspector panel

### 4.4 Watch Forward Pass Animation
**Sequence:**
1. Highlight Input 1 value
2. Show multiplication with Weight 1
3. Show intermediate result
4. Repeat for all inputs
5. Sum all weighted inputs
6. Add bias
7. Apply activation function
8. Show final output

**Controls:**
- [▶️ Play] [⏸️ Pause] [⏭️ Step] [🔄 Restart]
- Speed: 0.5x, 1x, 2x, 4x
- Step indicator: "Step 3 of 7"

**Animation Style:**
- Numbers flow along connection paths
- Color intensity indicates magnitude
- Intermediate calculations appear in floating panels

### 4.5 Network Builder
**Visual Design:**
- Layers as horizontal bars with neuron dots
- Connections as lines between layers
- Line thickness = weight magnitude
- Line color = positive (green) / negative (red)

**Interactions:**
- Click layer → Select for editing
- Double-click layer → Rename
- Right-click layer → Context menu (duplicate, delete, insert)
- Drag from layer edge → Create new layer connection
- Scroll wheel → Zoom
- Click + button between layers → Add new layer

**Layer Inspector Panel:**
```
LAYER 2: Hidden
─────────────────────
Neurons: 64
Activation: ReLU ▼
Input dim: (4,)
Output dim: (64,)
Parameters: 4,160
─────────────────────
[Edit Layer] [Duplicate] [Delete]
```

### 4.6 Training Controls
**CYCLE Button:**
- Single training iteration
- Shows: Input, Expected, Prediction, Loss, Gradients, Weight changes
- "Before → After" weight visualization

**TRAIN Panel:**
```
TRAINING CONFIGURATION
─────────────────────────────────────
Cycles:        [1000        ]
Learning Rate: [0.01        ]
Batch Size:    [32          ]
Shuffle:       [✓]
─────────────────────────────────────
[▶️ START] [⏸ PAUSE] [⏹ STOP]
─────────────────────────────────────
Progress: ████████░░ 73%
Cycles: 730 / 1000
Loss: 0.234
Accuracy: 87.2%
─────────────────────────────────────
```

### 4.7 Real-time Training Graphs
**Graph Types:**
- Loss vs Cycles
- Accuracy vs Cycles
- Validation Loss vs Cycles
- Validation Accuracy vs Cycles

**Features:**
- Auto-scaling Y-axis
- Hover for exact values
- Pinch to zoom
- Click to mark checkpoint

### 4.8 Backpropagation Visualizer
**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│            WATCH BACKPROPAGATION                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LOSS ──→ OUTPUT ──→ LAYER 2 ──→ LAYER 1 ──→ INPUT     │
│                                                         │
│  ↑ Animated gradient flow                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  PARAMETER UPDATES                                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Weight: 0.421                                   │    │
│  │ Gradient: -0.083                                │    │
│  │ Learning Rate: 0.01                             │    │
│  │ Update: +0.00083                                │    │
│  │ ────────────────────────────────────────       │    │
│  │ New Weight: 0.42183                             │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 4.9 Dataset Management
**Group Types:**
- Classification groups (labeled)
- Regression values

**Supported Formats:**
| Type | Formats | Preprocessing Shown |
|------|---------|-------------------|
| Images | PNG, JPG, JPEG, WebP, BMP | Load → Resize → Normalize → Tensor |
| Text | .txt, .csv | Tokenize → Embed → Tensor |
| Audio | WAV, MP3, FLAC | Load → Sample → FFT → Features → Tensor |
| Numerical | .csv, .json | Parse → Normalize → Tensor |
| Pose | .json (keypoints) | Parse → Normalize → Coordinates → Tensor |

**Validation Warnings:**
```
⚠️ IMBALANCED DATASET
Square: 1,000 examples
Circle: 12 examples

This may cause model bias.
[Suggestions] [Continue Anyway]
```

### 4.10 "WHY?" System
**Trigger:** Click "Why?" button next to any concept

**Levels:**
- ELI5 (Explain Like I'm 5) — Analogies, simple language
- Beginner — Clear explanations with examples
- Technical — Mathematical formulation

**Example - Weights:**
```
┌─────────────────────────────────────────────┐
│ WHY IS THERE A WEIGHT?                      │
├─────────────────────────────────────────────┤
│ [ELI5] [Beginner] [Technical]               │
├─────────────────────────────────────────────┤
│                                             │
│ The weight tells the neuron how much        │
│ to "listen" to each input.                 │
│                                             │
│ Imagine you're at a meeting:                │
│                                             │
│ 📊 Presentation slides ← Weight: 0.9        │
│    (Listen carefully)                      │
│                                             │
│ ☕ Coffee chatter ← Weight: 0.1            │
│    (Ignore mostly)                         │
│                                             │
│ The neuron does the same thing!             │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.11 Learn Mode (Curriculum)
**Structure:**
```
LESSON 1: What is a Neuron?
  ├── Interactive neuron anatomy
  ├── Hands-on: Adjust inputs and weights
  └── Quiz: Check understanding

LESSON 2: How Neurons Learn
  ├── Error and loss explained
  ├── The learning signal
  └── Exercise: See weights change

... (12 core lessons total)
```

### 4.12 Your Neuron (Custom Code Editor)
**Features:**
- Syntax-highlighted Python editor
- Template with forward() and backward() methods
- Sandboxed execution
- Unit test runner
- Comparison with built-in neuron

### 4.13 Code Explorer
**Navigation:**
```
neural/
├── neuron.py      ← Single neuron implementation
├── layer.py       ← Layer abstractions
├── network.py     ← Network orchestration
├── activation.py  ← Activation functions
├── loss.py        ← Loss functions
└── optimizer.py   ← Gradient descent, etc.

training/
├── trainer.py     ← Training loop
├── dataset.py     ← Data loading
└── evaluator.py   ← Metrics

visualization/
├── graphs.py      ← Training curves
└── animations.py  ← Data flow animations
```

**Line-by-line explanations:**
- Click line number → Show explanation panel
- Variables highlighted on hover
- Jump to definition

### 4.14 Model Export
**Formats:**
- `.cambric-model` — Full model (architecture + weights)
- `.cambric-code` — Generated Python code
- `.cambric-project` — Complete project package

**Exported Code Quality:**
```python
"""
Generated by CAMBRIC LABS
Architecture: 3-layer MLP
Date: 2024-01-15
"""

import numpy as np

class TrainedModel:
    """A 3-layer MLP trained on shape classification."""
    
    def __init__(self):
        # Layer 1: 784 -> 128
        self.W1 = np.array([...])  # Shape: (784, 128)
        self.b1 = np.array([...])  # Shape: (128,)
        # ...
    
    def forward(self, x):
        """Process input through the network."""
        x = x @ self.W1 + self.b1
        x = np.maximum(0, x)  # ReLU
        # ...
        return x
```

---

## 5. Component Inventory

### 5.1 Button
| State | Appearance |
|-------|------------|
| Default | `--lab-bg-tertiary` background, `--lab-text-primary` |
| Hover | `--lab-accent-blue` border glow |
| Active | Scale 0.98, darker background |
| Disabled | 50% opacity, no interactions |
| Loading | Spinner icon, disabled |

### 5.2 Input Field
| State | Appearance |
|-------|------------|
| Default | `--lab-bg-secondary` background, `--lab-border` |
| Focus | `--lab-accent-blue` border |
| Error | `--lab-accent-red` border, error message below |
| Disabled | Muted background |

### 5.3 Slider
| State | Appearance |
|-------|------------|
| Default | Track: `--lab-bg-tertiary`, Thumb: `--lab-accent-blue` |
| Dragging | Larger thumb, value tooltip |
| Disabled | Muted colors |

### 5.4 Card
```
┌─────────────────────────────┐
│ Title                   [⋮] │
├─────────────────────────────┤
│                             │
│         Content             │
│                             │
├─────────────────────────────┤
│ [Action 1]          [Action] │
└─────────────────────────────┘
```

### 5.5 Modal
- Centered overlay with backdrop blur
- Escape to close
- Focus trap
- Smooth scale-in animation

### 5.6 Tooltip
- Appears on hover after 500ms delay
- Position: auto (prefer top)
- Max width: 300px
- Arrow pointing to trigger

### 5.7 Graph
- Canvas-based for performance
- Grid lines: `--lab-grid`
- Data lines: `--lab-accent-blue`
- Axis labels: `--lab-text-secondary`
- Interactive hover states

### 5.8 Neuron Visualization
```
         ○
        /|\
       / | \
      ○──●──○
         |
         ▼
```
- Circle: Neuron body
- Input lines: From top
- Output line: To bottom
- Glow intensity: Activation level

---

## 6. Technical Approach

### Architecture Overview
```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Labs   │  │  Learn   │  │  Admin   │  │  Shared   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       └─────────────┴─────────────┴─────────────┘        │
│                           │                                │
│                    ┌──────┴──────┐                        │
│                    │  API Client │                        │
│                    └──────┬──────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │ HTTP/WebSocket
┌────────────────────────────┼────────────────────────────────┐
│                      BACKEND (Python)                        │
│                    ┌──────┴──────┐                        │
│                    │   FastAPI   │                        │
│                    └──────┬──────┘                        │
│       ┌────────────────────┼────────────────────┐          │
│  ┌────┴────┐  ┌───────────┴───────────┐  ┌────┴────┐     │
│  │  Neural  │  │      Training          │  │ Projects │     │
│  │  Engine  │  │      Engine            │  │ Storage  │     │
│  └─────────┘  └─────────────────────────┘  └─────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Backend (Python)
- **Framework**: FastAPI
- **Neural Engine**: NumPy-based (educational clarity over speed)
- **Training**: Custom implementation showing all steps
- **Storage**: Local filesystem (local-first)
- **Serialization**: JSON for configs, NumPy binary for weights

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **State**: Zustand for global state
- **Routing**: React Router v6
- **Styling**: CSS Modules with CSS variables
- **Visualization**: Canvas API + D3 for graphs

### API Design
```
POST   /api/experiments              Create experiment
GET    /api/experiments              List experiments
GET    /api/experiments/:id          Get experiment
PUT    /api/experiments/:id          Update experiment
DELETE /api/experiments/:id          Delete experiment

POST   /api/experiments/:id/train    Start training
POST   /api/experiments/:id/cycle    Single cycle
GET    /api/experiments/:id/history  Training history

GET    /api/neuron/forward            Forward pass
POST   /api/neuron/train              Train step

POST   /api/datasets                  Create dataset
GET    /api/datasets/:id             Get dataset
POST   /api/datasets/:id/examples    Add examples

POST   /api/export/model              Export model
POST   /api/export/code               Export code
POST   /api/export/project            Export project
POST   /api/import/project            Import project

POST   /api/admin/auth                Authenticate
GET    /api/admin/code                Get source files
POST   /api/admin/custom-neuron      Run custom neuron
```

### Data Models
```python
# Neuron
class Neuron:
    inputs: List[float]
    weights: List[float]
    bias: float
    activation: str  # 'relu', 'sigmoid', 'tanh', 'softmax'
    
# Layer
class Layer:
    name: str
    neurons: List[Neuron]
    activation: str
    input_dim: int
    output_dim: int
    
# Network
class Network:
    layers: List[Layer]
    loss_function: str  # 'mse', 'cross_entropy'
    
# Experiment
class Experiment:
    id: str
    name: str
    network: Network
    dataset_id: str
    training_config: TrainingConfig
    history: List[TrainingSnapshot]
    
# Training Snapshot
class TrainingSnapshot:
    cycle: int
    loss: float
    accuracy: float
    weights: Dict[str, np.ndarray]
    biases: Dict[str, np.ndarray]
```

### Security
- Admin area requires JWT authentication
- Custom code runs in isolated subprocess
- No arbitrary file system access
- CORS restricted to localhost
- Input validation on all endpoints

---

## 7. Milestones

### Milestone 1: One Neuron Engine ✓
- [x] Neural network core (forward pass)
- [x] Weight and bias management
- [x] Activation functions (ReLU, Sigmoid, Tanh)
- [x] Basic UI for neuron visualization
- [x] Forward pass animation
- [x] Unit tests for neuron

### Milestone 2: Training System
- [ ] Loss functions (MSE, Cross-Entropy)
- [ ] Gradient computation
- [ ] Backpropagation implementation
- [ ] Weight update mechanism
- [ ] CYCLE button with step visualization
- [ ] Training history tracking

### Milestone 3: Multi-Neuron Networks
- [ ] Dense layers
- [ ] Network class
- [ ] Multi-layer forward pass
- [ ] Layer visualization
- [ ] Parameter counting

### Milestone 4: Network Builder UI
- [ ] Visual network editor
- [ ] Add/remove layers
- [ ] Configure layer properties
- [ ] Connection visualization
- [ ] Architecture inspector

### Milestone 5: Dataset System
- [ ] Dataset creation UI
- [ ] Example management
- [ ] Train/validation split
- [ ] Dataset validation

### Milestone 6: Image Support
- [ ] Image upload
- [ ] Preprocessing pipeline
- [ ] Image dataset type
- [ ] Preprocessing visualization

### Milestone 7: Text Support
- [ ] Text dataset type
- [ ] Tokenization concepts
- [ ] Text → numbers visualization

### Milestone 8: Audio Support
- [ ] Audio upload
- [ ] Waveform display
- [ ] Feature extraction visualization

### Milestone 9: Advanced Training
- [ ] Batched training
- [ ] Learning rate configuration
- [ ] Training graphs (real-time)
- [ ] Early stopping

### Milestone 10: Educational System
- [ ] WHY? explanations
- [ ] Learn mode curriculum
- [ ] ELI5 explanations
- [ ] Developer mode

### Milestone 11: Advanced Features
- [ ] Your Neuron editor
- [ ] Code explorer
- [ ] Line-by-line explanations
- [ ] Architecture comparison

### Milestone 12: Export/Import
- [ ] Model export
- [ ] Code export
- [ ] Project export/import
- [ ] Cross-device compatibility

---

## 8. File Structure
```
cambric-labs/
├── backend/
│   ├── main.py
│   ├── neural/
│   │   ├── __init__.py
│   │   ├── neuron.py
│   │   ├── layer.py
│   │   ├── network.py
│   │   ├── activation.py
│   │   └── loss.py
│   ├── training/
│   │   ├── __init__.py
│   │   ├── trainer.py
│   │   └── backpropagation.py
│   ├── api/
│   │   ├── experiments.py
│   │   ├── datasets.py
│   │   ├── training.py
│   │   └── export.py
│   └── storage/
│       ├── __init__.py
│       └── projects.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── api/
│   │   └── styles/
│   └── index.html
├── tests/
│   ├── test_neuron.py
│   ├── test_training.py
│   ├── test_network.py
│   └── test_datasets.py
├── SPEC.md
└── README.md
```

---

## 9. Acceptance Criteria

### Core Functionality
- [ ] Single neuron performs correct forward pass
- [ ] Weights and biases are trainable
- [ ] Training updates actual weights (not fake)
- [ ] All activations produce correct outputs
- [ ] Loss is calculated from real predictions

### Educational Value
- [ ] User can see every calculation step
- [ ] Every concept has "Why?" explanation
- [ ] Learn mode teaches fundamentals
- [ ] Beginner mode provides simple explanations

### Technical Quality
- [ ] No frozen UI during training
- [ ] Large models don't crash browser
- [ ] Projects save/load correctly
- [ ] Exports work on other devices

### Definition of Done (v1)
A person with no neural-network experience can:
1. Create one neuron ✓
2. Understand its inputs ✓
3. Understand weights ✓
4. Understand bias ✓
5. Run a forward pass ✓
6. See the calculation ✓
7. Create training data ✓
8. Run one CYCLE ✓
9. See the loss ✓
10. See weights change ✓
11. Understand why they changed ✓
12. Add neurons ✓
13. Add layers ✓
14. Train a small model ✓
15. Test on unseen data ✓
16. Inspect architecture ✓
17. Read underlying code ✓
18. Create a custom neuron (Milestone 11)
19. Save experiment ✓
20. Export model ✓
