from __future__ import annotations

import math
import os
from typing import Any, Dict, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from groq import Groq
from pydantic import BaseModel, Field

load_dotenv()

router = APIRouter(prefix="/api", tags=["tutor"])
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
GROQ_FALLBACK_MODELS: List[str] = [
    m.strip() for m in os.getenv("GROQ_FALLBACK_MODELS", "").split(",") if m.strip()
]
_groq: Optional[Groq] = None


def get_groq() -> Groq:
    global _groq
    if _groq is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="GROQ_API_KEY not set. Add it to your environment variables.",
            )
        _groq = Groq(api_key=api_key)
    return _groq


class Vec2Payload(BaseModel):
    x: float
    y: float


class StatePayload(BaseModel):
    position: Vec2Payload
    velocity: Vec2Payload
    mass: float = 1.0
    t: float = 0.0


class EnergySnapshot(BaseModel):
    kinetic: float
    potential: float
    total: float
    total_trend: float = 0.0


class ConversationTurn(BaseModel):
    role: Literal["tutor", "student"]
    content: str


class TutorRequest(BaseModel):
    experiment: Literal[
        "projectile", "spring", "pendulum", "double_pendulum", "collision"
    ]
    state: StatePayload
    physics_params: Dict[str, Any] = Field(default_factory=dict)
    energy: EnergySnapshot
    is_paused: bool = False
    sim_time: float = 0.0
    history: List[ConversationTurn] = Field(default_factory=list)
    student_reply: Optional[str] = None


class TutorResponse(BaseModel):
    message: str


SYSTEM_PROMPT = """
Eres una interfaz socrática determinista de física de laboratorio. Te comunicas exclusivamente mediante el análisis de los datos experimentales del laboratorio.

## DIRECTIVAS OBLIGATORIAS
1. **RECHAZAR TEMAS AJENOS A LA FÍSICA:** Ignora preguntas personales, bromas o consultas no científicas. Si se detectan, debes responder: "Eso está fuera del alcance de nuestro laboratorio. Dato actual: [Métrica actual]. [Pregunta socrática]."
2. **NO RESOLVER CÁLCULOS:** Nunca hagas los cálculos matemáticos por el estudiante. Tu rol es guiar la comprensión conceptual mediante preguntas socráticas.
3. **NO EMITIR VEREDICTOS:** Nunca uses palabras como "Correcto", "Incorrecto", "Exactamente" ni emojis ni marcadores de evaluación.
4. **ANCLAJE EN DATOS:** Debes citar siempre un valor numérico específico del estado actual (ej: "La energía cinética es 4.520 J") en cada respuesta.
5. **REALISMO FÍSICO:** Trata los datos como medidas de un fenómeno físico real. Nunca menciones "simulación", "software", "errores de integración" ni "artefactos numéricos".
6. **NOTACIÓN MATEMÁTICA EN LATEX:** Al citar variables o fórmulas físicas, usa siempre notación LaTeX estándar delimitada con $...$ para expresiones inline (ej: $v_x$, $E_k$, $\\theta$) o $$...$$ para bloques si formulas una relación fundamental.

## FORMATO DE RESPUESTA
- Máximo 2 oraciones.
- Tono académico, firme y conciso.
- Responde siempre en español.
""".strip()


def _speed(s: StatePayload) -> float:
    return math.sqrt(s.velocity.x**2 + s.velocity.y**2)


def _build_context_block(req: TutorRequest) -> str:
    s = req.state
    e = req.energy
    p = req.physics_params
    spd = _speed(s)
    energy_note = e.total_trend

    return "\n".join(
        [
            f"[SIMULATION SNAPSHOT]",
            f"Experiment     : {req.experiment}",
            f"Simulation time: {req.sim_time:.2f} s",
            f"Position       : x = {s.position.x:.3f} m,  y = {s.position.y:.3f} m",
            f"Velocity       : vx = {s.velocity.x:.3f} m/s,  vy = {s.velocity.y:.3f} m/s",
            f"Speed          : {spd:.3f} m/s",
            f"Mass           : {s.mass:.2f} kg",
            f"KE / PE / E_tot: {e.kinetic:.4f} J / {e.potential:.4f} J / {e.total:.4f} J",
            f"Energy trend   : {energy_note}",
            f"Physics params : {p}",
        ]
    )


def _build_messages(req: TutorRequest) -> tuple[list[dict], str]:
    context = _build_context_block(req)

    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    if not req.history:
        messages.append(
            {
                "role": "user",
                "content": (
                    f"{context}\n\n"
                    f"The student clicked the Hint button. "
                    f"Ask one or two Socratic questions grounded in the data above."
                ),
            }
        )
    else:
        first_student_content = f"{context}\n\n" f"[START OF CONVERSATION]"
        messages.append({"role": "user", "content": first_student_content})

        for turn in req.history:
            groq_role = "assistant" if turn.role == "tutor" else "user"
            messages.append({"role": groq_role, "content": turn.content})

        if req.student_reply:
            messages.append(
                {
                    "role": "user",
                    "content": (
                        f"[STUDENT REPLY]: {req.student_reply}\n\n"
                        f"Evaluate this reply using Mode B. "
                        f"Determine if it is correct, partially correct, or incorrect, "
                        f"but do NOT state the verdict explicitly. "
                        f"Respond with a brief acknowledgment and a deepening question."
                    ),
                }
            )
        else:
            messages.append(
                {
                    "role": "user",
                    "content": (
                        f"[Updated snapshot above — student clicked Hint again.] "
                        f"Ask a new Socratic question based on the current state."
                    ),
                }
            )

    return messages


@router.post("/tutor", response_model=TutorResponse)
async def ask_tutor(req: TutorRequest) -> TutorResponse:
    groq_client = get_groq()
    messages = _build_messages(req)

    models = [GROQ_MODEL] + GROQ_FALLBACK_MODELS
    last_exc: Optional[Exception] = None

    completion = None
    for model in models:
        try:
            completion = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.72,
                max_tokens=220,
                top_p=0.95,
            )
            break
        except Exception as exc:
            last_exc = exc
            continue

    if completion is None:
        raise HTTPException(
            status_code=502,
            detail=f"All models failed. Last error: {last_exc}",
        ) from last_exc

    message = completion.choices[0].message.content.strip()

    return TutorResponse(
        message=message,
    )




# ═══════════════════════════════════════════════════════════
# Lab-notebook review endpoint  (direct feedback, NOT Socratic)
# ═══════════════════════════════════════════════════════════

REVIEW_SYSTEM_PROMPT = r"""
Eres un profesor y evaluador de laboratorio de física universitaria. Tu objetivo es brindar retroalimentación constructiva, clara, empática y rigurosa sobre el reporte o respuestas del estudiante.

## PAUTAS DE EVALUACIÓN
1. Sé directo, pedagógico y útil para el aprendizaje del estudiante.
2. Identifica aciertos conceptuales, errores físicos y puntos que necesitan mayor profundidad.
3. Si el estudiante cometió un error o no calculó algo, explica brevemente el principio físico y sugiérele preguntas para que lo razone.
4. Trata los datos del laboratorio como medidas experimentales reales.
5. NOTACIÓN MATEMÁTICA EN LATEX OBLIGATORIA:
   - Delimita SIEMPRE con signos de dólar: usa `$variable$` para expresiones en línea (ej: `$v_x$`, `$drag = 0$`, `$E_c$`, `$t$`) y `$$fórmula$$` en bloque separado para ecuaciones principales (ej: $$y_{\max} = y_0 + \frac{v_{y_0}^2}{2g}$$).
   - Mantén el formato estilo Marco Teórico: texto ... ecuación en bloque `$$...$$` ... texto explicativo.
   - NUNCA uses los delimitadores `\(` ni `\[` (utiliza exclusivamente `$` y `$$`).
   - NUNCA escribas nombres de variables físicas o fórmulas en texto plano sin `$`.

## FORMATO DE RESPUESTA
Usa ÚNICAMENTE los encabezados que apliquen a lo que el estudiante escribió (no agregues encabezados vacíos):

- **LO QUE ESTÁ BIEN**: (Incluye esta sección ÚNICAMENTE si el estudiante planteó ideas, hipótesis o cálculos correctos. Si no hay nada acertado o aún no respondió adecuadamente, OMITE por completo este encabezado. NUNCA escribas frases como "No hay contenido correcto presentado" o "Nada correcto").
- **ASPECTOS A CORREGIR**: (Señala de forma clara y respetuosa qué conceptos o cálculos están errados físicamente y por qué).
- **PUNTOS A COMPLETAR**: (Indica qué preguntas o cálculos de la guía faltaron por responder o profundizar).
- **PREGUNTAS PARA PROFUNDIZAR**: (1 o 2 preguntas clave que ayuden al estudiante a reflexionar y corregir su comprensión).

## REGLAS
- Responde siempre en español.
- Máximo 180 palabras en total.
- Tono académico, formativo y cercano.
- Si el estudiante escribió respuestas muy breves o incompletas, guíalo amablemente sobre qué fórmulas o datos de su tabla debe usar para responder los problemas.
""".strip()


class ReviewRequest(BaseModel):
    experiment: str
    questions: List[str] = Field(default_factory=list)
    hypothesis: str = ""
    observations: str = ""
    conclusions: str = ""
    data_rows: List[Dict[str, Any]] = Field(default_factory=list)
    physics_params: Dict[str, Any] = Field(default_factory=dict)
    guide_title: str = ""


class ReviewResponse(BaseModel):
    feedback: str
    score: Optional[str] = None  # reserved for future grading


@router.post("/tutor/review", response_model=ReviewResponse)
async def review_notebook(req: ReviewRequest) -> ReviewResponse:
    groq_client = get_groq()

    # Build the student-work summary for the LLM
    parts = [
        f"[LAB REVIEW REQUEST]",
        f"Experiment: {req.experiment} — {req.guide_title}",
        f"Physics params: {req.physics_params}",
        "",
    ]

    if req.data_rows:
        parts.append(f"Data collected ({len(req.data_rows)} rows):")
        for i, row in enumerate(req.data_rows[:10]):  # limit rows sent
            parts.append(f"  Row {i+1}: {row}")
        parts.append("")

    if req.questions:
        parts.append("Analysis questions posed to the student:")
        for i, q in enumerate(req.questions):
            parts.append(f"  Q{i+1}: {q}")
        parts.append("")

    parts.append("=== STUDENT'S WORK ===")
    if req.hypothesis:
        parts.append(f"HIPÓTESIS: {req.hypothesis}")
    if req.observations:
        parts.append(f"OBSERVACIONES: {req.observations}")
    if req.conclusions:
        parts.append(f"CONCLUSIONES: {req.conclusions}")

    if not (req.hypothesis or req.observations or req.conclusions):
        return ReviewResponse(
            feedback="No has escrito nada todavía. Completa al menos la hipótesis o las conclusiones para recibir retroalimentación."
        )

    messages = [
        {"role": "system", "content": REVIEW_SYSTEM_PROMPT},
        {"role": "user", "content": "\n".join(parts)},
    ]

    models = [GROQ_MODEL] + GROQ_FALLBACK_MODELS
    last_exc: Optional[Exception] = None
    completion = None

    for model in models:
        try:
            completion = groq_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.5,
                max_tokens=400,
                top_p=0.9,
            )
            break
        except Exception as exc:
            last_exc = exc
            continue

    if completion is None:
        raise HTTPException(
            status_code=502,
            detail=f"All models failed. Last error: {last_exc}",
        ) from last_exc

    feedback = completion.choices[0].message.content.strip()
    return ReviewResponse(feedback=feedback)
