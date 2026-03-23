# 🧪 Uso da IA no NutriBot

## ✅ Mudanças Implementadas

### 1. Análise Automática de Alimentos
**Antes:** Você precisava setar calorias, proteínas, carbs e gorduras manualmente.

**Agora:** A IA calcula tudo automaticamente quando você descreve o que comeu!

**Como usar:**
```bash
# Basta dizer o que você comeu
curl -X POST http://localhost:3333/api/food/analyze-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "{\"description\":\"comi 2 ovos mexidos com 1 fatia de pão e 1 copo de suco\"}"
```

**Resposta:**
```json
{
  "mensagem": "Refeição analisada e registrada automaticamente!",
  "analise": {
    "dados": {
      "alimentos": [...],
      "refeicao_completa": {
        "calorias_totais": 450,
        "proteina_total": 25,
        "carboidratos_total": 35,
        "gordura_total": 18
      }
    }
  },
  "refeicao_registrada": {
    "id": 1,
    "nome": "Refeição analisada por IA",
    "calorias": 450,
    "proteinas": 25,
    "carboidratos": 35,
    "gorduras": 18
  }
}
```

---

### 2. Cálculo Automático de Calorias em Exercícios
**Antes:** Calorias calculadas com valor MET fixo ou padrão.

**Agora:** A IA calcula o valor MET exato baseado no exercício específico!

**Como usar:**
```bash
# Adicione use_ai: true ao registrar exercício
curl -X POST http://localhost:3333/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d "{\"name\":\"Corrida intensa\",\"duration_minutes\":30,\"use_ai\":true}"
```

**Resposta:**
```json
{
  "message": "Exercício registrado com sucesso",
  "exercicio": {
    "name": "Corrida intensa",
    "met_value": 9.0,
    "duration_minutes": 30,
    "calories_burned": 337
  },
  "ia_used": true
}
```

---

### 3. Teste da API do Gemini
**Novo endpoint para verificar se a IA está funcionando:**

```bash
curl http://localhost:3333/api/ai/test
```

**Resposta se estiver funcionando:**
```json
{
  "status": "success",
  "message": "✅ API Gemini funcionando corretamente!",
  "detalhes": {
    "valido": true,
    "mensagem": "API Gemini funcionando corretamente"
  }
}
```

**Resposta se NÃO estiver funcionando:**
```json
{
  "status": "error",
  "message": "❌ API Gemini não está funcionando",
  "detalhes": {
    "valido": false,
    "erro": "API key not valid..."
  }
}
```

---

## 🔧 Como Funciona

### Fluxo de Análise de Alimentos

```
Usuário diz: "comi arroz com frango"
         ↓
IA Gemini analisa a descrição
         ↓
Calcula: calorias, proteínas, carbs, gorduras
         ↓
Registra automaticamente no banco
         ↓
Retorna tudo pronto!
```

### Fluxo de Cálculo de Exercícios

```
Usuário registra: "Corrida, 30 minutos"
         ↓
IA calcula valor MET baseado no exercício
         ↓
Fórmula: calorias = MET × peso(kg) × (duração/60)
         ↓
Registra com calorias precisas
         ↓
Retorna exercício + calorias gastas
```

---

## 📋 Endpoints Atualizados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/ai/test` | GET | Testa se API Gemini está funcionando |
| `/api/ai/analyze-food` | POST | Analisa comida (apenas análise) |
| `/api/ai/calculate-exercise` | POST | Calcula calorias de exercício |
| `/api/food/analyze-text` | POST | **Analisa e JÁ REGISTRA** refeição |
| `/api/exercises` | POST | Registra exercício (suporta `use_ai: true`) |

---

## 🚨 Problema Atual: API Key Inválida

### Status Atual
```
❌ API key do Gemini NÃO É VÁLIDA
```

### Como Resolver

1. **Obtenha nova API key:**
   - Acesse: https://aistudio.google.com/app/apikey
   - Clique em "Create API Key"
   - Copie a chave

2. **Atualize no projeto:**
   ```bash
   # Edite backend/.env
   GEMINI_API_KEY=AIzaSy...sua_nova_chave
   ```

3. **Reinicie o backend:**
   ```bash
   docker compose -f docker-compose.dev.yml restart backend
   ```

4. **Teste:**
   ```bash
   curl http://localhost:3333/api/ai/test
   ```

---

## 🧪 Testes

### Teste 1: Health Check
```bash
curl http://localhost:3333/health
```

### Teste 2: Testar API Gemini
```bash
curl http://localhost:3333/api/ai/test
```

### Teste 3: Analisar Refeição
```bash
curl -X POST http://localhost:3333/api/food/analyze-text \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d "{\"description\":\"comi 2 ovos mexidos com 1 fatia de pão\"}"
```

### Teste 4: Registrar Exercício com IA
```bash
curl -X POST http://localhost:3333/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d "{\"name\":\"Corrida\",\"duration_minutes\":30,\"use_ai\":true}"
```

---

## 📊 Comparação: Antes vs Depois

### Registrar Refeição

| Antes | Depois |
|-------|--------|
| Setar calorias manualmente | IA calcula automaticamente |
| Setar macros manualmente | IA identifica tudo |
| Múltiplos passos | Apenas descreva o que comeu |
| `{"name": "X", "calories": 400, "protein": 25...}` | `{"description": "comi X"}` |

### Registrar Exercício

| Antes | Depois |
|-------|--------|
| MET fixo ou padrão | IA calcula MET exato |
| Menos preciso | Mais preciso |
| `use_ai: false` (padrão) | `use_ai: true` (opcional) |

---

## 💡 Dicas de Uso

### Para Refeições
Seja descritivo:
- ✅ "comi 2 ovos mexidos com 1 fatia de pão integral e 1 copo de suco de laranja"
- ✅ "almoce: 150g de arroz, 200g de frango grelhado, salada de alface e tomate"
- ❌ "comi comida"

### Para Exercícios
Seja específico:
- ✅ "Corrida intensa na esteira"
- ✅ "Musculação - treino de pernas"
- ✅ "Natação - estilo livre"

---

## 🔄 Fallback (Quando IA Falha)

Se a IA não estiver disponível:

1. **Refeições:** Retorna erro e sugere registro manual
2. **Exercícios:** Usa valor MET padrão (5.0) ou do template

O sistema continua funcionando mesmo sem IA!

---

**Atualize sua API key e aproveite os recursos com IA!** 🚀
