from __future__ import annotations

import numpy as np
from abc import ABC, abstractmethod

from .forces.base import ForceModel
from .state import State

# ══════════════════════════════════════════════════════════════════════════════
#  VERLET ENGINE
# ══════════════════════════════════════════════════════════════════════════════


class VerletEngine:
    def __init__(
        self,
        state: State,
        force_model: ForceModel,
        time: float = 0.0,
    ) -> None:
        self.state = state
        self.force_model = force_model
        self.time = time

    def step(self, dt: float) -> State:
        force = self.force_model.compute_force(self.state)
        accel = force / self.state.mass

        new_pos = (
            self.state.position + self.state.velocity * dt + accel * (0.5 * dt * dt)
        )
        v_half = self.state.velocity + accel * (0.5 * dt)

        mid_state = State(new_pos, v_half, self.state.mass)
        next_force = self.force_model.compute_force(mid_state)
        next_accel = next_force / self.state.mass

        new_vel = v_half + next_accel * (0.5 * dt)
        self.state = State(new_pos, new_vel, self.state.mass)
        self.time += dt
        return self.state


# ══════════════════════════════════════════════════════════════════════════════
#  ODE MODEL
# ══════════════════════════════════════════════════════════════════════════════


class ODEModel(ABC):
    @property
    @abstractmethod
    def state_size(self) -> int: ...

    @abstractmethod
    def initial_state(self) -> list[float]: ...

    @abstractmethod
    def derivatives(self, y: np.ndarray) -> list[float]: ...

    @abstractmethod
    def to_state(self, y: np.ndarray) -> State: ...


# ══════════════════════════════════════════════════════════════════════════════
#  RK4 ENGINE
# ══════════════════════════════════════════════════════════════════════════════


class RK4Engine:
    def __init__(self, model: ODEModel, time: float = 0.0) -> None:
        self.model = model
        self.time = time
        self._y = np.array(model.initial_state(), dtype=float)
        self.state = model.to_state(self._y)

    def step(self, dt: float) -> State:
        f = self.model.derivatives
        y = self._y

        k1 = np.array(f(y), dtype=float)
        k2 = np.array(f(y + dt * 0.5 * k1), dtype=float)
        k3 = np.array(f(y + dt * 0.5 * k2), dtype=float)
        k4 = np.array(f(y + dt * k3), dtype=float)

        self._y = y + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
        self.time += dt
        self.state = self.model.to_state(self._y)
        return self.state

    @property
    def y(self) -> list[float]:
        """Current state vector as a plain Python list."""
        return self._y.tolist()
