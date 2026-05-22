# Codex Platform

[![CI/CD Pipeline](https://github.com/souravkumardubey/codex/actions/workflows/ci.yml/badge.svg)](https://github.com/souravkumardubey/codex/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://codex.vercel.app)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker)](https://docs.docker.com/compose)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2014-000000?logo=nextdotjs)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A production-grade distributed code execution platform for securely running untrusted user code inside isolated Docker sandboxes with real-time streaming and collaborative editing.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://codex.vercel.app |
| API | https://api.codex.dev/api/v1 |
| WebSocket | wss://api.codex.dev/socket.io |
| Grafana | https://api.codex.dev:3001 (admin/admin123) |

## Architecture

```
┌──────────────────┐    ┌────────────────────────────────────────────────┐
│   Vercel         │    │            VPS (Docker Compose)                 │
│   (Frontend)     │    │                                                │
│                  │    │  ┌────────┐   ┌────────────┐   ┌───────────┐  │
│   Next.js 14     │──────▶│ Nginx  │──▶│ API Gateway│──▶│  Redis    │  │
│   Monaco Editor  │    │  │ (SSL)  │   │ (NestJS)   │   │ (BullMQ)  │  │
│   Socket.IO      │    │  └────────┘   └────────────┘   └─────┬─────┘  │
│   TailwindCSS    │    │       │                               │        │
│                  │    │       ▼                               ▼        │
│                  │    │  ┌────────────┐   ┌─────────────────────────┐ │
│                  │    │  │ WS Gateway │   │   Worker(s)             │ │
│                  │    │  │(Socket.IO) │   │   (BullMQ Consumer)     │ │
│                  │    │  └────────────┘   │   Docker Sandbox        │ │
│                  │    │                    │   Python/JS/Go/Java/   │ │
│                  │    │                    │   C++/Rust             │ │
│                  │    │                    └─────────────────────────┘ │
│                  │    └────────────────────────────────────────────────┘
│                  │                              │
│                  │                    ┌─────────┴─────────┐
│                  │                    │                   │
│                  │              ┌─────┴─────┐       ┌─────┴─────┐
│                  │              │PostgreSQL │       │ Prometheus │
│                  │              │           │       │ + Grafana │
│                  │              └───────────┘       └───────────┘
└──────────────────┘
```

## Tech Stack

### Backend
- **Runtime:** Node.js 20, TypeScript
- **Framework:** NestJS (modular, DI, clean architecture)
- **Database:** PostgreSQL 16, Prisma ORM
- **Cache/Queue:** Redis 7, BullMQ
- **Sandbox:** Docker, Dockerode SDK
- **Real-time:** Socket.IO
- **Auth:** JWT, bcrypt, Passport.js
- **Monitoring:** Prometheus, Grafana

### Frontend
- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** TailwindCSS, shadcn/ui
- **State:** Zustand, TanStack Query
- **Editor:** Monaco Editor
- **Real-time:** Socket.IO Client
- **Animation:** Framer Motion

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Reverse Proxy:** NGINX
- **CI/CD:** GitHub Actions → Vercel + VPS
- **Registry:** GitHub Container Registry (ghcr.io)
- **Monitoring:** Prometheus + Grafana

## Project Structure

```
codex-platform/
├── apps/
│   ├── api-gateway/          # NestJS REST API
│   ├── worker/               # BullMQ job processor
│   └── ws-gateway/           # Socket.IO server
├── libs/
│   ├── shared/               # Shared types/constants
│   ├── logger/               # Pino logger
│   ├── database/             # Prisma client
│   ├── queue/                # BullMQ setup
│   └── sandbox/              # Docker sandbox engine
├── frontend/                 # Next.js app
├── docker/                   # Dockerfiles & configs
├── k8s/                      # Kubernetes manifests
├── scripts/                  # Setup & deployment scripts
└── .github/workflows/        # CI/CD pipelines
```

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)

### Development Setup

```bash
# 1. Start infrastructure
docker compose up -d postgres redis

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Start development servers
npm run dev
```

### Using Make

```bash
make dev          # Start development
make build        # Build all packages
make test         # Run all tests
make docker-up    # Start all services
make docker-down  # Stop all services
make db-migrate   # Run migrations
make db-seed      # Seed database
```

### Docker Deployment

```bash
# Build and start all services
docker compose up -d --build

# Services:
# - API Gateway:     http://localhost:4000
# - WS Gateway:      http://localhost:4002
# - PostgreSQL:      localhost:5432
# - Redis:           localhost:6379
# - Nginx:           http://localhost:80
# - Prometheus:      http://localhost:9090
# - Grafana:         http://localhost:3001 (admin/admin123)
```

## Production Deployment

### VPS Setup (one-time)

```bash
# Provision a fresh Ubuntu VPS, then run:
sudo ./scripts/setup-vps.sh \
  --domain api.codex.dev \
  --email admin@example.com
```

This script will:
1. Install Docker and Docker Compose
2. Configure firewall (SSH, HTTP, HTTPS)
3. Clone the repository
4. Generate JWT secrets and .env file
5. Obtain SSL certificate via Let's Encrypt
6. Configure nginx with your domain
7. Start all services
8. Set up auto-renewal for SSL

### Deploy Updates

```bash
./scripts/deploy.sh
```

Or set up environment variables and let CI/CD handle it automatically:
- Push to `main` → GitHub Actions builds images → pushes to ghcr.io → deploys to VPS

### Required Secrets (GitHub → Settings → Secrets and variables → Actions)

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel team/org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g., `https://api.codex.dev/api/v1`) |
| `NEXT_PUBLIC_WS_URL` | Backend WS URL (e.g., `https://api.codex.dev`) |
| `VPS_HOST` | VPS IP or domain |
| `VPS_USER` | SSH username (usually `root`) |
| `VPS_SSH_KEY` | Private SSH key for VPS access |

## Features

### Code Execution
- Multi-language support (Python, JS, TS, Go, Java, C++, Rust)
- Docker-isolated sandboxed execution
- Resource limits (CPU, memory, processes)
- Network disabled for security
- Automatic container cleanup
- Real-time output streaming via WebSocket

### Authentication & Authorization
- JWT-based authentication
- Refresh token rotation
- Role-based access control (User/Admin)
- Secure password hashing (bcrypt, 12 rounds)

### Coding Challenges
- Built-in challenge library
- Test case management (visible + hidden)
- Submission scoring engine
- Leaderboard system

### Collaboration
- Real-time collaborative coding rooms
- Live editor synchronization
- Cursor position tracking
- In-room chat
- Presence indicators

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/auth/register | User registration |
| POST | /api/v1/auth/login | User login |
| POST | /api/v1/auth/refresh | Refresh token |
| GET | /api/v1/users/me | User profile |
| GET | /api/v1/users/me/stats | User statistics |
| POST | /api/v1/executions | Create execution |
| GET | /api/v1/executions/:id | Get execution |
| GET | /api/v1/challenges | List challenges |
| GET | /api/v1/challenges/:slug | Get challenge |
| POST | /api/v1/executions/challenge/:id | Submit solution |
| GET | /api/v1/challenges/:id/leaderboard | Get leaderboard |
| GET | /api/v1/health | Health check |

## Security

The platform implements defense-in-depth for executing untrusted code:

- **Docker Sandboxing:** Each execution runs in isolated container
- **Resource Limits:** CPU, memory, and process limits enforced
- **Network Isolation:** Containers run with `--network none`
- **Read-Only FS:** Root filesystem mounted read-only
- **No Privileges:** `--security-opt no-new-privileges`
- **Capability Drop:** All Linux capabilities dropped
- **PID Limits:** Maximum 50 processes per container
- **Auto Cleanup:** Containers and temp files removed after execution
- **Timeout Enforcement:** Hard execution timeout per language

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://codex:codex123@postgres:5432/codex

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Docker Sandbox
EXECUTION_TIMEOUT=30000
MAX_MEMORY=512m
MAX_CPU=1

# BullMQ
QUEUE_CONCURRENCY=5
QUEUE_RETRY_ATTEMPTS=3

# Deployment (Vercel)
NEXT_PUBLIC_API_URL=https://api.codex.dev/api/v1
NEXT_PUBLIC_WS_URL=https://api.codex.dev
```

## License

MIT
