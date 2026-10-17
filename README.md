# MatBiom Virtual Physics Lab

An interactive **classical mechanics virtual laboratory**. A Python physics core streams real-time simulation frames over WebSockets to a Next.js / Canvas frontend, which shows live animation, charts, guided lab worksheets, and an AI **Socratic tutor** (powered by Groq) that asks questions about the data instead of giving answers.

---

## Table of Contents

- [Features](#features)
- [Experiments](#experiments)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Numerical Methods](#numerical-methods)

---

## Features

- **Real-time simulation**: the server steps the physics at a fixed `dt = 1/60 s` (up to 90 s per run) and streams each state frame over a WebSocket.
- **Pause / resume**: the client sends commands over the same socket.
- **Canvas rendering**: animated bodies, trajectories, springs, pendulum rods and collisions.
- **Live charts**: position, velocity and energy (kinetic, potential, total) over time.
- **Guided lab worksheets** (`labGuides.js`): each experiment has a structured guide with objectives, theory, procedure and questions.
- **Lab notebook**: students record a hypothesis, observations, data rows and conclusions. They can then request an **AI review** of the notebook.
- **Socratic AI tutor**: uses the current experiment state (position, velocity, energy trend, parameters) to ask short, data-grounded questions. It never solves the problem and never says "correct" or "incorrect". It replies in Spanish and writes math in LaTeX.
- **Markdown + LaTeX rendering** with `marked` and `KaTeX`.

## Experiments

| Experiment | Key | Model | Integrator | Main parameters |
|---|---|---|---|---|
| Projectile motion (2D) | `projectile` | Gravity + linear drag | Velocity Verlet | `mass, x0, y0, vx0, vy0, gravity, drag_coeff` |
| Mass–spring (Hooke's law) | `spring` | Elastic + damping force, optional ground bounce | Velocity Verlet (adaptive substeps) | `mass, x0, y0, vx0, vy0, k, damping, rest_length, ground_collision, restitution` |
| Simple pendulum | `pendulum` | Nonlinear ODE with damping | RK4 | `mass, gravity, length, damping, angle0, vt0` |
| Double pendulum (chaos) | `double_pendulum` | Coupled nonlinear ODEs | RK4 (adaptive substeps) | `mass1, mass2, length1, length2, gravity, damping, angle1, angle2, omega1, omega2` |
| 2D collisions | `collision` | Two rigid discs, coefficient of restitution, optional ground | Custom two-body stepper | `mass_a/b, radius_a/b, ax0, ay0, avx0, avy0, bx0, by0, bvx0, bvy0, gravity, drag, restitution, ground_collision, ground_y` |

All parameters are clamped to safe ranges in [`engine_factory.py`](backend/app/engine_factory.py).

## Project Structure

```
.
├── backend/
│   └── app/
│       ├── main.py              # FastAPI app, CORS, routes
│       ├── ws.py                # WebSocket fixed-timestep streaming loop
│       ├── config.py            # DT (1/60 s) and MAX_T (90 s)
│       ├── engine_factory.py    # Builds an engine from query params
│       ├── api/
│       │   └── tutor.py         # Socratic tutor + notebook review (Groq)
│       ├── core/
│       │   ├── state.py         # State and Vec2 primitives
│       │   ├── engines.py       # VerletEngine, ODEModel, RK4Engine
│       │   └── forces/base.py   # ForceModel abstract base
│       ├── experiments/
│       │   ├── projectile.py
│       │   ├── spring.py
│       │   ├── pendulum.py
│       │   ├── double_pendulum.py
│       │   └── collision.py
│       └── schemas/
│           └── messages.py      # Pydantic StateFrame / ExperimentConfig
└── frontend/
    └── src/
        ├── app/                 # Next.js App Router (layout, page, styles)
        └── components/
            ├── SimulationCanvas.jsx
            ├── TutorPanel.jsx
            ├── TutorContext.jsx
            ├── LabNotebook.jsx
            ├── MarkdownView.jsx
            └── simulation/
                ├── CanvasRenderer.jsx
                ├── Charts.jsx
                ├── Controls.jsx
                ├── constants.js
                ├── hooks.js
                ├── labGuides.js
                └── utils.js
```

## Tech Stack

**Backend:** Python 3.12, FastAPI, Uvicorn, Pydantic, NumPy, Groq SDK, python-dotenv
**Frontend:** Next.js 16, React 19, HTML Canvas, KaTeX, marked

## Getting Started

### Prerequisites

- Python 3.12+ (conda or venv)
- Node.js 20+
- A [Groq API key](https://console.groq.com/) (only needed for the tutor features)

### 1. Backend

From the repository root:

```bash
# Create and activate an environment (example with conda)
conda create -n physics-lab python=3.12 -y
conda activate physics-lab

pip install fastapi "uvicorn[standard]" pydantic numpy groq python-dotenv

python -m uvicorn backend.app.main:app --reload
```

The API runs at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GROQ_API_KEY` | For the tutor | — | Groq API key |
| `GROQ_MODEL` | No | `openai/gpt-oss-20b` | Main LLM model |
| `GROQ_FALLBACK_MODELS` | No | — | Comma-separated fallback models |

### Frontend (`frontend/.env.local`)

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000/ws` |
| `NEXT_PUBLIC_TUTOR_URL` | `http://localhost:8000/api/tutor` |
| `NEXT_PUBLIC_REVIEW_URL` | `http://localhost:8000/api/tutor/review` |

## API Reference

### WebSocket: `GET /ws?experiment=<key>&<params...>`

Open a socket with the experiment key and its parameters as query strings, for example:

```
ws://localhost:8000/ws?experiment=pendulum&length=2&angle0=30&damping=0.05
```

**Server → client (state frame):**

```json
{
  "type": "state",
  "t": 0.0167,
  "experiment": "pendulum",
  "position": { "x": 0.75, "y": -1.30 },
  "velocity": { "x": -0.12, "y": -0.07 },
  "units": { "length": "m", "time": "s", "mass": "kg" },
  "meta": {}
}
```

The `collision` experiment sends a two-body frame (both discs) instead.

**Client → server (commands):**

```json
{ "action": "pause" }
{ "action": "resume" }
```

### `POST /api/tutor`

Returns one Socratic question based on the live experiment state.

```json
{
  "experiment": "projectile",
  "state": { "position": {"x": 1, "y": 2}, "velocity": {"x": 3, "y": -1}, "mass": 1, "t": 0.8 },
  "physics_params": { "gravity": 9.81 },
  "energy": { "kinetic": 5.0, "potential": 19.6, "total": 24.6, "total_trend": 0.0 },
  "is_paused": true,
  "sim_time": 0.8,
  "history": [{ "role": "tutor", "content": "..." }],
  "student_reply": "..."
}
```

Response: `{ "message": "..." }`

### `POST /api/tutor/review`

Gives AI feedback on the student's lab notebook.

```json
{
  "experiment": "spring",
  "guide_title": "...",
  "questions": ["..."],
  "hypothesis": "...",
  "observations": "...",
  "conclusions": "...",
  "data_rows": [{ "t": 0.5, "y": -1.2 }],
  "physics_params": { "k": 12 }
}
```

Response: `{ "feedback": "...", "score": null }`

## Numerical Methods

- **Velocity Verlet** (`VerletEngine`): symplectic and second order. Used for force-based models (projectile, spring) because it keeps energy stable over long runs.
- **Runge–Kutta 4** (`RK4Engine`): fourth order. Used for ODE models (`ODEModel` subclasses) such as the simple and double pendulum.
- **Adaptive substepping**: for stiff springs and fast double pendulums, the number of substeps per frame is picked from the system's natural frequency. This keeps every frame accurate.
- **Collisions**: impulse-based resolution with a coefficient of restitution `e ∈ [0, 1]`, plus optional ground contact.
