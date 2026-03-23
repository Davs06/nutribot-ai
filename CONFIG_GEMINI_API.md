# 🔑 Como Obter e Configurar API Key do Gemini

## ⚠️ PROBLEMA ATUAL

Sua API key atual **NÃO É VÁLIDA**. O erro retornado é:
```
API key not valid. Please pass a valid API key.
Reason: API_KEY_INVALID
```

A chave no arquivo `backend/.env` é apenas um **exemplo/placeholder**:
```
GEMINI_API_KEY=AIzaSyD0CxN-_UiwUd1wloTEuwiBLwl_okFHfms
                                                   ↑
                                      Isso NÃO é uma chave real!
```

---

## ✅ SIM, O FREE TIER EXISTE E É GRATUITO!

### Limites do Free Tier (2026)

| Modelo | Requisições por Minuto | Custo |
|--------|----------------------|-------|
| **gemini-2.0-flash** | 500 RPM | **GRÁTIS** |
| gemini-1.5-flash | 500 RPM | **GRÁTIS** |
| gemini-2.5-pro | 25 RPM | **GRÁTIS** |

**Não precisa de cartão de crédito!**

---

## 📋 Passo a Passo para Obter SUA Chave Real

### Passo 1: Acesse o Google AI Studio

🔗 **URL:** https://aistudio.google.com/apikey

Faça login com sua conta Google (Gmail).

---

### Passo 2: Criar API Key

1. Clique em **"Create API Key"**
2. Selecione **"Create API key in new project"** (ou escolha um projeto existente)
3. Aguarde a geração da chave

---

### Passo 3: Copiar a Chave

Você verá uma chave assim:
```
AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Características de uma chave válida:**
- ✅ Começa com `AIzaSy`
- ✅ Tem **39 caracteres** no total
- ✅ Contém letras, números, hífens e underscores
- ✅ Sem espaços em branco

**Exemplo de formato válido:**
```
AIzaSyBvNtF8K9Qx7Zm2Lp3Wr5Yt6Hj8Ng4Mc1Vb0
```

---

### Passo 4: Habilitar a API (Importante!)

Mesmo com free tier, você precisa habilitar a API:

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto que apareceu no Passo 2
3. Vá em **"APIs & Services"** → **"Library"**
4. Busque por: **"Generative Language API"**
5. Clique em **"Enable"**

---

### Passo 5: Atualizar no Projeto

1. Abra o arquivo `backend/.env`
2. Substitua a linha:
   ```env
   GEMINI_API_KEY=AIzaSyD0CxN-_UiwUd1wloTEuwiBLwl_okFHfms
   ```
   Por:
   ```env
   GEMINI_API_KEY=AIzaSyB...sua_chave_real_aqui
   ```

3. **Sem espaços** antes ou depois do `=`
4. **Sem aspas** (opcional, mas recomendado não usar)

---

### Passo 6: Reiniciar o Backend

```bash
docker compose -f docker-compose.dev.yml restart backend
```

---

### Passo 7: Testar

```bash
# Teste 1: Health Check
curl http://localhost:3333/health

# Deve mostrar:
# "gemini_api_key_valid": true

# Teste 2: API Test
curl http://localhost:3333/api/ai/test

# Deve mostrar:
# "status": "success"
# "message": "✅ API Gemini funcionando corretamente!"
```

---

## 🧪 Testar Antes de Configurar

Você pode testar sua chave diretamente:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=SUA_CHAVE_AQUI" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Diga olá"}]}]}'
```

**Se funcionar:** Você verá uma resposta JSON com a geração.

**Se falhar:** Verifique os erros abaixo.

---

## ❌ Erros Comuns e Soluções

### Erro 1: API_KEY_INVALID

**Causas:**
- Chave incorreta ou incompleta
- Chave vazada e bloqueada pelo Google
- API não habilitada no Google Cloud

**Solução:**
1. Verifique se copiou a chave completa (39 caracteres)
2. Gere uma NOVA chave em https://aistudio.google.com/apikey
3. Habilite a "Generative Language API"

---

### Erro 2: PERMISSION_DENIED

**Causa:** API não habilitada no projeto

**Solução:**
1. Acesse https://console.cloud.google.com/
2. Selecione seu projeto
3. Habilite "Generative Language API"

---

### Erro 3: 403 Forbidden (Região)

**Causa:** Você está em região restrita (Europa/EEA)

**Solução:**
- Adicione billing (cartão de crédito) no Google Cloud
- Ou use VPN para região suportada

---

### Erro 4: Chave Funcionava e Parou

**Causa:** Google detectou a chave em repositório público e bloqueou

**Solução:**
1. Gere nova chave imediatamente
2. Nunca commitar `.env` no Git
3. Adicione `.env` no `.gitignore`

---

## 🔒 Segurança

### Nunca Faça Isso:
```bash
❌ git add backend/.env
❌ commitar chaves no GitHub
❌ compartilhar chaves publicamente
```

### Faça Isso:
```bash
✅ Adicione .env no .gitignore
✅ Use variáveis de ambiente
✅ Rotacione chaves periodicamente
```

---

## 📊 Após Configurar Corretamente

### Teste a Análise de Refeições:
```bash
curl -X POST http://localhost:3333/api/food/analyze-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "{\"description\":\"comi 2 ovos mexidos com 1 fatia de pão\"}"
```

### Teste o Coach Virtual:
```bash
curl -X POST http://localhost:3333/api/dashboard/coach \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "{\"pergunta\":\"Quanto de proteína devo comer por dia?\"}"
```

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:

1. **Verifique os logs:**
   ```bash
   docker compose -f docker-compose.dev.yml logs backend
   ```

2. **Teste a chave diretamente:**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=SUA_CHAVE" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

3. **Verifique no Google AI Studio:**
   - Acesse https://aistudio.google.com/apikey
   - Veja se sua chave aparece como "Active"

---

## ✅ Checklist Final

- [ ] Acessou https://aistudio.google.com/apikey
- [ ] Clicou em "Create API Key"
- [ ] Copiou a chave completa (39 caracteres)
- [ ] Habilitou "Generative Language API" no Google Cloud
- [ ] Substituiu no `backend/.env`
- [ ] Reiniciou o backend
- [ ] Testou com `curl http://localhost:3333/api/ai/test`
- [ ] Viu `"status": "success"`

---

**Após seguir estes passos, a IA estará funcionando!** 🚀
