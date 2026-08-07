# CAMBRIC LABS
## Local Neural Network Laboratory - Learn AI by Building It

![CAMBRIC LABS](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> **IMPORTANT**: CAMBRIC LABS is NOT CAMBRIC AI. CAMBRIC LABS is an educational environment where developers learn, experiment with, build, train, inspect, and export neural-network systems.

---

## 🚀 Quick Start

### Download the App
Visit: **https://cambric-software.github.io/Cambric-labs/**

**Windows**: Download and run the installer or portable version.

**Android**: Download the APK and install (enable "Unknown sources" in settings).

### Key Features
- **100% Local** - All computation happens on your device
- **No Account Required** - Works completely offline
- **Privacy First** - Your data never leaves your device

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

### 🎯 Loss Functions (4)
| Function | Use Case |
|----------|----------|
| MSE | Regression |
| MAE | Robust regression |
| Binary Cross-Entropy | Binary classification |
| Categorical Cross-Entropy | Multi-class classification |

### 🏋️ Training Features
- **Single cycle mode** - Watch one training step
- **Batch training** - Configurable batch sizes
- **Training history** - Track loss/accuracy over time
- **Real-time graphs** - Watch your model learn

### 📤 Export Options
- **Python code** - Ready to use in your projects
- **JavaScript code** - For web applications

### 📚 Educational Features
- **Simple explanations** for beginners
- **Technical details** for developers
- **WHY explanations** for every concept
- **Interactive visualizations** - See neurons, weights, gradients

---

## 🏗️ Architecture

CAMBRIC LABS uses a **local-first** architecture. All neural network computation happens on your device.

```
CAMBRIC LABS (Local)
├── Desktop App (Electron)
│   └── JavaScript Neural Engine
│
├── Mobile App (Capacitor)
│   └── JavaScript Neural Engine
│
└── Web App (GitHub Pages)
    └── JavaScript Neural Engine
```

**No cloud backend required.** Your projects, datasets, and trained models are stored locally.

---

## 📖 Documentation

### Core Concepts

**Neuron**: A single computational unit that takes inputs, multiplies by weights, adds bias, and applies an activation function.

**Layer**: A collection of neurons that process inputs in parallel.

**Network**: Multiple layers connected sequentially to form a deep learning model.

**Forward Pass**: Data flows from input through layers to output.

**Backpropagation**: Gradients flow backward to update weights.

**Loss**: Measures how wrong the network's prediction is.

### System Requirements

**Windows:**
- Windows 10 or later
- 4GB RAM minimum
- 200MB disk space
- 64-bit processor

**Android:**
- Android 7.0 (API 24) or later
- 2GB RAM minimum
- 100MB storage space
- ARM processor

### Installation

**Windows:**
1. Download the installer or portable version
2. Run the installer (or extract the portable version)
3. Launch CAMBRIC LABS

**Android:**
1. Download the APK to your device
2. Enable "Install from unknown sources" in settings
3. Open the APK file to install
4. Launch CAMBRIC LABS

---

## 🔧 Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/Cambric-software/Cambric-labs.git
cd Cambric-labs

# Frontend (web app)
cd frontend
npm install
npm run dev

# Build for production
npm run build
```

### Testing

```bash
# Backend tests (Python neural engine)
cd backend
python -m pytest tests/ -v

# Frontend build
cd frontend
npm run build
```

### Building Desktop/Mobile Apps

**Windows:**
```bash
cd electron
npm install
npm run build
```

**Android:**
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync android
# Open in Android Studio or run: npx cap open android
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
