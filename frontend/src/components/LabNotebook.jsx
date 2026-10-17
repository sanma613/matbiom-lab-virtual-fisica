"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import katex from "katex";
import MarkdownView from "./MarkdownView";
import { LAB_GUIDES } from "./simulation/labGuides";

/* ─── Minimalist SVG Icons (replacing all emojis) ────────── */
const Icons = {
  Document: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Target: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Book: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Beaker: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4.5" y1="3" x2="19.5" y2="3" />
      <path d="M6 3v13a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V3" />
      <line x1="6" y1="14" x2="18" y2="14" strokeDasharray="2 2" />
    </svg>
  ),
  Table: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  Edit: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Camera: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Download: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Trash: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Close: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Sparkles: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  Lightbulb: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6h8c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
    </svg>
  ),
  Eye: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  CheckCircle: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  HelpCircle: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  AlertTriangle: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Play: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Pause: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  Refresh: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
};

/* ─── localStorage helpers ──────────────────────────────── */
const STORAGE_KEY = "labNotebook";

function loadNotebook() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveNotebook(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* silent */ }
}

function formatSignedPercent(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  const sign = numeric >= 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}`;
}

function displayCellValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return Number.isFinite(value) ? value : "—";
  if (typeof value === "string") return value.includes("NaN") ? "—" : value;
  return String(value);
}

/* ─── Row normalizer & backfiller ───────────────────────── */
function normalizeRow(row, physics) {
  if (!row) return row;
  const exp = row.experiment;
  if (exp && exp !== "projectile") {
    // Other experiments are already fully computed in extractRow
    return { ...row };
  }

  // Projectile normalizer and legacy backfiller
  const t = Number(row.t ?? 0);
  const x = Number(row.x ?? 0);
  const y = Number(row.y ?? 0);
  const vx = Number(row.vx ?? 0);
  const vy = Number(row.vy ?? 0);
  const g = physics?.gravity ?? 9.81;
  const m = physics?.mass ?? 1;
  const y0 = physics?.y0 ?? 2;
  const vy0 = physics?.vy0 ?? 6;
  const vx0 = physics?.vx0 ?? 8;

  const speed = row.speed !== undefined && !isNaN(row.speed) ? Number(row.speed) : Math.hypot(vx, vy);
  const ke = row.ke !== undefined && !isNaN(row.ke) ? Number(row.ke) : 0.5 * m * speed * speed;
  const pe = row.pe !== undefined && !isNaN(row.pe) ? Number(row.pe) : m * g * y;
  const te = row.te !== undefined && !isNaN(row.te) ? Number(row.te) : ke + pe;
  const theta = row.theta !== undefined && !isNaN(row.theta) ? row.theta : +(Math.atan2(vy, vx) * (180 / Math.PI)).toFixed(1);

  const y_teo = row.y_teo !== undefined && !isNaN(row.y_teo) ? row.y_teo : +(y0 + vy0 * t - 0.5 * g * t * t).toFixed(3);
  const err_y = row.err_y !== undefined && !isNaN(row.err_y) ? row.err_y : +Math.abs(y - Number(y_teo)).toFixed(3);

  let phase = row.phase;
  if (!phase) {
    if (t <= 0.05) phase = "Disparo";
    else if (Math.abs(vy) <= 0.25) phase = "Altura máxima";
    else if (vy > 0.25) phase = "Subiendo";
    else phase = "Bajando";
  }

  let delta_e_pct = row.delta_e_pct;
  if (delta_e_pct === undefined || isNaN(delta_e_pct)) {
    const em0 = 0.5 * m * (vx0 * vx0 + vy0 * vy0) + m * g * y0;
    const diff = em0 !== 0 ? ((Number(te) - em0) / em0) * 100 : 0;
    delta_e_pct = formatSignedPercent(diff);
  }

  return {
    ...row,
    experiment: "projectile",
    t: +t.toFixed(3),
    phase,
    x: +x.toFixed(3),
    y: +y.toFixed(3),
    y_teo: typeof y_teo === "number" ? +y_teo.toFixed(3) : y_teo,
    err_y: typeof err_y === "number" ? +err_y.toFixed(3) : err_y,
    vx: +vx.toFixed(3),
    vy: +vy.toFixed(3),
    speed: +speed.toFixed(3),
    theta,
    ke: +ke.toFixed(3),
    pe: +pe.toFixed(3),
    te: +te.toFixed(3),
    delta_e_pct: formatSignedPercent(delta_e_pct),
  };
}

/* ─── CSV exporter ──────────────────────────────────────── */
function exportCSV(columns, rows, filename) {
  const header = columns.map(c => `${c.label}${c.unit ? ` (${c.unit})` : ""}`).join(",");
  const body = rows.map(r => columns.map(c => `"${r[c.key] ?? ""}"`).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─── Review API call ───────────────────────────────────── */
const DEFAULT_REVIEW_API = "http://localhost:8000/api/tutor/review";

async function callReviewAPI(payload) {
  const apiUrl = process.env.NEXT_PUBLIC_REVIEW_URL || DEFAULT_REVIEW_API;
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail || "Error al conectar con el tutor");
  }
  return res.json();
}

/* ─── KaTeX renderer component ──────────────────────────── */
function Tex({ children, accent }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !children) return;
    try {
      let mathTex = children;
      if (/\\(frac|dfrac|cfrac|sum|int|sqrt|iint|iiint|prod)/.test(mathTex) && !mathTex.includes("\\displaystyle")) {
        mathTex = `\\displaystyle ${mathTex}`;
      }
      katex.render(mathTex, ref.current, {
        throwOnError: false,
        displayMode: false,
        output: "html",
      });
    } catch {
      ref.current.textContent = children;
    }
  }, [children]);

  return <span ref={ref} style={{ color: accent }} />;
}

/* ─── Shared style tokens (matching dark theme) ─────────── */
const S = {
  bg: "rgba(13,15,22,0.97)",
  bgCard: "rgba(255,255,255,0.03)",
  bgCardH: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.07)",
  borderH: "rgba(255,255,255,0.14)",
  text: "rgba(255,255,255,0.84)",
  textDim: "rgba(255,255,255,0.48)",
  textDim2: "rgba(255,255,255,0.30)",
  mono: "'DM Mono',monospace",
  sans: "'DM Sans','Segoe UI',sans-serif",
  eqBg: "rgba(0,0,0,0.32)",
  radius: 8,
};

/* ─── TABS definition ───────────────────────────────────── */
const TABS = [
  { id: "objective", label: "Objetivo", icon: Icons.Target },
  { id: "theory", label: "Marco Teórico", icon: Icons.Book },
  { id: "procedure", label: "Procedimiento", icon: Icons.Beaker },
  { id: "data", label: "Tabla de Datos", icon: Icons.Table },
  { id: "analysis", label: "Análisis & Reporte", icon: Icons.Edit },
];

/* ═══════════════════════════════════════════════════════════
   Tab 1: Objective
   ═══════════════════════════════════════════════════════════ */
function ObjectiveTab({ guide, accent }) {
  return (
    <div style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 10, padding: "22px 24px" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <Icons.Target size={15} color={accent} />
        <span>Objetivo de la práctica de laboratorio</span>
      </div>
      <p style={{ fontSize: 14.5, lineHeight: 1.75, color: S.text, margin: 0 }}>{guide.objective}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Tab 2: Theory
   ═══════════════════════════════════════════════════════════ */
function TheoryTab({ guide, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {guide.theory.map((block, i) => (
        <div
          key={i}
          style={{ background: S.bgCard, border: `1px solid ${S.border}`, borderRadius: 10, padding: "20px 22px", transition: "border-color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = S.borderH)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = S.border)}
        >
          <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "0.03em", color: accent, marginBottom: 11, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 4, height: 14, borderRadius: 2, background: accent, display: "inline-block" }} />
            <span>{block.heading}</span>
          </div>

          {block.content && (
            <p style={{ fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", marginBottom: block.equations ? 14 : 0 }}>
              {block.content}
            </p>
          )}

          {block.equations && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {block.equations.map((eq, j) => (
                <div
                  key={j}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    padding: "10px 16px", borderRadius: 8,
                    background: S.eqBg, border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <div style={{ flexShrink: 0, fontSize: 15.5 }}>
                    <Tex accent={accent}>{eq.tex}</Tex>
                  </div>
                  <span style={{ fontSize: 12, color: S.textDim, fontWeight: 500, textAlign: "right", borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 16 }}>
                    {eq.desc}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Tab 3: Procedure
   ═══════════════════════════════════════════════════════════ */
function ProcedureTab({ guide, accent }) {
  return (
    <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0 }}>
      {guide.procedure.map((step, i) => (
        <li
          key={i}
          style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderRadius: 8, background: S.bgCard, border: `1px solid ${S.border}`, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = S.bgCardH; e.currentTarget.style.borderColor = S.borderH; }}
          onMouseLeave={e => { e.currentTarget.style.background = S.bgCard; e.currentTarget.style.borderColor = S.border; }}
        >
          <span style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: S.mono, flexShrink: 0, background: accent + "1a", color: accent, border: `1px solid ${accent}44`, marginTop: 1 }}>
            {i + 1}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MarkdownView content={step} accent={accent} style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(255,255,255,0.85)" }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ═══════════════════════════════════════════════════════════
   Tab 4: Data Table
   ═══════════════════════════════════════════════════════════ */
function DataTab({ guide, rows, accent, onCapture, onDeleteRow, onClearAll, hasSimData, onLaunch, onTogglePause, running, paused, editLocked = false }) {
  const [flash, setFlash] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const wrapRef = useRef(null);

  const handleCapture = () => {
    onCapture();
    setFlash(true);
    setTimeout(() => setFlash(false), 500);
  };

  const canCapture = running && !paused && hasSimData;
  const canEdit = !editLocked;

  useEffect(() => {
    if (wrapRef.current) wrapRef.current.scrollTop = wrapRef.current.scrollHeight;
  }, [rows.length]);

  return (
    <div>
      {/* action bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Table size={16} color={accent} />
          <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: S.textDim }}>
            Registro Experimental de Mediciones ({rows.length} {rows.length === 1 ? "muestra" : "muestras"})
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onLaunch}
            title={running ? "Relanzar simulación con los mismos parámetros" : "Iniciar simulación con los parámetros actuales"}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 14px", borderRadius: 7, cursor: "pointer",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", fontFamily: "inherit",
              border: `1px solid rgba(52,211,153,0.5)`, background: "rgba(52,211,153,0.12)", color: "#34d399",
              boxShadow: "0 0 12px rgba(52,211,153,0.1)",
              transition: "all 0.18s",
              opacity: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(52,211,153,0.22)"; e.currentTarget.style.boxShadow = "0 0 18px rgba(52,211,153,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(52,211,153,0.12)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(52,211,153,0.1)"; }}
          >
            {running ? <Icons.Refresh size={14} color="#34d399" /> : <Icons.Play size={14} color="#34d399" />}
            <span>{running ? "Relanzar" : "Iniciar"}</span>
          </button>
          {running && (
            <button
              onClick={onTogglePause}
              title={paused ? "Reanudar simulación" : "Pausar simulación"}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 14px", borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                border: `1px solid rgba(251,191,36,0.4)`, background: "rgba(251,191,36,0.1)", color: "#fbbf24",
                transition: "all 0.18s",
                opacity: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.1)"; }}
            >
              {paused ? <Icons.Play size={13} color="#fbbf24" /> : <Icons.Pause size={13} color="#fbbf24" />}
              <span>{paused ? "Reanudar" : "Pausar"}</span>
            </button>
          )}
          <button
            onClick={handleCapture}
            disabled={!canCapture}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 7, cursor: canCapture ? "pointer" : "not-allowed",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", fontFamily: "inherit",
              border: `1px solid ${accent}66`, background: accent + "20", color: accent,
              opacity: canCapture ? 1 : 0.4,
              boxShadow: canCapture ? `0 0 12px ${accent}22` : "none",
              transition: "all 0.18s",
            }}
          >
            <Icons.Camera size={14} color={accent} />
            <span>Capturar medición</span>
          </button>
          {rows.length > 0 && (
            <>
              <button
                onClick={() => canEdit && exportCSV(guide.columns, rows, `reporte_laboratorio_${Date.now()}.csv`)}
                disabled={!canEdit}
                title="Exportar archivo CSV para hojas de cálculo"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 7, cursor: canEdit ? "pointer" : "not-allowed",
                  border: `1px solid ${S.border}`, background: "rgba(255,255,255,0.03)",
                  color: S.textDim, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  transition: "all 0.15s", opacity: canEdit ? 1 : 0.45,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = S.borderH; }}
                onMouseLeave={e => { e.currentTarget.style.color = S.textDim; e.currentTarget.style.borderColor = S.border; }}
              >
                <Icons.Download size={13} />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={() => canEdit && setConfirmClearOpen(true)}
                disabled={!canEdit}
                title="Limpiar todas las mediciones"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 7, cursor: canEdit ? "pointer" : "not-allowed",
                  border: `1px solid ${S.border}`, background: "transparent",
                  color: S.textDim, fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  transition: "all 0.15s", opacity: canEdit ? 1 : 0.45,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#e8443a"; e.currentTarget.style.borderColor = "rgba(232,68,58,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = S.textDim; e.currentTarget.style.borderColor = S.border; }}
              >
                <Icons.Trash size={13} />
                <span>Limpiar</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal before clearing */}
      {confirmClearOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setConfirmClearOpen(false)}
        >
          <div
            style={{
              background: "#131620",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.85), 0 0 35px rgba(232,68,58,0.16)",
              borderRadius: 12,
              padding: "24px 26px",
              maxWidth: 440,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "rgba(232,68,58,0.15)",
                  border: "1px solid rgba(232,68,58,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icons.Trash size={18} color="#e8443a" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "0.01em" }}>
                  ¿Eliminar todas las mediciones?
                </div>
                <div style={{ fontSize: 12.5, color: S.textDim, marginTop: 4, lineHeight: 1.5 }}>
                  Esta acción eliminará permanentemente las {rows.length} {rows.length === 1 ? "medición" : "mediciones"} registradas para <strong>{guide.title}</strong> y no se puede deshacer.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setConfirmClearOpen(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 7,
                  border: `1px solid ${S.border}`,
                  background: "rgba(255,255,255,0.04)",
                  color: S.textDim,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = S.borderH; }}
                onMouseLeave={e => { e.currentTarget.style.color = S.textDim; e.currentTarget.style.borderColor = S.border; }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmClearOpen(false);
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 7,
                  border: "1px solid rgba(232,68,58,0.55)",
                  background: "rgba(232,68,58,0.22)",
                  color: "#ff6357",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,68,58,0.38)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(232,68,58,0.22)"; }}
              >
                Eliminar mediciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* table */}
      <div
        ref={wrapRef}
        style={{
          overflowX: "auto",
          borderRadius: 8,
          border: `1px solid ${S.border}`,
          height: 295,
          minHeight: 295,
          maxHeight: 295,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          ...(flash ? { boxShadow: `inset 0 0 30px 0 ${accent}25` } : {}),
          transition: "box-shadow 0.4s",
          background: "rgba(0,0,0,0.22)",
        }}
      >
        {rows.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "30px 20px",
              color: S.textDim2,
              fontSize: 13,
              fontFamily: S.sans,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                padding: 14,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.03)",
                marginBottom: 12,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Icons.Table size={28} color="rgba(255,255,255,0.25)" />
            </div>
            <div style={{ maxWidth: 360, lineHeight: 1.5 }}>
              Inicie la simulación y presione <strong style={{ color: accent }}>Capturar medición</strong> para registrar los datos experimentales
            </div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: S.mono, fontSize: 12 }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                {guide.columns.map(c => (
                  <th key={c.key} style={thStyle}>
                    {c.label}
                    {c.unit && <span style={{ fontSize: 9.5, fontWeight: 500, opacity: 0.6, display: "block", marginTop: 2 }}>{c.unit}</span>}
                  </th>
                ))}
                <th style={{ ...thStyle, width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const prev = i > 0 ? rows[i - 1] : null;
                const isNewConfig = row.configTag && (!prev || prev.configTag !== row.configTag);
                return (
                  <Fragment key={i}>
                    {isNewConfig && (
                      <tr>
                        <td
                          colSpan={guide.columns.length + 2}
                          style={{
                            padding: "6px 14px",
                            textAlign: "left",
                            background: "rgba(255,255,255,0.03)",
                            borderTop: i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            fontFamily: S.mono,
                            fontSize: 11,
                            fontWeight: 600,
                            color: accent,
                            letterSpacing: "0.02em",
                          }}
                        >
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                            <Icons.Sparkles size={11} color={accent} />
                            <span>Condición experimental: {row.configTag}</span>
                          </span>
                        </td>
                      </tr>
                    )}
                    <tr
                      style={{ transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ ...tdStyle, textAlign: "center", color: S.textDim2, fontWeight: 600 }}>{i + 1}</td>
                      {guide.columns.map(c => {
                        const val = row[c.key];
                        const displayVal = displayCellValue(val);
                        const isPhase = c.key === "phase";
                        const isEnergy = c.key === "te" || c.key === "ke" || c.key === "pe" || c.key === "spring_pe";
                        const isDelta = c.key === "delta_e_pct" || c.key === "delta_ke_pct";
                        return (
                          <td
                            key={c.key}
                            style={{
                              ...tdStyle,
                              color: isPhase ? "#67e8f9" : isEnergy ? accent : isDelta ? (String(displayVal).startsWith("-") ? "#fb923c" : "#34d399") : S.text,
                              fontWeight: isPhase || isEnergy ? 600 : 400,
                            }}
                          >
                            {isPhase ? (
                              <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: 4, background: "rgba(103,232,249,0.1)", fontSize: 11, border: "1px solid rgba(103,232,249,0.2)" }}>
                                {displayVal}
                              </span>
                            ) : (
                              displayVal
                            )}
                          </td>
                        );
                      })}
                      <td style={{ ...tdStyle, textAlign: "center", padding: "6px" }}>
                        <button
                          onClick={() => canEdit && onDeleteRow(i)}
                          title="Eliminar muestra"
                          style={{ width: 22, height: 22, borderRadius: 4, border: "none", background: "transparent", color: S.textDim2, cursor: canEdit ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s", opacity: canEdit ? 1 : 0.5 }}
                          onMouseEnter={e => { if (canEdit) { e.currentTarget.style.background = "rgba(232,68,58,0.15)"; e.currentTarget.style.color = "#e8443a"; } }}
                          onMouseLeave={e => { if (canEdit) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = S.textDim2; } }}
                        >
                          <Icons.Close size={12} />
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "10px 12px", textAlign: "right", fontSize: 10.5,
  textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
  color: "rgba(255,255,255,0.65)", background: "#131622",
  borderBottom: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap",
  position: "sticky", top: 0, zIndex: 10,
};

const tdStyle = {
  padding: "8px 12px", textAlign: "right", fontWeight: 500,
  borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap",
};

/* ═══════════════════════════════════════════════════════════
   Tab 5: Analysis & Report (with AI review)
   ═══════════════════════════════════════════════════════════ */
function AnalysisTab({ guide, accent, notes, onNotesChange, rows, experiment, launchPhys, disabled = false }) {
  const [reviewing, setReviewing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [previewField, setPreviewField] = useState({});

  const handleReview = async () => {
    setReviewing(true);
    setReviewError(null);
    setFeedback(null);
    try {
      const data = await callReviewAPI({
        experiment,
        guide_title: guide.title,
        questions: guide.questions,
        hypothesis: notes.hypothesis || "",
        observations: notes.observations || "",
        conclusions: notes.conclusions || "",
        data_rows: rows.slice(0, 10),
        physics_params: launchPhys?.current ?? {},
      });
      setFeedback(data.feedback);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Questions */}
      <div>
        <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: S.textDim, marginBottom: 11, display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.HelpCircle size={15} color={accent} />
          <span>Preguntas Guía para el Reporte de Laboratorio</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {guide.questions.map((q, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 8, background: S.bgCard, border: `1px solid ${S.border}` }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: S.mono, flexShrink: 0, background: accent + "18", color: accent, border: `1px solid ${accent}44`, marginTop: 1 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <MarkdownView content={q} accent={accent} style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.85)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student response sections */}
      {[
        { key: "hypothesis", label: "Hipótesis y Predicción Física", icon: Icons.Lightbulb, placeholder: "Antes de lanzar: ¿Qué relación predice para vx(t)? ¿En qué instante la energía cinética será mínima? Formule una hipótesis cuantitativa..." },
        { key: "observations", label: "Registro de Observaciones Experimentales", icon: Icons.Eye, placeholder: "Describa la trayectoria, el comportamiento de los vectores de velocidad y los valores numéricos observados durante el vuelo..." },
        { key: "conclusions", label: "Conclusiones y Discusión de Resultados", icon: Icons.CheckCircle, placeholder: "¿Se verificó la conservación de energía mecánica? Compare con las predicciones analíticas y discuta el error observado..." },
      ].map(field => {
        const IconComponent = field.icon;
        const isPreview = !!previewField[field.key];
        const val = notes[field.key] || "";

        return (
          <div key={field.key}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: S.textDim, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconComponent size={14} color={accent} />
                <span>{field.label}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewField(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                title={isPreview ? "Volver a editar" : "Ver formato Markdown y LaTeX"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  borderRadius: 5,
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: S.sans,
                  cursor: "pointer",
                  border: `1px solid ${isPreview ? accent + "66" : "rgba(255,255,255,0.08)"}`,
                  background: isPreview ? accent + "20" : "rgba(255,255,255,0.03)",
                  color: isPreview ? accent : S.textDim,
                  transition: "all 0.15s",
                }}
              >
                {isPreview ? <Icons.Edit size={11} color={accent} /> : <Icons.Eye size={11} color={S.textDim} />}
                <span>{isPreview ? "Editar" : "Vista previa"}</span>
              </button>
            </div>
            {isPreview ? (
              <div
                style={{
                  width: "100%",
                  minHeight: 90,
                  background: "rgba(0,0,0,0.28)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  padding: "16px 18px",
                  boxSizing: "border-box",
                }}
              >
                {val.trim() ? (
                  <MarkdownView content={val} accent={accent} style={{ fontSize: 14.5, lineHeight: 1.75 }} />
                ) : (
                  <span style={{ color: S.textDim2, fontStyle: "italic", fontSize: 13 }}>
                    Sin texto redactado todavía. Puedes escribir texto y fórmulas usando <code>$$fórmula$$</code> para ecuaciones destacadas o <code>$fórmula$</code> en línea.
                  </span>
                )}
              </div>
            ) : (
              <textarea
                value={val}
                onChange={e => !disabled && onNotesChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                disabled={disabled}
                style={{
                  width: "100%", minHeight: 84, resize: "vertical",
                  background: "rgba(255,255,255,0.035)", border: `1px solid ${S.border}`,
                  borderRadius: 8, padding: "12px 14px", color: S.text,
                  fontSize: 13.5, lineHeight: 1.65, fontFamily: S.sans, outline: "none",
                  transition: "border-color 0.18s", boxSizing: "border-box", opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "auto",
                }}
                onFocus={e => { if (!disabled) e.target.style.borderColor = accent + "66" }}
                onBlur={e => (e.target.style.borderColor = S.border)}
              />
            )}
          </div>
        );
      })}

      {/* AI Review section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "18px 0 4px", borderTop: `1px solid ${S.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: S.textDim, display: "flex", alignItems: "center", gap: 7 }}>
            <Icons.Sparkles size={14} color={accent} />
            <span style={{ color: accent }}>Revisión y Evaluación Pedagógica</span>
          </div>
          <button
            onClick={handleReview}
            disabled={disabled || reviewing || (!notes.hypothesis && !notes.observations && !notes.conclusions)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              padding: "10px 18px", borderRadius: 8, cursor: reviewing ? "wait" : "pointer",
              border: `1px solid ${accent}66`, background: accent + "18",
              color: accent, fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
              letterSpacing: "0.03em", transition: "all 0.18s",
              opacity: (!notes.hypothesis && !notes.observations && !notes.conclusions) ? 0.45 : 1,
            }}
          >
            {reviewing ? (
              <>
                <span style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${accent}33`, borderTopColor: accent, display: "inline-block", animation: "labSpin 0.7s linear infinite" }} />
                <span>Analizando respuestas del reporte...</span>
              </>
            ) : (
              <>
                <Icons.Sparkles size={14} color={accent} />
                <span>Solicitar evaluación del tutor</span>
              </>
            )}
          </button>
        </div>

        {reviewError && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171", fontSize: 13, fontWeight: 600 }}>
            <Icons.AlertTriangle size={15} color="#f87171" />
            <span>{reviewError}</span>
          </div>
        )}

        {feedback && (
          <div style={{ padding: "18px 20px", borderRadius: 10, background: accent + "0a", border: `1px solid ${accent}38` }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, color: accent, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Icons.Sparkles size={14} color={accent} />
              <span>Retroalimentación Académica</span>
            </div>
            <MarkdownView content={feedback} accent={accent} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main LabNotebook Component (Drawer)
   ═══════════════════════════════════════════════════════════ */
export default function LabNotebook({ experiment, stateRef, chartData, launchPhys, accent, visible, onToggle, onLaunch, onTogglePause, running, paused, hasSimData: hasSimDataSignal = false }) {
  const guide = LAB_GUIDES[experiment];

  const controlsDisabled = running || paused;

  const [tab, setTab] = useState("objective");
  const [notebook, setNotebook] = useState(() => loadNotebook());

  useEffect(() => {
    saveNotebook(notebook);
  }, [notebook]);

  useEffect(() => {
    setTab("objective");
  }, [experiment]);

  const expData = notebook[experiment] ?? { rows: [], notes: {} };
  const rawRows = expData.rows ?? [];
  const rows = useMemo(() => rawRows.map(r => normalizeRow(r, launchPhys?.current)), [rawRows, launchPhys]);
  const notes = expData.notes ?? {};

  const setRows = useCallback((updater) => {
    setNotebook(prev => {
      const exp = prev[experiment] ?? { rows: [], notes: {} };
      const newRows = typeof updater === "function" ? updater(exp.rows ?? []) : updater;
      return { ...prev, [experiment]: { ...exp, rows: newRows } };
    });
  }, [experiment]);

  const setNotes = useCallback((key, value) => {
    setNotebook(prev => {
      const exp = prev[experiment] ?? { rows: [], notes: {} };
      return { ...prev, [experiment]: { ...exp, notes: { ...exp.notes, [key]: value } } };
    });
  }, [experiment]);

  const handleCapture = useCallback(() => {
    if (!guide) return;
    const row = guide.extractRow(stateRef.current, chartData, launchPhys.current);
    if (row) {
      const fullRow = normalizeRow(row, launchPhys.current);
      setRows(prev => [...prev, fullRow]);
    }
  }, [guide, stateRef, chartData, launchPhys, setRows]);

  const handleDeleteRow = useCallback((idx) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  }, [setRows]);

  const handleClearAll = useCallback(() => {
    setRows([]);
  }, [setRows]);

  const hasSimData = hasSimDataSignal || !!stateRef.current;

  if (!guide) {
    if (!visible) return null;
    return (
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: S.bg, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderTop: `1px solid ${S.border}`, padding: "16px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icons.Document size={16} color={S.textDim} />
          <span style={{ fontSize: 13, color: S.textDim, fontWeight: 600 }}>
            Guía de laboratorio — <em>Disponible próximamente para {experiment}</em>
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textDim, fontSize: 12, fontFamily: "inherit" }}
        >
          <Icons.Close size={13} />
          <span>Cerrar</span>
        </button>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 100,
        background: S.bg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: `1px solid ${accent}44`,
        boxShadow: "0 -12px 48px rgba(0,0,0,0.65)",
      }}
    >
      <style>{`@keyframes labSpin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Top Header bar ──────────────────────────────── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 22px",
          borderBottom: `1px solid ${S.border}`,
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: accent + "1c", border: `1px solid ${accent}44` }}>
            <Icons.Document size={15} color={accent} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#ffffff" }}>
                Mesa de Laboratorio
              </span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: accent + "22", color: accent, border: `1px solid ${accent}44` }}>
                {guide.title}
              </span>
              {rows.length > 0 && (
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600, background: "rgba(255,255,255,0.08)", color: S.textDim }}>
                  {rows.length} {rows.length === 1 ? "medición" : "mediciones"}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, cursor: "pointer", border: `1px solid ${S.border}`, background: "transparent", color: S.textDim, fontSize: 12, fontWeight: 500, fontFamily: "inherit", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = S.borderH; }}
          onMouseLeave={e => { e.currentTarget.style.color = S.textDim; e.currentTarget.style.borderColor = S.border; }}
        >
          <Icons.Close size={13} />
          <span>Cerrar</span>
        </button>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, padding: "8px 22px 0", borderBottom: `1px solid ${S.border}`, overflowX: "auto" }}>
        {TABS.map(t => {
          const TabIcon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 18px", fontSize: 12, fontWeight: 600, letterSpacing: "0.03em",
                color: isActive ? accent : S.textDim2,
                border: "none", background: "transparent", cursor: "pointer",
                borderBottom: `2px solid ${isActive ? accent : "transparent"}`,
                transition: "all 0.18s", whiteSpace: "nowrap", fontFamily: "inherit",
              }}
            >
              <TabIcon size={14} color={isActive ? accent : S.textDim2} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content Area ────────────────────────────────── */}
      <div style={{ maxHeight: "54vh", overflowY: "auto", padding: "20px 24px 24px" }}>
        {tab === "objective" && <ObjectiveTab guide={guide} accent={accent} />}
        {tab === "theory" && <TheoryTab guide={guide} accent={accent} />}
        {tab === "procedure" && <ProcedureTab guide={guide} accent={accent} />}
        {tab === "data" && (
          <DataTab
            guide={guide} rows={rows} accent={accent}
            onCapture={handleCapture} onDeleteRow={handleDeleteRow}
            onClearAll={handleClearAll} hasSimData={hasSimData}
            onLaunch={onLaunch} onTogglePause={onTogglePause}
            running={running} paused={paused}
            editLocked={controlsDisabled}
          />
        )}
        {tab === "analysis" && (
          <AnalysisTab
            guide={guide} accent={accent} notes={notes} onNotesChange={setNotes}
            rows={rows} experiment={experiment} launchPhys={launchPhys}
            disabled={controlsDisabled}
          />
        )}
      </div>
    </div>
  );
}
