import { useEffect, useRef } from "react";

export function useChartRanges(chartData, running, centerKeys, centerBase) {
  const ref = useRef({});
  useEffect(() => {
    if (running) ref.current = {};
  }, [running]);

  Object.entries(chartData).forEach(([key, val]) => {
    if (!val || typeof val !== "object") return;
    const arr = Array.isArray(val) ? val : [];
    if (arr.length === 0) return;
    const last = arr.at(-1);
    if (centerKeys?.has(key)) {
      const base = centerBase?.[key];
      if (base === undefined) return;
      const maxDev = arr.reduce((acc, v) => Math.max(acc, Math.abs(v - base)), 0);
      ref.current[key] = { min: base - maxDev, max: base + maxDev };
      return;
    }
    if (ref.current[key] === undefined) ref.current[key] = { min: last, max: last };
    else {
      ref.current[key].min = Math.min(ref.current[key].min, last);
      ref.current[key].max = Math.max(ref.current[key].max, last);
    }
  });

  return ref.current;
}
