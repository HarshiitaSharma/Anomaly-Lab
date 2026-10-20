// Pure detection and scoring functions. No DOM access, so they can be unit tested in Node.
(function (root) {
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) ** 2))) || 1e-9; };
  const median = a => { const s = [...a].sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

  // Returns { score, lo, hi, mid, flagged } for series x. Bands are null where undefined.
  function detect(method, x, w, thr) {
    const N = x.length, nul = () => new Array(N).fill(null);
    const score = new Array(N).fill(0), lo = nul(), hi = nul(), mid = nul();
    if (method === 'global') {
      const mu = mean(x), s = sd(x);
      for (let i = 0; i < N; i++) { score[i] = (x[i] - mu) / s; lo[i] = mu - thr * s; hi[i] = mu + thr * s; }
    } else if (method === 'rolling') {
      for (let i = w; i < N; i++) {
        const seg = x.slice(i - w, i), mu = mean(seg), s = Math.max(sd(seg), 1e-9);
        score[i] = (x[i] - mu) / s; lo[i] = mu - thr * s; hi[i] = mu + thr * s; mid[i] = mu;
      }
    } else if (method === 'ewma') {
      // Exponentially weighted mean/variance of past points. Updates use winsorized
      // residuals so a spike does not drag the baseline toward itself.
      const a = 2 / (w + 1), init = x.slice(0, w);
      let m = mean(init), v = sd(init) ** 2;
      for (let i = w; i < N; i++) {
        const s = Math.max(Math.sqrt(v), 1e-9), r = x[i] - m;
        score[i] = r / s; lo[i] = m - thr * s; hi[i] = m + thr * s; mid[i] = m;
        const c = Math.max(-thr * s, Math.min(thr * s, r));
        m += a * c; v = (1 - a) * v + a * c * c;
      }
    } else { // median residual (MAD)
      const h = w >> 1, med = x.map((_, i) => median(x.slice(Math.max(0, i - h), Math.min(N, i + h + 1))));
      const r = x.map((v, i) => v - med[i]), mr = median(r);
      const mad = Math.max(median(r.map(v => Math.abs(v - mr))), 1e-9);
      for (let i = 0; i < N; i++) {
        score[i] = .6745 * (r[i] - mr) / mad;
        const d = thr * mad / .6745; lo[i] = med[i] + mr - d; hi[i] = med[i] + mr + d; mid[i] = med[i];
      }
    }
    const flagged = []; for (let i = 0; i < N; i++) if (Math.abs(score[i]) > thr) flagged.push(i);
    return { score, lo, hi, mid, flagged };
  }

  // Precision/recall/F1. A flag is correct if within `tol` steps of a true index.
  function evaluate(flagged, truth, tol = 1) {
    const near = (list, i) => list.some(j => Math.abs(j - i) <= tol);
    const tp = flagged.filter(i => near(truth, i)).length, found = truth.filter(i => near(flagged, i)).length;
    const p = flagged.length ? tp / flagged.length : null, r = truth.length ? found / truth.length : null;
    const f1 = p && r ? 2 * p * r / (p + r) : (p === null || r === null ? null : 0);
    return { precision: p, recall: r, f1 };
  }

  // Threshold with the best F1 over a grid (ties go to the higher threshold, fewer false alarms).
  function bestThreshold(method, x, w, truth, from = 1.5, to = 6, step = .1) {
    let best = { thr: from, f1: -1 };
    for (let t = from; t <= to + 1e-9; t += step) {
      const f = evaluate(detect(method, x, w, t).flagged, truth).f1 ?? 0;
      if (f >= best.f1) best = { thr: Math.round(t * 10) / 10, f1: f };
    }
    return best;
  }

  const api = { mean, sd, median, detect, evaluate, bestThreshold };
  if (typeof module !== 'undefined') module.exports = api; else root.Detectors = api;
})(typeof window !== 'undefined' ? window : globalThis);
