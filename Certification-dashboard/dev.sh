#!/usr/bin/env bash
# ==============================================================================
# SIM-HALAL FATAYAT NU DESA MERSI - macOS & Linux Development Runner
# ==============================================================================
# Script ini menggantikan bat file Windows lama agar developer di MacBook
# dapat menjalankan Fullstack modern (Go/Python Backend + React Vite Tailwind)
# dengan 1-klik / 1-baris perintah!
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "============================================================"
echo "  SIM-HALAL FATAYAT NU DESA MERSI (SDUM 2026)"
echo "  Modern Tech Stack: React + Vite + Tailwind & Golang Backend"
echo "  Running on macOS / Darwin..."
echo "============================================================"

# Port definitions
BACKEND_PORT=8080
FRONTEND_PORT=5173

# Check for Python flag
USE_PYTHON=false
for arg in "$@"
do
  if [ "$arg" == "--py" ] || [ "$arg" == "--python" ]; then
    USE_PYTHON=true
  fi
done

# Cleanup function on Ctrl+C
cleanup() {
  echo ""
  echo "🛑 Menghentikan server backend dan frontend..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  echo "✅ Semua server telah dihentikan dengan aman."
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
if [ "$USE_PYTHON" = true ]; then
  echo "🐍 Menjalankan Python FastAPI Backend di port $BACKEND_PORT..."
  cd "$DIR/backend-py"
  python3 -m uvicorn main:app --reload --port $BACKEND_PORT &
  BACKEND_PID=$!
else
  echo "🐹 Menjalankan Golang Backend di port $BACKEND_PORT..."
  cd "$DIR/backend"
  go run main.go &
  BACKEND_PID=$!
fi

# Wait for backend to be ready
echo "⏳ Menunggu API backend aktif..."
for i in {1..10}; do
  if curl -s "http://localhost:$BACKEND_PORT/api/health" > /dev/null 2>&1; then
    echo "✅ Backend API siap di http://localhost:$BACKEND_PORT/api/health"
    break
  fi
  sleep 0.5
done

# 2. Start Frontend
echo "⚡ Menjalankan React + Vite + Tailwind Frontend di port $FRONTEND_PORT..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

# Wait briefly and open browser on macOS
sleep 1.5
if command -v open > /dev/null 2>&1; then
  echo "🌐 Membuka browser MacBook ke http://localhost:$FRONTEND_PORT..."
  open "http://localhost:$FRONTEND_PORT"
fi

echo "============================================================"
echo "🎉 APLIKASI AKTIF & SIAP DIGUNAKAN!"
echo "   - Frontend (React):  http://localhost:$FRONTEND_PORT"
echo "   - Backend (Go API):  http://localhost:$BACKEND_PORT"
echo "   Tekan [Ctrl + C] untuk berhenti."
echo "============================================================"

# Wait for background processes
wait
