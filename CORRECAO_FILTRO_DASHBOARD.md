# ✅ Correção do Filtro Diário no Dashboard

## 🐛 Problema Identificado

O filtro "Dia" no Dashboard não estava funcionando.

**Causas:**
1. Frontend não estava passando parâmetro `period` na requisição
2. Backend não suportava valor `day` no switch

---

## ✅ Correções Implementadas

### 1. Frontend (`api.js`)

**Antes:**
```javascript
export const dashboard = {
  get: () => api.get('/dashboard'),  // ❌ Sem parâmetro
};
```

**Depois:**
```javascript
export const dashboard = {
  get: (period = 'week') => api.get(`/dashboard?period=${period}`),  // ✅ Com parâmetro
};
```

---

### 2. Backend (`dashboardController.js`)

**Antes:**
```javascript
const { period = 'week' } = req.query;
const days = period === 'month' ? 30 : 7;  // ❌ Sem suporte para 'day'
```

**Depois:**
```javascript
const { period = 'week' } = req.query;

let days;
switch (period) {
  case 'day':
    days = 1;    // ✅ Suporte para dia
    break;
  case 'month':
    days = 30;
    break;
  default:
    days = 7;
}
```

---

## 🧪 Testes Realizados

### Teste 1: Filtro Diário
```bash
curl "http://localhost:3333/api/dashboard?period=day" \
  -H "Authorization: Bearer TOKEN"
```

**Resultado:**
```json
{
  "hoje": {
    "consumo": { "calorias": 0 },
    "refeicoes_count": 0,
    "exercicios_count": 0
  },
  "semana": {
    "dias_registrados": 1,
    "dias": [{"data": "2026-03-21", "calorias": 275}]
  }
}
```
✅ **Funcionando!**

---

### Teste 2: Filtro Semanal
```bash
curl "http://localhost:3333/api/dashboard?period=week" \
  -H "Authorization: Bearer TOKEN"
```
✅ **Funcionando!**

---

### Teste 3: Filtro Mensal
```bash
curl "http://localhost:3333/api/dashboard?period=month" \
  -H "Authorization: Bearer TOKEN"
```
✅ **Funcionando!**

---

## 📊 Funcionamento Atual

| Período | Dias | Dados Exibidos |
|---------|------|----------------|
| **Dia** | 1 | Consumo e gasto do dia atual |
| **Semana** | 7 | Últimos 7 dias |
| **Mês** | 30 | Últimos 30 dias |

---

## 📁 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `frontend/src/services/api.js` | ✅ Parâmetro period no dashboard.get() |
| `backend/src/controllers/dashboardController.js` | ✅ Switch com suporte a 'day' |

---

## 🎯 Como Usar no Frontend

```javascript
// No Dashboard.jsx
const [period, setPeriod] = useState('week');

// Botões
<button onClick={() => setPeriod('day')}>Dia</button>
<button onClick={() => setPeriod('week')}>Semana</button>
<button onClick={() => setPeriod('month')}>Mês</button>

// Requisição automática
useEffect(() => {
  loadDashboard();
}, [period]);

const loadDashboard = async () => {
  const response = await dashboard.get(period);  // ✅ Passa o período
  setData(response.data);
};
```

---

**Filtro corrigido e funcionando!** 🎉

Agora você pode alternar entre:
- ✅ Dia (dados de hoje)
- ✅ Semana (últimos 7 dias)
- ✅ Mês (últimos 30 dias)
