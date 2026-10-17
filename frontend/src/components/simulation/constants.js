export const DEFAULT_WS = "ws://localhost:8000/ws";
export const TRAIL_MAX = 400;
export const CHART_MAX = 600;
export const BASE_SCALE = 90;

export const EXPERIMENTS = [
  { value: "projectile", label: "Proyectil", icon: "⟋" },
  { value: "spring", label: "Resorte", icon: "⌇" },
  { value: "pendulum", label: "Péndulo", icon: "◎" },
  { value: "double_pendulum", label: "Péndulo Doble", icon: "∞" },
  { value: "collision", label: "Colisión", icon: "⊕" },
];

export const PHYSICS_PARAMS = {
  projectile: [
    { key: "gravity", label: "Gravedad", min: 0.1, max: 25, step: 0.01, default: 9.81, unit: "m/s²" },
    { key: "drag_coeff", label: "Arrastre", min: 0, max: 1, step: 0.01, default: 0.1, unit: "" },
    { key: "mass", label: "Masa", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
  ],
  spring: [
    { key: "k", label: "Rigidez", min: 0.5, max: 80, step: 0.5, default: 12, unit: "N/m" },
    { key: "damping", label: "Amortiguamiento", min: 0, max: 3, step: 0.01, default: 0.3, unit: "" },
    { key: "rest_length", label: "Long. natural", min: 0, max: 5, step: 0.05, default: 1.0, unit: "m" },
    { key: "mass", label: "Masa", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
    { key: "restitution", label: "Restitución", min: 0, max: 1, step: 0.01, default: 0.85, unit: "" },
  ],
  pendulum: [
    { key: "length", label: "Longitud", min: 0.3, max: 5, step: 0.1, default: 1.5, unit: "m" },
    { key: "gravity", label: "Gravedad", min: 0.1, max: 25, step: 0.01, default: 9.81, unit: "m/s²" },
    { key: "damping", label: "Amortiguamiento", min: 0, max: 2, step: 0.01, default: 0.08, unit: "" },
    { key: "mass", label: "Masa", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
  ],
  double_pendulum: [
    { key: "length1", label: "Longitud 1", min: 0.2, max: 4, step: 0.1, default: 1.2, unit: "m" },
    { key: "length2", label: "Longitud 2", min: 0.2, max: 4, step: 0.1, default: 1.0, unit: "m" },
    { key: "mass1", label: "Masa 1", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
    { key: "mass2", label: "Masa 2", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
    { key: "gravity", label: "Gravedad", min: 0.1, max: 25, step: 0.01, default: 9.81, unit: "m/s²" },
    { key: "damping", label: "Amortiguamiento", min: 0, max: 1, step: 0.01, default: 0.0, unit: "" },
  ],
  collision: [
    { key: "gravity", label: "Gravedad", min: 0, max: 25, step: 0.1, default: 0.0, unit: "m/s²" },
    { key: "drag", label: "Arrastre", min: 0, max: 1, step: 0.01, default: 0.0, unit: "" },
    { key: "restitution", label: "Restitución", min: 0, max: 1, step: 0.01, default: 1.0, unit: "" },
    { key: "mass_a", label: "Masa A", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
    { key: "radius_a", label: "Radio A", min: 0.05, max: 1, step: 0.05, default: 0.2, unit: "m" },
    { key: "mass_b", label: "Masa B", min: 0.1, max: 20, step: 0.1, default: 1.0, unit: "kg" },
    { key: "radius_b", label: "Radio B", min: 0.05, max: 1, step: 0.05, default: 0.2, unit: "m" },
  ],
};

export const IC_PARAMS = {
  projectile: [
    { key: "x0", label: "x₀", min: -10, max: 10, step: 0.1, default: -3, unit: "m" },
    { key: "y0", label: "y₀", min: 0, max: 15, step: 0.1, default: 2, unit: "m" },
    { key: "vx0", label: "vx₀", min: -25, max: 25, step: 0.1, default: 8, unit: "m/s" },
    { key: "vy0", label: "vy₀", min: -25, max: 25, step: 0.1, default: 6, unit: "m/s" },
  ],
  spring: [
    { key: "x0", label: "x₀", min: -2, max: 2, step: 0.05, default: 0, unit: "m" },
    { key: "y0", label: "y₀", min: -6, max: 6, step: 0.1, default: -2, unit: "m" },
    { key: "vx0", label: "vx₀", min: -8, max: 8, step: 0.1, default: 0, unit: "m/s" },
    { key: "vy0", label: "vy₀", min: -12, max: 12, step: 0.1, default: 0, unit: "m/s" },
  ],
  pendulum: [
    { key: "angle0", label: "Ángulo", min: -175, max: 175, step: 1, default: 45, unit: "°" },
    { key: "vt0", label: "Vel. inicial", min: -8, max: 8, step: 0.1, default: 0, unit: "m/s" },
  ],
  double_pendulum: [
    { key: "angle1", label: "Ángulo 1", min: -175, max: 175, step: 1, default: 90, unit: "°" },
    { key: "angle2", label: "Ángulo 2", min: -175, max: 175, step: 1, default: 120, unit: "°" },
    { key: "omega1", label: "ω₁ inicial", min: -10, max: 10, step: 0.1, default: 0, unit: "rad/s" },
    { key: "omega2", label: "ω₂ inicial", min: -10, max: 10, step: 0.1, default: 0, unit: "rad/s" },
  ],
  collision: [
    { key: "ax0", label: "A — x₀", min: -10, max: 10, step: 0.1, default: -3, unit: "m" },
    { key: "ay0", label: "A — y₀", min: -10, max: 10, step: 0.1, default: 0, unit: "m" },
    { key: "avx0", label: "A — vx₀", min: -20, max: 20, step: 0.1, default: 4, unit: "m/s" },
    { key: "avy0", label: "A — vy₀", min: -20, max: 20, step: 0.1, default: 0, unit: "m/s" },
    { key: "bx0", label: "B — x₀", min: -10, max: 10, step: 0.1, default: 2, unit: "m" },
    { key: "by0", label: "B — y₀", min: -10, max: 10, step: 0.1, default: 0, unit: "m" },
    { key: "bvx0", label: "B — vx₀", min: -20, max: 20, step: 0.1, default: 0, unit: "m/s" },
    { key: "bvy0", label: "B — vy₀", min: -20, max: 20, step: 0.1, default: 0, unit: "m/s" },
  ],
};

export const CHART_DEFS = {
  projectile: [
    { key: "speed", label: "Rapidez", unit: "m/s", color: "#e8643a" },
    { key: "posX", label: "Posición X", unit: "m", color: "#67e8f9" },
    { key: "posY", label: "Posición Y", unit: "m", color: "#a78bfa" },
    { key: "ke", label: "Energía cinética", unit: "J", color: "#fbbf24" },
    { key: "pe", label: "Energía potencial", unit: "J", color: "#34d399" },
    { key: "te", label: "Energía total", unit: "J", color: "#f472b6" },
  ],
  spring: [
    { key: "speed", label: "Rapidez", unit: "m/s", color: "#2cb87a" },
    { key: "extension", label: "Elongación", unit: "m", color: "#fb923c" },
    { key: "posY", label: "Posición Y", unit: "m", color: "#a78bfa" },
    { key: "ke", label: "Energía cinética", unit: "J", color: "#fbbf24" },
    { key: "spring_pe", label: "Energía elástica", unit: "J", color: "#34d399" },
    { key: "te", label: "Energía total", unit: "J", color: "#f472b6" },
  ],
  pendulum: [
    { key: "angle", label: "Ángulo", unit: "°", color: "#a78bfa" },
    { key: "omega", label: "Vel. angular", unit: "rad/s", color: "#fb923c" },
    { key: "speed", label: "Rapidez", unit: "m/s", color: "#4a9eff" },
    { key: "ke", label: "Energía cinética", unit: "J", color: "#fbbf24" },
    { key: "pe", label: "Energía potencial", unit: "J", color: "#34d399" },
    { key: "te", label: "Energía total", unit: "J", color: "#f472b6" },
  ],
  double_pendulum: [
    { key: "theta1", label: "Ángulo 1", unit: "°", color: "#4a9eff" },
    { key: "theta2", label: "Ángulo 2", unit: "°", color: "#a78bfa" },
    { key: "omega1", label: "Vel. angular 1", unit: "rad/s", color: "#67e8f9" },
    { key: "omega2", label: "Vel. angular 2", unit: "rad/s", color: "#fb923c" },
    { key: "ke", label: "Energía cinética", unit: "J", color: "#fbbf24" },
    { key: "pe", label: "Energía potencial", unit: "J", color: "#34d399" },
    { key: "te", label: "Energía total", unit: "J", color: "#f472b6" },
  ],
  collision: [
    { key: "speed_a", label: "Rapidez A", unit: "m/s", color: "#e8643a" },
    { key: "speed_b", label: "Rapidez B", unit: "m/s", color: "#4a9eff" },
    { key: "px_total", label: "Momento X", unit: "kg·m/s", color: "#fbbf24", centered: true },
    { key: "py_total", label: "Momento Y", unit: "kg·m/s", color: "#34d399", centered: true },
    { key: "te_total", label: "Energía total", unit: "J", color: "#f472b6" },
    { key: "dist", label: "Distancia A↔B", unit: "m", color: "#fb923c" },
  ],
};

export const COLORS = {
  projectile: { ball: "#e8643a", trail: "232,100,58", glow: "#e8643a22" },
  spring: { ball: "#2cb87a", trail: "44,184,122", glow: "#2cb87a22" },
  pendulum: { ball: "#4a9eff", trail: "74,158,255", glow: "#4a9eff22" },
  double_pendulum: { ball: "#a78bfa", trail: "167,139,250", glow: "#a78bfa22" },
  collision: { ball: "#e8643a", trail: "232,100,58", glow: "#e8643a22" },
};
