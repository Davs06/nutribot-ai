# 🚀 Guia de Deploy - NutriBot AI

## 📋 Visão Geral

Este guia cobre o deploy do NutriBot AI em dois ambientes:
- **Desenvolvimento**: SQLite + Docker Compose local
- **Produção**: PostgreSQL + Docker Compose com SSL

---

## 🏗️ Arquitetura

### Desenvolvimento
```
┌─────────────┐     ┌──────────────┐
│   Frontend  │────▶│   Backend    │
│  (Vite)     │     │  (Node.js)   │
│  :5173      │     │   :3333      │
└─────────────┘     └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   SQLite     │
                    │   (file)     │
                    └──────────────┘
```

### Produção
```
┌─────────────┐
│   Traefik   │ (SSL/Proxy)
│  :80, :443  │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐  ┌──▼────┐
│Front │  │Backend│
│Nginx │  │Node.js│
│:80   │  │:3333  │
└──────┘  └───┬───┘
              │
       ┌──────▼──────┐
       │  PostgreSQL │
       │   :5432     │
       └─────────────┘
```

---

## 🛠️ Pré-requisitos

### Desenvolvimento
- Docker 20+
- Docker Compose 2+
- Node.js 18+ (opcional, para dev local)

### Produção
- Servidor Linux (Ubuntu 20.04+)
- Docker 20+
- Docker Compose 2+
- Domínio configurado
- SSL (automático via Traefik)

---

## 🚀 Deploy - Desenvolvimento

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/nutribot-ai.git
cd nutribot-ai
```

### 2. Configure variáveis de ambiente
```bash
cp .env.example .env
# Edite .env e adicione sua GEMINI_API_KEY
```

### 3. Inicie os containers
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Acesse
- Frontend: http://localhost:5173
- Backend: http://localhost:3333
- Health: http://localhost:3333/health

---

## 🌐 Deploy - Produção

### 1. Configure o servidor

**Instale Docker:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

**Instale Docker Compose:**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clone o repositório
```bash
git clone https://github.com/seu-usuario/nutribot-ai.git /opt/nutribot
cd /opt/nutribot
```

### 3. Configure variáveis de ambiente
```bash
cp .env.example .env
nano .env
```

**Preencha:**
```env
# API Keys
GEMINI_API_KEY=AIzaSy...sua_chave

# Banco de Dados
DB_USER=nutribot
DB_PASSWORD=senha_forte_aleatoria
DB_NAME=nutribot

# Segurança
JWT_SECRET=$(openssl rand -base64 32)

# Domínio
DOMAIN=seu-dominio.com
SSL_EMAIL=seu@email.com
```

### 4. Gere senha do Traefik
```bash
htpasswd -nb admin sua_senha
# Copie o output para TRAEFIK_DASHBOARD_PASSWORD no .env
```

### 5. Inicie os containers
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 6. Verifique logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### 7. Acesse
- Frontend: https://seu-dominio.com
- Backend API: https://seu-dominio.com/api
- Traefik Dashboard: https://traefik.seu-dominio.com

---

## 🔄 CI/CD - GitHub Actions + Portainer Webhook

### Configuração

**1. No GitHub, configure as secrets:**

```
Settings → Secrets and variables → Actions → New repository secret
```

**Secrets necessários:**
| Nome | Descrição |
|------|-----------|
| `DOCKER_USERNAME` | Usuário Docker Hub |
| `DOCKER_TOKEN` | Token de acesso Docker Hub |
| `PORTAINER_WEBHOOK_DEV` | Webhook do Portainer (Dev) |
| `PORTAINER_WEBHOOK_PROD` | Webhook do Portainer (Prod) |

**2. Gere Token Docker Hub:**
```
https://hub.docker.com/settings/security
→ New Access Token
→ Copie e cole em DOCKER_TOKEN
```

**3. Configure Webhook no Portainer:**

**No Portainer:**
```
1. Acesse seu Stack do NutriBot
2. Clique em "Advanced Mode"
3. Em "Webhooks", clique em "Add Webhook"
4. Configure:
   - Name: Deploy Dev (ou Prod)
   - Type: Stack webhook
   - Action: Redeploy
5. Copie a URL gerada
6. Cole no GitHub Secret: PORTAINER_WEBHOOK_DEV ou PORTAINER_WEBHOOK_PROD
```

**URL do Webhook será algo como:**
```
https://seu-portainer.com/api/stacks/webhooks/abc123-def456-ghi789
```

### Fluxo de Deploy

**Desenvolvimento (branch `develop`):**
```
Push → Build → Test → Docker Hub :dev → Portainer Webhook Dev
```

**Produção (branch `main`):**
```
Push → Build → Test → Docker Hub :latest → Portainer Webhook Prod
```

### Payload do Webhook

**Dev:**
```json
{
  "image": "seu-usuario/nutribot-backend:dev"
}
```

**Prod:**
```json
{
  "repository": "seu-usuario/nutribot-ai",
  "commit": "abc123...",
  "branch": "main",
  "images": {
    "backend": "seu-usuario/nutribot-backend:latest",
    "frontend": "seu-usuario/nutribot-frontend:latest"
  }
}
```

### Comandos Manuais

**Build local:**
```bash
docker build -t seu-usuario/nutribot-backend:latest ./backend
docker build -t seu-usuario/nutribot-frontend:latest ./frontend
```

**Push manual:**
```bash
docker push seu-usuario/nutribot-backend:latest
docker push seu-usuario/nutribot-frontend:latest
```

**Trigger webhook manual:**
```bash
curl -X POST https://seu-portainer.com/api/stacks/webhooks/abc123 \
  -H "Content-Type: application/json" \
  -d '{"image": "seu-usuario/nutribot-backend:latest"}'
```

---

## 📊 Monitoramento

### Logs
```bash
# Todos os logs
docker compose -f docker-compose.prod.yml logs -f

# Backend apenas
docker compose -f docker-compose.prod.yml logs -f backend

# PostgreSQL apenas
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Saúde dos serviços
```bash
# Status dos containers
docker compose -f docker-compose.prod.yml ps

# Health check backend
curl https://seu-dominio.com/health

# Health check frontend
curl https://seu-dominio.com
```

### Banco de Dados
```bash
# Acessar PostgreSQL
docker exec -it nutribot-postgres psql -U nutribot -d nutribot

# Listar tabelas
\dt

# Sair
\q
```

---

## 🔧 Troubleshooting

### Erro: "Connection refused"
```bash
# Verifique se os containers estão rodando
docker compose -f docker-compose.prod.yml ps

# Reinicie os serviços
docker compose -f docker-compose.prod.yml restart
```

### Erro: "Database does not exist"
```bash
# Verifique as variáveis de ambiente
docker compose -f docker-compose.prod.yml config

# Recrie o banco
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Erro: "SSL Certificate"
```bash
# Verifique se o domínio está apontando para o servidor
dig seu-dominio.com

# Verifique logs do Traefik
docker compose -f docker-compose.prod.yml logs -f traefik
```

### Erro: "API Key Invalid"
```bash
# Verifique se GEMINI_API_KEY está correta
docker compose -f docker-compose.prod.yml exec backend printenv GEMINI_API_KEY

# Reinicie o backend
docker compose -f docker-compose.prod.yml restart backend
```

---

## 📈 Backup

### Banco de Dados
```bash
# Backup
docker exec nutribot-postgres pg_dump -U nutribot nutribot > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i nutribot-postgres psql -U nutribot nutribot < backup-20260321.sql
```

### Uploads
```bash
# Backup
tar -czf uploads-backup.tar.gz /var/lib/docker/volumes/nutribot-backend-uploads

# Restore
tar -xzf uploads-backup.tar.gz -C /
```

---

## 🔒 Segurança

### Atualizações
```bash
# Atualizar imagens
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Firewall
```bash
# Ubuntu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Secrets
- Nunca commitar `.env`
- Usar secrets do GitHub Actions
- Rotacionar JWT_SECRET periodicamente
- Usar senhas fortes no PostgreSQL

---

## 📝 Comandos Úteis

```bash
# Ver uso de recursos
docker stats

# Limpar sistema
docker system prune -a

# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Reiniciar serviço
docker compose -f docker-compose.prod.yml restart backend

# Acessar shell do container
docker exec -it nutribot-backend-dev sh
```

---

**Deploy concluído!** 🎉

Para suporte, abra uma issue no GitHub.
