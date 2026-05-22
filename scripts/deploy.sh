#!/usr/bin/env bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════
# Codex Platform — Deployment Script
# ────────────────────────────────────────────────────────────────
# Pushes latest code to VPS and rolls out new containers.
#
# Usage:
#   export DEPLOY_HOST=root@api.codex.dev
#   export DEPLOY_KEY_PATH=~/.ssh/id_rsa
#   ./scripts/deploy.sh [--skip-build] [--skip-migrations]
# ════════════════════════════════════════════════════════════════

# ── Colors ──────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()   { echo -e "${RED}[ERR]${NC}   $1"; }

# ── Configuration (override via env vars) ───────────────────────
: "${DEPLOY_HOST:=}"                    # e.g., root@api.codex.dev
: "${DEPLOY_KEY_PATH:=}"                # SSH private key path
: "${DEPLOY_PATH:=/opt/codex}"          # Remote repo path
: "${GIT_BRANCH:=main}"                 # Branch to deploy
: "${COMPOSE_FILE:=docker-compose.yml}" # Compose file relative to DEPLOY_PATH

SKIP_BUILD=false
SKIP_MIGRATIONS=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-build)      SKIP_BUILD=true;       shift ;;
    --skip-migrations) SKIP_MIGRATIONS=true;  shift ;;
    --help)
      echo "Usage: $0 [--skip-build] [--skip-migrations]"
      echo ""
      echo "Required env vars:"
      echo "  DEPLOY_HOST       SSH user@host (e.g., root@api.codex.dev)"
      echo "  DEPLOY_KEY_PATH   Path to SSH private key"
      exit 0 ;;
    *) err "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ -z "$DEPLOY_HOST" ]]; then
  err "DEPLOY_HOST is not set"
  echo "  export DEPLOY_HOST=root@api.codex.dev"
  exit 1
fi

SSH_OPTS="-o StrictHostKeyChecking=no -o LogLevel=ERROR"
if [[ -n "$DEPLOY_KEY_PATH" ]]; then
  SSH_OPTS="$SSH_OPTS -i $DEPLOY_KEY_PATH"
fi

# ── 1. Push latest code to GitHub ───────────────────────────────
info "Pushing latest code to GitHub..."
git push origin "$GIT_BRANCH"
ok "Code pushed to origin/$GIT_BRANCH"

# ── 2. Pull & rebuild on VPS ────────────────────────────────────
info "Connecting to $DEPLOY_HOST..."
ssh $SSH_OPTS "$DEPLOY_HOST" bash -s <<CMDEOF
  set -euo pipefail

  cd $DEPLOY_PATH

  echo "  [VPS] Pulling latest code..."
  git fetch origin
  git checkout $GIT_BRANCH
  git pull origin $GIT_BRANCH

  echo "  [VPS] Current commit: \$(git rev-parse --short HEAD)"

  if [ "$SKIP_BUILD" = false ]; then
    echo "  [VPS] Rebuilding and restarting containers..."

    # Recreate .env with fresh JWT if missing vars
    if [ ! -f .env ]; then
      echo "JWT_SECRET=\$(openssl rand -hex 32)" >> .env
    fi

    docker compose -f $COMPOSE_FILE pull
    docker compose -f $COMPOSE_FILE up -d --build --remove-orphans

    echo "  [VPS] Pruning old images..."
    docker image prune -f
  fi

  if [ "$SKIP_MIGRATIONS" = false ]; then
    echo "  [VPS] Running database migrations..."
    # Wait for api-gateway to be healthy, then run migrations
    sleep 3
    docker compose -f $COMPOSE_FILE exec -T api-gateway npx prisma migrate deploy
  fi

  echo "  [VPS] Deployment complete"
CMDEOF

ok "Deployment to $DEPLOY_HOST successful"

# ── 3. Verify health ────────────────────────────────────────────
HOST="${DEPLOY_HOST#*@}"  # strip user@
info "Verifying health at https://$HOST/health ..."
sleep 3

for i in {1..5}; do
  if curl -sf "https://$HOST/health" > /dev/null 2>&1; then
    ok "Health check passed (attempt $i)"
    break
  fi
  if [[ $i -eq 5 ]]; then
    warn "Health check did not pass after 5 attempts"
    warn "  Check manually: ssh $DEPLOY_HOST 'docker compose logs --tail=50'"
  fi
  sleep 2
done

info "Deployment complete! https://$HOST"
