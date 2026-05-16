# Codex Platform

A production-grade Distributed Code Execution Platform for securely executing untrusted user code inside isolated Docker sandboxes with distributed workers.

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌─────────────┐
│  Client  │────▶│  API     │────▶│  BullMQ  │────▶│   Worker    │
│ (Next.js)│     │ Gateway  │     │  (Redis) │     │  (Docker)   │
└──────────┘     └──────────┘     └──────────┘     └──────┬──────┘
      │                                                    │
      │              ┌──────────────┐                      │
      └──────────────▶  WebSocket   │◀─────────────────────┘
                     │   Gateway    │
                     └──────────────┘
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
- **Orchestration:** Kubernetes manifests
- **Reverse Proxy:** NGINX
- **CI/CD:** GitHub Actions

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
├── prisma/                   # Schema & migrations
├── docker/                   # Dockerfiles & configs
├── k8s/                      # Kubernetes manifests
├── scripts/                  # Utility scripts
└── .github/                  # CI/CD workflows
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
docker-compose up -d postgres redis

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
docker-compose up -d --build

# Services:
# - API Gateway:     http://localhost:4000
# - WS Gateway:      http://localhost:4002
# - PostgreSQL:      localhost:5432
# - Redis:           localhost:6379
# - Prometheus:      http://localhost:9090
# - Grafana:         http://localhost:3001 (admin/admin123)
```

### Kubernetes Deployment

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/api-gateway/
kubectl apply -f k8s/worker/
kubectl apply -f k8s/ws-gateway/
kubectl apply -f k8s/monitoring/
```

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
- Session management

### Coding Challenges
- Built-in challenge library
- Test case management (visible + hidden)
- Submission scoring engine
- Leaderboard system
- Difficulty levels (Easy, Medium, Hard, Expert)

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
- **ULimits:** File descriptor and process limits
- **Auto Cleanup:** Containers and temp files removed after execution
- **Timeout Enforcement:** Hard execution timeout per language

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://codex:codex123@localhost:5432/codex

# Redis
REDIS_URL=redis://localhost:6379

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
```

## License

MIT
