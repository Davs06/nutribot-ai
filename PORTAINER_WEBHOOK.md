# 🔗 Configurar Portainer Webhook para CI/CD

## 📋 Visão Geral

O Portainer Webhook permite deploy automático quando uma nova imagem Docker é publicada no Docker Hub.

---

## 🚀 Configuração no Portainer

### 1. Acesse o Portainer

```
https://seu-portainer.com
```

### 2. Navegue até o Stack

```
Home → Stacks → nutribot (ou nome do seu stack)
```

### 3. Ative Advanced Mode

```
Clique em "Advanced Mode" (canto superior direito)
```

### 4. Adicione Webhook

```
1. Role até a seção "Webhooks"
2. Clique em "Add Webhook"
3. Configure:
```

**Configurações do Webhook:**

| Campo | Valor |
|-------|-------|
| **Name** | `Deploy Dev` (ou `Deploy Prod`) |
| **Type** | `Stack webhook` |
| **Action** | `Redeploy` |

### 5. Copie a URL

Após criar, o Portainer gera uma URL como:
```
https://seu-portainer.com/api/stacks/webhooks/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**⚠️ Guarde esta URL!** Ela será usada no GitHub.

---

## 🔐 Configurar no GitHub

### 1. Acesse GitHub Secrets

```
GitHub → Seu Repositório → Settings → Secrets and variables → Actions
```

### 2. Adicione Secrets

**Para Desenvolvimento:**
```
Name: PORTAINER_WEBHOOK_DEV
Value: https://seu-portainer.com/api/stacks/webhooks/a1b2c3d4...
```

**Para Produção:**
```
Name: PORTAINER_WEBHOOK_PROD
Value: https://seu-portainer.com/api/stacks/webhooks/x9y8z7w6...
```

---

## 🧪 Testar Webhook

### Método 1: GitHub Actions

```bash
# Faça push para develop ou main
git push origin develop
# ou
git push origin main
```

O webhook será acionado automaticamente após o build e push das imagens.

### Método 2: Manual (curl)

**Testar Webhook Dev:**
```bash
curl -X POST https://seu-portainer.com/api/stacks/webhooks/SEU_WEBHOOK_DEV \
  -H "Content-Type: application/json" \
  -d '{"image": "seu-usuario/nutribot-backend:dev"}'
```

**Testar Webhook Prod:**
```bash
curl -X POST https://seu-portainer.com/api/stacks/webhooks/SEU_WEBHOOK_PROD \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "seu-usuario/nutribot-ai",
    "commit": "abc123",
    "branch": "main",
    "images": {
      "backend": "seu-usuario/nutribot-backend:latest",
      "frontend": "seu-usuario/nutribot-frontend:latest"
    }
  }'
```

---

## 📊 Verificar Deploy

### No Portainer

1. **Acesse o Stack**
   ```
   Stacks → nutribot
   ```

2. **Verifique Logs**
   ```
   Clique em "Logs" para ver o redeploy
   ```

3. **Verifique Containers**
   ```
   Containers → Verifique se foram recriados
   ```

### No GitHub Actions

1. **Acesse Actions**
   ```
   GitHub → Actions → CI/CD Pipeline
   ```

2. **Verifique o Job**
   ```
   Clique no job "deploy-prod" ou "deploy-dev"
   ```

3. **Veja o Log do Webhook**
   ```
   Procure por "Trigger Portainer Webhook"
   Deve mostrar: ✅ Portainer webhook triggered successfully!
   ```

---

## 🔧 Troubleshooting

### Webhook não aciona

**Verifique:**
1. URL do webhook está correta
2. Secret do GitHub está configurado
3. Branch está correta (develop ou main)

**No Portainer:**
```
Stacks → nutribot → Advanced Mode → Webhooks
Verifique se o webhook está ativo
```

### Deploy falha

**Verifique logs no Portainer:**
```
Stacks → nutribot → Logs
```

**Erros comuns:**
- `Image not found`: Imagem ainda não foi pushada
- `Pull access denied`: Credenciais Docker Hub incorretas
- `Container already exists`: Conflito de nomes

### Imagem não atualiza

**Force pull no Portainer:**
```
1. Stack → nutribot
2. Clique em "Advanced Mode"
3. Em "Container environment variables", adicione:
   FORCE_PULL=true
4. Clique em "Update the stack"
```

---

## 🎯 Fluxo Completo

```
┌─────────────┐
│   Push      │
│   develop   │
│   ou main   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ GitHub Actions  │
│  Build & Test   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Docker Hub     │
│  Push :dev ou   │
│  :latest        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Portainer       │
│ Webhook         │
│ (curl POST)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Portainer       │
│ Pull nova imagem│
│ Recria containers│
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Deploy        │
│   Completo!     │
└─────────────────┘
```

---

## 📝 Secrets Resumo

| Secret | Valor | Onde Obter |
|--------|-------|------------|
| `DOCKER_USERNAME` | seu-usuario | Docker Hub |
| `DOCKER_TOKEN` | abc123... | Docker Hub Settings |
| `PORTAINER_WEBHOOK_DEV` | https://.../webhooks/abc123 | Portainer Stack Dev |
| `PORTAINER_WEBHOOK_PROD` | https://.../webhooks/xyz789 | Portainer Stack Prod |

---

## ✅ Checklist

- [ ] Webhook Dev criado no Portainer
- [ ] Webhook Prod criado no Portainer
- [ ] Secrets configurados no GitHub
- [ ] Token Docker Hub configurado
- [ ] Teste de push realizado
- [ ] Deploy automático funcionando

---

**Configuração concluída!** 🎉

Agora cada push para `develop` ou `main` dispara deploy automático via Portainer Webhook!
