#!/bin/bash
# ============================================================
# AI AGENT HUB — VPS Setup Script (Hostinger KVM)
# Ubuntu 22.04/24.04 LTS
# Ejecutar como root en el primer acceso al VPS
# ============================================================

set -euo pipefail

echo "=========================================="
echo "  AI AGENT HUB — VPS Setup"
echo "=========================================="

# ── Variables (cambiar antes de ejecutar) ──
NEW_USER="deploy"
SSH_PORT=2222
DOMAIN="tuagentestore.com"

# ── 1. Actualizar sistema ──
echo "[1/10] Actualizando sistema..."
apt update && apt upgrade -y
apt install -y curl wget git unzip htop ufw fail2ban \
    apt-transport-https ca-certificates gnupg lsb-release

# ── 2. Crear usuario deploy ──
echo "[2/10] Creando usuario deploy..."
if ! id "$NEW_USER" &>/dev/null; then
    adduser --disabled-password --gecos "" $NEW_USER
    usermod -aG sudo $NEW_USER
    echo "$NEW_USER ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$NEW_USER
    
    # Copiar SSH keys del root
    mkdir -p /home/$NEW_USER/.ssh
    cp /root/.ssh/authorized_keys /home/$NEW_USER/.ssh/ 2>/dev/null || true
    chown -R $NEW_USER:$NEW_USER /home/$NEW_USER/.ssh
    chmod 700 /home/$NEW_USER/.ssh
    chmod 600 /home/$NEW_USER/.ssh/authorized_keys 2>/dev/null || true
fi

# ── 3. SSH Hardening ──
echo "[3/10] Hardening SSH..."
cat > /etc/ssh/sshd_config.d/hardening.conf << EOF
Port $SSH_PORT
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowUsers $NEW_USER
EOF
systemctl restart sshd

# ── 4. Firewall (UFW) ──
echo "[4/10] Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow $SSH_PORT/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# ── 5. Fail2Ban ──
echo "[5/10] Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = $SSH_PORT
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF
systemctl enable fail2ban
systemctl restart fail2ban

# ── 6. Docker ──
echo "[6/10] Instalando Docker..."
curl -fsSL https://get.docker.com | sh
usermod -aG docker $NEW_USER

# Docker Compose plugin
apt install -y docker-compose-plugin

# ── 7. Swap (si el VPS tiene poca RAM) ──
echo "[7/10] Configurando swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
fi

# ── 8. Timezone ──
echo "[8/10] Configurando timezone..."
timedatectl set-timezone America/Argentina/Buenos_Aires

# ── 9. Estructura de proyecto ──
echo "[9/10] Creando estructura..."
PROJECT_DIR="/home/$NEW_USER/ai-agent-hub"
mkdir -p $PROJECT_DIR/{app,database/backup,caddy,logs,scripts}
chown -R $NEW_USER:$NEW_USER $PROJECT_DIR

# ── 10. Cron: Backups + limpieza ──
echo "[10/10] Configurando cron jobs..."
cat > /etc/cron.d/ai-agent-hub << 'EOF'
# Limpiar logs de Docker cada semana
0 3 * * 0 root docker system prune -f >> /var/log/docker-cleanup.log 2>&1

# Limpiar backups viejos (> 30 días)
0 4 1 * * root find /home/deploy/ai-agent-hub/database/backup -mtime +30 -delete

# Renovar certs (Caddy lo hace solo, pero por si acaso)
0 12 * * * root docker compose -f /home/deploy/ai-agent-hub/docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || true
EOF

echo ""
echo "=========================================="
echo "  SETUP COMPLETO"
echo "=========================================="
echo ""
echo "  IMPORTANTE:"
echo "  1. SSH ahora usa puerto $SSH_PORT"
echo "  2. Conectar como: ssh -p $SSH_PORT $NEW_USER@IP"
echo "  3. Root login deshabilitado"
echo "  4. Copiar archivos del proyecto a: $PROJECT_DIR"
echo ""
echo "  Siguiente paso:"
echo "  1. Copiar .env, docker-compose.yml, Caddyfile"
echo "  2. cd $PROJECT_DIR && docker compose up -d"
echo ""
