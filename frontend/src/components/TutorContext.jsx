"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

const DEFAULT_API = "http://localhost:8000/api/tutor";

const TutorCtx = createContext(null);

export function TutorProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const [history, setHistory] = useState([]);

  const energyHistory = useRef([]);
  const HISTORY_MAX = 300;

  const pushEnergy = useCallback(totalEnergy => {
    energyHistory.current.push(totalEnergy);
    if (energyHistory.current.length > HISTORY_MAX) energyHistory.current.shift();

    const hist = energyHistory.current;
    if (hist.length > 60) {
      const old = hist[hist.length - 61];
      const now = hist.at(-1);
      const pct = old !== 0 ? Math.abs((now - old) / old) * 100 : 0;
      setPulse(p => (pct > 5 ? true : p));
    }
  }, []);

  const getTrend = useCallback(() => {
    const hist = energyHistory.current;
    if (hist.length < 2) return 0;
    const old = hist[Math.max(0, hist.length - 301)];
    const now = hist.at(-1);
    return old !== 0 ? ((now - old) / Math.abs(old)) * 100 : 0;
  }, []);

  const callAPI = useCallback(async payload => {
    const apiUrl = process.env.NEXT_PUBLIC_TUTOR_URL || DEFAULT_API;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(detail.detail || "Unknown error from tutor API");
    }
    return res.json();
  }, []);

  const askTutor = useCallback(
    ({ experiment, state, physicsParams, energy, isPaused, simTime }) => {
      if (loading) return;
      setLoading(true);
      setError(null);
      setPanelOpen(true);
      setPulse(false);
      setTimeout(async () => {
        const payload = {
          experiment,
          state: {
            position: state.position,
            velocity: state.velocity,
            mass: state.mass ?? 1,
            t: state.t ?? simTime,
          },
          physics_params: physicsParams,
          energy: {
            kinetic: energy.kinetic,
            potential: energy.potential,
            total: energy.total,
            total_trend: getTrend(),
          },
          is_paused: isPaused,
          sim_time: simTime,
          history: [],
          student_reply: null,
        };

        try {
          const data = await callAPI(payload);
          setHistory([{ role: "tutor", content: data.message, trigger: data.trigger }]);
          if (data.pulse) setPulse(true);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }, 0);
    },
    [loading, getTrend, callAPI]
  );

  const submitReply = useCallback(
    ({ reply, experiment, state, physicsParams, energy, simTime }) => {
      if (loading || !reply.trim()) return;
      setLoading(true);
      setError(null);

      setTimeout(async () => {
        const updatedHistory = [...history, { role: "student", content: reply }];
        setHistory(updatedHistory);

        const historyForAPI = updatedHistory.map(t => ({ role: t.role, content: t.content }));

        const payload = {
          experiment,
          state: {
            position: state.position,
            velocity: state.velocity,
            mass: state.mass ?? 1,
            t: state.t ?? simTime,
          },
          physics_params: physicsParams,
          energy: {
            kinetic: energy.kinetic,
            potential: energy.potential,
            total: energy.total,
            total_trend: getTrend(),
          },
          is_paused: false,
          sim_time: simTime,
          history: historyForAPI.slice(0, -1),
          student_reply: reply,
        };

        try {
          const data = await callAPI(payload);
          setHistory(prev => [...prev, { role: "tutor", content: data.message, trigger: data.trigger, verdict: data.verdict }]);
        } catch (err) {
          setError(err.message);
          setHistory(history);
        } finally {
          setLoading(false);
        }
      }, 0);
    },
    [loading, history, getTrend, callAPI]
  );

  const clearHistory = useCallback(() => setHistory([]), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const dismissPulse = useCallback(() => setPulse(false), []);

  return (
    <TutorCtx.Provider
      value={{
        loading,
        error,
        pulse,
        panelOpen,
        history,
        askTutor,
        submitReply,
        pushEnergy,
        clearHistory,
        closePanel,
        dismissPulse,
      }}
    >
      {children}
    </TutorCtx.Provider>
  );
}

export function useTutor() {
  const ctx = useContext(TutorCtx);
  if (!ctx) throw new Error("useTutor must be used inside <TutorProvider>");
  return ctx;
}
