#!/usr/bin/env bash
# From a folder containing these files. One commit per piece.
set -e
git init -q 2>/dev/null || true
c() { m="$1"; shift; git add "$@" && git commit -q -m "$m"; echo "✓ $m"; }
c "Add .gitignore and MIT license"                  .gitignore LICENSE
c "Add detection and scoring module"                detectors.js package.json
c "Add detector unit tests"                         test/detectors.test.js
c "Add CI workflow for tests"                       .github/workflows/test.yml
c "Add styles"                                      styles.css
c "Add UI, signal generator and chart"              script.js
c "Add auto-tune and method comparison"             sweep.js
c "Add app icon"                                    icon.svg
c "Add page shell"                                  index.html
c "Add PWA manifest and offline service worker"     manifest.webmanifest sw.js pwa.js
c "Add GitHub Pages deploy workflow"                .github/workflows/pages.yml
c "Add changelog"                                   CHANGELOG.md
c "Add README"                                      README.md
git log --oneline | head -14
