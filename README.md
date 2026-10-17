# Virtual Physics Lab

Skeleton for a classical physics virtual lab with a modular physics core, FastAPI backend, and Canvas frontend.

## Project Layout

- backend/app/core: physics engine and utilities
- backend/app/experiments: force models (projectile, spring, pendulum)
- backend/app/schemas: JSON message schema definitions
- backend/app/main.py: FastAPI app with WebSocket fixed-timestep stream
- frontend: HTML/JS Canvas client

## Run (local)

1. Backend (conda env already created)

```
conda activate /home/sanma613/Desktop/avanceProyecto/env
python -m uvicorn backend.app.main:app --reload
```

2. Frontend (Next.js)

```
cd frontend
npm run dev
```

Optional: set a custom WebSocket URL for the frontend

```
export NEXT_PUBLIC_WS_URL="ws://localhost:8000/ws"
```

## JSON Data Contract

### State Frame (server -> client)

```json
{
  "type": "state",
  "t": 0.0,
  "experiment": "projectile",
  "position": { "x": 0.0, "y": 0.0 },
  "velocity": { "x": 0.0, "y": 0.0 },
  "units": { "length": "m", "time": "s", "mass": "kg" }
}
```

### Experiment Config (client -> server, future)

```json
{
  "experiment": "spring",
  "params": {
    "k": 12.0,
    "damping": 0.3
  }
}
```

## Notes

- Physics integration uses Velocity Verlet with a decoupled force model.
- WebSocket stream runs a fixed timestep with an accumulator and sends frames at 60 Hz.
- The pendulum force model includes a soft constraint term for length preservation.
