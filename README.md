demo:
<img width="1062" height="902" alt="image" src="https://github.com/user-attachments/assets/60d50dbb-eae2-4d7c-8c98-1865d12323d0" />
# Anomaly Lab

An interactive playground for time-series anomaly detection, running entirely in the browser.

A synthetic sensor signal (seasonal cycle + slow trend + noise) hides a few injected spikes. Pick a detector, tune it, and watch precision, recall and F1 change live. Click the chart to add or remove a spike.

One static HTML file. No build step, no dependencies, no data leaves your browser.

## Detectors

- **Global z-score**: compares every point to the overall mean and spread.
- **Rolling z-score**: compares each point to the previous *window* points.
- **Median residual (MAD)**: subtracts a rolling median (a simple stand-in for STL-style decomposition) and scores the residual with a robust MAD-based z-score.

A flag counts as correct if it lands within one step of a true spike.

## Controls

Method, window size, threshold, noise level, **New signal**, and **Download CSV** (index, value, true spike, flagged, score).

## Run it

Open `index.html`, or host it with GitHub Pages (**Settings → Pages → Deploy from a branch → `main` / root**).

## Ideas for later

- Real STL decomposition and an EWMA detector
- Isolation Forest running in the browser
- Upload your own CSV time series
- Level-shift and drift anomalies, not just spikes
- Precision-recall curve across thresholds
