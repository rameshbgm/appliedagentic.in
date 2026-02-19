#!/usr/bin/env bash
set -euo pipefail

# kill-ports.sh — kills processes listening on specified TCP ports (macOS / Linux)
# Usage: ./scripts/kill-ports.sh [port ...]
# If no ports are provided, defaults to 3000 and 3001.

ports=(3000 3001)
if [ "$#" -gt 0 ]; then
  ports=()
  for p in "$@"; do
    ports+=("$p")
  done
fi

for p in "${ports[@]}"; do
  echo "Checking port $p..."
  # lsof -t returns PIDs only; -sTCP:LISTEN filters listening TCP sockets
  pids=$(lsof -t -iTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)
  if [ -z "${pids}" ]; then
    echo "  No process listening on port $p"
    continue
  fi
  echo "  Found PIDs on port $p: ${pids}"
  for pid in ${pids}; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "  Stopping PID $pid (TERM)..."
      kill "$pid" || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        echo "  PID $pid still running; sending KILL..."
        kill -9 "$pid" || true
      else
        echo "  PID $pid stopped"
      fi
    else
      echo "  PID $pid not running"
    fi
  done
done

echo "Done."
