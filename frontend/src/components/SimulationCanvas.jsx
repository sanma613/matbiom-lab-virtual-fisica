"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TutorProvider, useTutor } from "./TutorContext";
import LabNotebook from "./LabNotebook";
import { ChartAccordion } from "./simulation/Charts";
import { ParamRow, SectionLabel, Toggle } from "./simulation/Controls";
import { renderFrame } from "./simulation/CanvasRenderer";
import {
  BASE_SCALE,
  CHART_DEFS,
  CHART_MAX,
  COLORS,
  DEFAULT_WS,
  EXPERIMENTS,
  IC_PARAMS,
  PHYSICS_PARAMS,
  TRAIL_MAX,
} from "./simulation/constants";
import { useChartRanges } from "./simulation/hooks";
import { buildDefaults, mag, pickNice } from "./simulation/utils";

function SimulationCanvasInner() {
  const { pushEnergy } = useTutor();

  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const stateRef = useRef(null);
  const worldTrail = useRef([]);
  const pausedRef = useRef(false);
  const originRef = useRef([0, 0]);
  const scaleRef = useRef(BASE_SCALE);
  const panRef = useRef([0, 0]);
  const isDragging = useRef(false);
  const dragStart = useRef([0, 0]);
  const panSnap = useRef([0, 0]);
  const showFBDRef = useRef(false);
  const showGndRef = useRef(false);
  const groundYRef = useRef(-3);
  const launchPhys = useRef({});
  const launchExp = useRef("projectile");
  const collisionBaseRef = useRef({ set: false, px: 0, py: 0, te: 0 });
  const manuallyStopped = useRef(false);

  const [experiment, setExperiment] = useState("projectile");
  const [status, setStatus] = useState("idle");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showFBD, setShowFBD] = useState(false);
  const [showGround, setShowGround] = useState(false);
  const [groundY, setGroundY] = useState(-3);
  const [springGnd, setSpringGnd] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [completionToast, setCompletionToast] = useState(null);

  const [physics, setPhysics] = useState(() => buildDefaults(PHYSICS_PARAMS));
  const [ic, setIc] = useState(() => buildDefaults(IC_PARAMS));

  const [disp, setDisp] = useState(null);
  const [time, setTime] = useState(0);
  const [chartData, setChartData] = useState({});
  const [openCharts, setOpenCharts] = useState(["te", "speed"]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!completionToast) return;
    const t = setTimeout(() => setCompletionToast(null), 7000);
    return () => clearTimeout(t);
  }, [completionToast]);

  useEffect(() => {
    launchPhys.current = { ...physics[experiment], ...ic[experiment] };
  }, [experiment, physics, ic]);

  useEffect(() => {
    showFBDRef.current = showFBD;
  }, [showFBD]);
  useEffect(() => {
    showGndRef.current = showGround;
    groundYRef.current = groundY;
  }, [showGround, groundY]);

  const refreshOrigin = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    originRef.current = [c.width * 0.5 + panRef.current[0], c.height * 0.5 + panRef.current[1]];
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width;
      c.height = r.height;
      refreshOrigin();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, [refreshOrigin]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const onDown = e => {
      setShowHint(false);
      isDragging.current = true;
      dragStart.current = [e.clientX, e.clientY];
      panSnap.current = [...panRef.current];
      c.style.cursor = "grabbing";
    };
    const onMove = e => {
      if (!isDragging.current) return;
      panRef.current = [
        panSnap.current[0] + e.clientX - dragStart.current[0],
        panSnap.current[1] + e.clientY - dragStart.current[1],
      ];
      refreshOrigin();
    };
    const onUp = () => {
      isDragging.current = false;
      c.style.cursor = "grab";
    };
    c.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    c.style.cursor = "grab";
    return () => {
      c.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [refreshOrigin]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const onWheel = e => {
      setShowHint(false);
      e.preventDefault();
      const r = c.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const prev = scaleRef.current;
      const next = Math.max(10, Math.min(600, prev * f));
      panRef.current[0] = mx - (mx - panRef.current[0] - c.width * 0.5) * (next / prev) - c.width * 0.5;
      panRef.current[1] = my - (my - panRef.current[1] - c.height * 0.5) * (next / prev) - c.height * 0.5;
      scaleRef.current = next;
      refreshOrigin();
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [refreshOrigin]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let raf;
    const loop = () => {
      renderFrame(
        ctx,
        c.width,
        c.height,
        stateRef.current,
        worldTrail.current,
        originRef.current,
        scaleRef.current,
        experiment,
        showGndRef.current,
        groundYRef.current,
        showFBDRef.current,
        launchPhys.current,
        COLORS
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [experiment]);

  const extractVals = useCallback((data, exp, phys) => {
    if (!data) return {};
    if (exp === "collision") {
      const cf = data._collision;
      if (!cf) return {};
      const sa = mag(cf.avx, cf.avy);
      const sb = mag(cf.bvx, cf.bvy);
      const g = phys?.gravity ?? 0;
      const ke = 0.5 * cf.am * sa * sa + 0.5 * cf.bm * sb * sb;
      const pe = g * (cf.am * cf.ay + cf.bm * cf.by);
      const te = ke + pe;
      const base = collisionBaseRef.current;
      if (!base.set) {
        base.set = true;
        base.px = cf.px_total;
        base.py = cf.py_total;
        base.te = te;
      }
      const dpx = cf.px_total - base.px;
      const dpy = cf.py_total - base.py;
      return {
        speed_a: sa,
        speed_b: sb,
        px_total: cf.px_total,
        py_total: cf.py_total,
        p_mag: Math.hypot(cf.px_total, cf.py_total),
        dp_mag: Math.hypot(dpx, dpy),
        te_total: te,
        dte: te - base.te,
        dist: mag(cf.ax - cf.bx, cf.ay - cf.by),
        ax: cf.ax,
        bx: cf.bx,
        avx: cf.avx,
        bvx: cf.bvx,
      };
    }
    if (exp === "double_pendulum") {
      const m = data._meta ?? {};
      return {
        theta1: (m.theta1 ?? 0) * 180 / Math.PI,
        theta2: (m.theta2 ?? 0) * 180 / Math.PI,
        omega1: m.omega1 ?? 0,
        omega2: m.omega2 ?? 0,
        ke: m.ke ?? 0,
        pe: m.pe ?? 0,
        te: m.te ?? 0,
      };
    }
    const { x: px, y: py } = data.position;
    const { x: vx, y: vy } = data.velocity;
    const m = data.mass ?? phys?.mass ?? 1;
    const g = phys?.gravity ?? 9.81;
    const speed = mag(vx, vy);
    const ke = 0.5 * m * speed * speed;
    const vals = { speed };
    if (exp === "projectile") {
      const pe = m * g * py;
      Object.assign(vals, { posX: px, posY: py, ke, pe, te: ke + pe });
    } else if (exp === "spring") {
      const k = phys?.k ?? 12;
      const rl = phys?.rest_length ?? 1;
      const ext = mag(px, py) - rl;
      const spe = 0.5 * k * ext * ext;
      Object.assign(vals, { posX: px, posY: py, ke, spring_pe: spe, te: ke + spe, extension: ext });
    } else if (exp === "pendulum") {
      const L = phys?.length ?? 1.5;
      const pe = m * g * (py + L);
      const theta = Math.atan2(px, -py) * 180 / Math.PI;
      const omega = data.meta?.omega ?? 0;
      Object.assign(vals, { angle: theta, omega, ke, pe, te: ke + pe });
    }
    return vals;
  }, []);

  const clearData = useCallback(() => {
    stateRef.current = null;
    worldTrail.current = [];
    collisionBaseRef.current = { set: false, px: 0, py: 0, te: 0 };
    setDisp(null);
    setTime(0);
    setChartData({});
  }, []);

  const launch = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    clearData();
    setPaused(false);
    pausedRef.current = false;
    manuallyStopped.current = false;
    setCompletionToast(null);
    setRunning(true);
    launchExp.current = experiment;
    launchPhys.current = { ...physics[experiment], ...ic[experiment] };

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || DEFAULT_WS;
    const combined = { ...physics[experiment], ...ic[experiment], experiment };
    if (experiment === "spring") {
      combined.ground_collision = springGnd ? "1" : "0";
    }
    if (experiment === "collision") {
      combined.ground_collision = showGround ? "1" : "0";
      combined.ground_y = String(groundY);
    }
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(combined).map(([k, v]) => [k, String(v)])));
    const ws = new WebSocket(`${wsUrl}?${qs}`);
    socketRef.current = ws;
    setStatus("connecting");
    ws.onopen = () => setStatus("connected");
    ws.onerror = () => {
      setStatus("error");
      setRunning(false);
      setPaused(false);
      pausedRef.current = false;
    };
    ws.onclose = () => {
      setStatus("idle");
      setRunning(false);
      setPaused(false);
      pausedRef.current = false;
      if (!manuallyStopped.current && stateRef.current) {
        const tFinal = +(stateRef.current?.t ?? 0);
        const posX = stateRef.current?.position?.x;
        const expDef = EXPERIMENTS.find(e => e.value === launchExp.current);
        const expLabel = expDef?.label ?? launchExp.current;
        let msg = `Simulación de ${expLabel} finalizada en t = ${tFinal.toFixed(2)} s`;
        if (launchExp.current === "projectile" && posX !== undefined) {
          msg = `El proyectil aterrizó en t = ${tFinal.toFixed(2)} s (alcance x = ${posX.toFixed(2)} m)`;
        }
        setCompletionToast({ message: msg });
      }
    };

    let fc = 0;
    ws.onmessage = evt => {
      if (pausedRef.current) return;
      const raw = JSON.parse(evt.data);
      const exp = launchExp.current;
      let data;
      if (exp === "collision") {
        data = { position: { x: raw.ax, y: raw.ay }, velocity: { x: raw.avx, y: raw.avy }, mass: raw.am, t: raw.t, _collision: raw };
      } else if (exp === "double_pendulum") {
        data = { position: { x: raw.meta?.p2x ?? 0, y: raw.meta?.p2y ?? 0 }, velocity: { x: raw.meta?.v2x ?? 0, y: raw.meta?.v2y ?? 0 }, mass: raw.meta?.m2 ?? 1, t: raw.t, _meta: raw.meta };
      } else {
        data = raw;
      }
      stateRef.current = data;
      fc += 1;
      worldTrail.current.push([data.position.x, data.position.y]);
      if (worldTrail.current.length > TRAIL_MAX) worldTrail.current.shift();
      const vals = extractVals(data, exp, launchPhys.current);
      setDisp(data);
      setTime(+(data.t ?? 0));
      pushEnergy(vals.te ?? vals.te_total ?? vals.ke_total ?? vals.ke ?? 0);
      if (fc % 2 === 0) {
        setChartData(prev => {
          const next = { ...prev };
          Object.entries(vals).forEach(([k, v]) => {
            const arr = Array.isArray(prev[k]) ? prev[k] : [];
            const n = [...arr, v];
            next[k] = n.length > CHART_MAX ? n.slice(-CHART_MAX) : n;
          });
          return next;
        });
      }
    };
  }, [experiment, physics, ic, springGnd, showGround, groundY, clearData, extractVals, pushEnergy]);

  const stop = useCallback(() => {
    manuallyStopped.current = true;
    socketRef.current?.close();
    socketRef.current = null;
    setRunning(false);
    setPaused(false);
    pausedRef.current = false;
    setStatus("idle");
  }, []);

  const switchExperiment = val => {
    stop();
    clearData();
    setExperiment(val);
  };

  const togglePause = () => {
    const willPause = !pausedRef.current;
    pausedRef.current = willPause;
    setPaused(willPause);
    // Tell the backend to actually pause/resume the physics loop
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: willPause ? "pause" : "resume" }));
    }
  };

  const getPhaseData = def => {
    if (!def.phase) return {};
    const xArr = Array.isArray(chartData[def.xKey]) ? chartData[def.xKey] : [];
    const yArr = Array.isArray(chartData[def.yKey]) ? chartData[def.yKey] : [];
    return { x: xArr, y: yArr };
  };

  const col = COLORS[experiment];
  const chartDefs = CHART_DEFS[experiment] || [];
  const centerKeys = new Set(chartDefs.filter(d => d.centered).map(d => d.key));
  const centerBase = { px_total: collisionBaseRef.current.px, py_total: collisionBaseRef.current.py };
  const chartRanges = useChartRanges(chartData, running, centerKeys, centerBase);
  const statusColor = { connected: "#2cb87a", connecting: "#f0a340", error: "#e8443a", idle: "#444" }[status] ?? "#444";
  const STATUS_LABELS = { idle: "En reposo", connecting: "Conectando…", connected: "En ejecución", error: "Error" };



  const scaleBarWorld = pickNice(80 / scaleRef.current);
  const scaleBarPx = scaleBarWorld * scaleRef.current;
  const controlsDisabled = running || paused;

  return (<>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "230px 1fr 280px",
        gridTemplateRows: "44px 1fr",
        height: "100vh",
        background: "#0d0f14",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        color: "#e8e8e8",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          gridColumn: "1/-1",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#10121a",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
            marginRight: 6,
          }}
        >
          φ Lab
        </span>
        {EXPERIMENTS.map(e => (
          <button
            key={e.value}
            onClick={() => switchExperiment(e.value)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minWidth: 110,
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px solid " + (experiment === e.value ? col.ball : "rgba(255,255,255,0.07)"),
              background: experiment === e.value ? col.ball + "1a" : "transparent",
              color: experiment === e.value ? col.ball : "rgba(255,255,255,0.32)",
              fontSize: 12,
              fontWeight: 500,
              transition: "all 0.15s",
            }}
          >
            <span style={{ lineHeight: 1 }}>{e.icon}</span>
            <span style={{ whiteSpace: "nowrap" }}>{e.label}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {running && (
          <button
            onClick={togglePause}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.09)",
              background: paused ? "rgba(240,163,64,0.12)" : "transparent",
              color: paused ? "#f0a340" : "rgba(255,255,255,0.32)",
              fontSize: 12,
            }}
          >
            {paused ? "▶ Reanudar" : "⏸ Pausar"}
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace" }}>{STATUS_LABELS[status] ?? status}</span>
        </div>
      </div>

      <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", background: "#10121a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>
          <SectionLabel>Condiciones iniciales</SectionLabel>
          {IC_PARAMS[experiment].map(def => (
            <ParamRow
              key={def.key}
              def={def}
              value={ic[experiment]?.[def.key] ?? def.default}
              onChange={v => setIc(p => ({ ...p, [experiment]: { ...p[experiment], [def.key]: v } }))}
              accentColor={col.ball}
              disabled={controlsDisabled}
            />
          ))}
          <SectionLabel>Física</SectionLabel>
          {PHYSICS_PARAMS[experiment]
            .filter(def => !(experiment === "spring" && def.key === "restitution" && !springGnd))
            .map(def => (
              <ParamRow
                key={def.key}
                def={def}
                value={physics[experiment]?.[def.key] ?? def.default}
                onChange={v => setPhysics(p => ({ ...p, [experiment]: { ...p[experiment], [def.key]: v } }))}
                accentColor={col.ball}
                disabled={controlsDisabled}
              />
            ))}
          {(() => {
            const showForceToggle = !(experiment === "double_pendulum" || experiment === "collision");
            const showSpringGroundToggle = experiment === "spring";
            const showCollisionGroundToggle = experiment === "collision";
            const hasVisualization = showForceToggle || showSpringGroundToggle || showCollisionGroundToggle;
            if (!hasVisualization) return null;
            return (
              <>
                <SectionLabel>Visualización</SectionLabel>
                {showForceToggle && (
                  <Toggle label="Diagrama de fuerzas (DCL)" checked={showFBD} onChange={() => setShowFBD(s => !s)} accentColor={col.ball} disabled={controlsDisabled} />
                )}
                {showSpringGroundToggle && (
                  <Toggle label="Colisión con suelo" checked={springGnd} onChange={() => setSpringGnd(s => !s)} accentColor={col.ball} disabled={controlsDisabled} />
                )}
                {showCollisionGroundToggle && (
                  <>
                    <Toggle label="Suelo" checked={showGround} onChange={() => setShowGround(s => !s)} accentColor={col.ball} disabled={controlsDisabled} />
                    {showGround && (
                      <ParamRow
                        def={{ key: "ground_y", label: "Nivel del suelo Y", min: -10, max: 0, step: 0.1, default: -3, unit: "m" }}
                        value={groundY}
                        onChange={setGroundY}
                        accentColor={col.ball}
                        disabled={controlsDisabled}
                      />
                    )}
                  </>
                )}
              </>
            );
          })()}
        </div>
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={running ? stop : launch}
            style={{
              width: "100%",
              padding: "9px",
              borderRadius: 6,
              cursor: "pointer",
              border: "1px solid " + (running ? "rgba(232,100,58,0.45)" : col.ball + "50"),
              background: running ? "rgba(232,100,58,0.1)" : col.ball + "16",
              color: running ? "#e8643a" : col.ball,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            {running ? "■  Detener simulación" : "▶  Aplicar e Iniciar"}
          </button>
          {!running && disp && (
            <button
              onClick={launch}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "7px",
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.07)",
                background: "transparent",
                color: "rgba(255,255,255,0.28)",
                fontSize: 11,
              }}
            >
              ↺  Reiniciar
            </button>
          )}
        </div>
      </div>

      <div style={{ position: "relative", overflow: "hidden", background: "#0d0f14" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
        {!running && !disp && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, pointerEvents: "none" }}>
            <div style={{ fontSize: 56, opacity: 0.04 }}>{EXPERIMENTS.find(e => e.value === experiment)?.icon}</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", letterSpacing: "0.06em" }}>Configura los parámetros → Aplicar e Iniciar</p>
          </div>
        )}
        {completionToast && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(16, 18, 26, 0.94)",
              border: `1.5px solid ${col.ball}`,
              borderRadius: 8,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: `0 8px 30px rgba(0,0,0,0.65), 0 0 20px ${col.ball}33`,
              backdropFilter: "blur(12px)",
              zIndex: 20,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.ball, boxShadow: `0 0 8px ${col.ball}` }} />
            <span style={{ fontSize: 12.5, color: "#ffffff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              {completionToast.message}
            </span>
            <button
              onClick={launch}
              style={{
                padding: "4px 10px",
                borderRadius: 5,
                background: col.ball + "22",
                border: `1px solid ${col.ball}55`,
                color: col.ball,
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ↺ Relanzar
            </button>
            <button
              onClick={() => setCompletionToast(null)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 15,
                padding: "0 4px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}
        {paused && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: "rgba(13,15,20,0.9)",
              border: `1px solid ${col.ball}28`,
              color: col.ball,
              padding: "8px 22px",
              borderRadius: 8,
              fontSize: 12,
              letterSpacing: "0.1em",
              pointerEvents: "none",
              boxShadow: `0 8px 30px rgba(0,0,0,0.45), 0 0 18px ${col.ball}33`,
            }}
          >
            EN PAUSA
          </div>
        )}
        {disp && (
          <div style={{ position: "absolute", bottom: 40, left: 14, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              { l: "x", v: disp.position.x.toFixed(3), u: "m" },
              { l: "y", v: disp.position.y.toFixed(3), u: "m" },
              { l: "|v|", v: mag(disp.velocity.x, disp.velocity.y).toFixed(3), u: "m/s" },
              { l: "vx", v: disp.velocity.x.toFixed(3), u: "m/s" },
              { l: "vy", v: disp.velocity.y.toFixed(3), u: "m/s" },
              { l: "E", v: (chartData.te?.at(-1) ?? chartData.te_total?.at(-1) ?? chartData.ke_total?.at(-1) ?? 0).toFixed(3), u: "J" },
            ].map(m => (
              <div key={m.l} style={{ background: "rgba(13,15,20,0.82)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 5, padding: "7px 11px", minWidth: 85 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", marginBottom: 2, fontWeight: 500 }}>{m.l}</div>
                <div style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", color: col.ball, fontWeight: 600 }}>{m.v}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{m.u}</div>
              </div>
            ))}
          </div>
        )}
        {!labOpen && (
          <button
            onClick={() => setLabOpen(true)}
            title="Abrir mesa de trabajo, guía teórica y toma de datos"
            style={{
              position: "absolute",
              bottom: 14,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "9px 20px",
              borderRadius: 24,
              background: "rgba(16, 18, 26, 0.92)",
              backdropFilter: "blur(14px)",
              border: `1.5px solid ${col.ball}`,
              color: "#ffffff",
              boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 18px ${col.ball}44`,
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "0.03em",
              zIndex: 10,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)";
              e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.7), 0 0 26px ${col.ball}77`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateX(-50%)";
              e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.6), 0 0 18px ${col.ball}44`;
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={col.ball} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Mesa de Laboratorio & Guía</span>
            <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 10, background: col.ball + "28", color: col.ball, border: `1px solid ${col.ball}55`, fontWeight: 700 }}>
              Abrir
            </span>
          </button>
        )}
        <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, pointerEvents: "none", zIndex: 5, userSelect: "none" }}>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Mono',monospace", fontWeight: 500, opacity: showHint ? 1 : 0, transition: "opacity 0.8s ease" }}>
            rueda: zoom · arrastrar: mover
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(13,15,20,0.75)", padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div
              style={{
                width: Math.max(16, Math.min(160, scaleBarPx)),
                height: 4,
                borderLeft: "2px solid rgba(255,255,255,0.55)",
                borderRight: "2px solid rgba(255,255,255,0.55)",
                borderBottom: "2px solid rgba(255,255,255,0.55)",
              }}
            />
            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>
              {scaleBarWorld >= 1 ? `${scaleBarWorld} m` : `${(scaleBarWorld * 100).toFixed(0)} cm`}
            </span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "'DM Mono',monospace", fontSize: 18, color: "rgba(255,255,255,0.5)", pointerEvents: "none", fontWeight: 500 }}>
          t = {time.toFixed(2)} s
        </div>
      </div>

      <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", background: "#10121a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>
          <SectionLabel>Gráficas — clic para alternar</SectionLabel>
          {chartDefs.map(def => {
            const rng = def.phase ? null : chartRanges[def.key];
            const phaseData = def.phase ? getPhaseData(def) : {};
            const sparkData = def.phase ? [] : Array.isArray(chartData[def.key]) ? chartData[def.key] : [];
            return (
              <ChartAccordion
                key={def.key}
                def={def}
                data={def.phase ? phaseData : sparkData}
                open={openCharts.includes(def.key)}
                onToggle={() => setOpenCharts(p => (p.includes(def.key) ? p.filter(k => k !== def.key) : [...p, def.key]))}
                yMin={rng?.min}
                yMax={rng?.max}
              />
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "7px 14px", display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>
          <span>Verlet · RK4 · 60 Hz</span>
          <span>{experiment}</span>
        </div>
      </div>
    </div>
    <LabNotebook
      experiment={experiment}
      stateRef={stateRef}
      chartData={chartData}
      launchPhys={launchPhys}
      accent={col.ball}
      visible={labOpen}
      onToggle={() => setLabOpen(false)}
      onLaunch={launch}
      onTogglePause={togglePause}
      running={running}
      paused={paused}
      hasSimData={Boolean(disp)}
    />
  </>);
}

export default function SimulationCanvas() {
  return (
    <TutorProvider>
      <SimulationCanvasInner />
    </TutorProvider>
  );
}
