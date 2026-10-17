from __future__ import annotations

import math
from dataclasses import dataclass

from ..core.engines import VerletEngine
from ..core.forces.base import ForceModel
from ..core.state import State, Vec2


class BodyForce(ForceModel):
    def __init__(self, gravity: float = 9.81, drag: float = 0.0) -> None:
        self.gravity = gravity
        self.drag = drag

    def compute_force(self, state: State) -> Vec2:
        return Vec2(
            -self.drag * state.velocity.x,
            -state.mass * self.gravity - self.drag * state.velocity.y,
        )


@dataclass
class CollisionFrame:
    ax: float
    ay: float
    avx: float
    avy: float
    am: float
    ar: float
    bx: float
    by: float
    bvx: float
    bvy: float
    bm: float
    br: float
    px_total: float
    py_total: float
    a_fg: float
    a_fd: float
    b_fg: float
    b_fd: float
    a_fcx: float
    a_fcy: float
    b_fcx: float
    b_fcy: float
    colliding: bool
    a_on_ground: bool
    b_on_ground: bool
    t: float = 0.0

    def to_dict(self) -> dict:
        return self.__dict__


class TwoBodyCollision:

    def __init__(
        self,
        ax0: float,
        ay0: float,
        avx0: float,
        avy0: float,
        am: float,
        ar: float,
        bx0: float,
        by0: float,
        bvx0: float,
        bvy0: float,
        bm: float,
        br: float,
        gravity: float = 9.81,
        drag: float = 0.0,
        restitution: float = 1.0,
        ground: bool = False,
        ground_y: float = -3.0,
    ) -> None:
        self.ar = ar
        self.br = br
        self.restitution = restitution
        self.ground = ground
        self.ground_y = ground_y
        self.gravity = gravity
        self.drag = drag

        force = BodyForce(gravity=gravity, drag=drag)
        self.engine_a = VerletEngine(State(Vec2(ax0, ay0), Vec2(avx0, avy0), am), force)
        self.engine_b = VerletEngine(State(Vec2(bx0, by0), Vec2(bvx0, bvy0), bm), force)

        self._a_fc = Vec2(0.0, 0.0)
        self._b_fc = Vec2(0.0, 0.0)
        self._colliding = False

    def step(self, dt: float) -> CollisionFrame:
        sa = self.engine_a.step(dt)
        sb = self.engine_b.step(dt)

        self._a_fc = Vec2(0.0, 0.0)
        self._b_fc = Vec2(0.0, 0.0)
        self._colliding = False

        a_ground = self._ground_bounce(self.engine_a, self.ar)
        b_ground = self._ground_bounce(self.engine_b, self.br)
        sa = self.engine_a.state
        sb = self.engine_b.state

        self._body_collision(sa, sb)
        sa = self.engine_a.state
        sb = self.engine_b.state

        ma, mb = sa.mass, sb.mass
        px = ma * sa.velocity.x + mb * sb.velocity.x
        py = ma * sa.velocity.y + mb * sb.velocity.y

        a_fg = ma * self.gravity
        b_fg = mb * self.gravity
        a_spd = math.sqrt(sa.velocity.x**2 + sa.velocity.y**2)
        b_spd = math.sqrt(sb.velocity.x**2 + sb.velocity.y**2)
        a_fd = self.drag * a_spd
        b_fd = self.drag * b_spd

        return CollisionFrame(
            ax=sa.position.x,
            ay=sa.position.y,
            avx=sa.velocity.x,
            avy=sa.velocity.y,
            am=ma,
            ar=self.ar,
            bx=sb.position.x,
            by=sb.position.y,
            bvx=sb.velocity.x,
            bvy=sb.velocity.y,
            bm=mb,
            br=self.br,
            px_total=px,
            py_total=py,
            a_fg=a_fg,
            a_fd=a_fd,
            b_fg=b_fg,
            b_fd=b_fd,
            a_fcx=self._a_fc.x,
            a_fcy=self._a_fc.y,
            b_fcx=self._b_fc.x,
            b_fcy=self._b_fc.y,
            colliding=self._colliding,
            a_on_ground=a_ground,
            b_on_ground=b_ground,
        )

    def _ground_bounce(self, engine: VerletEngine, radius: float) -> bool:
        if not self.ground:
            return False
        s = engine.state
        if s.position.y - radius <= self.ground_y and s.velocity.y < 0:
            e = self.restitution
            new_pos = Vec2(s.position.x, self.ground_y + radius)
            new_vel = Vec2(s.velocity.x, -s.velocity.y * e)
            engine.state = State(new_pos, new_vel, s.mass)
            return True
        return False

    def _body_collision(self, sa: State, sb: State) -> None:
        dx = sb.position.x - sa.position.x
        dy = sb.position.y - sa.position.y
        dist = math.sqrt(dx * dx + dy * dy)
        min_dist = self.ar + self.br

        if dist >= min_dist or dist < 1e-9:
            return

        nx, ny = dx / dist, dy / dist

        vrel_n = (sa.velocity.x - sb.velocity.x) * nx + (
            sa.velocity.y - sb.velocity.y
        ) * ny

        if vrel_n <= 0:
            return

        e = self.restitution
        ma, mb = sa.mass, sb.mass

        j = (1 + e) * vrel_n / (1 / ma + 1 / mb)

        new_va = Vec2(sa.velocity.x - (j / ma) * nx, sa.velocity.y - (j / ma) * ny)
        new_vb = Vec2(sb.velocity.x + (j / mb) * nx, sb.velocity.y + (j / mb) * ny)


        overlap = min_dist - dist
        slop = 1e-4 
        correction = max(overlap + slop, 0.0)
        corr_a = correction * mb / (ma + mb)
        corr_b = correction * ma / (ma + mb)
        new_pa = Vec2(sa.position.x - corr_a * nx, sa.position.y - corr_a * ny)
        new_pb = Vec2(sb.position.x + corr_b * nx, sb.position.y + corr_b * ny)

        self.engine_a.state = State(new_pa, new_va, ma)
        self.engine_b.state = State(new_pb, new_vb, mb)

        self._a_fc = Vec2(-j * nx, -j * ny)
        self._b_fc = Vec2(j * nx, j * ny)
        self._colliding = True
