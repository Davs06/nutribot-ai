# 🐳 Guia de Dockerização - NutriBot AI

## Visão Geral

O NutriBot AI agora está completamente dockerizado usando **Docker Compose** e **Traefik** como proxy reverso.

### Arquitetura

```
                                    ┌─────────────────┐
                                    │   Traefik v2    │
                                    │  (Proxy Reverso)│
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
              ┌─────▼─────┐          ┌──────▼──────┐          ┌──────▼──────┐
              │ Frontend  │          │   Backend   │          │  Dashboard  │
              │  (Nginx)  │          │  (Node.js)  │          │   Traefik   │
              │  Port 80  │          │  Port 3333  │          │   Port 8080 │
              └───────────┘          └─────────────┘          └─────────────┘
                    │                        │
              ┌─────▼─────┐          ┌──────▼──────┐
              │  Volumes  │          │   Volumes   │
              │   dist/   │          │  data, uploads│
              └───────────┘          └─────────────┘
```

---

## 📁 Estrutura de Arquivos Docker

```
nutribot-ai/
├── docker/
│   ├── backend/
│   │   ├── Dockerfile          # Backend produção
│   │   └── Dockerfile.dev      # Backend desenvolvimento
│   ├── frontend/
│   │   ├── Dockerfile          # Frontend produção
│   │   ├── Dockerfile.dev      # Frontend desenvolvimento
│   │   └── nginx.conf          # Configuração Nginx
│   └── .gitkeep
├── traefik/
│   ├── traefik.yml             # Configuração estática
│   ├── dynamic.yml             # Configuração dinâmica
│   ├── certs/
│   │   └── acme.json           # Certificados SSL
│   └── generate-password.sh    # Gerador de senha
├── docker-compose.yml          # Produção com Traefik
├── docker-compose.dev.yml      # Desenvolvimento
├── .env                        # Variáveis de ambiente
├── .env.example                # Exemplo de .env
├── deploy.sh                   # Script de deploy (Linux/Mac)
└── deploy.bat                  # Script de deploy (Windows)
```

---

## 🚀 Produção com Traefik

### Pré-requisitos

1. **Docker** instalado (versão 20+)
2. **Docker Compose** instalado (versão 2+)
3. **Domínio** configurado (ex: nutribot.local)
4. **Portas** 80 e 443 livres

### Configuração

#### 1. Copiar e editar .env

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas chaves:

```env
# APIs Externas
GEMINI_API_KEY=AIzaSy...sua_chave
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
USDA_API_KEY=sua_chave_usda

# Segurança
JWT_SECRET=gerar-um-segredo-forte-aqui

# Domínio
DOMAIN=nutribot.local
SSL_EMAIL=seu@email.com
```

#### 2. Configurar DNS

Adicione ao seu `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1   nutribot.local
127.0.0.1   traefik.nutribot.local
```

Em produção, aponte seu domínio para o IP do servidor.

#### 3. Gerar senha para Dashboard do Traefik

```bash
cd traefik
./generate-password.sh sua_senha_forte
```

Copie o output e cole no arquivo `traefik/dynamic.yml`.

#### 4. Deploy

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```bash
deploy.bat
```

Ou manualmente:
```bash
docker compose up -d
```

---

## 🛠️ Desenvolvimento Local

### Sem Docker

```bash
# Backend
cd backend
npm run dev

# Frontend (outro terminal)
cd frontend
npm run dev
```

### Com Docker Compose Dev

```bash
docker compose -f docker-compose.dev.yml up -d
```

Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3333

---

## 📊 Comandos Úteis

### Ver status dos serviços
```bash
docker compose ps
```

### Ver logs
```bash
# Todos os serviços
docker compose logs -f

# Serviço específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f traefik
```

### Parar serviços
```bash
docker compose down
```

### Parar e remover volumes
```bash
docker compose down -v
```

### Reiniciar serviço
```bash
docker compose restart backend
```

### Rebuild de um serviço
```bash
docker compose build --no-cache backend
docker compose up -d --force-recreate backend
```

### Acessar container
```bash
# Backend
docker compose exec backend sh

# Frontend
docker compose exec frontend sh

# Traefik
docker compose exec traefik sh
```

### Ver uso de recursos
```bash
docker stats
```

---

## 🔧 Configuração do Traefik

### Labels de Roteamento

Os serviços são configurados via labels no `docker-compose.yml`:

#### Backend
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.backend.rule=Host(`nutribot.local`) && PathPrefix(`/api`)"
  - "traefik.http.routers.backend.entrypoints=websecure"
  - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
  - "traefik.http.services.backend.loadbalancer.server.port=3333"
```

#### Frontend
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`nutribot.local`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
  - "traefik.http.services.frontend.loadbalancer.server.port=80"
```

### Middlewares Disponíveis

- `api-ratelimit` - Rate limiting para API (50 req/min)
- `strip-api-prefix` - Remove prefixo /api das rotas
- `cors-headers` - Headers CORS
- `compress` - Compressão Gzip
- `security-headers` - Headers de segurança
- `auth-dashboard` - Autenticação básica para dashboard

---

## 🔒 SSL/HTTPS

### Automático (Let's Encrypt)

O Traefik gerencia certificados SSL automaticamente via Let's Encrypt.

Os certificados são armazenados em:
```
traefik/certs/acme.json
```

### Forçar renovação
```bash
docker compose stop traefik
rm traefik/certs/acme.json
docker compose up -d traefik
```

### Produção - Domínio Real

1. Aponte seu domínio para o IP do servidor
2. Libere as portas 80 e 443
3. Edite `.env` com seu domínio:
   ```env
   DOMAIN=seusite.com
   SSL_EMAIL=voce@seusite.com
   ```
4. Deploy:
   ```bash
   docker compose up -d
   ```

---

## 📦 Volumes

### Volumes Persistentes

| Volume | Finalidade | Localização |
|--------|------------|-------------|
| `backend-data` | Banco de dados SQLite | `/app/data` |
| `backend-uploads` | Uploads de imagens | `/app/uploads` |
| `traefik/certs` | Certificados SSL | `/etc/traefik/certs` |

### Backup do Banco de Dados

```bash
# Parar backend
docker compose stop backend

# Copiar banco de dados
docker cp nutribot-backend:/app/data/data.db ./backup-data.db

# Iniciar backend
docker compose start backend
```

### Restore

```bash
# Parar backend
docker compose stop backend

# Copiar backup para container
docker cp ./backup-data.db nutribot-backend:/app/data/data.db

# Iniciar backend
docker compose start backend
```

---

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker compose logs backend

# Verificar se porta está em uso
docker compose ps
netstat -tulpn | grep :3333
```

### Erro de certificado SSL

```bash
# Remover certificados e recriar
docker compose stop traefik
rm traefik/certs/acme.json
docker compose up -d traefik
```

### Backend não responde

```bash
# Health check manual
curl http://localhost:3333/health

# Restart
docker compose restart backend
```

### Traefik não roteia

```bash
# Verificar labels
docker inspect nutribot-backend | grep traefik

# Ver logs do Traefik
docker compose logs -f traefik
```

### Limpeza completa

```bash
# Parar e remover tudo
docker compose down -v

# Remover redes
docker network rm nutribot-network

# Remover imagens
docker rmi nutribot-backend nutribot-frontend
```

---

## 🔄 Deploy Contínuo (CI/CD)

### Exemplo GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .env
        run: |
          cp .env.example .env
          echo "GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}" >> .env
      
      - name: Deploy
        run: |
          chmod +x deploy.sh
          ./deploy.sh
```

---

## 📈 Monitoramento

### Dashboard do Traefik

Acesse: http://traefik.nutribot.local:8080

- Usuário: `admin`
- Senha: (gerada com `generate-password.sh`)

### Logs em Tempo Real

```bash
docker compose logs -f
```

### Métricas

O Traefik expõe métricas em:
```
http://traefik.nutribot.local:8080/metrics
```

---

## 🎯 Produção vs Desenvolvimento

| Característica | Desenvolvimento | Produção |
|----------------|-----------------|----------|
| Compose File | `docker-compose.dev.yml` | `docker-compose.yml` |
| Hot Reload | ✅ Sim | ❌ Não |
| Portas Expostas | 3333, 5173 | 80, 443 (via Traefik) |
| SSL | ❌ Não | ✅ Sim (Let's Encrypt) |
| Rate Limiting | ❌ Não | ✅ Sim |
| Volumes | Locais | Persistentes |

---

## 📝 Checklist de Deploy em Produção

- [ ] `.env` configurado com chaves reais
- [ ] Domínio apontado para o servidor
- [ ] Portas 80 e 443 liberadas no firewall
- [ ] Senha do dashboard do Traefik alterada
- [ ] JWT_SECRET forte configurado
- [ ] SSL_EMAIL configurado
- [ ] Backup do banco de dados configurado
- [ ] Monitoramento de logs implementado

---

## 🎉 Pronto!

Seu NutriBot AI está rodando em produção com:

✅ **Traefik** como proxy reverso
✅ **SSL/HTTPS** automático
✅ **Load Balancing** pronto
✅ **Rate Limiting** na API
✅ **Health Checks** configurados
✅ **Volumes** persistentes
✅ **Logs** centralizados

**Acesse:** https://nutribot.local

**Dashboard Traefik:** http://traefik.nutribot.local:8080

---

**Dúvidas?** Consulte os logs: `docker compose logs -f`
