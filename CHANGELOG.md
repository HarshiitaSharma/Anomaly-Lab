# Changelog

## Unreleased
- Detection math moved to `detectors.js` (pure, no DOM) with a Node test suite
- New EWMA control-chart detector
- "Auto-tune threshold" button and a side-by-side F1 comparison of all methods
- Split the single HTML file into `index.html`, `styles.css`, `script.js`
- Installable offline PWA, GitHub Pages workflow, GitHub Actions test workflow, MIT license

## 1.0.0
- Synthetic signal with trend, seasonality and spikes; global, rolling and median-residual detectors;
  precision, recall and F1; click to add or remove spikes; CSV export
