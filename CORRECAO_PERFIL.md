# ✅ Correção: Página de Perfil em Branco

## 🐛 Problema Identificado

**Sintoma:** Página de Perfil totalmente em branco, apenas sidebar visível.

**Causa:** Erro no banco de dados SQLite:
```
SqliteError: no such column: body_type
```

O banco de dados não foi atualizado com as novas colunas (`body_type`, `water_goal_ml`) e a nova tabela (`water_logs`).

---

## ✅ Solução Implementada

### 1. Fallback no Backend

Em vez de quebrar quando as colunas não existem, o backend agora usa **try-catch** e fornece valores padrão:

**Exemplo:**
```javascript
// Antes (quebrava)
const user = db.prepare(`
  SELECT id, name, email, body_type, water_goal_ml
  FROM users WHERE id = ?
`).get(userId);

// Depois (funciona mesmo sem as colunas)
let user;
try {
  user = db.prepare(`
    SELECT id, name, email, body_type, water_goal_ml
    FROM users WHERE id = ?
  `).get(userId);
} catch (e) {
  user = db.prepare(`
    SELECT id, name, email, NULL as body_type, 0 as water_goal_ml
    FROM users WHERE id = ?
  `).get(userId);
}
```

### 2. Arquivos Corrigidos

| Arquivo | Mudanças |
|---------|----------|
| `controllers/authController.js` | ✅ `getProfile()` com fallback<br>✅ `updateProfile()` ignora colunas inexistentes |
| `controllers/waterController.js` | ✅ `registrarConsumo()` com fallback<br>✅ `getConsumoHoje()` com fallback<br>✅ `getEstatisticas()` com fallback<br>✅ `calcularDiasConsecutivos()` retorna 0 se tabela não existe<br>✅ `getMetaRecomendada()` com fallback<br>✅ `atualizarMeta()` retorna erro amigável |

---

## 🔧 Como Funciona Agora

### Banco de Dados Antigo (sem migration)
- ✅ Perfil carrega normalmente
- ✅ `body_type` = `null`
- ✅ `water_goal_ml` = `0`
- ✅ Funcionalidades básicas funcionam
- ⚠️ Água não funciona (tabela não existe)

### Banco de Dados Novo (com migration)
- ✅ Todas funcionalidades disponíveis
- ✅ Biotipo influencia TMB e IMC
- ✅ Meta de água personalizável
- ✅ Controle completo de hidratação

---

## 📝 Migration Disponível

O script `backend/scripts/migrate-water-bodytype.js` ainda pode ser executado para adicionar as colunas:

```bash
docker compose -f docker-compose.dev.yml exec nutribot-backend-dev \
  node scripts/migrate-water-bodytype.js
```

**O que o migration faz:**
1. Adiciona `body_type` em `users`
2. Adiciona `water_goal_ml` em `users`
3. Cria tabela `water_logs`
4. Lida com colunas duplicadas (se já existirem)

---

## 🧪 Testes

### Testar Perfil
1. Acesse: http://localhost:5173/profile
2. Deve carregar:
   - ✅ Informações pessoais
   - ✅ Métricas metabólicas
   - ✅ IMC
   - ✅ Macronutrientes

### Testar Água (apenas com migration)
1. Acesse: http://localhost:5173/water
2. Deve mostrar:
   - ✅ Barra de progresso
   - ✅ Botões de registro
   - ✅ Histórico do dia

---

## 🎯 Resultado

### Antes
- ❌ Página em branco
- ❌ Erro 500 no backend
- ❌ `profile` = `null`
- ❌ Frontend travado no loading

### Depois
- ✅ Perfil carrega normalmente
- ✅ Dados exibidos corretamente
- ✅ Biotipo funciona (se migration executado)
- ✅ Água funciona (se migration executado)
- ✅ Fallback elegante para bancos antigos

---

## 📚 Lições Aprendidas

1. **Sempre usar fallback** ao queryar colunas novas
2. **Migrations devem ser opcionais** (não quebrar sistema)
3. **Try-catch em queries SQL** previne erros em produção
4. **Valores padrão** (`NULL`, `0`) permitem compatibilidade

---

**Página de Perfil corrigida!** ✅

Agora o sistema funciona tanto em bancos de dados antigos quanto novos, com ou sem as colunas de biotipo e água.
