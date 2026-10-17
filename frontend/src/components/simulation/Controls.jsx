import { useEffect, useState } from "react";
import { clampNum } from "./utils";

export function ParamRow({ def, value, onChange, accentColor, disabled = false }) {
  const safe = value ?? def.default;
  const decimals = def.step < 0.1 ? 2 : def.step < 1 ? 2 : 1;
  const [inputVal, setInputVal] = useState(String(safe));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setInputVal(Number(safe).toFixed(decimals));
  }, [safe, decimals]);

  const commit = raw => {
    if (disabled) return;
    const c = clampNum(raw, def.min, def.max);
    onChange(c);
    setInputVal(Number(c).toFixed(decimals));
  };

  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{def.label}</label>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            border: `1px solid ${focused ? accentColor + "80" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 5,
            overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
            transition: "border-color 0.15s",
          }}
        >
          <input
            type="text"
            inputMode="decimal"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={e => {
              setFocused(false);
              commit(e.target.value);
            }}
            onKeyDown={e => e.key === "Enter" && commit(e.target.value)}
            disabled={disabled}
            style={{
              width: 58,
              padding: "3px 6px",
              background: "transparent",
              border: "none",
              color: accentColor,
              fontSize: 13,
              fontFamily: "'DM Mono',monospace",
              fontWeight: 600,
              textAlign: "right",
              outline: "none",
              MozAppearance: "textfield",
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "default" : "text",
            }}
          />
          {def.unit && (
            <span
              style={{
                fontSize: 12,
                color: accentColor,
                opacity: 0.75,
                fontWeight: 600,
                fontFamily: "'DM Mono',monospace",
                display: "flex",
                alignItems: "center",
                padding: "0 8px 0 2px",
                minWidth: 20,
                borderLeft: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {def.unit}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={def.min}
        max={def.max}
        step={def.step}
        value={safe}
        onChange={e => !disabled && onChange(+e.target.value)}
        style={{ width: "100%", accentColor, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.6 : 1 }}
        disabled={disabled}
      />
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11.5,
        color: "rgba(255,255,255,0.42)",
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        marginBottom: 11,
        marginTop: 8,
        paddingBottom: 6,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

export function Toggle({ label, checked, onChange, accentColor, sublabel, disabled = false }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "default" : "pointer",
        fontSize: 12.5,
        color: "rgba(255,255,255,0.68)",
        fontWeight: 500,
        marginBottom: 11,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span
        style={{
          width: 34,
          height: 19,
          borderRadius: 10,
          background: checked ? accentColor : "rgba(255,255,255,0.14)",
          position: "relative",
          display: "inline-block",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
        onClick={() => !disabled && onChange()}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 16 : 3,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            transition: "left 0.2s",
          }}
        />
      </span>
      <span>
        {label}
        {sublabel && (
          <span style={{ fontSize: 11.5, opacity: 0.6, marginLeft: 5, fontWeight: 500 }}>{sublabel}</span>
        )}
      </span>
    </label>
  );
}