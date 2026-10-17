"""
backend/app/core/forces/base.py

Only ForceModel lives here.
ODEModel is in core/engines.py — import it from there.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..state import State, Vec2


class ForceModel(ABC):
    """
    Abstract base for Verlet-compatible force models.
    Receives the current State, returns a force Vec2.
    """

    @abstractmethod
    def compute_force(self, state: State) -> Vec2:
        raise NotImplementedError
