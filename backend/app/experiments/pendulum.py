from __future__ import annotations

import math
from typing import Sequence

from ..core.engines import ODEModel
from ..core.state import State, Vec2


class PendulumODE(ODEModel):
    def __init__(
        self,
        length: float,
        gravity: float,
        damping: float,
        mass: float,
        theta0: float,
        omega0: float,
    ) -> None:
        self.length = length
        self.gravity = gravity
        self.damping = damping
        self.mass = mass
        self._y0 = [theta0, omega0]

    @property
    def state_size(self) -> int:
        return 2

    def initial_state(self) -> list[float]:
        return list(self._y0)

    def derivatives(self, y: Sequence[float]) -> list[float]:
        theta, omega = y
        alpha = (
            -(self.gravity / self.length) * math.sin(theta)
            - (self.damping / self.mass) * omega
        )
        return [omega, alpha]

    def to_state(self, y: Sequence[float]) -> State:
        theta, omega = y
        L = self.length
        return State(
            Vec2(L * math.sin(theta), -L * math.cos(theta)),
            Vec2(L * omega * math.cos(theta), L * omega * math.sin(theta)),
            self.mass,
        )

    def omega_from(self, y: Sequence[float]) -> float:
        return y[1]
