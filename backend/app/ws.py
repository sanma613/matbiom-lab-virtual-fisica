import asyncio
import json

from fastapi import WebSocket, WebSocketDisconnect

from .config import DT, MAX_T
from .core.state import State, Vec2
from .engine_factory import build_engine
from .schemas.messages import StateFrame


async def ws_endpoint(websocket: WebSocket) -> None:
    await websocket.accept()
    qs = dict(websocket.query_params)
    experiment = qs.get("experiment", "projectile")

    try:
        engine, meta = build_engine(experiment, qs)
    except ValueError as exc:
        await websocket.send_text(json.dumps({"error": str(exc)}))
        await websocket.close()
        return

    t = 0.0
    proj_started_above = None
    paused = asyncio.Event()
    paused.set()  # starts unpaused (event is "set" = running)

    # Listen for pause/resume commands from the client
    async def _listen_commands():
        try:
            while True:
                msg = await websocket.receive_text()
                try:
                    cmd = json.loads(msg)
                    action = cmd.get("action")
                    if action == "pause":
                        paused.clear()
                    elif action == "resume":
                        paused.set()
                except (json.JSONDecodeError, AttributeError):
                    pass
        except WebSocketDisconnect:
            pass
        except Exception:
            pass

    listener_task = asyncio.create_task(_listen_commands())

    try:
        while t < MAX_T:
            # Wait while paused
            await paused.wait()

            if experiment == "collision":
                cf = engine.step(DT)
                cf.t = round(t + DT, 4)
                await websocket.send_text(json.dumps(cf.to_dict()))
                t += DT
                await asyncio.sleep(DT)
                continue

            if experiment == "pendulum":
                state = engine.step(DT)
                ode = meta["ode"]
                frame_meta = {"omega": ode.omega_from(engine.y), "mass": ode.mass}

            elif experiment == "double_pendulum":
                n_sub = meta.get("substeps", 1)
                dt_sub = DT / n_sub
                for _ in range(n_sub):
                    state = engine.step(dt_sub)
                ode = meta["ode"]
                y = engine.y
                p1, p2 = ode.cartesian_positions(y)
                v1, v2 = ode.cartesian_velocities(y)
                en = ode.energies(y)
                frame_meta = {
                    "p1x": p1.x,
                    "p1y": p1.y,
                    "p2x": p2.x,
                    "p2y": p2.y,
                    "v1x": v1.x,
                    "v1y": v1.y,
                    "v2x": v2.x,
                    "v2y": v2.y,
                    "theta1": y[0],
                    "omega1": y[1],
                    "theta2": y[2],
                    "omega2": y[3],
                    "ke": en["ke"],
                    "pe": en["pe"],
                    "te": en["te"],
                    "m1": ode.m1,
                    "m2": ode.m2,
                }

            elif experiment == "spring":
                n_sub = meta.get("substeps", 1)
                dt_sub = DT / n_sub
                for _ in range(n_sub):
                    state = engine.step(dt_sub)
                    if meta.get("ground_collision"):
                        gy = meta["ground_y"]
                        e = meta["restitution"]
                        neg = meta["bounce_when_vy_negative"]
                        py_s, vy_s = state.position.y, state.velocity.y
                        if (neg and py_s <= gy and vy_s < 0) or (
                            not neg and py_s >= gy and vy_s > 0
                        ):
                            engine.state = State(
                                Vec2(state.position.x, gy),
                                Vec2(state.velocity.x, -vy_s * e),
                                state.mass,
                            )
                            state = engine.state
                frame_meta = {"mass": state.mass}

            else:
                state = engine.step(DT)
                frame_meta = {"mass": state.mass}

            t += DT

            if experiment == "projectile":
                y0 = meta["y0"]
                y = state.position.y
                vy = state.velocity.y
                if y0 > 0:
                    if y <= 0:
                        await _emit(websocket, t, experiment, state, frame_meta)
                        break
                else:
                    if proj_started_above is None:
                        if vy > 0:
                            proj_started_above = True
                        elif y <= y0:
                            break
                    else:
                        if y <= y0 and vy <= 0:
                            await _emit(websocket, t, experiment, state, frame_meta)
                            break

            await _emit(websocket, t, experiment, state, frame_meta)
            await asyncio.sleep(DT)

    except WebSocketDisconnect:
        pass
    finally:
        listener_task.cancel()
        try:
            await websocket.close()
        except:
            pass


async def _emit(ws, t, experiment, state, meta):
    frame = StateFrame(
        type="state",
        t=round(t, 4),
        experiment=experiment,
        position=state.position.to_dict(),
        velocity=state.velocity.to_dict(),
        meta=meta,
    )
    await ws.send_text(frame.model_dump_json())
