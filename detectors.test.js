const test = require('node:test'), assert = require('node:assert');
const D = require('../detectors.js');

// Deterministic pseudo-noise (LCG) so tests are repeatable; roughly +/-3.
let seed = 12345;
const noise = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return (seed / 4294967296 - .5) * 6; };
const series = (n = 240, spikes = { 50: 30, 120: -30, 200: 35 }) => {
  seed = 12345;
  return Array.from({ length: n }, (_, i) => 50 + .05 * i + 12 * Math.sin(2 * Math.PI * i / 60) + noise() + (spikes[i] || 0));
};

test('median helpers', () => {
  assert.equal(D.median([3, 1, 2]), 2);
  assert.equal(D.median([4, 1, 3, 2]), 2.5);
});

test('evaluate: perfect, empty and tolerance cases', () => {
  assert.deepEqual(D.evaluate([5, 9], [5, 9]), { precision: 1, recall: 1, f1: 1 });
  assert.equal(D.evaluate([], [5]).precision, null);
  assert.equal(D.evaluate([6], [5]).recall, 1);      // within one step
  assert.equal(D.evaluate([8], [5]).f1, 0);          // too far
});

for (const method of ['median', 'rolling', 'ewma']) {
  test(`${method} finds large spikes in a noisy seasonal signal`, () => {
    const x = series(), truth = [50, 120, 200];
    const r = D.evaluate(D.detect(method, x, 15, 3.5).flagged, truth);
    assert.equal(r.recall, 1, method);
    assert.ok(r.precision >= 0.3, `${method} precision ${r.precision}`);
  });
}

test('median residual beats global z-score on a seasonal signal', () => {
  const x = series(), truth = [50, 120, 200];
  const g = D.evaluate(D.detect('global', x, 15, 3.5).flagged, truth).f1 ?? 0;
  const m = D.evaluate(D.detect('median', x, 15, 3.5).flagged, truth).f1 ?? 0;
  assert.ok(m > g, `median ${m} vs global ${g}`);
});

test('detect returns arrays of equal length', () => {
  const x = series(), r = D.detect('ewma', x, 15, 3);
  for (const k of ['score', 'lo', 'hi', 'mid']) assert.equal(r[k].length, x.length);
});

test('bestThreshold returns a value inside the grid with a good F1', () => {
  const x = series(), b = D.bestThreshold('median', x, 15, [50, 120, 200]);
  assert.ok(b.thr >= 1.5 && b.thr <= 6);
  assert.ok(b.f1 > 0.8);
});
