export function buildDefaults(defs) {
  const out = {};
  Object.entries(defs).forEach(([exp, arr]) => {
    out[exp] = {};
    arr.forEach(d => {
      out[exp][d.key] = d.default;
    });
  });
  return out;
}

export function w2s(wx, wy, origin, scale) {
  return [origin[0] + wx * scale, origin[1] - wy * scale];
}

export function mag(vx, vy) {
  return Math.sqrt(vx * vx + vy * vy);
}

export function clampNum(v, mn, mx) {
  const n = parseFloat(v);
  return Number.isNaN(n) ? mn : Math.max(mn, Math.min(mx, n));
}

export function pickNice(approx) {
  const nice = [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  return nice.find(v => v >= approx) || 100;
}

export function movingAvg(arr, win = 30) {
  return arr.map((_, i) => {
    const lo = Math.max(0, i - win + 1);
    let s = 0;
    for (let j = lo; j <= i; j += 1) s += arr[j];
    return s / (i - lo + 1);
  });
}
