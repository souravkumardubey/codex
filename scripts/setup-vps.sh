#!/usr/bin/env bash
set -euo pipefail

# ════════════════════════════════════════════════════════════════
# Codex Platform — VPS Provisioning Script
# ────────────────────────────────────────────────────────────────
# Prerequisites:
#   - Fresh Ubuntu 22.04/24.04 VPS (DigitalOcean, Hostinger, etc.)
#   - Domain A-record pointing to VPS IP (e.g., api.codex.dev)
#   - Run as root or with sudo
#
# Usage:
#   chmod +x scripts/setup-vps.sh
#   sudo ./scripts/setup-vps.sh --domain api.codex.dev --email admin@example.com
# ════════════════════════════════════════════════════════════════

# ── Colors ──────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
err()   { echo -e "${RED}[ERR]${NC}   $1"; }

# ── Parse Arguments ─────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case $1 in
    --domain)  DOMAIN="$2";  shift 2 ;;
    --email)   EMAIL="$2";   shift 2 ;;
    --github-repo) REPO="$2"; shift 2 ;;
    --branch)  BRANCH="$2";  shift 2 ;;
    --help)    echo "Usage: $0 --domain <domain> --email <email> [--github-repo <repo>] [--branch <branch>]"
               exit 0 ;;
    *) err "Unknown option: $1"; exit 1 ;;
  esac
done

: "${DOMAIN:=}" "${EMAIL:=}" "${REPO:=souravkumardubey/codex}" "${BRANCH:=main}"

if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
  err "Both --domain and --email are required"
  echo "Usage: $0 --domain api.codex.dev --email admin@example.com"
  exit 1
fi

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Codex Platform — VPS Setup${NC}"
echo -e "${CYAN}  Domain: $DOMAIN${NC}"
echo -e "${CYAN}  Email:  $EMAIL${NC}"
echo -e "${CYAN}  Repo:   $REPO (branch: $BRANCH)${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

# ── 1. System Updates & Dependencies ────────────────────────────
info "Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq
ok "System packages updated"

info "Installing essential dependencies (curl, git, ufw, certbot)..."
apt-get install -y -qq curl git ufw certbot python3-certbot-nginx
ok "Essential dependencies installed"

# ── 2. Install Docker ───────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  info "Installing Docker..."
  curl -fsSL https://get.docker.com | bash
  systemctl enable --now docker
  ok "Docker installed and running"
else
  ok "Docker already installed ($(docker --version))"
fi

# ── 3. Install Docker Compose ───────────────────────────────────
if ! command -v docker-compose &>/dev/null && ! docker compose version &>/dev/null; then
  info "Installing Docker Compose..."
  DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker/cli-plugins}
  mkdir -p "$DOCKER_CONFIG"
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o "$DOCKER_CONFIG/docker-compose"
  chmod +x "$DOCKER_CONFIG/docker-compose"
  ok "Docker Compose installed"
else
  ok "Docker Compose already available"
fi

# ── 4. Firewall ─────────────────────────────────────────────────
info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ok "Firewall configured (SSH, HTTP, HTTPS)"

# ── 5. Clone / Pull Repository ──────────────────────────────────
if [[ -d /opt/codex ]]; then
  info "Repository already exists at /opt/codex — pulling latest..."
  cd /opt/codex
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  info "Cloning repository..."
  git clone --branch "$BRANCH" "https://github.com/$REPO.git" /opt/codex
fi
cd /opt/codex
ok "Repository at /opt/codex ($(git rev-parse --short HEAD))"

# ── 6. Create .env from template ────────────────────────────────
if [[ ! -f /opt/codex/.env ]]; then
  info "Creating .env file..."
  cat > /opt/codex/.env <<ENVEOF
# ── Database ──
DATABASE_URL=postgresql://codex:codex123@postgres:5432/codex?schema=public

# ── Redis ──
REDIS_URL=redis://redis:6379

# ── JWT ──
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# ── Execution Sandbox ──
EXECUTION_TIMEOUT=30000
MAX_MEMORY=512m
MAX_CPU=1
DOCKER_HOST=tcp://docker-socket-proxy:2375

# ── BullMQ ──
QUEUE_CONCURRENCY=5
QUEUE_RETRY_ATTEMPTS=3

# ── CORS (frontend URL for backend to allow) ──
CORS_ORIGIN=https://codex.vercel.app

# ── Domain (used by nginx setup) ──
DOMAIN=$DOMAIN
ENVEOF
  echo "  JWT_SECRET generated: ${JWT_SECRET:0:16}..."
  ok ".env file created at /opt/codex/.env"
else
  ok ".env already exists"
fi

# ── 7. Let's Encrypt SSL Certificate ────────────────────────────
info "Obtaining SSL certificate for $DOMAIN..."
certbot --nginx \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --domains "$DOMAIN" \
  --redirect || warn "certbot failed — you may need to run it manually"
ok "SSL certificate configured"

# ── 8. Update nginx.conf with real domain ───────────────────────
info "Configuring nginx server_name..."
sed -i "s/server_name codex.dev;/server_name $DOMAIN;/g" /opt/codex/docker/nginx.conf
sed -i "s|ssl_certificate /etc/nginx/ssl/cert.pem;|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|" /opt/codex/docker/nginx.conf
sed -i "s|ssl_certificate_key /etc/nginx/ssl/key.pem;|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|" /opt/codex/docker/nginx.conf
ok "nginx.conf updated for $DOMAIN"

# ── 9. Generate JWT key pair for auth ───────────────────────────
if [[ ! -f /opt/codex/keys/private.pem ]]; then
  info "Generating JWT RSA key pair..."
  mkdir -p /opt/codex/keys
  openssl genpkey -algorithm RSA -out /opt/codex/keys/private.pem -pkeyopt rsa_keygen_bits:2048
  openssl rsa -pubout -in /opt/codex/keys/private.pem -out /opt/codex/keys/public.pem
  ok "JWT key pair generated"
else
  ok "JWT key pair already exists"
fi

# ── 10. Pull Docker images & start services ─────────────────────
info "Pulling Docker images and starting services..."
cd /opt/codex
docker compose pull
docker compose up -d --build
ok "All services started"

# ── 11. Verify health ───────────────────────────────────────────
info "Verifying service health..."
sleep 5
if curl -sf "https://$DOMAIN/health" > /dev/null 2>&1; then
  ok "Health check passed — https://$DOMAIN/health"
else
  warn "Health check failed — check 'docker compose logs' for details"
fi

# ── 12. Set up auto-renew cron for SSL ──────────────────────────
info "Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet && docker compose -f /opt/codex/docker-compose.yml exec nginx nginx -s reload") | crontab -
ok "Cron job added for SSL renewal (daily 3 AM)"

# ── Summary ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}  ──────────────────────────────────────────────────────────${NC}"
echo -e "  Frontend:  https://codex.vercel.app"
echo -e "  Backend:   https://$DOMAIN"
echo -e "  API:       https://$DOMAIN/api/v1"
echo -e "  WS:        wss://$DOMAIN/socket.io"
echo -e "  Grafana:   https://$DOMAIN:3001 (admin/admin123)"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
warn "CHANGE THE DEFAULT GRAFANA PASSWORD!"
warn "Set NEXT_PUBLIC_API_URL=https://$DOMAIN/api/v1 in Vercel project settings"
warn "Set NEXT_PUBLIC_WS_URL=https://$DOMAIN in Vercel project settings"
