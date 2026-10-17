from __future__ import annotations

import math
import sys
import numpy as np
from scipy.special import ellipk

from backend.app.core.state import State, Vec2
from backend.app.core.engines import VerletEngine, RK4Engine
from backend.app.experiments.projectile import ProjectileForce
from backend.app.experiments.spring import SpringForce
from backend.app.experiments.pendulum import PendulumODE
from backend.app.experiments.double_pendulum import DoublePendulumODE
from backend.app.experiments.collision import TwoBodyCollision

RESULTS = []


def check(name: str, metric: float, threshold: float, detail: str = "",
          comparator: str = "abs_le") -> bool:
    """Registra y evalúa una condición de prueba respecto a un umbral permisible."""
    if comparator == "abs_le":
        passed = np.isfinite(metric) and abs(metric) <= threshold
    elif comparator == "le":
        passed = np.isfinite(metric) and metric <= threshold
    else:
        raise ValueError(comparator)

    RESULTS.append(dict(name=name, metric=metric, threshold=threshold,
                         passed=passed, detail=detail))
    tag = "PASA" if passed else "FALLA"
    print(f"  [{tag:5}] {name:<38} valor={metric: .3e}  umbral={threshold: .3e}  {detail}")
    return passed


def section(title: str):
    print(f"\n{'='*78}\n{title}\n{'='*78}")


def rmse(a: np.ndarray, b: np.ndarray) -> float:
    """Calcula el Error Cuadrático Medio entre la serie simulada y la analítica."""
    n = min(len(a), len(b))
    return float(np.sqrt(np.mean((a[:n] - b[:n]) ** 2)))


def rel_drift(series: np.ndarray) -> float:
    """Calcula la deriva relativa máxima respecto al valor inicial para validar invariantes."""
    s0 = series[0]
    if abs(s0) < 1e-12:
        return float(np.max(np.abs(series - s0)))
    return float(np.max(np.abs((series - s0) / s0)))


def test_projectile():
    section("TEST 1: PROYECTIL vs Cinemática Analítica Exacta")

    # Caso A: Sin rozamiento (Verificación contra Cinemática Clásica)
    mass_p1, x0_p1, y0_p1 = 1.0, 0.0, 0.0
    vx0_p1, vy0_p1, g_p1 = 30.0, 25.0, 9.81
    dt_p1 = 1.0 / 60.0

    engine = VerletEngine(
        State(Vec2(x0_p1, y0_p1), Vec2(vx0_p1, vy0_p1), mass_p1),
        ProjectileForce(gravity=g_p1, drag_coeff=0.0),
    )

    t_p1, x_p1, y_p1 = [0.0], [x0_p1], [y0_p1]
    t_cur = 0.0
    for _ in range(400):
        s = engine.step(dt_p1)
        t_cur += dt_p1
        t_p1.append(t_cur)
        x_p1.append(s.position.x)
        y_p1.append(s.position.y)
        if s.position.y <= 0 and t_cur > 0.1:
            break

    t_p1, x_p1, y_p1 = np.array(t_p1), np.array(x_p1), np.array(y_p1)
    x_an_p1 = x0_p1 + vx0_p1 * t_p1
    y_an_p1 = y0_p1 + vy0_p1 * t_p1 - 0.5 * g_p1 * t_p1 ** 2

    check("sin_drag_x_vs_analitico", rmse(x_p1, x_an_p1), 1e-6, "Posición X, RMSE contra x0 + vx0*t")
    check("sin_drag_y_vs_analitico", rmse(y_p1, y_an_p1), 1e-6, "Posición Y, RMSE contra y0 + vy0*t - 0.5*g*t^2")

    t_vuelo_an_p1 = 2.0 * vy0_p1 / g_p1
    check("sin_drag_tiempo_vuelo", abs(t_p1[-1] - t_vuelo_an_p1), 0.02,
          f"Analítico={t_vuelo_an_p1:.4f}s | Simulado={t_p1[-1]:.4f}s")

    # Caso B: Con rozamiento lineal (Verificación contra EDO con Drag)
    mass_p2, x0_p2, y0_p2 = 1.0, 0.0, 0.0
    vx0_p2, vy0_p2, g_p2, b_p2 = 20.0, 18.0, 9.81, 0.25
    dt_p2 = 1.0 / 120.0

    engine2 = VerletEngine(
        State(Vec2(x0_p2, y0_p2), Vec2(vx0_p2, vy0_p2), mass_p2),
        ProjectileForce(gravity=g_p2, drag_coeff=b_p2),
    )

    t_p2, x_p2, y_p2 = [0.0], [x0_p2], [y0_p2]
    t_cur2 = 0.0
    for _ in range(600):
        s = engine2.step(dt_p2)
        t_cur2 += dt_p2
        t_p2.append(t_cur2)
        x_p2.append(s.position.x)
        y_p2.append(s.position.y)
        if s.position.y <= 0 and t_cur2 > 0.1:
            break

    t_p2, x_p2, y_p2 = np.array(t_p2), np.array(x_p2), np.array(y_p2)

    m_over_b = mass_p2 / b_p2
    mg_over_b = mass_p2 * g_p2 / b_p2
    x_an_p2 = m_over_b * vx0_p2 * (1 - np.exp(-b_p2 * t_p2 / mass_p2))
    y_an_p2 = m_over_b * (vy0_p2 + mg_over_b) * (1 - np.exp(-b_p2 * t_p2 / mass_p2)) - mg_over_b * t_p2

    check("con_drag_x_vs_analitico", rmse(x_p2, x_an_p2), 0.05, "Posición X con drag lineal")
    check("con_drag_y_vs_analitico", rmse(y_p2, y_an_p2), 0.05, "Posición Y con drag lineal")


def test_spring():
    section("TEST 2: RESORTE vs Oscilador Armónico (Simple y Amortiguado)")

    # Caso A: Movimiento Armónico Simple (Sin amortiguamiento)
    mass_s1, k_s1, rest_len_s1 = 1.0, 20.0, 1.0
    x0_s1, y0_s1 = 2.0, 0.0
    dt_s1 = 1.0 / 60.0

    engine = VerletEngine(
        State(Vec2(x0_s1, y0_s1), Vec2(0.0, 0.0), mass_s1),
        SpringForce(k=k_s1, damping=0.0, anchor=Vec2(0, 0), rest_length=rest_len_s1),
    )

    omega_n_s1 = math.sqrt(k_s1 / mass_s1)
    disp0_s1 = x0_s1 - rest_len_s1

    t_s1, x_s1 = [0.0], [x0_s1]
    t_cur = 0.0
    for _ in range(600):
        s = engine.step(dt_s1)
        t_cur += dt_s1
        t_s1.append(t_cur)
        x_s1.append(s.position.x)
    t_s1, x_s1 = np.array(t_s1), np.array(x_s1)

    x_an_s1 = rest_len_s1 + disp0_s1 * np.cos(omega_n_s1 * t_s1)
    check("mas_sin_damping_vs_analitico", rmse(x_s1, x_an_s1), 0.01, f"omega_n={omega_n_s1:.4f} rad/s")

    # Caso B: Oscilador Subamortiguado
    mass_s2, k_s2, c_s2, rest_len_s2 = 1.0, 15.0, 0.4, 1.0
    x0_s2, y0_s2 = 2.0, 0.0
    dt_s2 = 1.0 / 60.0

    omega0_s2 = math.sqrt(k_s2 / mass_s2)
    gamma_s2 = c_s2 / (2 * mass_s2)
    assert gamma_s2 < omega0_s2, "El caso debe ser subamortiguado"
    omega_d_s2 = math.sqrt(omega0_s2 ** 2 - gamma_s2 ** 2)
    disp0_s2 = x0_s2 - rest_len_s2

    engine2 = VerletEngine(
        State(Vec2(x0_s2, y0_s2), Vec2(0.0, 0.0), mass_s2),
        SpringForce(k=k_s2, damping=c_s2, anchor=Vec2(0, 0), rest_length=rest_len_s2),
    )

    # CORREGIDO: ahora se registra también la velocidad SIMULADA (no solo posición),
    # para poder calcular la energía a partir de datos reales del motor, no de la fórmula analítica.
    t_s2, x_s2, vx_s2 = [0.0], [x0_s2], [0.0]
    t_cur2 = 0.0
    for _ in range(600):
        s = engine2.step(dt_s2)
        t_cur2 += dt_s2
        t_s2.append(t_cur2)
        x_s2.append(s.position.x)
        vx_s2.append(s.velocity.x)  # requiere que el motor exponga la velocidad del estado
    t_s2, x_s2, vx_s2 = np.array(t_s2), np.array(x_s2), np.array(vx_s2)

    disp_an_s2 = disp0_s2 * np.exp(-gamma_s2 * t_s2) * (
        np.cos(omega_d_s2 * t_s2) + (gamma_s2 / omega_d_s2) * np.sin(omega_d_s2 * t_s2)
    )
    x_an_s2 = rest_len_s2 + disp_an_s2

    check("amortiguado_vs_analitico", rmse(x_s2, x_an_s2), 0.03,
          f"omega0={omega0_s2:.3f} gamma={gamma_s2:.3f} omega_d={omega_d_s2:.3f}")

    # --- CORREGIDO: energía mecánica calculada con posición y velocidad SIMULADAS ---
    disp_sim_s2 = x_s2 - rest_len_s2
    KE_s2 = 0.5 * mass_s2 * vx_s2 ** 2
    PE_s2 = 0.5 * k_s2 * disp_sim_s2 ** 2
    E_total_s2 = KE_s2 + PE_s2

    window = max(int(2 * math.pi / omega0_s2 / dt_s2 / 4), 5)
    envelope = np.array([
        E_total_s2[max(0, i - window):i + window + 1].max()
        for i in range(len(E_total_s2))
    ])
    max_increase = float(np.max(np.diff(envelope))) if len(envelope) > 1 else 0.0
    check("amortiguado_energia_no_crece", max_increase, 1e-3,
          "Envolvente de energía SIMULADA debe decrecer de forma monótona", comparator="le")

    # --- NUEVO: la tasa de decaimiento medida debe coincidir con gamma analítico ---
    # E(t) ~ E0 * exp(-2*gamma*t)  =>  log(E(t)) es lineal en t con pendiente -2*gamma
    mask = envelope > 1e-8
    if np.sum(mask) > 10:
        slope, _ = np.polyfit(t_s2[mask], np.log(envelope[mask]), 1)
        gamma_medido = -slope / 2.0
        check("amortiguado_gamma_medido_vs_analitico", abs(gamma_medido - gamma_s2), 0.02,
              f"gamma_analitico={gamma_s2:.4f} | gamma_medido={gamma_medido:.4f}")
    else:
        check("amortiguado_gamma_medido_vs_analitico", float("inf"), 0.02,
              "Envolvente insuficiente para ajustar la tasa de decaimiento")


def test_pendulum():
    section("TEST 3: PÉNDULO (Grandes Ángulos) vs Integral Elíptica")

    mass_pe, g_pe, L_pe = 1.0, 9.81, 1.5
    dt_pe = 1.0 / 240.0

    for angle0_deg in (10.0, 45.0, 90.0, 150.0):
        theta0_pe = math.radians(angle0_deg)
        ode = PendulumODE(length=L_pe, gravity=g_pe, damping=0.0, mass=mass_pe, theta0=theta0_pe, omega0=0.0)
        engine = RK4Engine(model=ode)

        t_pe, theta_pe = [0.0], [theta0_pe]
        t_cur = 0.0
        n_steps = int(20.0 / dt_pe)
        for _ in range(n_steps):
            engine.step(dt_pe)
            t_cur += dt_pe
            t_pe.append(t_cur)
            theta_pe.append(engine.y[0])

        t_pe, theta_pe = np.array(t_pe), np.array(theta_pe)

        # Cálculo del período simulado mediante cruces por cero
        signs = np.sign(theta_pe)
        crossings = np.where(np.diff(signs) != 0)[0]
        if len(crossings) >= 3:
            cross_times = []
            for i in crossings:
                t0, t1 = t_pe[i], t_pe[i + 1]
                th0, th1 = theta_pe[i], theta_pe[i + 1]
                tc = t0 - th0 * (t1 - t0) / (th1 - th0) if th1 != th0 else t0
                cross_times.append(tc)
            T_medido = float(np.mean(2.0 * np.diff(cross_times)))
        else:
            T_medido = float("nan")

        # Período exacto no lineal usando Integral Elíptica
        k_ellip = math.sin(theta0_pe / 2.0)
        T_analitico = 4.0 * math.sqrt(L_pe / g_pe) * float(ellipk(k_ellip ** 2))

        check(f"periodo_angulo0={angle0_deg:.0f}deg",
              abs(T_medido - T_analitico) if np.isfinite(T_medido) else float("inf"),
              0.01, f"Analítico(Elíptica)={T_analitico:.4f}s | Medido={T_medido:.4f}s")

    # Conservación de energía en movimiento no lineal
    theta0_e = math.radians(80.0)
    ode_e = PendulumODE(length=L_pe, gravity=g_pe, damping=0.0, mass=mass_pe, theta0=theta0_e, omega0=0.0)
    engine_e = RK4Engine(model=ode_e)
    E_series = []
    for _ in range(int(15.0 / dt_pe)):
        engine_e.step(dt_pe)
        theta_i, omega_i = engine_e.y[0], engine_e.y[1]
        E_i = 0.5 * mass_pe * L_pe ** 2 * omega_i ** 2 + mass_pe * g_pe * L_pe * (1 - math.cos(theta_i))
        E_series.append(E_i)

    check("energia_conservada_angulo_grande", rel_drift(np.array(E_series)), 1e-4, "Sin amortiguamiento: energía constante")


def test_double_pendulum():
    section("TEST 4: PÉNDULO DOBLE (Caótico) vs Invariantes Físicos")

    L1_dp, L2_dp = 1.0, 1.0
    m1_dp, m2_dp = 1.0, 1.0
    g_dp = 9.81
    theta1_0_dp, theta2_0_dp = math.radians(90.0), math.radians(20.0)
    dt_dp = 1.0 / 240.0

    # Conservación de energía total
    ode = DoublePendulumODE(length1=L1_dp, length2=L2_dp, mass1=m1_dp, mass2=m2_dp,
                             gravity=g_dp, damping=0.0,
                             theta1_0=theta1_0_dp, omega1_0=0.0,
                             theta2_0=theta2_0_dp, omega2_0=0.0)
    engine = RK4Engine(model=ode)
    E_series_dp = []
    for _ in range(int(15.0 / dt_dp)):
        engine.step(dt_dp)
        E_series_dp.append(ode.energies(engine.y)["te"])

    check("energia_conservada", rel_drift(np.array(E_series_dp)), 1e-4, "Conservación de energía total en sistema caótico")

    # Caso límite: Reducción a Péndulo Simple (L2 -> 0, m2 -> 0)
    L2_lim, m2_lim = 1e-4, 1e-4
    theta1_0_lim = math.radians(60.0)
    ode_lim = DoublePendulumODE(length1=L1_dp, length2=L2_lim, mass1=m1_dp, mass2=m2_lim,
                                 gravity=g_dp, damping=0.0,
                                 theta1_0=theta1_0_lim, omega1_0=0.0,
                                 theta2_0=0.0, omega2_0=0.0)
    engine_lim = RK4Engine(model=ode_lim)

    ode_simple = PendulumODE(length=L1_dp, gravity=g_dp, damping=0.0, mass=m1_dp, theta0=theta1_0_lim, omega0=0.0)
    engine_simple = RK4Engine(model=ode_simple)

    theta1_lim, theta1_simple = [], []
    for _ in range(int(8.0 / dt_dp)):
        engine_lim.step(dt_dp)
        engine_simple.step(dt_dp)
        theta1_lim.append(engine_lim.y[0])
        theta1_simple.append(engine_simple.y[0])

    check("caso_limite_reduce_a_pendulo_simple", rmse(np.array(theta1_lim), np.array(theta1_simple)), 0.02,
          "Coincidencia límite L2, m2 -> 0 con péndulo simple")

    # Monotonía del amortiguamiento
    ode_d = DoublePendulumODE(length1=L1_dp, length2=L2_dp, mass1=m1_dp, mass2=m2_dp,
                               gravity=g_dp, damping=0.3,
                               theta1_0=theta1_0_dp, omega1_0=0.0,
                               theta2_0=theta2_0_dp, omega2_0=0.0)
    engine_d = RK4Engine(model=ode_d)
    E_d_series = []
    for _ in range(int(20.0 / dt_dp)):
        engine_d.step(dt_dp)
        E_d_series.append(ode_d.energies(engine_d.y)["te"])

    max_increase_dp = float(np.max(np.diff(np.array(E_d_series))))
    check("con_damping_energia_no_crece", max_increase_dp, 1e-6, "Pérdida monótona de energía con amortiguamiento", comparator="le")


def test_collision():
    section("TEST 5: COLISIONES vs Conservación de Momento/Energía y Restitución")

    # Choque perfectamente elástico (e = 1.0)
    ma, mb = 1.0, 1.5
    sim = TwoBodyCollision(
        ax0=-3.0, ay0=0.0, avx0=4.0, avy0=0.0, am=ma, ar=0.3,
        bx0=3.0, by0=0.0, bvx0=-2.0, bvy0=0.0, bm=mb, br=0.3,
        gravity=0.0, drag=0.0, restitution=1.0, ground=False,
    )
    dt_c = 1.0 / 120.0
    avx0_inicial = 4.0
    px_series, E_series_c = [], []
    frame = None
    for _ in range(int(4.0 / dt_c)):
        frame = sim.step(dt_c)
        px = ma * frame.avx + mb * frame.bvx
        E = 0.5 * ma * (frame.avx ** 2 + frame.avy ** 2) + 0.5 * mb * (frame.bvx ** 2 + frame.bvy ** 2)
        px_series.append(px)
        E_series_c.append(E)

    # --- NUEVO: sanity check — si nunca hubo choque, las conservaciones de abajo
    # pasarían trivialmente (nada cambia) y no probarían nada. Se exige que avx
    # cambie de forma apreciable respecto al valor inicial.
    delta_avx = abs(frame.avx - avx0_inicial)
    assert delta_avx > 0.5, (
        f"No se detectó intercambio de velocidad apreciable en el choque elástico "
        f"(avx inicial={avx0_inicial}, final={frame.avx:.3f}). "
        f"Las pruebas de conservación siguientes no serían significativas."
    )

    check("elastico_momento_x_conservado", rel_drift(np.array(px_series)), 1e-6, "Conservación de momento lineal Px")
    check("elastico_energia_conservada", rel_drift(np.array(E_series_c)), 1e-6, "Conservación de energía cinética (e = 1)")

    # Coeficiente de restitución parcial (e = 0.6)
    e_test = 0.6
    sim2 = TwoBodyCollision(
        ax0=-2.0, ay0=0.0, avx0=3.0, avy0=0.0, am=1.0, ar=0.25,
        bx0=2.0, by0=0.0, bvx0=0.0, bvy0=0.0, bm=1.0, br=0.25,
        gravity=0.0, drag=0.0, restitution=e_test, ground=False,
    )
    dt_c2 = 1.0 / 500.0

    # --- CORREGIDO: vrel_before y vrel_after se miden ambos desde la simulación,
    # en vez de fijar a mano la velocidad relativa "antes" del choque.
    vrel_before = None
    vrel_after = None
    was_colliding = False

    for _ in range(int(2.0 / dt_c2)):
        frame2 = sim2.step(dt_c2)

        if not frame2.colliding and not was_colliding:
            # aún en vuelo libre: se sigue actualizando hasta el instante justo antes del contacto
            vrel_before = frame2.avx - frame2.bvx

        if was_colliding and not frame2.colliding:
            # el contacto acaba de terminar: primera lectura limpia post-choque
            vrel_after = frame2.avx - frame2.bvx
            break

        was_colliding = frame2.colliding

    if vrel_before is not None and vrel_after is not None:
        e_medido = abs(vrel_after) / abs(vrel_before)
        check("restitucion_coeficiente_medido", abs(e_medido - e_test), 0.05,
              f"vrel_antes(medido)={vrel_before:.3f} | Esperado e={e_test} | Medido e≈{e_medido:.3f}")
    else:
        check("restitucion_coeficiente_medido", float("inf"), 0.05,
              "No se detectó ciclo completo de colisión (before/after)")


def main():
    print("VERIFICACIÓN FÍSICA Y NUMÉRICA DEL LABORATORIO VIRTUAL (v2)\n")

    test_projectile()
    test_spring()
    test_pendulum()
    test_double_pendulum()
    test_collision()

    section("RESUMEN FINAL")
    n_pass = sum(1 for r in RESULTS if r["passed"])
    n_fail = sum(1 for r in RESULTS if not r["passed"])
    print(f"Total: {len(RESULTS)} tests | {n_pass} PASARON | {n_fail} FALLARON\n")

    if n_fail:
        print("Tests que fallaron:")
        for r in RESULTS:
            if not r["passed"]:
                print(f"  - {r['name']}: valor={r['metric']:.4e} > umbral={r['threshold']:.4e}")
    else:
        print("Todos los tests analíticos e invariantes físicos pasaron correctamente.")

    sys.exit(1) if n_fail else None


if __name__ == "__main__":
    main()