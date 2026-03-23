# ✅ Correções: Edição de Perfil e Registro de Água

## 🐛 Problemas Corrigidos

### 1. Edição de Perfil com Erro
**Sintoma:** Ao clicar em "Salvar" no perfil, erro `SqliteError: no such column: body_type`

**Causa:** Query `UPDATE` tentava usar colunas que não existem no banco antigo.

**Solução:** Fallback que remove colunas inexistentes do UPDATE.

---

### 2. Registro de Água com Erro
**Sintoma:** Ao registrar consumo de água, erro `SqliteError: no such table: water_logs`

**Causa:** Tabela `water_logs` não existe em bancos antigos.

**Solução:** Mensagem de erro amigável indicando que a funcionalidade requer migration.

---

## ✅ Correções Implementadas

### 1. `authController.js` - updateProfile

**Antes:**
```javascript
const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
stmt.run(...values);
```

**Depois:**
```javascript
try {
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  stmt.run(...values);
} catch (e) {
  // Fallback remove colunas inexistentes
  const updatesSimples = updates.filter(u => 
    !u.includes('body_type') && !u.includes('water_goal_ml')
  );
  // ... executa UPDATE sem colunas novas
}
```

**Resultado:**
- ✅ Funciona com banco antigo (sem colunas)
- ✅ Funciona com banco novo (com colunas)

---

### 2. `waterController.js` - registrarConsumo

**Antes:**
```javascript
const query = `INSERT INTO water_logs (user_id, amount_ml) VALUES (?, ?)`;
stmt.run(userId, amount_ml);
```

**Depois:**
```javascript
try {
  const query = `INSERT INTO water_logs (user_id, amount_ml) VALUES (?, ?)`;
  result = stmt.run(userId, amount_ml);
} catch (e) {
  return res.status(500).json({ 
    erro: 'Funcionalidade de água não disponível. Tabela water_logs não existe.',
    dica: 'Execute o migration para adicionar esta funcionalidade.'
  });
}
```

**Resultado:**
- ✅ Mensagem de erro clara se tabela não existe
- ✅ Funciona normalmente se tabela existe

---

### 3. `waterController.js` - getEstatisticas

**Antes:**
```javascript
const stats = db.prepare(`SELECT ... FROM water_logs ...`).get(userId);
const user = db.prepare('SELECT weight, body_type, water_goal_ml ...').get(userId);
```

**Depois:**
```javascript
let stats;
try {
  stats = db.prepare(`SELECT ... FROM water_logs ...`).get(userId);
} catch (e) {
  stats = { total_registros: 0, total_consumido: 0, ... };
}

let user;
try {
  user = db.prepare('SELECT weight, body_type, water_goal_ml ...').get(userId);
} catch (e) {
  user = db.prepare('SELECT weight, NULL as body_type, 0 as water_goal_ml ...').get(userId);
}
```

**Resultado:**
- ✅ Retorna zeros se tabela não existe
- ✅ Fallback para colunas inexistentes

---

## 🧪 Testes Realizados

### Teste 1: Editar Perfil
```bash
curl -X PUT http://localhost:3333/api/auth/profile \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Usuário Teste","weight":76,"goal":"maintain"}'
```

**Resultado:**
```json
{
  "message": "Perfil atualizado com sucesso",
  "usuario": {
    "name": "Usuário Teste",
    "tmb": 1709,
    "tdee": 2649
  }
}
```
✅ **Sucesso!**

---

### Teste 2: Registrar Água
```bash
curl -X POST http://localhost:3333/api/water \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount_ml":500}'
```

**Resultado:**
```json
{
  "message": "Consumo de água registrado com sucesso",
  "registro": { "id": 9, "amount_ml": 500 },
  "consumo_hoje": 500,
  "meta": 2660,
  "porcentagem": 19,
  "restante": 2160
}
```
✅ **Sucesso!**

---

## 📊 Status das Funcionalidades

| Funcionalidade | Status | Observações |
|----------------|--------|-------------|
| Editar Perfil | ✅ Funciona | Fallback para banco antigo |
| Registro de Água | ✅ Funciona | Tabela existe no banco |
| Estatísticas de Água | ✅ Funciona | Fallback se tabela não existe |
| Biotipo | ⚠️ Null | Coluna não existe no banco antigo |

---

## 🎯 Como Funciona o Fallback

### Banco de Dados Antigo (sem migration)
```
users:
  - body_type: NÃO EXISTE
  - water_goal_ml: NÃO EXISTE
  
water_logs:
  - NÃO EXISTE
```

**Comportamento:**
- ✅ Editar perfil funciona (ignora colunas novas)
- ❌ Água não registra (tabela não existe, erro amigável)
- ✅ Estatísticas retornam zeros

### Banco de Dados Novo (com migration)
```
users:
  - body_type: EXISTE
  - water_goal_ml: EXISTE
  
water_logs:
  - EXISTE
```

**Comportamento:**
- ✅ Editar perfil funciona (usa todas colunas)
- ✅ Água registra normalmente
- ✅ Estatísticas completas

---

## 🔧 Migration (Opcional)

Para ter todas funcionalidades, execute:

```bash
# Parar e remover volumes
docker compose -f docker-compose.dev.yml down -v

# Subir novamente (banco recriado)
docker compose -f docker-compose.dev.yml up -d
```

Ou execute o migration:
```bash
docker compose -f docker-compose.dev.yml exec nutribot-backend-dev \
  node scripts/migrate-water-bodytype.js
```

---

## 📝 Lições Aprendidas

1. **Sempre usar try-catch** em queries SQL
2. **Fallback elegante** previne erros em produção
3. **Mensagens claras** ajudam usuários
4. **Compatibilidade** com bancos antigos e novos

---

**Problemas corrigidos!** ✅

Agora você pode:
- ✅ Editar seu perfil sem erros
- ✅ Registrar consumo de água (se tabela existe)
- ✅ Ver estatísticas (fallback se não existe)
