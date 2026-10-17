/**
 * Guías de laboratorio para física universitaria clásica.
 * Formato estándar tipo Sears-Zemansky / Serway / Halliday-Resnick.
 */

function formatSignedPercent(value) {
  if (!Number.isFinite(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export const LAB_GUIDES = {
  /* ─────────────────────────── PROJECTILE ─────────────────────────── */
  projectile: {
    title: "Tiro Parabólico (Movimiento de Proyectiles en 2D)",
    objective:
      "Analizar el movimiento de un proyectil en dos dimensiones bajo la acción de la gravedad. Determinar experimentalmente la altura máxima, el tiempo de vuelo y el alcance horizontal; comprobar si la velocidad horizontal permanece constante y verificar el principio de conservación de la energía mecánica.",

    theory: [
      {
        heading: "1. Concepto Básico",
        content:
          "Cuando lanzamos un objeto al aire, este se mueve simultáneamente en dos direcciones independientes. En el eje horizontal (X) no actúa ninguna fuerza neta si despreciamos el aire, por lo que el objeto se desplaza con velocidad constante (MRU). En el eje vertical (Y), el peso de la gravedad ejerce una aceleración constante hacia abajo de g = 9.81 m/s², comportándose como un tiro vertical o caída libre (MRUA).",
        equations: [
          { tex: "a_x = 0", desc: "Aceleración en el eje X (sin fuerzas horizontales)" },
          { tex: "a_y = -g = -9.81\\text{ m/s}^2", desc: "Aceleración en el eje Y (gravedad hacia abajo)" },
        ],
      },
      {
        heading: "2. Ecuaciones del Movimiento",
        content:
          "A partir de las condiciones iniciales (posición inicial x₀, y₀ y velocidades de disparo vx₀, vy₀), la posición y velocidad en cualquier instante t vienen dadas por:",
        equations: [
          { tex: "x(t) = x_0 + v_{x_0} \\cdot t", desc: "Posición horizontal en función del tiempo" },
          { tex: "y(t) = y_0 + v_{y_0} \\cdot t - \\tfrac{1}{2}g \\cdot t^2", desc: "Posición vertical en función del tiempo" },
          { tex: "v_x = v_{x_0} = \\text{constante}", desc: "Velocidad horizontal (no cambia durante el vuelo)" },
          { tex: "v_y(t) = v_{y_0} - g \\cdot t", desc: "Velocidad vertical (disminuye al subir y aumenta al bajar)" },
          { tex: "v = \\sqrt{v_x^2 + v_y^2}", desc: "Rapidez total instantánea del proyectil" },
          { tex: "\\theta = \\arctan\\!\\left(\\frac{v_y}{v_x}\\right)", desc: "Ángulo de inclinación de la velocidad con la horizontal" },
        ],
      },
      {
        heading: "3. Altura Máxima, Tiempo de Vuelo y Alcance",
        content:
          "En el punto más alto (vértice de la parábola), la velocidad vertical se anula por un instante (vy = 0). A partir de esta condición deducimos la altura máxima alcanzada y el tiempo necesario para llegar a ella:",
        equations: [
          { tex: "t_{\\text{subida}} = \\frac{v_{y_0}}{g}", desc: "Tiempo en alcanzar la altura máxima (cuando vy = 0)" },
          { tex: "y_{\\max} = y_0 + \\frac{v_{y_0}^{\\,2}}{2g}", desc: "Altura máxima alcanzada" },
          { tex: "t_{\\text{vuelo}} = \\frac{2\\,v_{y_0}}{g}", desc: "Tiempo total de vuelo (si aterriza a la misma altura de disparo)" },
          { tex: "R = v_{x_0} \\cdot t_{\\text{vuelo}} = \\frac{v_0^2\\,\\sin(2\\alpha)}{g}", desc: "Alcance horizontal máximo (alcance óptimo a 45°)" },
        ],
      },
      {
        heading: "4. Conservación de la Energía Mecánica",
        content:
          "Si no hay resistencia del aire (drag = 0), el peso es una fuerza conservativa y la energía mecánica total Em permanece constante en cualquier punto del vuelo. A medida que el proyectil sube, pierde energía cinética Ek y gana energía potencial Ep. En el punto más alto, la energía potencial es máxima y la cinética es mínima (pero no es cero, porque aún conserva vx).",
        equations: [
          { tex: "E_c = \\tfrac{1}{2}\\,m\\,v^2", desc: "Energía cinética" },
          { tex: "E_p = m\\,g\\,y", desc: "Energía potencial gravitacional" },
          { tex: "E_m = E_c + E_p = \\text{constante}", desc: "Energía mecánica total (se conserva si drag = 0)" },
        ],
      },
      {
        heading: "5. Efecto del Arrastre del Aire (Fricción)",
        content:
          "Al activar el coeficiente de arrastre (drag > 0), el aire ejerce una fuerza de fricción opuesta a la velocidad. Esta fuerza realiza trabajo negativo sobre el proyectil, disipando energía mecánica en forma de calor. En consecuencia, la energía mecánica Em disminuye continuamente, la velocidad horizontal vx se va frenando, y el proyectil llega menos alto y cae mucho antes de lo esperado.",
      },
    ],

    procedure: [
      "Asegúrate de tener el arrastre de aire en $drag = 0.00$ para la primera parte de la práctica.",
      "Configura las condiciones iniciales en el panel izquierdo (por ejemplo: $x_0 = -3.0\\text{ m}$, $y_0 = 2.0\\text{ m}$, $v_{x_0} = 8.0\\text{ m/s}$, $v_{y_0} = 6.0\\text{ m/s}$). Anótalas en tu reporte.",
      "Presiona **'Aplicar e Iniciar'** para disparar el proyectil.",
      "Captura al menos 5 puntos de la trayectoria con el botón **'Capturar medición'**: (1) al disparar, (2) a medio camino de subida, (3) cerca del punto más alto ($v_y \\approx 0$), (4) bajando, y (5) justo antes de tocar el suelo.",
      "Revisa la tabla: fíjate si $v_x$ se mantiene constante y si la energía mecánica total $E_m$ varía o se conserva.",
      "Ahora pon el arrastre en $drag = 0.20$, repite el disparo y captura nuevos puntos. Observa cómo decrece la energía total $E_m$.",
    ],

    columns: [
      { key: "t", label: "t", unit: "s" },
      { key: "phase", label: "Fase", unit: "" },
      { key: "x", label: "x", unit: "m" },
      { key: "y", label: "y", unit: "m" },
      { key: "y_teo", label: "y teór.", unit: "m" },
      { key: "err_y", label: "|Δy|", unit: "m" },
      { key: "vx", label: "vx", unit: "m/s" },
      { key: "vy", label: "vy", unit: "m/s" },
      { key: "speed", label: "|v|", unit: "m/s" },
      { key: "theta", label: "θ", unit: "°" },
      { key: "ke", label: "Ec", unit: "J" },
      { key: "pe", label: "Ep", unit: "J" },
      { key: "te", label: "Em", unit: "J" },
      { key: "delta_e_pct", label: "ΔEm", unit: "%" },
    ],

    extractRow: (state, _chartData, physics) => {
      if (!state) return null;
      const { x, y } = state.position;
      const { x: vx, y: vy } = state.velocity;
      const m = state.mass ?? physics?.mass ?? 1;
      const g = physics?.gravity ?? 9.81;
      const drag = physics?.drag_coeff ?? 0;
      const speed = Math.hypot(vx, vy);
      const ke = 0.5 * m * speed * speed;
      const pe = m * g * y;
      const te = ke + pe;
      const theta = Math.atan2(vy, vx) * (180 / Math.PI);
      const t = +(state.t ?? 0);

      // Theoretical ballistic reference
      const y0 = physics?.y0 ?? 2;
      const vy0 = physics?.vy0 ?? 6;
      const y_teo = y0 + vy0 * t - 0.5 * g * t * t;
      const err_y = Math.abs(y - y_teo);

      const vx0 = physics?.vx0 ?? 8;
      const speed0 = Math.hypot(vx0, vy0);
      const em0 = 0.5 * m * speed0 * speed0 + m * g * y0;
      const delta_e_pct = em0 !== 0 ? ((te - em0) / em0) * 100 : 0;

      let phase = "Vuelo";
      if (t <= 0.05) {
        phase = "Disparo";
      } else if (Math.abs(vy) <= 0.25) {
        phase = "Altura máxima";
      } else if (vy > 0.25) {
        phase = "Subiendo";
      } else if (vy < -0.25) {
        phase = "Bajando";
      }

      const configTag = `Arrastre: ${drag.toFixed(2)} | g: ${g.toFixed(2)} m/s² | m: ${m.toFixed(1)} kg`;

      return {
        experiment: "projectile",
        configTag,
        t: +t.toFixed(3),
        phase,
        x: +x.toFixed(3),
        y: +y.toFixed(3),
        y_teo: +y_teo.toFixed(3),
        err_y: +err_y.toFixed(3),
        vx: +vx.toFixed(3),
        vy: +vy.toFixed(3),
        speed: +speed.toFixed(3),
        theta: +theta.toFixed(1),
        ke: +ke.toFixed(3),
        pe: +pe.toFixed(3),
        te: +te.toFixed(3),
        delta_e_pct: formatSignedPercent(delta_e_pct),
      };
    },

    questions: [
      "**Problema 1 (Cálculo de Altura Máxima):**\nCon tus valores iniciales $v_{y_0}$ y $y_0$, calcula analíticamente la altura máxima esperada mediante la ecuación:\n$$y_{\\max} = y_0 + \\frac{v_{y_0}^2}{2g}$$\nLuego busca en tu tabla el punto donde $v_y \\approx 0$ y compara el valor experimental con tu predicción. ¿Cuál es el error porcentual?",
      "**Problema 2 (Velocidad Horizontal y Aceleración Nula):**\nObserva los valores de la columna $v_x$ a lo largo de todo el vuelo sin arrastre ($drag = 0$). Explica por qué se mantiene constante según la Segunda Ley de Newton:\n$$\\sum F_x = m \\cdot a_x = 0 \\implies a_x = 0$$\n¿Qué ocurre con $v_x$ cuando activas un coeficiente de arrastre $drag > 0$?",
      "**Problema 3 (Energía en el Punto Más Alto):**\nEn la altura máxima ($v_y = 0$), ¿la energía cinética se anula? Determina la energía cinética remanente usando la componente horizontal:\n$$E_c(\\text{vértice}) = \\frac{1}{2} m v_x^2$$\nVerifica en tu tabla si coincide con la diferencia entre la energía mecánica total y la energía potencial en ese instante.",
      "**Problema 4 (Alcance Horizontal y Tiempo de Vuelo):**\nCalcula el tiempo total de vuelo y el alcance horizontal teórico con la relación analítica:\n$$R = v_{x_0} \\cdot t_{\\text{vuelo}} = \\frac{v_0^2 \\sin(2\\theta)}{g}$$\n¿Qué tan cercano es el alcance $x_{\\text{final}}$ medido en la tabla respecto al valor calculado?",
      "**Problema 5 (Disipación por Fricción del Aire):**\nRepite el tiro con fricción ($drag = 0.20$). Calcula cuánta energía mecánica se perdió entre el disparo inicial y el impacto:\n$$\\Delta E_m = E_m(\\text{inicial}) - E_m(\\text{final})$$\n¿Qué porcentaje de la energía original se disipó en calor y resistencia aerodinámica?",
    ],
  },

  /* ─────────────────────────── SPRING ─────────────────────────── */
  spring: {
    title: "Oscilador Armónico y Ley de Hooke (Masa-Resorte)",
    objective:
      "Estudiar la dinámica de un oscilador armónico simple y amortiguado. Determinar la constante de rigidez k del resorte, medir el periodo de oscilación, comprobar la alternancia entre energía cinética y energía potencial elástica, y evaluar la disipación por fricción viscosa.",

    theory: [
      {
        heading: "1. Ley de Hooke y Fuerza Restauradora",
        content:
          "Un resorte ideal ejerce una fuerza restauradora directamente proporcional a su deformación respecto a la longitud natural L₀. Si se elonga o comprime una distancia Δl, la fuerza elástica apunta en sentido opuesto al desplazamiento hacia la posición de equilibrio.",
        equations: [
          { tex: "\\vec{F}_e = -k\\,(\\Delta l)\\,\\hat{u}_r", desc: "Ley de Hooke (k es la constante de rigidez en N/m)" },
          { tex: "\\Delta l = r - L_0", desc: "Elongación respecto a la longitud natural L₀" },
        ],
      },
      {
        heading: "2. Ecuación Diferencial del Movimiento",
        content:
          "Aplicando la Segunda Ley de Newton con una fuerza de amortiguamiento viscoso proporcional a la velocidad (F_amort = -b·v):",
        equations: [
          { tex: "m\\,\\frac{d^2 y}{dt^2} + b\\,\\frac{dy}{dt} + k\\,y = 0", desc: "Ecuación del oscilador amortiguado" },
          { tex: "\\omega_0 = \\sqrt{\\frac{k}{m}}", desc: "Frecuencia angular natural del oscilador (rad/s)" },
          { tex: "T_0 = \\frac{2\\pi}{\\omega_0} = 2\\pi\\sqrt{\\frac{m}{k}}", desc: "Periodo teórico de oscilación sin amortiguamiento" },
        ],
      },
      {
        heading: "3. Balance de Energía Mecánica",
        content:
          "En ausencia de amortiguamiento (b = 0), la energía mecánica total se conserva, transformándose continuamente entre energía cinética (máxima al pasar por el equilibrio) y energía potencial elástica (máxima en los extremos de elongación o compresión).",
        equations: [
          { tex: "E_c = \\tfrac{1}{2}\\,m\\,v^2", desc: "Energía cinética de la masa" },
          { tex: "E_{pe} = \\tfrac{1}{2}\\,k\\,(\\Delta l)^2", desc: "Energía potencial elástica almacenada en el resorte" },
          { tex: "E_m = E_c + E_{pe} = \\text{constante}", desc: "Energía mecánica total (se conserva si b = 0)" },
        ],
      },
      {
        heading: "4. Amortiguamiento y Decaimiento",
        content:
          "Cuando b > 0, la fuerza viscosa realiza trabajo disipativo negativo. La amplitud de oscilación decae exponencialmente según A(t) = A₀·e^(-γt), donde γ = b/(2m), y la energía mecánica total disminuye monótonamente.",
      },
    ],

    procedure: [
      "Configura el amortiguamiento en $b = 0.00$ para la primera fase de oscilación libre.",
      "Ajusta los parámetros físicos: masa $m = 1.0\\text{ kg}$, rigidez $k = 12.0\\text{ N/m}$ y longitud natural $L_0 = 1.0\\text{ m}$.",
      "Establece una posición inicial desplazada del equilibrio (por ejemplo: $y_0 = -2.0\\text{ m}$, $v_{y_0} = 0.0\\text{ m/s}$).",
      "Presiona **'Aplicar e Iniciar'** y captura mediciones en puntos clave: máxima elongación, paso por equilibrio ($\\Delta l \\approx 0$), máxima compresión y retorno.",
      "Verifica en la tabla que la suma $E_m = E_c + E_{pe}$ permanezca constante a lo largo del ciclo.",
      "Configura ahora el amortiguamiento en $b = 0.30$ y repite la captura. Observa cómo decae la amplitud y disminuye la energía total $E_m$.",
    ],

    columns: [
      { key: "t", label: "t", unit: "s" },
      { key: "phase", label: "Fase", unit: "" },
      { key: "y", label: "y", unit: "m" },
      { key: "vy", label: "vy", unit: "m/s" },
      { key: "extension", label: "Δl", unit: "m" },
      { key: "speed", label: "|v|", unit: "m/s" },
      { key: "ke", label: "Ec", unit: "J" },
      { key: "spring_pe", label: "Epe", unit: "J" },
      { key: "te", label: "Em", unit: "J" },
      { key: "delta_e_pct", label: "ΔEm", unit: "%" },
    ],

    extractRow: (state, _chartData, physics) => {
      if (!state) return null;
      const { x, y } = state.position;
      const { x: vx, y: vy } = state.velocity;
      const m = state.mass ?? physics?.mass ?? 1;
      const k = physics?.k ?? 12;
      const rl = physics?.rest_length ?? 1;
      const damp = physics?.damping ?? 0.3;
      const r = Math.hypot(x, y);
      const ext = r - rl;
      const speed = Math.hypot(vx, vy);
      const ke = 0.5 * m * speed * speed;
      const spe = 0.5 * k * ext * ext;
      const te = ke + spe;
      const t = +(state.t ?? 0);

      let phase = "Oscilando";
      if (Math.abs(ext) < 0.08) {
        phase = "Equilibrio";
      } else if (speed < 0.15) {
        phase = ext > 0 ? "Elongación máx" : "Compresión máx";
      } else if (ext > 0) {
        phase = vy < 0 ? "Elongando" : "Retornando";
      } else {
        phase = vy > 0 ? "Comprimiendo" : "Retornando";
      }

      const y0 = physics?.y0 ?? -2;
      const x0 = physics?.x0 ?? 0;
      const ext0 = Math.hypot(x0, y0) - rl;
      const vx0 = physics?.vx0 ?? 0;
      const vy0 = physics?.vy0 ?? 0;
      const speed0 = Math.hypot(vx0, vy0);
      const em0 = 0.5 * m * speed0 * speed0 + 0.5 * k * ext0 * ext0;
      const delta_e_pct = em0 !== 0 ? ((te - em0) / em0) * 100 : 0;

      const configTag = `k: ${k.toFixed(1)} N/m | b: ${damp.toFixed(2)} | L₀: ${rl.toFixed(2)} m | m: ${m.toFixed(1)} kg`;

      return {
        experiment: "spring",
        configTag,
        t: +t.toFixed(3),
        phase,
        y: +y.toFixed(3),
        vy: +vy.toFixed(3),
        extension: +ext.toFixed(3),
        speed: +speed.toFixed(3),
        ke: +ke.toFixed(3),
        spring_pe: +spe.toFixed(3),
        te: +te.toFixed(3),
        delta_e_pct: formatSignedPercent(delta_e_pct),
      };
    },

    questions: [
      "**Problema 1 (Periodo Teórico vs Experimental):**\nCon la rigidez $k$ del resorte y la masa $m$ empleadas, calcula el periodo analítico de oscilación:\n$$T_0 = 2\\pi \\sqrt{\\frac{m}{k}}$$\nCon las mediciones de tiempo de paso por equilibrio en tu tabla, halla el periodo experimental y calcula el porcentaje de discrepancia.",
      "**Problema 2 (Intercambio Energético en el Equilibrio):**\nEvalúa la relación continua entre energía cinética y energía potencial elástica:\n$$E_m = \\frac{1}{2} m v^2 + \\frac{1}{2} k (\\Delta l)^2 = \\text{constante}$$\nAl pasar por la posición de equilibrio ($\\Delta l \\approx 0$), ¿qué porcentaje de la energía mecánica total corresponde a energía cinética $E_c$?",
      "**Problema 3 (Fuerza Restauradora y Aceleración Máxima):**\nA partir de la máxima elongación $|\\Delta l_{\\max}|$ observada en los extremos, calcula la fuerza elástica restauradora y la aceleración instantánea máxima:\n$$F_{\\max} = k \\cdot |\\Delta l_{\\max}| \\quad \\implies \\quad a_{\\max} = \\frac{k}{m} |\\Delta l_{\\max}|$$\n¿En qué puntos de la trayectoria la velocidad es cero y la aceleración es máxima?",
      "**Problema 4 (Conservación de Energía sin Amortiguamiento):**\nVerifica los valores de la columna $E_m$ en el caso sin fricción ($b = 0$). Comprueba la constancia de la energía mecánica:\n$$\\Delta E_m = E_m(t) - E_m(0) \\approx 0$$\n¿Permanece constante dentro del margen numérico? Explica qué ocurriría si el integrador cometiese errores sistemáticos.",
      "**Problema 5 (Disipación por Amortiguamiento Viscoso):**\nEn la prueba con amortiguamiento $b > 0$, calcula la energía disipada tras un ciclo completo:\n$$\\Delta E_m = E_m(t_1) - E_m(t_2) < 0$$\nExplica físicamente hacia dónde va a parar la energía mecánica perdida durante la oscilación.",
    ],
  },

  /* ─────────────────────────── PENDULUM ─────────────────────────── */
  pendulum: {
    title: "Péndulo Simple (Dinámica Rotacional y Pequeñas Oscilaciones)",
    objective:
      "Determinar experimentalmente la relación entre la longitud del péndulo, el ángulo de oscilación y el periodo. Verificar el régimen de validez de la aproximación de ángulos pequeños y comprobar la conservación de la energía mecánica entre energía potencial gravitatoria y energía cinética.",

    theory: [
      {
        heading: "1. Dinámica del Péndulo Simple",
        content:
          "Una masa puntual m suspendida de un hilo inextensible de longitud L sin masa oscila bajo la acción de la gravedad. La fuerza neta tangencial que causa la aceleración es la componente del peso mg·sin(θ), orientada siempre hacia el punto de equilibrio vertical.",
        equations: [
          { tex: "F_{\\text{tang}} = -m\\,g\\,\\sin\\theta", desc: "Fuerza restauradora tangencial" },
          { tex: "\\frac{d^2\\theta}{dt^2} + \\frac{g}{L}\\,\\sin\\theta = 0", desc: "Ecuación diferencial exacta del movimiento" },
        ],
      },
      {
        heading: "2. Aproximación de Pequeñas Oscilaciones",
        content:
          "Para amplitudes angulares pequeñas (θ < 15° o ~0.26 rad), se cumple la aproximación lineal sin(θ) ≈ θ. En este régimen, el movimiento es armónico simple (MAS) y el periodo no depende de la masa ni de la amplitud (isocronismo).",
        equations: [
          { tex: "\\frac{d^2\\theta}{dt^2} + \\frac{g}{L}\\,\\theta \\approx 0", desc: "Ecuación diferencial linealizada" },
          { tex: "\\omega_0 = \\sqrt{\\frac{g}{L}}", desc: "Frecuencia angular del péndulo simple" },
          { tex: "T_0 = 2\\pi\\sqrt{\\frac{L}{g}}", desc: "Fórmula clásica del periodo para ángulos pequeños" },
        ],
      },
      {
        heading: "3. Conservación de la Energía Mecánica",
        content:
          "Tomando el punto más bajo (θ = 0) como nivel de referencia cero de energía potencial, la altura relativa de la masa al separarse un ángulo θ es h = L(1 - cos θ). La energía mecánica se conserva si no hay amortiguamiento viscoso.",
        equations: [
          { tex: "h(\\theta) = L\\,(1 - \\cos\\theta)", desc: "Altura vertical sobre el punto más bajo" },
          { tex: "E_p = m\\,g\\,h = m\\,g\\,L\\,(1 - \\cos\\theta)", desc: "Energía potencial gravitatoria" },
          { tex: "E_c = \\tfrac{1}{2}\\,m\\,v^2 = \\tfrac{1}{2}\\,m\\,(L\\,\\omega)^2", desc: "Energía cinética en términos de velocidad angular" },
          { tex: "v_{\\max} = \\sqrt{2\\,g\\,L\\,(1 - \\cos\\theta_0)}", desc: "Velocidad en el punto más bajo (h = 0)" },
        ],
      },
    ],

    procedure: [
      "Configura el péndulo con longitud $L = 1.5\\text{ m}$, masa $m = 1.0\\text{ kg}$ y amortiguamiento $b = 0.00$.",
      "Para la **Parte 1 (Pequeñas oscilaciones)**: establece un ángulo inicial pequeño $\\theta_0 = 15^\\circ$ con velocidad angular inicial nula ($\\omega_0 = 0$).",
      "Presiona **'Aplicar e Iniciar'** y captura mediciones: en el extremo inicial ($\\theta = 15^\\circ$), al cruzar la vertical ($\\theta = 0^\\circ$) y en el extremo opuesto.",
      "Verifica si la rapidez en el punto más bajo concuerda con la predicción teórica $v_{\\max} = \\sqrt{2gL(1 - \\cos\\theta_0)}$.",
      "Para la **Parte 2 (Grandes oscilaciones)**: reinicia y ajusta $\\theta_0 = 60^\\circ$. Captura mediciones y observa cómo se incrementa el periodo experimental respecto al teórico.",
      "Activa amortiguamiento $b = 0.10$ y registra la disipación progresiva de la energía mecánica $E_m$.",
    ],

    columns: [
      { key: "t", label: "t", unit: "s" },
      { key: "phase", label: "Fase", unit: "" },
      { key: "angle", label: "θ", unit: "°" },
      { key: "omega", label: "ω", unit: "rad/s" },
      { key: "speed", label: "|v|", unit: "m/s" },
      { key: "h", label: "h", unit: "m" },
      { key: "ke", label: "Ec", unit: "J" },
      { key: "pe", label: "Ep", unit: "J" },
      { key: "te", label: "Em", unit: "J" },
      { key: "delta_e_pct", label: "ΔEm", unit: "%" },
    ],

    extractRow: (state, _chartData, physics) => {
      if (!state) return null;
      const { x, y } = state.position;
      const { x: vx, y: vy } = state.velocity;
      const m = state.mass ?? physics?.mass ?? 1;
      const g = physics?.gravity ?? 9.81;
      const L = physics?.length ?? 1.5;
      const damp = physics?.damping ?? 0.08;

      const thetaRad = Math.atan2(x, -y);
      const thetaDeg = thetaRad * (180 / Math.PI);
      const speed = Math.hypot(vx, vy);
      const omega = speed / L;
      const h = Math.max(0, L * (1 - Math.cos(thetaRad)));
      const ke = 0.5 * m * speed * speed;
      const pe = m * g * h;
      const te = ke + pe;
      const t = +(state.t ?? 0);

      let phase = "Oscilando";
      if (Math.abs(thetaDeg) < 2.0) {
        phase = "Punto más bajo";
      } else if (speed < 0.12) {
        phase = "Amplitud máx";
      } else if (Math.abs(thetaDeg) > 15) {
        phase = thetaDeg > 0 ? "Oscilación derecha" : "Oscilación izquierda";
      }

      const angle0 = physics?.angle0 ?? 45;
      const angle0Rad = (angle0 * Math.PI) / 180;
      const h0 = L * (1 - Math.cos(angle0Rad));
      const em0 = m * g * h0;
      const delta_e_pct = em0 !== 0 ? ((te - em0) / em0) * 100 : 0;

      const configTag = `L: ${L.toFixed(2)} m | g: ${g.toFixed(2)} m/s² | b: ${damp.toFixed(2)} | m: ${m.toFixed(1)} kg`;

      return {
        experiment: "pendulum",
        configTag,
        t: +t.toFixed(3),
        phase,
        angle: +thetaDeg.toFixed(1),
        omega: +omega.toFixed(3),
        speed: +speed.toFixed(3),
        h: +h.toFixed(3),
        ke: +ke.toFixed(3),
        pe: +pe.toFixed(3),
        te: +te.toFixed(3),
        delta_e_pct: formatSignedPercent(delta_e_pct),
      };
    },

    questions: [
      "**Problema 1 (Periodo Teórico para Pequeñas Oscilaciones):**\nCalcula el periodo teórico con la longitud $L$ y la aceleración gravitatoria $g$:\n$$T_0 = 2\\pi \\sqrt{\\frac{L}{g}}$$\n¿Cuál es el error porcentual respecto al tiempo experimental medido entre dos pasos sucesivos por el punto más bajo en el mismo sentido?",
      "**Problema 2 (Rapidez Teórica en el Fondo):**\nPor conservación de energía mecánica, deduce la rapidez teórica en el punto más bajo de la trayectoria:\n$$v_{\\max} = \\sqrt{2 g L (1 - \\cos\\theta_0)}$$\nCompara el valor teórico con el dato de la columna $|v|$ registrado cuando $\\theta \\approx 0^\\circ$. ¿Coinciden?",
      "**Problema 3 (Tensión Máxima en la Cuerda):**\nEn el punto más bajo de la trayectoria, la tensión $T$ debe contrarrestar el peso y suministrar la aceleración centrípeta:\n$$T = m g + m \\frac{v^2}{L}$$\nCalcula numéricamente la tensión en Newtons con los datos de tu tabla en $\\theta \\approx 0^\\circ$.",
      "**Problema 4 (Límite de Validez de Pequeños Ángulos):**\nCompara las oscilaciones con $\\theta_0 = 15^\\circ$ frente a $\\theta_0 = 60^\\circ$:\n$$\\sin\\theta \\approx \\theta \\quad (\\text{válido únicamente si } \\theta \\ll 1 \\text{ rad})$$\n¿Por qué a $60^\\circ$ la aproximación lineal introduce un error apreciable en el periodo?",
      "**Problema 5 (Amortiguamiento y Disipación):**\nCon amortiguamiento $b > 0$, calcula la pérdida relativa de energía mecánica tras 3 oscilaciones completas:\n$$\\frac{\\Delta E_m}{E_{m_0}} = \\frac{E_m(t) - E_{m_0}}{E_{m_0}} \\times 100\\%$$\n¿Qué factor físico determina la rapidez con que se extingue la oscilación?",
    ],
  },

  /* ─────────────────────────── DOUBLE PENDULUM ─────────────────────────── */
  double_pendulum: {
    title: "Péndulo Doble (Dinámica No Lineal y Caos Determinista)",
    objective:
      "Analizar el comportamiento dinámico de dos péndulos acoplados. Estudiar las ecuaciones de Euler-Lagrange que gobiernan el sistema, observar la transición hacia el caos determinista a altas energías, y comprobar la conservación rigurosa de la energía mecánica total a pesar de la extrema complejidad de la trayectoria.",

    theory: [
      {
        heading: "1. Mecánica Lagrangiana del Sistema Acoplado",
        content:
          "El péndulo doble consiste en un primer eslabón (longitud L₁, masa m₁) pivotado en el origen, del cual pende un segundo eslabón (longitud L₂, masa m₂). Las coordenadas generalizadas son los ángulos θ₁ y θ₂ medidos respecto a la vertical descendente.",
        equations: [
          { tex: "x_1 = L_1\\sin\\theta_1,\\quad y_1 = -L_1\\cos\\theta_1", desc: "Posición cartesiana de la masa 1" },
          { tex: "x_2 = x_1 + L_2\\sin\\theta_2,\\quad y_2 = y_1 - L_2\\cos\\theta_2", desc: "Posición cartesiana de la masa 2" },
          { tex: "\\mathcal{L} = T - V", desc: "Lagrangiano del sistema (cinética menos potencial)" },
        ],
      },
      {
        heading: "2. Energía Cinética y Potencial Acopladas",
        content:
          "La energía cinética total incluye términos cruzados proporcionales a cos(θ₁ - θ₂), lo que genera un fuerte acoplamiento no lineal entre ambos péndulos:",
        equations: [
          { tex: "T = \\tfrac{1}{2}(m_1+m_2)L_1^2\\dot{\\theta}_1^2 + \\tfrac{1}{2}m_2 L_2^2\\dot{\\theta}_2^2 + m_2 L_1 L_2\\dot{\\theta}_1\\dot{\\theta}_2\\cos(\\theta_1-\\theta_2)", desc: "Energía cinética acoplada" },
          { tex: "V = -(m_1+m_2)g L_1\\cos\\theta_1 - m_2 g L_2\\cos\\theta_2", desc: "Energía potencial gravitatoria total" },
          { tex: "E_m = T + V = \\text{constante}", desc: "Conservación de energía mecánica total (b = 0)" },
        ],
      },
      {
        heading: "3. Sensibilidad a Condiciones Iniciales y Caos",
        content:
          "Para ángulos pequeños, el péndulo doble exhibe dos modos normales de vibración predecibles. Sin embargo, para ángulos grandes (energías altas), las ecuaciones no lineales originan caos determinista: dos trayectorias con condiciones iniciales infinitesimalmente distintas divergen exponencialmente en el tiempo (exponente de Lyapunov positivo).",
      },
    ],

    procedure: [
      "Configura las masas $m_1 = 1.0\\text{ kg}, m_2 = 1.0\\text{ kg}$, longitudes $L_1 = 1.2\\text{ m}, L_2 = 1.0\\text{ m}$ y amortiguamiento en $0.00$.",
      "Establece ángulos iniciales moderados o grandes (ejemplo: $\\theta_1 = 90^\\circ, \\theta_2 = 120^\\circ$) con velocidades angulares iniciales en cero ($\\omega_1 = 0, \\omega_2 = 0$).",
      "Presiona **'Aplicar e Iniciar'** y observa la trayectoria compleja, no lineal y aperiódica del segundo péndulo.",
      "Captura al menos 6 mediciones a lo largo de los primeros 10 segundos de movimiento.",
      "Examina en la tabla cómo la energía fluctúa continuamente entre cinética $E_c$ y potencial $E_p$, mientras la energía mecánica total $E_m$ permanece invariante.",
    ],

    columns: [
      { key: "t", label: "t", unit: "s" },
      { key: "theta1", label: "θ₁", unit: "°" },
      { key: "theta2", label: "θ₂", unit: "°" },
      { key: "omega1", label: "ω₁", unit: "rad/s" },
      { key: "omega2", label: "ω₂", unit: "rad/s" },
      { key: "ke", label: "Ec", unit: "J" },
      { key: "pe", label: "Ep", unit: "J" },
      { key: "te", label: "Em", unit: "J" },
      { key: "delta_e_pct", label: "ΔEm", unit: "%" },
    ],

    extractRow: (state, _chartData, physics) => {
      if (!state) return null;
      const meta = state._meta ?? {};
      const t = +(state.t ?? 0);
      const theta1Deg = ((meta.theta1 ?? 0) * 180) / Math.PI;
      const theta2Deg = ((meta.theta2 ?? 0) * 180) / Math.PI;
      const omega1 = +(meta.omega1 ?? 0);
      const omega2 = +(meta.omega2 ?? 0);
      const ke = +(meta.ke ?? 0);
      const pe = +(meta.pe ?? 0);
      const te = +(meta.te ?? ke + pe);

      const m1 = physics?.mass1 ?? 1;
      const m2 = physics?.mass2 ?? 1;
      const L1 = physics?.length1 ?? 1.2;
      const L2 = physics?.length2 ?? 1.0;
      const g = physics?.gravity ?? 9.81;

      const a1_0 = ((physics?.angle1 ?? 90) * Math.PI) / 180;
      const a2_0 = ((physics?.angle2 ?? 120) * Math.PI) / 180;
      const v0 = -(m1 + m2) * g * L1 * Math.cos(a1_0) - m2 * g * L2 * Math.cos(a2_0);
      const delta_e_pct = v0 !== 0 ? ((te - v0) / Math.abs(v0)) * 100 : 0;

      const configTag = `L₁: ${L1.toFixed(1)} m | L₂: ${L2.toFixed(1)} m | m₁: ${m1.toFixed(1)} kg | m₂: ${m2.toFixed(1)} kg`;

      return {
        experiment: "double_pendulum",
        configTag,
        t: +t.toFixed(3),
        theta1: +theta1Deg.toFixed(1),
        theta2: +theta2Deg.toFixed(1),
        omega1: +omega1.toFixed(3),
        omega2: +omega2.toFixed(3),
        ke: +ke.toFixed(3),
        pe: +pe.toFixed(3),
        te: +te.toFixed(3),
        delta_e_pct: formatSignedPercent(delta_e_pct),
      };
    },

    questions: [
      "**Problema 1 (Conservación de Energía en Sistemas Caóticos):**\nA pesar de que las coordenadas angulares $\\theta_1$ y $\\theta_2$ muestran trayectorias aparentemente erráticas, comprueba la constancia de la energía mecánica total:\n$$E_m = E_c(\\theta_1, \\theta_2, \\omega_1, \\omega_2) + E_p(\\theta_1, \\theta_2) = \\text{constante}$$\n¿Se conserva la energía mecánica total en tu tabla? ¿Cuál es la desviación porcentual máxima observada?",
      "**Problema 2 (Transferencia de Energía entre Eslabones):**\nObserva las velocidades angulares $\\omega_1$ y $\\omega_2$ en diferentes instantes de la trayectoria:\n$$\\omega_1 = \\frac{d\\theta_1}{dt}, \\quad \\omega_2 = \\frac{d\\theta_2}{dt}$$\n¿Se observan momentos donde el primer eslabón casi se detiene mientras el segundo adquiere velocidades muy altas? Explica cómo el acoplamiento no lineal transfiere momento y energía de un cuerpo al otro.",
      "**Problema 3 (Energía Potencial Mínima y Máxima):**\nCalcula analíticamente la energía potencial cuando ambos péndulos cuelgan verticalmente frente a cuando ambos están invertidos:\n$$\\Delta E_p = E_p(180^\\circ, 180^\\circ) - E_p(0^\\circ, 0^\\circ) = 2(m_1 + m_2)g L_1 + 2 m_2 g L_2$$\n¿Cuál es la diferencia de energía potencial total calculada para tu configuración?",
      "**Problema 4 (Régimen Lineal vs Régimen Caótico):**\nSi configuras ángulos pequeños ($\\theta_1 = 5^\\circ, \\theta_2 = 5^\\circ$), el sistema oscila de forma cuasi-periódica en sus dos modos normales. Analiza la ecuación de acoplamiento angular:\n$$\\ddot{\\theta}_1 \\propto \\omega_2^2 \\sin(\\theta_1 - \\theta_2) + g \\sin\\theta_1$$\n¿Por qué a ángulos grandes ($90^\\circ, 120^\\circ$) los términos no lineales destruyen la periodicidad y desatan el caos?",
      "**Problema 5 (Efecto del Amortiguamiento):**\nAñade un valor pequeño de amortiguamiento ($damp = 0.05$). Observa cómo se disipa la energía cinética:\n$$\\lim_{t \\to \\infty} E_c(t) = 0$$\n¿Hacia qué estado final de equilibrio converge el péndulo doble cuando toda la energía cinética se ha extinguido?",
    ],
  },

  /* ─────────────────────────── COLLISION ─────────────────────────── */
  collision: {
    title: "Colisiones en 2D (Conservación del Momento Lineal)",
    objective:
      "Verificar experimentalmente la ley de conservación del momento lineal en colisiones bidimensionales. Analizar la diferencia entre choques elásticos e inelásticos a través del coeficiente de restitución e, y calcular la energía mecánica disipada en la deformación durante el impacto.",

    theory: [
      {
        heading: "1. Principio de Conservación del Momento Lineal",
        content:
          "Durante una colisión entre dos cuerpos A y B, las fuerzas mutuas de interacción durante el impacto son de acción y reacción (Tercera Ley de Newton). Si las fuerzas externas netas son despreciables durante la colisión, el momento lineal total del sistema se conserva vectorialmente en cada eje cartesiano.",
        equations: [
          { tex: "\\vec{P}_{\\text{total}} = m_A\\,\\vec{v}_A + m_B\\,\\vec{v}_B = \\text{constante}", desc: "Conservación del momento lineal total" },
          { tex: "P_x = m_A\\,v_{Ax} + m_B\\,v_{Bx} = \\text{constante}", desc: "Conservación de la componente X del momento" },
          { tex: "P_y = m_A\\,v_{Ay} + m_B\\,v_{By} = \\text{constante}", desc: "Conservación de la componente Y del momento" },
        ],
      },
      {
        heading: "2. Coeficiente de Restitución y Clasificación de Choques",
        content:
          "El coeficiente de restitución e mide la elasticidad del choque a lo largo de la línea normal al impacto:",
        equations: [
          { tex: "e = -\\frac{v_{Bn}' - v_{An}'}{v_{Bn} - v_{An}}", desc: "Coeficiente de restitución (0 ≤ e ≤ 1)" },
          { tex: "e = 1.00", desc: "Choque perfectamente elástico: Ec se conserva estrictamente" },
          { tex: "0 < e < 1.00", desc: "Choque inelástico: parte de la energía cinética se disipa en calor/deformación" },
          { tex: "e = 0.00", desc: "Choque perfectamente inelástico: los cuerpos permanecen juntos tras el impacto" },
        ],
      },
      {
        heading: "3. Balance de Energía Cinética",
        content:
          "La variación de energía cinética ΔEc antes y después del impacto permite cuantificar el trabajo de deformación y la energía disipada:",
        equations: [
          { tex: "E_c = \\tfrac{1}{2}\\,m_A\\,v_A^2 + \\tfrac{1}{2}\\,m_B\\,v_B^2", desc: "Energía cinética total del sistema" },
          { tex: "\\Delta E_c = E_{c,\\text{post}} - E_{c,\\text{pre}}", desc: "Pérdida de energía cinética en choques inelásticos (ΔEc ≤ 0)" },
        ],
      },
    ],

    procedure: [
      "Configura el experimento con gravedad $g = 0.00\\text{ m/s}^2$ y arrastre en $0.00$ para aislar completamente las fuerzas del impacto.",
      "**Parte 1 (Choque Elástico con masas iguales)**: ajusta $m_A = 1.0\\text{ kg}, m_B = 1.0\\text{ kg}$, restitución $e = 1.00$, velocidad inicial $v_{Ax_0} = 4.0\\text{ m/s}$ y $v_{Bx_0} = 0.0\\text{ m/s}$.",
      "Captura una medición **PRE-COLISIÓN** antes del impacto mientras las partículas se aproximan.",
      "Permite el choque y captura de inmediato una medición **POST-COLISIÓN** tras el rebote.",
      "Comprueba en la tabla si el momento horizontal $P_x$ se conservó y si la energía cinética total $E_c$ es idéntica antes y después.",
      "**Parte 2 (Choque Inelástico)**: cambia la restitución a $e = 0.50$ y repite el ensayo. Calcula en tu reporte la fracción de energía cinética disipada.",
      "**Parte 3 (Masas desiguales)**: configura $m_A = 2.0\\text{ kg}$ y $m_B = 0.5\\text{ kg}$ con $e = 1.00$ y analiza el efecto de la inercia relativa en las velocidades resultantes.",
    ],

    columns: [
      { key: "t", label: "t", unit: "s" },
      { key: "phase", label: "Fase", unit: "" },
      { key: "vA", label: "vA", unit: "m/s" },
      { key: "vB", label: "vB", unit: "m/s" },
      { key: "px", label: "Px", unit: "kg·m/s" },
      { key: "py", label: "Py", unit: "kg·m/s" },
      { key: "p_mag", label: "|P|", unit: "kg·m/s" },
      { key: "dist", label: "Dist. A-B", unit: "m" },
      { key: "ke", label: "Ec", unit: "J" },
      { key: "delta_ke_pct", label: "ΔEc", unit: "%" },
    ],

    extractRow: (state, _chartData, physics) => {
      if (!state) return null;
      const cf = state._collision;
      if (!cf) return null;
      const t = +(state.t ?? 0);
      const sa = Math.hypot(cf.avx, cf.avy);
      const sb = Math.hypot(cf.bvx, cf.bvy);
      const px = cf.px_total;
      const py = cf.py_total;
      const p_mag = Math.hypot(px, py);
      const dist = Math.hypot(cf.ax - cf.bx, cf.ay - cf.by);
      const ke = 0.5 * cf.am * sa * sa + 0.5 * cf.bm * sb * sb;

      const rest = physics?.restitution ?? 1;
      const am = cf.am ?? physics?.mass_a ?? 1;
      const bm = cf.bm ?? physics?.mass_b ?? 1;
      const g = physics?.gravity ?? 0;

      // Identify phase
      const rSum = (physics?.radius_a ?? 0.2) + (physics?.radius_b ?? 0.2);
      let phase = "Vuelo";
      if (dist <= rSum + 0.05) {
        phase = "Contacto";
      } else if (cf.ax < cf.bx && cf.avx > cf.bvx) {
        phase = "Pre-colisión";
      } else {
        phase = "Post-colisión";
      }

      // Initial kinetic energy calculation for reference
      const avx0 = physics?.avx0 ?? 4;
      const avy0 = physics?.avy0 ?? 0;
      const bvx0 = physics?.bvx0 ?? 0;
      const bvy0 = physics?.bvy0 ?? 0;
      const ke0 = 0.5 * am * (avx0 * avx0 + avy0 * avy0) + 0.5 * bm * (bvx0 * bvx0 + bvy0 * bvy0);
      const delta_ke_pct = ke0 !== 0 ? ((ke - ke0) / ke0) * 100 : 0;

      const configTag = `e: ${rest.toFixed(2)} | mA: ${am.toFixed(1)} kg | mB: ${bm.toFixed(1)} kg | g: ${g.toFixed(1)} m/s²`;

      return {
        experiment: "collision",
        configTag,
        t: +t.toFixed(3),
        phase,
        vA: +sa.toFixed(3),
        vB: +sb.toFixed(3),
        px: +px.toFixed(3),
        py: +py.toFixed(3),
        p_mag: +p_mag.toFixed(3),
        dist: +dist.toFixed(3),
        ke: +ke.toFixed(3),
        delta_ke_pct: formatSignedPercent(delta_ke_pct),
      };
    },

    questions: [
      "**Problema 1 (Conservación del Momento Lineal Total):**\nCompara el momento lineal horizontal $P_x$ antes y después del impacto en tu tabla:\n$$P_x = m_A v_{Ax} + m_B v_{Bx}$$\n¿Cuál es la diferencia absoluta $|P_{x,\\text{final}} - P_{x,\\text{inicial}}|$? ¿Confirma la ley de conservación del momento lineal?",
      "**Problema 2 (Choque Elástico Frontal con Masas Iguales):**\nDemuestra analíticamente que en un choque elástico frontal unidimensional con $m_A = m_B$ y cuerpo B inicialmente en reposo, los cuerpos intercambian velocidades exactamente:\n$$v_A' = 0, \\quad v_B' = v_A$$\nCompara esta predicción teórica con los datos registrados en tu tabla experimental.",
      "**Problema 3 (Choque Inelástico y Pérdida Energética):**\nCon coeficiente de restitución $e = 0.50$, calcula la energía cinética disipada durante el impacto:\n$$\\Delta E_c = E_{c,\\text{final}} - E_{c,\\text{inicial}} < 0$$\n¿Qué porcentaje de la energía cinética inicial se disipó en calor y deformación permanente?",
      "**Problema 4 (Efecto de la Relación de Masas):**\nSi la masa incidente $m_A$ es mayor que $m_B$ (ej: $m_A = 2\\text{ kg}, m_B = 0.5\\text{ kg}$), analiza el movimiento posterior aplicando la relación:\n$$v_A' = \\frac{m_A - m_B}{m_A + m_B} v_A$$\n¿Continúa la masa A moviéndose hacia adelante tras el impacto? Explica qué ocurriría si $m_A < m_B$.",
      "**Problema 5 (Conservación del Momento en Dos Dimensiones):**\nSi la colisión fuese oblicua (con componentes en Y distintas de cero), explica cómo se aplica la conservación del momento por componentes vectoriales independientes:\n$$\\vec{P} = P_x \\hat{i} + P_y \\hat{j} = \\text{constante}$$\n¿Por qué la conservación en el eje horizontal es independiente de las fuerzas ocurridas en el eje vertical?",
    ],
  },
};
