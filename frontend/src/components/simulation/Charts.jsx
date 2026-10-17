import { useEffect, useRef } from "react";
import { CHART_MAX } from "./constants";
import { movingAvg } from "./utils";

export function Sparkline({ data, color, unit, yMin, yMax, height = 56, smooth = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const plotData = smooth ? movingAvg(data, 30) : data;
    let lo = yMin ?? Math.min(...plotData);
    let hi = yMax ?? Math.max(...plotData);
    if (smooth && hi - lo < 0.5) {
      const mid = (hi + lo) / 2;
      lo = mid - 0.25;
      hi = mid + 0.25;
    }
    const range = hi - lo || 1e-6;
    const pts = plotData.map((v, i) => [(i / (CHART_MAX - 1)) * w, h - 4 - ((v - lo) / range) * (h - 8)]);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + "38");
    grad.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.moveTo(pts[0][0], h);
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(pts.at(-1)[0], h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = "600 10px 'DM Mono',monospace";
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    ctx.fillText(hi.toFixed(2), 4, 11);
    ctx.fillText(lo.toFixed(2), 4, h - 3);
  }, [data, color, yMin, yMax, smooth]);

  const cur = data.at(-1) ?? 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", color, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {cur.toFixed(3)}
        </span>
        <span
          style={{
            fontSize: 14,
            color,
            opacity: 1,
            fontWeight: 700,
            fontFamily: "'DM Mono',monospace",
          }}
        >
          {unit}
        </span>
      </div>
      <canvas ref={ref} width={300} height={height} style={{ width: "100%", height, display: "block", borderRadius: 3 }} />
    </div>
  );
}

export function PhaseSpace({ xData, yData, color, xLabel = "x", yLabel = "y", height = 120 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || xData.length < 2) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const n = Math.min(xData.length, yData.length);
    const xs = xData.slice(-n);
    const ys = yData.slice(-n);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xR = xMax - xMin || 1e-6;
    const yR = yMax - yMin || 1e-6;
    const pad = 18;
    const toX = v => pad + ((v - xMin) / xR) * (w - 2 * pad);
    const toY = v => h - pad - ((v - yMin) / yR) * (h - 2 * pad);

    const ox2 = Math.min(Math.max(toX(0), pad), w - pad);
    const oy2 = Math.min(Math.max(toY(0), pad), h - pad);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(pad, oy2);
    ctx.lineTo(w - pad, oy2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox2, pad);
    ctx.lineTo(ox2, h - pad);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 1; i < n; i += 1) {
      const t = i / n;
      ctx.beginPath();
      ctx.arc(toX(xs[i]), toY(ys[i]), Math.max(t * 2.5, 0.8), 0, Math.PI * 2);
      ctx.fillStyle = color + Math.floor(t * 200).toString(16).padStart(2, "0");
      ctx.fill();
    }
    if (n > 0) {
      ctx.beginPath();
      ctx.arc(toX(xs[n - 1]), toY(ys[n - 1]), 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.font = "600 10.5px 'DM Mono',monospace";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(xLabel, w - pad - ctx.measureText(xLabel).width, oy2 - 3);
    ctx.fillText(yLabel, ox2 + 3, pad + 8);
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    ctx.fillText(xMin.toFixed(1), pad, h - 3);
    ctx.fillText(xMax.toFixed(1), w - pad - ctx.measureText(xMax.toFixed(1)).width, h - 3);
  }, [xData, yData, color, xLabel, yLabel]);

  return <canvas ref={ref} width={280} height={height} style={{ width: "100%", height, display: "block", borderRadius: 3 }} />;
}

export function ChartAccordion({ def, data, open, onToggle, yMin, yMax }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 2px",
          background: "none",
          border: "none",
          color: open ? def.color : "rgba(255,255,255,0.5)",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.02em",
          transition: "color 0.15s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: open ? def.color : "rgba(255,255,255,0.18)",
              display: "inline-block",
              transition: "background 0.15s",
              boxShadow: open ? `0 0 6px ${def.color}80` : "none",
            }}
          />
          {def.label}
        </span>
        <span style={{ fontSize: 11, opacity: 0.6, fontWeight: 600 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 12 }}>
          {def.phase ? (
            <PhaseSpace
              xData={data.x || []}
              yData={data.y || []}
              color={def.color}
              xLabel={def.xLabel ?? def.xKey}
              yLabel={def.yLabel ?? def.yKey}
              height={120}
            />
          ) : (
            <Sparkline
              data={data}
              color={def.color}
              unit={def.unit}
              yMin={yMin}
              yMax={yMax}
              height={def.key === "te" || def.key === "te_total" ? 90 : def.key.endsWith("e") ? 68 : 56}
              smooth={def.key === "te" || def.key === "te_total"}
            />
          )}
        </div>
      )}
    </div>
  );
}