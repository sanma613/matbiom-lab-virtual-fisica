from __future__ import annotations

from ..core.forces.base import ForceModel
from ..core.state import State, Vec2


class SpringForce(ForceModel):
    def __init__(
        self,
        k: float = 12.0,
        damping: float = 0.3,
        anchor: Vec2 | None = None,
        rest_length: float = 0.0,
    ) -> None:
        self.k = k
        self.damping = damping
        self.anchor = anchor or Vec2(0.0, 0.0)
        self.rest_length = rest_length

    def compute_force(self, state: State) -> Vec2:
        displacement = state.position - self.anchor
        length = displacement.magnitude()
        if length == 0.0:
            spring_force = Vec2(0.0, 0.0)
        else:
            direction = displacement / length
            stretch = length - self.rest_length
            spring_force = direction * (-self.k * stretch)
        damping_force = state.velocity * (-self.damping)
        return spring_force + damping_force
