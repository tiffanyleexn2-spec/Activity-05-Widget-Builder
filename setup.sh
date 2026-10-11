#!/bin/bash
# W35 Activity 05 — Widget Builder
# Real public APIs: wttr.in, CoinGecko, Hacker News, DummyJSON. No keys.

if [ ! -f "index.html" ]; then
    echo "Run this script from the activity-05-widget-builder directory."
    exit 1
fi

if command -v python3 &> /dev/null; then
    echo "Starting server at http://localhost:8001"
    python3 -m http.server 8001
else
    echo "Python 3 not found. Use VS Code Live Server, npx serve, or any other static server."
fi
