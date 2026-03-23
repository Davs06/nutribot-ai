# 🧪 Testes do Frontend - NutriBot AI

## ✅ Status dos Testes

### 1. Autenticação
| Teste | Status | Observações |
|-------|--------|-------------|
| Login | ✅ Passou | Token gerado corretamente |
| Registro | ⚠️ Não testado | Requer novo usuário |
| Logout | ⚠️ Não testado | Funcionalidade simples |

### 2. Dashboard
| Teste | Status | Observações |
|-------|--------|-------------|
| Carregar dados | ✅ Passou | API retorna dados completos |
| Métricas | ✅ Passou | TMB, TDEE, IMC calculados |
| Gráficos | ⚠️ Não testado | Verificar no navegador |

### 3. Refeições (Meals)
| Teste | Status | Observações |
|-------|--------|-------------|
| Listar refeições | ✅ Passou | API retorna lista vazia |
| Adicionar refeição | ⚠️ Não testado | Testar no frontend |
| Analisar com IA | ⚠️ Não testado | Requer API key válida |
| Deletar refeição | ⚠️ Não testado | Testar no frontend |

### 4. Exercícios
| Teste | Status | Observações |
|-------|--------|-------------|
| Listar exercícios | ✅ Passou | 40 exercícios retornados |
| Registrar exercício | ⚠️ Não testado | Testar no frontend |
| Usar IA | ⚠️ Não testado | Campo `use_ai` implementado |

### 5. Água
| Teste | Status | Observações |
|-------|--------|-------------|
| Consumo hoje | ✅ Passou | Meta: 2625ml |
| Registrar água | ⚠️ Não testado | Tabela water_logs não existe |
| Estatísticas | ⚠️ Não testado | Testar no frontend |

### 6. Perfil
| Teste | Status | Observações |
|-------|--------|-------------|
| Carregar perfil | ✅ Passou | Dados completos |
| Editar perfil | ⚠️ Não testado | Testar no frontend |
| Biotipo | ⚠️ Não testado | Campo é null |

### 7. Coach IA
| Teste | Status | Observações |
|-------|--------|-------------|
| Chat | ⚠️ Não testado | Requer API key válida |

---

## 🔧 Problemas Conhecidos

### 1. Banco de Dados
- ❌ Tabela `water_logs` não existe
- ❌ Colunas `body_type` e `water_goal_ml` não existem
- ✅ Fallback implementado no backend

### 2. API Key Gemini
- ❌ API key inválida/expirada
- ⚠️ Funcionalidades de IA não funcionam

---

## 📋 Checklist de Testes Manuais

### Login
- [ ] Acessar /login
- [ ] Preencher email e senha
- [ ] Clicar em "Entrar"
- [ ] Verificar redirecionamento para /dashboard

### Dashboard
- [ ] Verificar cards de calorias
- [ ] Verificar gráficos de macros
- [ ] Verificar meta calórica

### Refeições
- [ ] Clicar em "Adicionar"
- [ ] Preencher formulário
- [ ] Salvar refeição
- [ ] Verificar na lista
- [ ] Testar "Analisar com IA" (se API key válida)

### Exercícios
- [ ] Clicar em "Adicionar"
- [ ] Selecionar exercício da lista
- [ ] Preencher duração
- [ ] Marcar "Usar IA" (opcional)
- [ ] Salvar exercício

### Água
- [ ] Acessar /water
- [ ] Clicar em "Registrar"
- [ ] Adicionar 250ml, 500ml, etc.
- [ ] Verificar barra de progresso

### Perfil
- [ ] Acessar /profile
- [ ] Clicar em "Editar"
- [ ] Alterar peso
- [ ] Selecionar biotipo (opcional)
- [ ] Salvar alterações

---

## 🐛 Bugs a Corrigir

1. **Tabela water_logs não existe**
   - Solução: Executar migration ou recriar banco

2. **API Key Gemini inválida**
   - Solução: Obter nova key em https://aistudio.google.com/apikey

3. **Responsividade**
   - Verificar em mobile
   - Ajustar padding e grids

---

## ✅ APIs Funcionando

```bash
# Todas as APIs retornaram sucesso:
POST   /api/auth/login          ✅ 200
GET    /api/auth/me             ✅ 200
GET    /api/dashboard           ✅ 200
GET    /api/food/meals          ✅ 200
GET    /api/exercises           ✅ 200
GET    /api/water/today         ✅ 200
```

---

**Última atualização:** 2026-03-21 09:45
