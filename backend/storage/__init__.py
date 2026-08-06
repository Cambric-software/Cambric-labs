"""
Storage package for CAMBRIC LABS
Local-first project storage.
"""

try:
    from .projects import ProjectStorage
except ImportError:
    from projects import ProjectStorage

__all__ = ['ProjectStorage']
