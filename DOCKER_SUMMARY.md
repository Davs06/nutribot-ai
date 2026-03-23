# 🐳 Estrutura Docker - NutriBot AI

## Resumo Rápido

### Comandos Principais

```bash
# Produção (com Traefik e SSL)
docker compose up -d

# Desenvolvimento (com hot-reload)
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose logs -f

# Parar
docker compose down

# Rebuild completo
docker compose build --no-cache
docker compose up -d
```

---

## Arquivos de Configuração

| Arquivo | Finalidade |
|---------|------------|
| `docker-compose.yml` | Produção com Traefik |
| `docker-compose.dev.yml` | Desenvolvimento local |
| `.env` | Variáveis de ambiente |
| `traefik/traefik.yml` | Configuração do Traefik |
| `traefik/dynamic.yml` | Rotas e middlewares |
| `docker/backend/Dockerfile` | Backend produção |
| `docker/frontend/Dockerfile` | Frontend produção |

---

## Serviços

### Produção

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| `traefik` | `traefik` | 80, 443, 8080 | Proxy reverso + SSL |
| `backend` | `nutribot-backend` | 3333 (interna) | API Node.js |
| `frontend` | `nutribot-frontend` | 80 (interna) | React + Nginx |

### Desenvolvimento

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| `backend` | `nutribot-backend-dev` | 3333 | API com hot-reload |
| `frontend` | `nutribot-frontend-dev` | 5173 | React com Vite |

---

## Redes

| Rede | Finalidade |
|------|------------|
| `nutribot-network` | Rede de produção |
| `nutribot-network-dev` | Rede de desenvolvimento |

---

## Volumes

| Volume | Finalidade |
|--------|------------|
| `backend-data` | Banco de dados SQLite |
| `backend-uploads` | Uploads de imagens |
| `traefik/certs` | Certificados SSL Let's Encrypt |

---

## Rotas (Produção)

| URL | Serviço | Descrição |
|-----|---------|-----------|
| `https://nutribot.local/` | Frontend | Web App React |
| `https://nutribot.local/api/*` | Backend | API REST |
| `http://traefik.nutribot.local:8080` | Traefik | Dashboard |

---

## Middlewares Traefik

| Middleware | Função |
|------------|--------|
| `api-ratelimit` | Rate limiting (50 req/min) |
| `strip-api-prefix` | Remove `/api` do path |
| `cors-headers` | Headers CORS |
| `compress` | Compressão Gzip |
| `security-headers` | Headers de segurança |
| `auth-dashboard` | Auth básica dashboard |

---

## Health Checks

| Serviço | Endpoint | Intervalo |
|---------|----------|-----------|
| Backend | `/health` | 30s |
| Frontend | `/health` | 30s |
| Traefik | Interno | - |

---

## Variáveis de Ambiente (.env)

```env
# APIs
GEMINI_API_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
USDA_API_KEY=xxx

# Segurança
JWT_SECRET=xxx

# Domínio
DOMAIN=nutribot.local
SSL_EMAIL=admin@nutribot.local
```

---

## Fluxo de Request

```
Cliente
   │
   ▼
┌─────────────────────────────────┐
│         Traefik (443)           │
│  - SSL Termination              │
│  - Rate Limiting                │
│  - Routing                      │
└─────────────┬───────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐       ┌─────────┐
│Frontend │       │ Backend │
│  (80)   │       │  (3333) │
│         │       │         │
│ React   │       │ Node.js │
│ Nginx   │       │ Express │
└─────────┘       └────┬────┘
                       │
                       ▼
                 ┌─────────┐
                 │ SQLite  │
                 │  data   │
                 └─────────┘
```

---

## Deploy em 3 Passos

### 1. Configurar

```bash
cp .env.example .env
# Edite .env com suas chaves
```

### 2. Deploy

```bash
docker compose up -d
```

### 3. Verificar

```bash
docker compose ps
docker compose logs -f
```

---

## Troubleshooting

### Ver logs
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik
```

### Restartar serviço
```bash
docker compose restart backend
```

### Rebuild completo
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Acessar container
```bash
docker compose exec backend sh
docker compose exec frontend sh
```

---

## Segurança

✅ **Produção:**
- SSL/HTTPS automático (Let's Encrypt)
- Rate limiting na API
- Headers de segurança
- Containers como non-root
- Secrets via .env

⚠️ **Desenvolvimento:**
- Sem SSL
- Sem rate limiting
- Hot-reload habilitado
- Portas expostas localmente

---

## Monitoramento

### Dashboard Traefik
```
http://traefik.nutribot.local:8080
```

### Logs em tempo real
```bash
docker compose logs -f
```

### Métricas
```bash
curl http://localhost:8080/metrics
```

### Status dos containers
```bash
docker compose ps
docker stats
```

---

## Backup

### Banco de dados
```bash
docker cp nutribot-backend:/app/data/data.db ./backup.db
```

### Restore
```bash
docker cp ./backup.db nutribot-backend:/app/data/data.db
docker compose restart backend
```

---

## Checklist Produção

- [ ] `.env` configurado
- [ ] Domínio apontado
- [ ] Portas 80/443 liberadas
- [ ] Senha do Traefik alterada
- [ ] JWT_SECRET forte
- [ ] Backup configurado
- [ ] Logs monitorados

---

**🎉 Pronto para produção!**
