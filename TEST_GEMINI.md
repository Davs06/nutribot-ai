# 🧪 Teste da API Gemini

## ❌ Problema Detectado

Sua API key do Gemini **não é válida**. O erro retornado foi:
```
API key not valid. Please pass a valid API key.
```

---

## ✅ Como Obter Nova API Key

### Passo 1: Acesse o Google AI Studio
```
https://aistudio.google.com/app/apikey
```

### Passo 2: Crie uma API Key
1. Clique em **"Create API Key"**
2. Selecione um projeto Google (ou crie um novo)
3. Copie a chave gerada (começa com `AIzaSy...`)

### Passo 3: Atualize no Projeto

**Opção A: Editar arquivo .env**
```bash
# Edite backend/.env e substitua:
GEMINI_API_KEY=AIzaSy...sua_nova_chave_aqui
```

**Opção B: Via Docker Compose**
```bash
# No docker-compose.dev.yml, a variável já está configurada
# Basta atualizar o arquivo backend/.env
```

### Passo 4: Reinicie o Backend
```bash
docker compose -f docker-compose.dev.yml restart backend
```

---

## 🧪 Testar API Key

### Teste 1: Health Check da IA
```bash
curl http://localhost:3333/api/ai/test
```

### Teste 2: Analisar Descrição de Refeição
```bash
curl -X POST http://localhost:3333/api/food/analyze-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"description\":\"comi 2 ovos mexidos com 1 fatia de pão\"}"
```

### Teste 3: Coach IA
```bash
curl -X POST http://localhost:3333/api/dashboard/coach \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d "{\"pergunta\":\"Quantas calorias devo comer por dia?\"}"
```

---

## 📝 Notas

- A API do Gemini é **gratuita** até 60 requisições por minuto
- Não compartilhe sua API key publicamente
- A chave atual (`AIzaSyD0CxN-_UiwUd1wloTEuwiBLwl_okFHfms`) parece ser um exemplo/inválida

---

## 🔍 Debug

Se ainda houver erro após trocar a chave:

1. **Verifique se o backend carregou a nova variável:**
   ```bash
   docker compose -f docker-compose.dev.yml logs backend | grep "GEMINI"
   ```

2. **Teste a conexão direta com a API:**
   ```bash
   curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=SUA_CHAVE \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

3. **Verifique se há rate limiting:**
   - Acesse https://aistudio.google.com/app/apikey
   - Veja o quota de uso

---

**Atualize a API key e teste novamente!** 🚀
