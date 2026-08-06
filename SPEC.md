# CAMBRIC LABS - Complete Product & Engineering Specification

> **IMPORTANT**: CAMBRIC LABS is NOT CAMBRIC AI. CAMBRIC AI is the employee-facing AI product. CAMBRIC LABS is the environment where developers learn, experiment with, build, train, inspect, and export neural-network systems.

---

## 1. PRODUCT GOAL

CAMBRIC LABS must teach the user by allowing them to physically interact with the system.

The user should be able to:

- Create neurons
- Inspect neurons
- Add neurons
- Remove neurons
- Create layers
- Remove layers
- Connect layers
- Change architecture
- Change activation functions
- Create datasets
- Add training examples
- Train manually
- Train automatically
- Perform exactly one training cycle
- Watch calculations happen
- Watch weights change
- Watch biases change
- Watch loss change
- Watch predictions change
- Inspect gradients
- Inspect the actual source code
- Write custom neuron code
- Compare architectures
- Save experiments
- Export trained models
- Export source code
- Import experiments on another device

**NEVER fake a training animation.**
**NEVER fake changing weights.**
**NEVER hard-code predictions while pretending a neural network produced them.**

---

## 2. CENTRAL PHILOSOPHY

> «Do not hide AI behind a black box. Let the developer see exactly what is happening.»

- A beginner should be able to open CAMBRIC LABS knowing nothing about neural networks and progressively understand neurons, weights, biases, activation functions, layers, training, loss, gradients, backpropagation, datasets, and model architecture.
- An experienced developer should be able to use the same application as a rapid experimentation environment for small and medium neural-network models.

---

## 3. TECHNOLOGY STACK

### Backend (Python/FastAPI)
- **Neural Network Core** (`/backend/neural/`):
  - `neuron.py` - Single neuron with forward/backward pass
  - `layer.py` - Dense layer with multiple neurons
  - `network.py` - Multi-layer network with sequential architecture
  - `activation.py` - Activation functions (ReLU, Sigmoid, Tanh, Identity, Softmax)
  - `loss.py` - Loss functions (MSE, MAE, Cross-Entropy)

- **Training Engine** (`/backend/training/`):
  - `trainer.py` - Training orchestrator with cycle/epoch management
  - `backpropagation.py` - Gradient computation and weight updates

- **Database**:
  - Supabase PostgreSQL for experiments, datasets, training history
  - Supabase Auth for user authentication

### Frontend (React/TypeScript/Vite)
- React 18 with TypeScript
- React Router for navigation
- Zustand for state management
- Supabase JS client for authentication
- Lucide React for icons

---

## 4. DATABASE SCHEMA (Supabase)

### Tables

1. **users** - User profiles
2. **experiments** - Neural network experiments
3. **datasets** - Training datasets
4. **training_history** - Training metrics over time
5. **model_exports** - Exported models
6. **custom_neurons** - User-defined neurons

See `/backend/supabase_client/schema.sql` for full schema.

---

## 5. API ENDPOINTS

### Health
- `GET /` - Root endpoint
- `GET /health` - Health check

### Neuron
- `POST /api/neuron/create` - Create a neuron
- `POST /api/neuron/forward` - Forward pass
- `POST /api/neuron/train` - Train step
- `POST /api/neuron/batch-train` - Batch training

### Network
- `POST /api/network/create` - Create network
- `POST /api/network/forward` - Forward pass
- `POST /api/network/train-cycle` - Single cycle
- `POST /api/network/train` - Full training
- `GET /api/network/{id}/weights` - Get weights

### Experiments
- `POST /api/experiments` - Create experiment
- `GET /api/experiments` - List experiments
- `GET /api/experiments/{id}` - Get experiment
- `PUT /api/experiments/{id}` - Update experiment
- `DELETE /api/experiments/{id}` - Delete experiment

### Datasets
- `POST /api/datasets` - Create dataset
- `GET /api/datasets` - List datasets
- `GET /api/datasets/{id}` - Get dataset

### Educational
- `GET /api/concepts/{concept}` - Get concept explanation
- `GET /api/concepts` - List all concepts
- `GET /api/why/{concept}` - Get WHY explanation
- `GET /api/activations` - List activation functions
- `GET /api/losses` - List loss functions

### Export
- `POST /api/export/neuron` - Export neuron as code
- `POST /api/export/network/{id}` - Export network as code
- `POST /api/export/project/{id}` - Export complete project

---

## 6. EDUCATIONAL CONTENT

### WHY System
Every concept has a WHY explanation at three levels:
- **Simple**: Beginner-friendly explanation
- **Technical**: Technical definition
- **Analogy**: Real-world analogy

### Concepts
- Neuron, Weight, Bias, Activation, Layer, Loss, Gradient, Backpropagation, Learning Rate, Epoch, Batch, Overfitting, Underfitting, Validation

---

## 7. PROJECT STRUCTURE

```
cambric-labs/
├── backend/
│   ├── neural/              # Neural network core
│   ├── training/            # Training engine
│   ├── supabase_client/     # Supabase integration
│   ├── storage/             # Local storage
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   └── schema.sql           # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api/             # API client
│   │   ├── styles/          # Global styles
│   │   ├── supabase.ts      # Supabase client
│   │   └── App.tsx
│   └── package.json
├── tests/
│   ├── test_neuron.py
│   └── test_training.py
├── SPEC.md
└── README.md
```

---

## 8. QUICK START

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
Run `backend/schema.sql` in Supabase SQL Editor.

---

## 9. TESTING

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend build
cd frontend
npm run build
```

---

*Last updated: Implementation complete through Milestone 4*
