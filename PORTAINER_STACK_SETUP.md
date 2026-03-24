# 🚀 Configurar Stack no Portainer - NutriBot AI

## 📋 Visão Geral

Este guia mostra como configurar a stack do NutriBot AI no Portainer para deploy automático via Webhook.

---

## 🎯 Pré-requisitos

- Portainer instalado e acessível
- Docker Hub com as imagens `nutribot-backend` e `nutribot-frontend`
- Secrets configurados no GitHub Actions

---

## 📝 Passo 1: Preparar Variáveis de Ambiente

**Crie um arquivo `.env` local com:**

```bash
# Docker Hub
DOCKER_USERNAME=seu-usuario-docker

# Banco de Dados
DB_USER=nutribot
DB_PASSWORD=SenhaForte123!
DB_NAME=nutribot

# Segurança
JWT_SECRET=$(openssl rand -base64 32)

# Domínio
DOMAIN=seu-dominio.com
FRONTEND_URL=https://seu-dominio.com

# APIs
GEMINI_API_KEY=AIzaSy...sua_chave
```

---

## 📝 Passo 2: Criar Stack no Portainer

### 2.1. Acesse Portainer

```
https://seu-portainer.com
```

### 2.2. Navegue até Stacks

```
Home → Stacks → Add stack
```

### 2.3. Configure a Stack

**Basic settings:**
```
Name: nutribot
Build method: Custom template
```

**Upload o arquivo:**
```
Escolha o arquivo: stacks.yml (do repositório)
```

### 2.4. Configure Environment Variables

**No Portainer, em "Environment variables":**

| Variable | Value |
|----------|-------|
| `DOCKER_USERNAME` | seu-usuario-docker |
| `TAG` | latest |
| `DB_USER` | nutribot |
| `DB_PASSWORD` | SenhaForte123! |
| `DB_NAME` | nutribot |
| `JWT_SECRET` | (gerado com openssl) |
| `DOMAIN` | seu-dominio.com |
| `FRONTEND_URL` | https://seu-dominio.com |
| `GEMINI_API_KEY` | AIzaSy...sua_chave |

### 2.5. Deploy

```
Clique em "Deploy the stack"
```

---

## 📝 Passo 3: Configurar Webhook

### 3.1. Ative Advanced Mode

```
No topo da página da stack → Clique em "Advanced Mode"
```

### 3.2. Adicione Webhook

```
Role até "Webhooks" → Clique em "Add Webhook"
```

**Configure:**
```
Name: Deploy Production
Type: Stack webhook
Action: Redeploy
```

### 3.3. Copie a URL

Após criar, copie a URL gerada:
```
https://seu-portainer.com/api/stacks/webhooks/abc123-def456-ghi789
```

---

## 📝 Passo 4: Configurar GitHub Secrets

### 4.1. Acesse GitHub

```
GitHub → seu-repositorio/nutribot-ai → Settings → Secrets and variables → Actions
```

### 4.2. Adicione Secrets

**New repository secret:**

| Name | Value |
|------|-------|
| `DOCKER_USERNAME` | seu-usuario-docker |
| `DOCKER_TOKEN` | seu-token-docker-hub |
| `PORTAINER_WEBHOOK_PROD` | https://seu-portainer.com/api/stacks/webhooks/abc123... |

---

## 📝 Passo 5: Testar Deploy

### 5.1. Push para main

```bash
git add .
git commit -m "Teste de deploy"
git push origin main
```

### 5.2. Verifique GitHub Actions

```
GitHub → Actions → CI/CD Pipeline
```

**Deve mostrar:**
```
✅ build-and-test (success)
✅ deploy-prod (success)
   ✅ Build and push backend (prod)
   ✅ Build and push frontend (prod)
   ✅ Trigger Portainer Webhook (Prod)
```

### 5.3. Verifique Portainer

```
Portainer → Stacks → nutribot → Logs
```

**Deve mostrar:**
```
Pulling image: seu-usuario/nutribot-backend:latest
Pulling image: seu-usuario/nutribot-frontend:latest
Recreating container: nutribot-backend
Recreating container: nutribot-frontend
```

---

## 🔧 Troubleshooting

### Stack não deploya

**Verifique:**
1. Imagens existem no Docker Hub
2. Variáveis de ambiente estão corretas
3. Rede `nutribot-network` existe

**No Portainer:**
```
Stacks → nutribot → Logs
Verifique erros
```

### Webhook não aciona

**Verifique:**
1. URL do webhook está correta
2. Secret `PORTAINER_WEBHOOK_PROD` configurado
3. Push foi para branch `main`

**Teste manual:**
```bash
curl -X POST https://seu-portainer.com/api/stacks/webhooks/abc123 \
  -H "Content-Type: application/json" \
  -d '{"image": "seu-usuario/nutribot-backend:latest"}'
```

### Imagem não atualiza

**Force pull:**
```
Portainer → Stacks → nutribot → Advanced Mode
Marque "Pull latest image"
Clique "Update the stack"
```

---

## 📊 Estrutura da Stack

```
┌─────────────┐
│   Traefik   │ (:80, :443)
│   Proxy     │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐  ┌──▼────┐
│Front │  │Backend│
│:80   │  │:3333  │
└──────┘  └───┬───┘
              │
       ┌──────▼──────┐
       │  PostgreSQL │
       │   :5432     │
       └─────────────┘
```

**Volumes:**
- `postgres-data`: Dados do PostgreSQL
- `backend-uploads`: Uploads do backend

**Redes:**
- `nutribot-network`: Rede interna

---

## ✅ Checklist Final

- [ ] Stack criada no Portainer
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook criado e URL copiada
- [ ] Secrets configurados no GitHub
- [ ] Push para main realizado
- [ ] Deploy automático funcionou
- [ ] Aplicação acessível em https://seu-dominio.com

---

## 🎯 Comandos Úteis

**Gerar JWT_SECRET:**
```bash
openssl rand -base64 32
```

**Testar Webhook:**
```bash
curl -X POST https://seu-portainer.com/api/stacks/webhooks/abc123 \
  -H "Content-Type: application/json" \
  -d '{"repository": "seu-usuario/nutribot-ai", "branch": "main"}'
```

**Ver logs da stack:**
```
Portainer → Stacks → nutribot → Logs
```

---

**Stack configurada!** 🎉

Agora cada push para `main` dispara deploy automático via Portainer Webhook!
