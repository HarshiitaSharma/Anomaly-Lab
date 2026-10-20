// "Auto-tune" and "Compare methods": uses the true spikes to find the best threshold
// for the current method, and scores all methods side by side on the current signal.
(() => {
  const controls = document.querySelector('.controls');
  const tune = document.createElement('button');
  tune.textContent = 'Auto-tune threshold';
  controls.insertBefore(tune, document.getElementById('regen'));

  const card = document.createElement('section');
  card.className = 'panel';
  card.style.marginTop = '14px';
  card.innerHTML = '<div class="hint">Compare methods on this signal (current window and threshold)</div><div class="stats" id="cmp"></div>';
  document.querySelector('.chart').after(card);

  const NAMES = { global: 'Global z-score', rolling: 'Rolling z-score', ewma: 'EWMA', median: 'Median (MAD)' };

  function compare() {
    const w = +document.getElementById('win').value, thr = +document.getElementById('thr').value, t = truth();
    document.getElementById('cmp').innerHTML = Object.keys(NAMES).map(m => {
      const f1 = Detectors.evaluate(Detectors.detect(m, x, w, thr).flagged, t).f1;
      return `<div class="stat"><b>${f1 === null ? '-' : Math.round(f1 * 100) + '%'}</b><span>${NAMES[m]} F1</span></div>`;
    }).join('');
  }

  tune.addEventListener('click', () => {
    const t = truth();
    if (!t.length) return;
    const b = Detectors.bestThreshold(document.getElementById('method').value, x, +document.getElementById('win').value, t);
    const el = document.getElementById('thr');
    el.value = b.thr; update();
  });

  // update() is defined in script.js; refresh the comparison after every update.
  const base = update;
  update = function () { base(); compare(); };
  update();
})();
