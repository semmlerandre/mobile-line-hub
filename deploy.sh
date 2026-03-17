#!/usr/bin/env bash
set -euo pipefail

# ============================================================
#  Deploy Script - Sistema de Controle de Linhas Móveis
#  Compatível com Linux e macOS
# ============================================================

REPO_URL="https://github.com/semmlerandre/mobile-line-hub.git"
PROJECT_DIR="controle-linhas-moveis"
PORT_RANGE_START=3000
PORT_RANGE_END=9000

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✔]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✘]${NC} $1"; exit 1; }

# ---- Pre-flight checks ----
check_dependency() {
  command -v "$1" >/dev/null 2>&1 || error "$1 não encontrado. Instale $1 antes de continuar."
}

check_dependency docker
check_dependency git

# Check docker compose (v2 plugin or standalone)
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  error "docker compose não encontrado. Instale o Docker Compose."
fi

log "Docker e Git verificados com sucesso"

# ---- Clone or update ----
if [ -d "$PROJECT_DIR" ]; then
  warn "Projeto já existe. Atualizando..."
  cd "$PROJECT_DIR"
  git pull --ff-only || { warn "git pull falhou, tentando reset..."; git fetch origin && git reset --hard origin/main; }
else
  log "Clonando repositório..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# ---- Find free port ----
find_free_port() {
  for port in $(seq $PORT_RANGE_START $PORT_RANGE_END); do
    if ! ss -tuln 2>/dev/null | grep -q ":${port} " && \
       ! netstat -tuln 2>/dev/null | grep -q ":${port} "; then
      # Also check if Docker is using this port
      if ! docker ps --format '{{.Ports}}' 2>/dev/null | grep -q "0.0.0.0:${port}->"; then
        echo "$port"
        return
      fi
    fi
  done
  error "Nenhuma porta livre encontrada entre $PORT_RANGE_START e $PORT_RANGE_END"
}

# Reuse existing port from .env if available
if [ -f .env ] && grep -q "APP_PORT=" .env; then
  APP_PORT=$(grep "APP_PORT=" .env | cut -d= -f2)
  log "Usando porta existente: $APP_PORT"
else
  APP_PORT=$(find_free_port)
  log "Porta livre encontrada: $APP_PORT"
fi

# ---- Generate .env ----
DB_PASSWORD=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 24)

# Preserve existing DB password on updates
if [ -f .env ] && grep -q "DB_PASSWORD=" .env; then
  DB_PASSWORD=$(grep "DB_PASSWORD=" .env | cut -d= -f2)
fi

cat > .env <<EOF
APP_PORT=$APP_PORT
DB_HOST=db
DB_PORT=5432
DB_NAME=controle_linhas
DB_USER=appuser
DB_PASSWORD=$DB_PASSWORD
EOF

log "Arquivo .env criado/atualizado"

# ---- Build and start ----
log "Construindo e iniciando containers..."
$COMPOSE_CMD up -d --build

# Wait for containers to be healthy
sleep 5

# ---- Get server IP ----
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
if [ -z "$SERVER_IP" ]; then
  SERVER_IP="localhost"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Sistema instalado com sucesso!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Aplicação rodando em:"
echo ""
echo -e "  ${YELLOW}http://${SERVER_IP}:${APP_PORT}${NC}"
echo -e "  ${YELLOW}http://localhost:${APP_PORT}${NC}"
echo ""
echo -e "  Porta atribuída automaticamente: ${YELLOW}${APP_PORT}${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Para atualizar o sistema, execute:"
echo -e "  ${YELLOW}./deploy.sh${NC}"
echo ""
echo -e "  Para ver logs:"
echo -e "  ${YELLOW}$COMPOSE_CMD logs -f${NC}"
echo ""
echo -e "  Para parar:"
echo -e "  ${YELLOW}$COMPOSE_CMD down${NC}"
echo ""
