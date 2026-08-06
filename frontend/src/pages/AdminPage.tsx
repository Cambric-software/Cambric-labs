import { useState } from 'react'
import { Code2, FlaskConical, FileCode, Lock, Eye, EyeOff } from 'lucide-react'
import styles from './AdminPage.module.css'

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<'explorer' | 'custom' | 'settings'>('explorer')
  
  // Mock authentication (in production, use proper auth)
  const handleAuth = () => {
    if (password === 'cambric-dev') {
      setIsAuthenticated(true)
    }
  }
  
  if (!isAuthenticated) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authCard}>
          <Lock size={48} className={styles.lockIcon} />
          <h1>Developer Area</h1>
          <p>Enter the developer password to access advanced features.</p>
          
          <div className={styles.authForm}>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              />
              <button
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button className={styles.authBtn} onClick={handleAuth}>
              Access
            </button>
          </div>
          
          <p className={styles.hint}>
            Hint: For development, use 'cambric-dev'
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>
          <Code2 size={28} />
          Developer Area
        </h1>
        <button 
          className={styles.logoutBtn}
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
        </button>
      </header>
      
      <div className={styles.content}>
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'explorer' ? styles.active : ''}`}
            onClick={() => setActiveTab('explorer')}
          >
            <FileCode size={18} />
            Code Explorer
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <FlaskConical size={18} />
            Your Neuron
          </button>
        </nav>
        
        <div className={styles.panel}>
          {activeTab === 'explorer' && (
            <div className={styles.explorer}>
              <div className={styles.fileTree}>
                <h3>Project Structure</h3>
                <ul className={styles.tree}>
                  <li className={styles.folder}>
                    <span>neural/</span>
                    <ul>
                      <li>neuron.py</li>
                      <li>layer.py</li>
                      <li>network.py</li>
                      <li>activation.py</li>
                      <li>loss.py</li>
                    </ul>
                  </li>
                  <li className={styles.folder}>
                    <span>training/</span>
                    <ul>
                      <li>trainer.py</li>
                      <li>backpropagation.py</li>
                    </ul>
                  </li>
                  <li className={styles.folder}>
                    <span>api/</span>
                    <ul>
                      <li>experiments.py</li>
                      <li>datasets.py</li>
                    </ul>
                  </li>
                  <li className={styles.folder}>
                    <span>tests/</span>
                    <ul>
                      <li>test_neuron.py</li>
                      <li>test_training.py</li>
                      <li>test_network.py</li>
                    </ul>
                  </li>
                </ul>
              </div>
              
              <div className={styles.codeView}>
                <div className={styles.codeHeader}>
                  <span>neuron.py</span>
                </div>
                <pre className={styles.code}>
{`"""
Single Neuron Implementation for CAMBRIC LABS

A neuron is the fundamental unit of a neural network.
"""

import numpy as np
from typing import List, Dict, Any, Optional


class Neuron:
    """
    A single artificial neuron.
    
    The neuron computes a weighted sum of its inputs,
    adds a bias, and applies an activation function.
    """
    
    def __init__(
        self,
        input_count: int,
        weights: Optional[List[float]] = None,
        bias: float = 0.0,
        activation: str = 'relu'
    ):
        self.input_count = input_count
        self.weights = np.array(weights) if weights else None
        self.bias = bias
        self.activation = activation
    
    def forward(self, inputs: List[float]) -> Dict[str, Any]:
        """Compute forward pass through this neuron."""
        # Multiply inputs by weights
        weighted = np.array(inputs) * self.weights
        # Sum all contributions
        weighted_sum = np.sum(weighted) + self.bias
        # Apply activation
        output = self._activate(weighted_sum)
        
        return {
            'output': output,
            'weighted_sum': weighted_sum
        }
    
    def _activate(self, x: float) -> float:
        """Apply activation function."""
        if self.activation == 'relu':
            return max(0, x)
        elif self.activation == 'sigmoid':
            return 1 / (1 + np.exp(-x))
        return x`}
                </pre>
              </div>
            </div>
          )}
          
          {activeTab === 'custom' && (
            <div className={styles.customNeuron}>
              <h2>Your Neuron</h2>
              <p className={styles.description}>
                Write your own neuron implementation. Test it against the built-in version.
              </p>
              
              <div className={styles.editorSection}>
                <div className={styles.editorHeader}>
                  <span>neuron.py</span>
                  <button className={styles.runBtn}>Run Tests</button>
                </div>
                <textarea
                  className={styles.editor}
                  placeholder={`class MyNeuron:
    def __init__(self, input_count):
        self.input_count = input_count
        # Initialize your weights
        
    def forward(self, inputs):
        # Your forward pass logic
        pass`}
                />
              </div>
              
              <div className={styles.testResults}>
                <h4>Test Results</h4>
                <p className={styles.noTests}>Run tests to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
