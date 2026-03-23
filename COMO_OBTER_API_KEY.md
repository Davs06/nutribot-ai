# 🔑 Como Obter Nova API Key do Gemini

## ⚠️ IMPORTANTE: Sua API Key Atual Foi Comprometida

A API key que estava neste projeto foi **bloqueada automaticamente pelo Google** por segurança.

**Motivo:** A chave foi encontrada em arquivos de texto no repositório, o que representa um risco de vazamento.

---

## 📋 Passos para Obter Nova Chave

### 1. Acesse o Google AI Studio
```
🔗 URL: https://aistudio.google.com/apikey
```

### 2. Faça Login
- Use sua conta Google (Gmail)
- Aceite os termos de serviço

### 3. Crie Nova API Key
1. Clique em **"Create API Key"**
2. Selecione **"Create API key in new project"** (ou projeto existente)
3. Aguarde a geração
4. **Copie a chave** (39 caracteres, começa com `AIzaSy...`)

### 4. Atualize no Projeto
1. Abra o arquivo `backend/.env`
2. Substitua a linha:
   ```env
   GEMINI_API_KEY=AIzaSy...SUA_NOVA_CHAVE_AQUI
   ```
3. **Salve o arquivo**

### 5. Reinicie o Backend
```bash
docker compose -f docker-compose.dev.yml restart backend
```

### 6. Teste
```bash
curl http://localhost:3333/api/ai/test
```

**Resposta esperada:**
```json
{
  "status": "success",
  "message": "✅ API Gemini funcionando corretamente!"
}
```

---

## 🔒 Boas Práticas de Segurança

### ✅ Faça
- Use variáveis de ambiente (`.env`)
- Mantenha `.env` no `.gitignore`
- Revogue chaves antigas quando gerar novas
- Monitore uso no Google AI Studio

### ❌ Não Faça
- Nunca commitar `.env` no Git
- Nunca coloque chaves em arquivos de texto (.md, .bat, .txt)
- Nunca compartilhe chaves em fóruns ou chats
- Nunca exponha chaves no frontend (JavaScript do navegador)

---

## 📊 Free Tier do Gemini

| Recurso | Limite |
|---------|--------|
| Requisições/minuto | 500 RPM |
| Requisições/dia | 50,000 |
| Tokens/minuto | 1,000,000 |
| Custo | **GRÁTIS** |

**Não precisa de cartão de crédito!**

---

## 🐛 Problemas Comuns

### Erro: "API key not valid"
**Causa:** Chave expirada, revogada ou digitada incorretamente  
**Solução:** Gere nova chave em https://aistudio.google.com/apikey

### Erro: "RESOURCE_EXHAUSTED"
**Causa:** Limite de requisições excedido  
**Solução:** Aguarde alguns minutos ou reduza frequência de chamadas

### Erro: "FAILED_PRECONDITION"
**Causa:** Região sem suporte ao free tier  
**Solução:** Ative faturamento no Google Cloud Console

---

## 📞 Precisa de Ajuda?

- **Docs Oficial:** https://ai.google.dev/gemini-api/docs
- **Troubleshooting:** https://ai.google.dev/gemini-api/docs/troubleshooting
- **Suporte:** https://discuss.ai.google.dev/

---

**Última atualização:** Março 2026
