demo:
<img width="1062" height="902" alt="image" src="https://github.com/user-attachments/assets/60d50dbb-eae2-4d7c-8c98-1865d12323d0" />

# Anomaly Lab 📈

An interactive playground for time-series anomaly detection. A synthetic sensor signal has a
trend, a seasonal cycle, noise and hidden spikes. Pick a detector, tune it, and watch precision,
recall and F1 change. Plain HTML/CSS/JS, no build step, no dependencies.

## Features

- Four detectors: **global z-score**, **rolling z-score**, **EWMA control chart**, **median residual (MAD)**
- Window, threshold and noise sliders; click the chart to add or remove a true spike
- Precision / recall / F1 against the injected spikes
- **Auto-tune threshold** picks the best F1 threshold for the current method
- **Compare methods**: F1 for every detector on the same signal
- CSV export, dark mode, installable offline PWA

## Run it

```bash
python3 -m http.server 8000   # open http://localhost:8000
npm test                      # unit tests for the detectors (Node 18+)
```

## Add a detector

Add a branch to `detect()` in `detectors.js` returning `{ score, lo, hi, mid, flagged }`,
add an `<option>` in `index.html`, and a test in `test/detectors.test.js`.

## Files

```
index.html  styles.css  script.js  detectors.js  sweep.js
test/detectors.test.js  package.json
pwa.js  sw.js  manifest.webmanifest  icon.svg
.github/workflows/{pages,test}.yml  CHANGELOG.md  LICENSE
```

## Ideas

- Seasonal-trend decomposition (STL) detector
- Upload your own CSV
- ROC-style precision/recall curve across thresholds
