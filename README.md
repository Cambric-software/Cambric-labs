# CAMBRIC LABS

A serious educational and experimental neural network laboratory for developers.

> "Do not hide AI behind a black box. Let the developer see exactly what is happening."

## Overview

CAMBRIC LABS is a neural network laboratory where developers learn by building. Every number displayed corresponds to actual computation, every animation represents real data flow.

### Features

- **One Neuron Mode**: Start with a single neuron and understand inputs, weights, biases, and activation functions
- **Watch Forward Pass**: Animated step-by-step visualization of calculations
- **Training System**: Real training with CYCLE, loss tracking, and gradient visualization
- **Network Builder**: Build multi-layer networks visually
- **Learn Mode**: Structured curriculum from neuron basics to backpropagation
- **Developer Area**: Code explorer and custom neuron editor
- **Export/Import**: Save experiments and export trained models

## Quick Start

### Backend (Python/FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (React/TypeScript)

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use CAMBRIC LABS.

## Architecture

```
cambric-labs/
├── backend/
│   ├── neural/           # Neural network core (neuron, layer, network)
│   ├── training/         # Training system (trainer, backpropagation)
│   ├── api/             # API endpoints
│   └── storage/          # Local-first project storage
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── api/          # API client
│       └── styles/       # CSS styles
└── tests/               # Unit tests
```

## Neural Network Core

The backend implements a complete neural network engine from scratch:

- **Neuron**: Single neuron with forward/backward pass
- **Layer**: Dense layer with multiple neurons
- **Network**: Sequential network of layers
- **Activations**: ReLU, Sigmoid, Tanh, Identity, Softmax
- **Loss Functions**: MSE, MAE, Cross-Entropy

## Testing

```bash
cd /workspace/project/Cambric-labs
PYTHONPATH=/workspace/project/Cambric-labs python -m pytest tests/ -v
```

## Core Philosophy

CAMBRIC LABS must never:

- Fake training animations
- Hard-code predictions
- Hide underlying computations

Every visualization must reflect actual model state.

## Development

The project follows a milestone-based development approach:

1. ✓ Milestone 1: One Neuron Engine
2. ✓ Milestone 2: Training System
3. ✓ Milestone 3: Multi-Neuron Networks
4. In Progress: Network Builder UI
5. Planned: Dataset System, Advanced Features

## License

MIT
