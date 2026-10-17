from __future__ import annotations

from ..core.forces.base import ForceModel
from ..core.state import State, Vec2


class ProjectileForce(ForceModel):
    def __init__(self, gravity: float = 9.81, drag_coeff: float = 0.1) -> None:
        self.gravity = gravity
        self.drag_coeff = drag_coeff

    def compute_force(self, state: State) -> Vec2:
        gravity_force = Vec2(0.0, -state.mass * self.gravity)
        drag_force = state.velocity * (-self.drag_coeff)
        return gravity_force + drag_force
