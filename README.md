# CAMBRIC LABS
## Neural Network Laboratory - Learn AI by Building It

![CAMBRIC LABS](https://img.shields.io/badge/Status-Production%20Ready-green)
![Supabase](https://img.shields.io/badge/Backend-Supabase%20Edge%20Functions-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

> **IMPORTANT**: CAMBRIC LABS is NOT CAMBRIC AI. CAMBRIC LABS is an educational environment where developers learn, experiment with, build, train, inspect, and export neural-network systems.

---

## 🚀 Quick Start

### Frontend (GitHub Pages)
Visit: **https://cambric-software.github.io/Cambric-labs/**

### Deploy Edge Functions (One-time Setup)

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link to project
cd supabase
supabase link --project-ref dafgzzkerytjuvxzymnq

# 4. Deploy
supabase functions deploy network
```

---

## ✨ Features

### 🧠 Neural Network Engine
- **Multi-layer networks** with configurable architecture
- **Full backpropagation** with gradient descent
- **Xavier weight initialization** for stable training
- **Real-time weight tracking** - see weights change live!

### 📊 Activation Functions (8)
| Function | Use Case |
|----------|----------|
| ReLU | Default for hidden layers |
| Leaky ReLU | Prevents dead neurons |
| Sigmoid | Binary classification output |
| Tanh | Hidden layers (zero-centered) |
| Softmax | Multi-class classification |
| Identity | Regression output |
| Swish | Modern alternative to ReLU |
| GELU | State-of-the-art (BERT, etc.) |

### 🎯 Loss Functions (5)
| Function | Use Case |
|----------|----------|
| MSE | Regression |
| MAE | Robust regression |
| Binary Cross-Entropy | Binary classification |
| Categorical Cross-Entropy | Multi-class classification |
| Hinge | SVM-style classification |

### 🏋️ Training Features
- **Single cycle mode** - Watch one training step
- **Batch training** - Configurable batch sizes
- **Validation split** - Detect overfitting
- **Training history** - Track loss/accuracy over time
- **Real-time graphs** - Watch your model learn

### 📤 Export Options
- **Python code** - Ready to use in your projects
- **JavaScript code** - For web applications
- **ONNX format** - Industry standard interchange

### 📚 Educational Features
- **Simple explanations** for beginners
- **Technical details** for developers
- **WHY explanations** for every concept
- **Interactive visualizations** - See neurons, weights, gradients

---

## 🏗️ Architecture

```
CAMBRIC LABS
├── GitHub Pages (Frontend)
│   └── React + TypeScript + Vite
│
└── Supabase (Backend)
    ├── Database (PostgreSQL)
    │   └── Tables prefixed: cambric_labs_*
    │
    └── Edge Functions (Deno/TypeScript)
        └── network.ts (Neural Network Engine)
```

---

## 🛠️ Supabase Edge Functions

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /network/create` | Create a new network |
| `POST /network/forward` | Run forward pass |
| `POST /network/train-cycle` | Single training step |
| `POST /network/train` | Full training |
| `POST /network/export` | Export to code |
| `GET /network/info` | Get available functions |

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Edge Function Invocations | 500,000/month |
| Database Storage | 500 MB |
| Bandwidth | 100 GB/month |

---

## 📖 Documentation

### Core Concepts

**Neuron**: A single computational unit that takes inputs, multiplies by weights, adds bias, and applies an activation function.

**Layer**: A collection of neurons that process inputs in parallel.

**Network**: Multiple layers connected sequentially to form a deep learning model.

**Forward Pass**: Data flows from input through layers to output.

**Backpropagation**: Gradients flow backward to update weights.

**Loss**: Measures how wrong the network's prediction is.

---

## 🔧 Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/Cambric-software/Cambric-labs.git
cd Cambric-labs

# Frontend
cd frontend
npm install
npm run dev

# Backend (optional - uses Supabase Edge Functions)
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Testing

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend build
cd frontend
npm run build
```

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

*Built with ❤️ by the CAMBRIC team*
