#!/usr/bin/env bash
# setup-vps.sh — Configuración inicial del VPS para MEF Transparencia
# Uso: bash setup-vps.sh
# Probado en Ubuntu 24.04 LTS
set -euo pipefail

DOMAIN="observaeldetalle.masredespro.com"
APP_DIR="/var/www/mef"
LOG_DIR="/var/log/mef-portal"
REPO="https://github.com/andretys/mef.git"
BRANCH="claude/redesign-transparency-portal-mJ3RU"
NODE_VERSION="20"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✔]${NC} $*"; }
warn()  { echo -e "${YELLOW}[!]${NC} $*"; }
error() { echo -e "${RED}[✘]${NC} $*"; exit 1; }

[[ $EUID -ne 0 ]] && error "Ejecutar como root: sudo bash setup-vps.sh"

# ── 1. Sistema ────────────────────────────────────────────────────────────────
info "Actualizando paquetes del sistema..."
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx ufw

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
  info "Instalando Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
fi
info "Node.js: $(node -v)  npm: $(npm -v)"

# ── 3. PM2 ────────────────────────────────────────────────────────────────────
if ! command -v pm2 &>/dev/null; then
  info "Instalando PM2..."
  npm install -g pm2 --quiet
fi
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# ── 4. Directorio y repo ──────────────────────────────────────────────────────
mkdir -p "$APP_DIR" "$LOG_DIR"
if [[ -d "$APP_DIR/.git" ]]; then
  info "Actualizando repositorio existente..."
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull origin "$BRANCH"
else
  info "Clonando repositorio..."
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
fi

# ── 5. Dependencias Node ──────────────────────────────────────────────────────
info "Instalando dependencias npm..."
cd "$APP_DIR"
npm ci --omit=dev --ignore-scripts

# ── 6. Variables de entorno ───────────────────────────────────────────────────
if [[ ! -f "$APP_DIR/.env" ]]; then
  warn "Creando .env con valores por defecto (editar después)..."
  cat > "$APP_DIR/.env" <<'ENV'
PORT=3000
NODE_ENV=production
# Secreto para el endpoint /api/feed (elegir uno seguro)
FEED_SECRET=cambia_esto_por_un_secreto_seguro
# Clave de Claude para el chatbot (opcional)
# ANTHROPIC_API_KEY=sk-ant-...
ENV
fi
info ".env en $APP_DIR/.env — editar FEED_SECRET y ANTHROPIC_API_KEY si aún no lo has hecho"

# ── 7. data/ ──────────────────────────────────────────────────────────────────
mkdir -p "$APP_DIR/data"

# ── 8. PM2 — iniciar / reiniciar app ─────────────────────────────────────────
info "Iniciando aplicación con PM2..."
if pm2 list | grep -q "mef-portal"; then
  pm2 restart mef-portal
else
  pm2 start "$APP_DIR/ecosystem.config.js"
fi
pm2 save
info "App corriendo en puerto 3000"

# ── 9. Firewall ───────────────────────────────────────────────────────────────
info "Configurando UFW..."
ufw allow OpenSSH  >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null
info "UFW activo: SSH + HTTP/HTTPS permitidos"

# ── 10. Nginx — sitio virtual ─────────────────────────────────────────────────
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
if [[ ! -f "$NGINX_CONF" ]]; then
  info "Configurando Nginx (HTTP temporal, antes de SSL)..."
  cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout  90s;
        proxy_send_timeout  90s;
        proxy_connect_timeout 10s;
    }
}
NGINX
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
fi
nginx -t && systemctl reload nginx
info "Nginx configurado para $DOMAIN"

# ── 11. SSL con Certbot ───────────────────────────────────────────────────────
if [[ ! -d "/etc/letsencrypt/live/$DOMAIN" ]]; then
  warn "Obteniendo certificado SSL para $DOMAIN..."
  warn "Asegúrate de que el registro DNS A apunta a esta IP ANTES de continuar."
  read -rp "¿El DNS ya está configurado? (s/n): " dns_ok
  if [[ "$dns_ok" == "s" || "$dns_ok" == "S" ]]; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
      -m "andretys1000@gmail.com" --redirect
    info "SSL instalado exitosamente"
    # Copiar la configuración final de nginx como referencia
    cp "$APP_DIR/nginx.conf.example" "/etc/nginx/sites-available/${DOMAIN}.example"
  else
    warn "SSL omitido. Ejecutar después: certbot --nginx -d $DOMAIN"
  fi
else
  info "Certificado SSL ya existe para $DOMAIN"
fi

# ── 12. Renovación automática de SSL ─────────────────────────────────────────
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
  info "Renovación automática de SSL programada (3 AM diario)"
fi

# ── 13. Resumen final ─────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo -e "${GREEN}   MEF Transparencia — VPS configurado        ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════${NC}"
echo ""
echo "  App:      http://$DOMAIN"
echo "  App dir:  $APP_DIR"
echo "  Logs:     $LOG_DIR"
echo "  PM2:      pm2 status"
echo "  Nginx:    systemctl status nginx"
echo ""
warn "PASOS MANUALES PENDIENTES:"
echo "  1. Editar $APP_DIR/.env y cambiar FEED_SECRET"
echo "  2. (Opcional) Agregar ANTHROPIC_API_KEY en .env para el chatbot IA"
echo "  3. Configurar GitHub Actions secrets:"
echo "       VPS_HOST     = $(curl -s ifconfig.me 2>/dev/null || echo '76.13.234.161')"
echo "       VPS_USER     = root"
echo "       VPS_PASSWORD = (tu contraseña de root)"
echo "  4. En feeder.js (Windows PC), configurar:"
echo "       VPS_URL      = https://$DOMAIN"
echo "       FEED_SECRET  = (el mismo valor que pusiste en .env)"
echo ""
info "Setup completo."
