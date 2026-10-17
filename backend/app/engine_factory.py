import math

from .config import DT
from .core.engines import RK4Engine, VerletEngine
from .core.state import State, Vec2
from .experiments.collision import TwoBodyCollision
from .experiments.double_pendulum import DoublePendulumODE
from .experiments.pendulum import PendulumODE
from .experiments.projectile import ProjectileForce
from .experiments.spring import SpringForce


def _f(qs: dict, key: str, default: float) -> float:
    try:
        return float(qs.get(key, default))
    except:
        return default


def _b(qs: dict, key: str, default: bool = False) -> bool:
    return qs.get(key, str(default)).lower() in ("1", "true", "yes")


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _spring_substeps(k: float, mass: float) -> int:
    omega = math.sqrt(max(k, 0.5) / max(mass, 0.01))
    return max(1, min(int(math.ceil(omega * DT / 0.2)), 20))


def _double_pendulum_substeps(
    length1: float,
    length2: float,
    gravity: float,
    omega1: float,
    omega2: float,
) -> int:
    min_len = max(min(length1, length2), 0.1)
    base = math.sqrt(gravity / min_len)
    omega = max(abs(omega1), abs(omega2), base)
    return max(1, min(int(math.ceil(omega * DT / 0.15)), 12))


def build_engine(experiment: str, qs: dict):
    meta: dict = {}

    if experiment == "projectile":
        mass = _clamp(_f(qs, "mass", 1.0), 0.1, 20.0)
        x0 = _clamp(_f(qs, "x0", 0.0), -10, 10)
        y0 = _clamp(_f(qs, "y0", 0.0), 0, 15)
        vx0 = _clamp(_f(qs, "vx0", 0.0), -25, 25)
        vy0 = _clamp(_f(qs, "vy0", 0.0), -25, 25)
        g = _clamp(_f(qs, "gravity", 9.81), 0.1, 25)
        drag = _clamp(_f(qs, "drag_coeff", 0.0), 0.0, 1)
        engine = VerletEngine(
            State(Vec2(x0, y0), Vec2(vx0, vy0), mass),
            ProjectileForce(gravity=g, drag_coeff=drag),
        )
        meta["y0"] = y0

    elif experiment == "spring":
        mass = _clamp(_f(qs, "mass", 1.0), 0.1, 20.0)
        x0 = _clamp(_f(qs, "x0", 0.0), -2, 2)
        y0 = _clamp(_f(qs, "y0", -2.0), -6, 6)
        vx0 = _clamp(_f(qs, "vx0", 0.0), -8, 8)
        vy0 = _clamp(_f(qs, "vy0", 0.0), -12, 12)
        k = _clamp(_f(qs, "k", 12), 0.5, 80)
        damp = _clamp(_f(qs, "damping", 0.3), 0, 3)
        rl = _clamp(_f(qs, "rest_length", 1.0), 0, 5)
        gc = _b(qs, "ground_collision")
        rest = _clamp(_f(qs, "restitution", 0.85), 0.0, 1.0)
        engine = VerletEngine(
            State(Vec2(x0, y0), Vec2(vx0, vy0), mass),
            SpringForce(k=k, damping=damp, anchor=Vec2(0, 0), rest_length=rl),
        )
        meta.update(
            ground_collision=gc,
            restitution=rest,
            ground_y=0.0,
            bounce_when_vy_negative=(y0 >= 0),
            substeps=_spring_substeps(k, mass),
        )

    elif experiment == "pendulum":
        mass = _clamp(_f(qs, "mass", 1.0), 0.1, 20.0)
        g = _clamp(_f(qs, "gravity", 9.81), 0.1, 25)
        L = _clamp(_f(qs, "length", 1.5), 0.3, 5)
        damp = _clamp(_f(qs, "damping", 0.08), 0.0, 2)
        angle0 = _clamp(_f(qs, "angle0", 45.0), -175, 175)
        vt0 = _clamp(_f(qs, "vt0", 0.0), -8, 8)
        ode = PendulumODE(
            length=L,
            gravity=g,
            damping=damp,
            mass=mass,
            theta0=math.radians(angle0),
            omega0=vt0 / L,
        )
        engine = RK4Engine(model=ode)
        meta["ode"] = ode

    elif experiment == "double_pendulum":
        m1 = _clamp(_f(qs, "mass1", 1.0), 0.1, 20.0)
        m2 = _clamp(_f(qs, "mass2", 1.0), 0.1, 20.0)
        L1 = _clamp(_f(qs, "length1", 1.2), 0.2, 4.0)
        L2 = _clamp(_f(qs, "length2", 1.0), 0.2, 4.0)
        g = _clamp(_f(qs, "gravity", 9.81), 0.1, 25.0)
        damp = _clamp(_f(qs, "damping", 0.0), 0.0, 1.0)
        a1 = _clamp(_f(qs, "angle1", 90.0), -175, 175)
        a2 = _clamp(_f(qs, "angle2", 120.0), -175, 175)
        o1 = _clamp(_f(qs, "omega1", 0.0), -10, 10)
        o2 = _clamp(_f(qs, "omega2", 0.0), -10, 10)
        ode = DoublePendulumODE(
            length1=L1,
            length2=L2,
            mass1=m1,
            mass2=m2,
            gravity=g,
            damping=damp,
            theta1_0=math.radians(a1),
            omega1_0=o1,
            theta2_0=math.radians(a2),
            omega2_0=o2,
        )
        engine = RK4Engine(model=ode)
        meta["ode"] = ode
        meta["substeps"] = _double_pendulum_substeps(L1, L2, g, o1, o2)

    elif experiment == "collision":
        g = _clamp(_f(qs, "gravity", 9.81), 0.0, 25.0)
        drag = _clamp(_f(qs, "drag", 0.0), 0.0, 1.0)
        rest = _clamp(_f(qs, "restitution", 1.0), 0.0, 1.0)
        am = _clamp(_f(qs, "mass_a", 1.0), 0.1, 20.0)
        ar = _clamp(_f(qs, "radius_a", 0.2), 0.05, 1.0)
        ax0 = _clamp(_f(qs, "ax0", -3.0), -10, 10)
        ay0 = _clamp(_f(qs, "ay0", 0.0), -10, 10)
        avx0 = _clamp(_f(qs, "avx0", 4.0), -20, 20)
        avy0 = _clamp(_f(qs, "avy0", 0.0), -20, 20)
        bm = _clamp(_f(qs, "mass_b", 1.0), 0.1, 20.0)
        br = _clamp(_f(qs, "radius_b", 0.2), 0.05, 1.0)
        bx0 = _clamp(_f(qs, "bx0", 2.0), -10, 10)
        by0 = _clamp(_f(qs, "by0", 0.0), -10, 10)
        bvx0 = _clamp(_f(qs, "bvx0", 0.0), -20, 20)
        bvy0 = _clamp(_f(qs, "bvy0", 0.0), -20, 20)
        gc = _b(qs, "ground_collision")
        ground_y = _clamp(_f(qs, "ground_y", -3.0), -10, 0.0)
        engine = TwoBodyCollision(
            ax0=ax0,
            ay0=ay0,
            avx0=avx0,
            avy0=avy0,
            am=am,
            ar=ar,
            bx0=bx0,
            by0=by0,
            bvx0=bvx0,
            bvy0=bvy0,
            bm=bm,
            br=br,
            gravity=g,
            drag=drag,
            restitution=rest,
            ground=gc,
            ground_y=ground_y,
        )

    else:
        raise ValueError(f"Unknown experiment: {experiment!r}")

    return engine, meta
