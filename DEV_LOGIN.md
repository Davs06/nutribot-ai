# 🔑 Credenciais de Desenvolvimento

## Usuário de Desenvolvimento Criado

Um usuário de teste foi pré-cadastrado no banco de dados para facilitar o desenvolvimento e testes.

---

## 📋 Credenciais

| Campo | Valor |
|-------|-------|
| **📧 Email** | `dev@nutribot.local` |
| **🔑 Senha** | `123456` |

---

## 🎯 Dados do Usuário

| Campo | Valor |
|-------|-------|
| **Nome** | Usuário Desenvolvedor |
| **Gênero** | Masculino |
| **Idade** | 30 anos |
| **Peso** | 75 kg |
| **Altura** | 175 cm |
| **Nível de Atividade** | Moderado |
| **Objetivo** | Manter peso |

### Métricas Calculadas

- **TMB (Taxa Metabólica Basal):** 1699 kcal/dia
- **GET (Gasto Energético Total):** 2633 kcal/dia
- **IMC:** 24.49 (Peso normal)

### Macros Alvo

- **Proteínas:** 120g (18%)
- **Carboidratos:** 385g (59%)
- **Gorduras:** 68g (23%)

---

## 🍽️ Refeições Cadastradas

| Refeição | Calorias | Proteína | Carbs | Gordura |
|----------|----------|----------|-------|---------|
| Café da Manhã | 450 kcal | 25g | 50g | 15g |
| Almoço | 650 kcal | 45g | 70g | 20g |
| Lanche da Tarde | 300 kcal | 15g | 40g | 8g |
| Jantar | 500 kcal | 35g | 45g | 18g |

**Total Diário:** 1900 kcal

---

## 🏋️ Exercícios Cadastrados

| Exercício | Duração | Calorias Gastas |
|-----------|---------|-----------------|
| Caminhada | 30 min | 197 kcal |
| Musculação | 45 min | 295 kcal |

**Total Gasto:** 492 kcal

---

## 🚀 Como Acessar

1. **Acesse o frontend:** http://localhost:5173
2. **Faça login** com as credenciais acima
3. **Explore o dashboard** com dados já preenchidos

---

## 📝 Comandos Úteis

### Criar Novo Usuário de Teste

```bash
# Via API (curl)
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@nutribot.local",
    "password": "123456",
    "gender": "female",
    "age": 25,
    "weight": 60,
    "height": 165,
    "activity_level": "light",
    "goal": "lose_weight"
  }'
```

### Fazer Login e Obter Token

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@nutribot.local",
    "password": "123456"
  }'
```

### Registrar Refeição

```bash
curl -X POST http://localhost:3333/api/food/meal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Café da Manhã",
    "description": "Ovos e pão integral",
    "calories": 450,
    "protein": 25,
    "carbs": 50,
    "fat": 15,
    "meal_type": "breakfast"
  }'
```

### Registrar Exercício

```bash
curl -X POST http://localhost:3333/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Corrida",
    "duration_minutes": 30
  }'
```

---

## 🧪 Testar API

### Health Check
```bash
curl http://localhost:3333/health
```

### Dashboard Completo
```bash
curl http://localhost:3333/api/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📌 Notas

- O token JWT expira em **7 dias**
- Para limpar todos os dados e recriar o usuário, delete o arquivo `backend/data.db`
- O script `backend/scripts/create-dev-user.js` pode ser usado para recriar o usuário

---

**Desenvolvido com ❤️ para testes rápidos!**
