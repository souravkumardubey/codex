# Codex Platform — System Architecture

## System Design Diagram

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'background': '#ffffff',
    'primaryColor': '#1a1a2e',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#1a1a2e',
    'lineColor': '#64748b',
    'secondaryColor': '#f8fafc',
    'tertiaryColor': '#e2e8f0',
    'fontSize': '13px',
    'fontFamily': 'Inter, system-ui, -apple-system, sans-serif'
  }
}}%%

graph TB

  classDef client fill:#3b82f6,color:#fff,stroke:#2563eb,stroke-width:2px
  classDef edge fill:#f59e0b,color:#fff,stroke:#d97706,stroke-width:2px
  classDef gateway fill:#14b8a6,color:#fff,stroke:#0d9488,stroke-width:2px
  classDef queue fill:#ef4444,color:#fff,stroke:#dc2626,stroke-width:2px
  classDef worker fill:#8b5cf6,color:#fff,stroke:#7c3aed,stroke-width:2px
  classDef sandbox fill:#a78bfa,color:#fff,stroke:#8b5cf6,stroke-width:2px,stroke-dasharray:3
  classDef storage fill:#22c55e,color:#fff,stroke:#16a34a,stroke-width:2px
  classDef monitor fill:#eab308,color:#1a1a2e,stroke:#ca8a04,stroke-width:2px
  classDef deploy fill:#64748b,color:#fff,stroke:#475569,stroke-width:2px

  %% ───────────────── CLIENT ─────────────────
  subgraph Client["CLIENT LAYER"]
    direction LR

    B1["Next.js Frontend<br/>React + Monaco Editor"]:::client
    B2["Auth Pages<br/>Login / Register"]:::client
    B3["Collab UI<br/>Real-time Rooms"]:::client

    B1 --- B2
    B2 --- B3
  end

  %% ───────────────── EDGE ─────────────────
  subgraph Edge["EDGE & REVERSE PROXY"]
    Nginx["Nginx<br/>SSL Termination · Rate Limiting"]:::edge
  end

  %% ───────────────── GATEWAY ─────────────────
  subgraph Gateway["GATEWAY LAYER"]
    direction LR

    API["API Gateway<br/>NestJS · Port 4000<br/>REST · Auth · Validation"]:::gateway

    WS["WS Gateway<br/>Socket.IO · Port 4002<br/>Streaming · Presence"]:::gateway
  end

  %% ───────────────── QUEUE ─────────────────
  subgraph Queue["MESSAGE QUEUE"]
    Redis["Redis 7<br/>BullMQ Job Queue<br/>Pub/Sub · Session Cache"]:::queue
  end

  %% ───────────────── WORKERS ─────────────────
  subgraph Workers["WORKER LAYER"]
    W1["Worker<br/>BullMQ Consumer<br/>Docker Sandbox Orchestrator"]:::worker
  end

  %% ───────────────── SANDBOX ─────────────────
  subgraph Sandbox["SANDBOX IMAGES"]
    P["codex-python"]:::sandbox
    N["codex-node"]:::sandbox
    G["codex-go"]:::sandbox
    J["codex-java"]:::sandbox
    C["codex-cpp"]:::sandbox
    R["codex-rust"]:::sandbox
  end

  %% ───────────────── STORAGE ─────────────────
  subgraph Storage["DATA LAYER"]
    PG[("PostgreSQL 16<br/>Prisma ORM")]:::storage
  end

  %% ───────────────── MONITORING ─────────────────
  subgraph Monitoring["MONITORING"]
    Prom["Prometheus<br/>Metrics Collection"]:::monitor
    Graf["Grafana<br/>Dashboards"]:::monitor
  end

  %% ───────────────── CI/CD ─────────────────
  subgraph CICD["DEPLOYMENT & CI/CD"]
    Vercel["Vercel<br/>Frontend Hosting"]:::deploy
    VPS["VPS · Docker Compose<br/>Backend Services"]:::deploy
    GHActions["GitHub Actions<br/>Lint → Test → Build → Deploy"]:::deploy
  end

  %% ───────────────── FLOW ─────────────────

  B1 -->|"HTTPS :443"| Nginx

  Nginx -->|"/api/*"| API
  Nginx -->|"/socket.io/*"| WS

  API -->|"Auth / CRUD"| PG
  API -->|"Enqueue Job"| Redis
  API -->|"Metrics"| Prom

  WS -->|"Subscribe"| Redis
  WS -->|"Validate Token"| API

  Redis -->|"Dequeue"| W1

  W1 -->|"Publish Result"| Redis
  W1 -->|"Persist Result"| PG

  W1 -.->|"Spawn Container"| P
  W1 -.->|"Spawn Container"| N
  W1 -.->|"Spawn Container"| G
  W1 -.->|"Spawn Container"| J
  W1 -.->|"Spawn Container"| C
  W1 -.->|"Spawn Container"| R

  Prom -->|"Visualize"| Graf

  GHActions -->|"Deploy Frontend"| Vercel
  GHActions -->|"Deploy Backend"| VPS

  Vercel -.->|"API Calls"| Nginx
```

## Execution Flow

```mermaid
%%{init: { 'theme': 'base', 'themeVariables': { 'fontSize': '13px' }}}%%

sequenceDiagram
    participant Browser as Browser (Monaco)
    participant Nginx as Nginx
    participant API as API Gateway
    participant Redis as Redis (BullMQ)
    participant Worker as Worker
    participant Sandbox as Docker Sandbox
    participant DB as PostgreSQL
    participant WS as WS Gateway

    Browser->>Nginx: POST /api/executions
    Nginx->>API: Forward Request
    API->>API: Validate Input & Auth
    API->>Redis: Enqueue Job
    API-->>Browser: 202 Accepted (executionId)

    Redis->>Worker: Dequeue Job
    Worker->>Sandbox: Create Docker Container
    Sandbox-->>Worker: Container Running

    Worker->>Worker: Execute Code (resource-limited)
    Sandbox-->>Worker: stdout/stderr Stream

    loop Every 100ms
        Worker->>Redis: Publish Execution Log
        Redis->>WS: Forward Log Event
        WS-->>Browser: WebSocket Push (execution:log)
    end

    Worker->>Sandbox: Terminate Container
    Sandbox-->>Worker: Exit Code + Stats
    Worker->>DB: Save Final Result
    Worker->>Redis: Publish Completed Event
    Redis->>WS: Forward Completion
    WS-->>Browser: execution:completed
    Browser->>Browser: Render Result
```

## Diagrams (Editable)

| File | Description | Tool |
|------|-------------|------|
| `docs/architecture.svg` | Rendered SVG system diagram | View in any browser |
| `docs/architecture.drawio` | Editable diagram with shape library | Open at [app.diagrams.net](https://app.diagrams.net) |

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **API + WS split** | REST and WebSocket scale independently; WS connections are long-lived, REST is request/response |
| **BullMQ on Redis** | Redis already serves caching + Pub/Sub; BullMQ adds zero-infra job queue with retries, delays, DLQ |
| **Docker sandbox per execution** | Process-level isolation isn't sufficient for untrusted code; each execution gets a fresh container with `--network none`, read-only FS, no capabilities |
| **Nginx reverse proxy** | Single entry point with SSL termination, route-based splitting (`/api/*` → API, `/socket.io/*` → WS); backend services stay on internal network |
| **Prisma ORM** | Type-safe database client generated from schema; auto-migrations, joins, and nested queries reduce boilerplate |
| **Monorepo (Turbo)** | Shared types across frontend/backend; single `npm test` / `npm run lint` for all packages; coordinated versioning |
| **GHCR for images** | Build once in CI, push to registry; VPS pulls pre-built images instead of building on the server (faster deploys, no build deps on VPS) |
| **Vercel + VPS split** | Frontend on Vercel Edge network (fast global CDN, free tier); backend on VPS for Docker access (can't run Docker on Vercel) |

## Capacity Planning

| Service | CPU | Memory | Replicas | Storage |
|---------|-----|--------|----------|---------|
| Nginx | 0.1 | 128 MB | 1 | — |
| API Gateway | 0.5 | 512 MB | 1 | — |
| WS Gateway | 0.5 | 512 MB | 1 | — |
| Worker | 1.0 | 1 GB | 2 | — |
| PostgreSQL | 1.0 | 1 GB | 1 | 10 GB |
| Redis | 0.5 | 256 MB | 1 | — |
| Prometheus | 0.3 | 512 MB | 1 | 5 GB |
| Grafana | 0.2 | 256 MB | 1 | — |
| **Total** | **~4.1** | **~4.2 GB** | **9** | **15 GB** |
