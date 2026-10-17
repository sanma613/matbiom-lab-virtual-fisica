from __future__ import annotations

import math
from typing import Sequence

from ..core.engines import ODEModel
from ..core.state import State, Vec2


class DoublePendulumODE(ODEModel):

    def __init__(
        self,
        length1: float,
        length2: float,
        mass1: float,
        mass2: float,
        gravity: float,
        damping: float,
        theta1_0: float,
        omega1_0: float,
        theta2_0: float,
        omega2_0: float,
    ) -> None:
        self.L1 = length1
        self.L2 = length2
        self.m1 = mass1
        self.m2 = mass2
        self.g = gravity
        self.damping = damping
        self._y0 = [theta1_0, omega1_0, theta2_0, omega2_0]

    @property
    def state_size(self) -> int:
        return 4

    def initial_state(self) -> list[float]:
        return list(self._y0)

    def derivatives(self, y: Sequence[float]) -> list[float]:
        t1, o1, t2, o2 = y
        L1, L2 = self.L1, self.L2
        m1, m2 = self.m1, self.m2
        g, b = self.g, self.damping
        d = t1 - t2
        cos2d = math.cos(2 * d)
        # common factor used in both denominators
        common = (2 * m1 + m2 - m2 * cos2d)
        denom1 = L1 * common
        denom2 = L2 * common

        num1 = (
            -g * (2 * m1 + m2) * math.sin(t1)
            - m2 * g * math.sin(t1 - 2 * t2)
            - 2 * math.sin(d) * m2 * (o2**2 * L2 + o1**2 * L1 * math.cos(d))
        )
        alpha1 = num1 / denom1 - b * o1

        num2 = (
            2
            * math.sin(d)
            * (
                o1**2 * L1 * (m1 + m2)
                + g * (m1 + m2) * math.cos(t1)
                + o2**2 * L2 * m2 * math.cos(d)
            )
        )
        alpha2 = num2 / denom2 - b * o2

        return [o1, alpha1, o2, alpha2]

    def to_state(self, y: Sequence[float]) -> State:
        _, pos2 = self.cartesian_positions(y)
        t1, o1, t2, o2 = y
        vx2 = self.L1 * o1 * math.cos(t1) + self.L2 * o2 * math.cos(t2)
        vy2 = self.L1 * o1 * math.sin(t1) + self.L2 * o2 * math.sin(t2)
        return State(pos2, Vec2(vx2, vy2), self.m2)

    def cartesian_positions(self, y: Sequence[float]) -> tuple[Vec2, Vec2]:
        t1, _, t2, _ = y
        p1 = Vec2(self.L1 * math.sin(t1), -self.L1 * math.cos(t1))
        p2 = Vec2(p1.x + self.L2 * math.sin(t2), p1.y - self.L2 * math.cos(t2))
        return p1, p2

    def cartesian_velocities(self, y: Sequence[float]) -> tuple[Vec2, Vec2]:
        t1, o1, t2, o2 = y
        v1 = Vec2(self.L1 * o1 * math.cos(t1), self.L1 * o1 * math.sin(t1))
        v2 = Vec2(
            v1.x + self.L2 * o2 * math.cos(t2), v1.y + self.L2 * o2 * math.sin(t2)
        )
        return v1, v2

    def energies(self, y: Sequence[float]) -> dict[str, float]:
        v1, v2 = self.cartesian_velocities(y)
        p1, p2 = self.cartesian_positions(y)
        ke1 = 0.5 * self.m1 * (v1.x**2 + v1.y**2)
        ke2 = 0.5 * self.m2 * (v2.x**2 + v2.y**2)
        pe1 = self.m1 * self.g * p1.y
        pe2 = self.m2 * self.g * p2.y
        ke = ke1 + ke2
        pe = pe1 + pe2
        return {"ke": ke, "pe": pe, "te": ke + pe}
