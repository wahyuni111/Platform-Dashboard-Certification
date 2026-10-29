.PHONY: dev dev-py build clean frontend backend install

# Default target: jalankan fullstack development (Go + React Vite)
dev:
	@./dev.sh

# Jalankan fullstack development dengan Python FastAPI Backend
dev-py:
	@./dev.sh --py

# Install seluruh dependencies (Frontend npm)
install:
	@cd frontend && npm install

# Build production binary backend & frontend bundle
build:
	@echo "🔨 Building frontend Vite bundle..."
	@cd frontend && npm run build
	@echo "🔨 Building Golang backend binary..."
	@cd backend && go build -o server main.go
	@echo "✅ Build selesai!"

# Bersihkan build artifacts
clean:
	@rm -rf frontend/dist backend/server
	@echo "🧹 Clean selesai."
