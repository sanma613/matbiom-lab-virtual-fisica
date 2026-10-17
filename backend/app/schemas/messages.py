from __future__ import annotations

from typing import Any, Dict, Literal

from pydantic import BaseModel, Field


class Vec2Schema(BaseModel):
    x: float
    y: float


class StateFrame(BaseModel):
    type: Literal["state"]
    t: float
    experiment: Literal["projectile", "spring", "pendulum", "double_pendulum", "collision"]
    position: Vec2Schema
    velocity: Vec2Schema
    units: Dict[str, str] = Field(
        default_factory=lambda: {"length": "m", "time": "s", "mass": "kg"}
    )
    meta: Dict[str, Any] = Field(default_factory=dict)


class ExperimentConfig(BaseModel):
    experiment: Literal["projectile", "spring", "pendulum", "double_pendulum", "collision"]
    params: Dict[str, Any] = Field(default_factory=dict)
