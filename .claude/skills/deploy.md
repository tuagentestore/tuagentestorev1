---
name: deploy
description: Deploy TuAgenteStore to Hostinger VPS via SSH — pull + build + health check
user-invocable: true
allowed-tools: Bash
---

Ejecutar el deploy completo en el VPS:

```bash
ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no root@76.13.172.79 "cd /opt/tuagentestore && bash deploy.sh"
```

Luego verificar salud de la app:

```bash
curl -s https://tuagentestore.com/api/health
```

Reportar al usuario:
- Si el deploy fue exitoso (exit 0) y el health check retorna `{"status":"ok",...}`
- Si hubo errores, mostrar los últimos 30 líneas de `docker compose logs app --tail=30`
- URL final: https://tuagentestore.com
