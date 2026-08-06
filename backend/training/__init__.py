"""
Training package for CAMBRIC LABS
"""

import sys
import os

# Add parent directory to path if needed
if __name__ != '__main__':
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)

try:
    from .trainer import Trainer
    from .backpropagation import Backpropagation
except ImportError:
    from trainer import Trainer
    from backpropagation import Backpropagation

__all__ = ['Trainer', 'Backpropagation']
