"use client";

import { useEffect, useRef, useState } from "react";
import { useTutor } from "./TutorContext";
import MarkdownView from "./MarkdownView";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("tutor-styles")) return;
  const el = document.createElement("style");
  el.id = "tutor-styles";
  el.textContent = `
    @keyframes tutorPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.45); }
      50%       { box-shadow: 0 0 0 7px rgba(251,191,36,0); }
    }
    @keyframes tutorSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes tutorSlideIn {
      from { opacity: 0; transform: translateY(5px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(el);
}

function LightbulbIcon({ lit, size = 14 }) {
  const c = lit ? "#fbbf24" : "rgba(255,255,255,0.45)";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8C7.21 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
      <path d="M9 17h6" />
    </svg>
  );
}

function Spinner({ size = 13 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "2px solid rgba(251,191,36,0.18)",
        borderTopColor: "#fbbf24",
        animation: "tutorSpin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}

const VERDICT_STYLE = {
  correct: { bg: "rgba(52,211,153,0.14)", color: "#34d399", label: "✓ Vas por buen camino" },
  partial: { bg: "rgba(251,191,36,0.13)", color: "#fbbf24", label: "◑ Parcialmente correcto" },
  incorrect: { bg: "rgba(248,113,113,0.13)", color: "#f87171", label: "↻ Reconsiderar" },
};

function Bubble({ turn }) {
  const isTutor = turn.role === "tutor";
  const verdict = turn.verdict ? VERDICT_STYLE[turn.verdict] : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isTutor ? "flex-start" : "flex-end",
        animation: "tutorSlideIn 0.2s ease",
        marginBottom: 12,
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: isTutor ? "rgba(251,191,36,0.75)" : "rgba(74,158,255,0.75)",
          marginBottom: 4,
          paddingLeft: isTutor ? 2 : 0,
          paddingRight: isTutor ? 0 : 2,
          fontWeight: 700,
        }}
      >
        {isTutor ? "Tutor" : "Tú"}
      </span>

      {verdict && (
        <div
          style={{
            fontSize: 11.5,
            color: verdict.color,
            background: verdict.bg,
            border: `1px solid ${verdict.color}44`,
            borderRadius: 4,
            padding: "4px 10px",
            marginBottom: 5,
            alignSelf: "flex-start",
            letterSpacing: "0.02em",
            fontWeight: 700,
          }}
        >
          {verdict.label}
        </div>
      )}

      <div
        style={{
          maxWidth: "92%",
          padding: "10px 13px",
          borderRadius: isTutor ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          background: isTutor ? "rgba(251,191,36,0.08)" : "rgba(74,158,255,0.1)",
          border: `1px solid ${isTutor ? "rgba(251,191,36,0.18)" : "rgba(74,158,255,0.18)"}`,
          fontSize: 13,
          lineHeight: 1.6,
          color: isTutor ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)",
        }}
      >
        <MarkdownView content={turn.content} style={{ fontSize: 13, lineHeight: 1.6, color: isTutor ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)" }} />
      </div>
    </div>
  );
}

export default function TutorPanel({ onAsk, getReplyContext, disabled = false }) {
  const { loading, error, pulse, panelOpen, history, submitReply, closePanel, dismissPulse } = useTutor();

  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    ensureStyles();
    setIsMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [history, loading]);

  const hasConversation = history.length > 0;

  const handleAsk = () => {
    dismissPulse();
    setExpanded(true);
    onAsk();
  };

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text || loading) return;
    setDraft("");
    const ctx = getReplyContext?.() ?? {};
    submitReply({ reply: text, ...ctx });
    inputRef.current?.focus();
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const lastTutor = [...history].reverse().find(t => t.role === "tutor");
  const canReply = hasConversation && !loading && panelOpen;

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          cursor: hasConversation ? "pointer" : "default",
        }}
        onClick={() => hasConversation && setExpanded(e => !e)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
            Tutor Socrático
          </span>
          {hasConversation && (
            <span style={{ fontSize: 11, background: "rgba(251,191,36,0.18)", color: "#fbbf24", borderRadius: 10, padding: "2px 8px", fontWeight: 700 }}>
              {history.length} mensaje{history.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 7 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={handleAsk}
            disabled={!isMounted || disabled || loading}
            title={!isMounted || disabled ? "Inicie una simulación primero" : "Pedir una pista al tutor"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              borderRadius: 6,
              cursor: !isMounted || disabled ? "not-allowed" : "pointer",
              border: `1px solid ${pulse ? "rgba(251,191,36,0.55)" : "rgba(255,255,255,0.14)"}`,
              background: pulse ? "rgba(251,191,36,0.12)" : "transparent",
              color: pulse ? "#fbbf24" : "rgba(255,255,255,0.5)",
              fontSize: 11.5,
              fontWeight: 700,
              animation: pulse && isMounted && !disabled ? "tutorPulse 1.8s ease-in-out infinite" : "none",
              transition: "all 0.18s",
              opacity: !isMounted || disabled ? 0.4 : 1,
            }}
          >
            {loading && !canReply ? <Spinner /> : <LightbulbIcon lit={pulse} />}
            <span>{loading && !canReply ? "Pensando…" : "Pista"}</span>
          </button>

          {hasConversation && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", userSelect: "none" }}>{expanded ? "▲" : "▼"}</span>}
        </div>
      </div>

      {panelOpen && expanded && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {hasConversation && (
            <div style={{ maxHeight: 260, overflowY: "auto", padding: "4px 14px 8px", display: "flex", flexDirection: "column" }}>
              {history.map((turn, i) => (
                <Bubble key={i} turn={turn} />
              ))}
              {loading && !lastTutor && <Bubble turn={{ role: "tutor", content: "…" }} />}
              <div ref={bottomRef} />
            </div>
          )}

          {error && (
            <div style={{ padding: "7px 14px", fontSize: 12.5, color: "#f87171", fontWeight: 600 }}>
              {error}
            </div>
          )}

          {panelOpen && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 12px" }}>
              <textarea
                ref={inputRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder={hasConversation ? "Responde al tutor…" : "Haz clic en Pista para comenzar"}
                disabled={!canReply}
                style={{
                  flex: 1,
                  minHeight: 38,
                  resize: "vertical",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 6,
                  padding: "7px 9px",
                  color: "rgba(255,255,255,0.88)",
                  fontSize: 12.5,
                  fontFamily: "'DM Sans','Segoe UI',sans-serif",
                  outline: "none",
                  opacity: canReply ? 1 : 0.45,
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!canReply}
                style={{
                  padding: "7px 12px",
                  borderRadius: 6,
                  cursor: canReply ? "pointer" : "not-allowed",
                  border: "1px solid rgba(74,158,255,0.35)",
                  background: "rgba(74,158,255,0.15)",
                  color: "#4a9eff",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  opacity: canReply ? 1 : 0.45,
                }}
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}