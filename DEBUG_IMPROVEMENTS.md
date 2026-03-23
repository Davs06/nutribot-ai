# 🔧 Melhorias de Debug do NutriBot

## ✅ Mudanças Realizadas

### 1. Página de Debug (`/debug`)
**Arquivo:** `frontend/src/pages/Debug.jsx`

Uma página completa de diagnóstico que mostra:
- ✅ Status da conexão com o Backend API
- ✅ Status dos componentes React e Tailwind
- ✅ Variáveis de ambiente (VITE_API_URL)
- ✅ Conteúdo do LocalStorage
- ✅ Informações do navegador (User Agent)
- ✅ Lista de erros encontrados
- ✅ Ações rápidas (limpar localStorage, recarregar)
- ✅ Links úteis

**Acesso:** http://localhost:5173/debug

---

### 2. Error Boundary
**Arquivos:** 
- `frontend/src/components/ErrorBoundary.jsx` (novo)
- `frontend/src/main.jsx` (atualizado)

Captura erros do React em tempo de execução e exibe:
- Mensagem do erro
- Stack trace completo
- Botões para:
  - Recarregar página
  - Limpar dados e recarregar
  - Ir para página de Debug

---

### 3. Sidebar Atualizada
**Arquivo:** `frontend/src/components/Sidebar.jsx`

Adicionado item de menu "Debug" com ícone de bug para acesso rápido à página de diagnóstico.

---

### 4. Página de Fallback
**Arquivo:** `frontend/public/fallback.html`

Página HTML estática que é exibida caso o React falhe ao carregar, mostrando:
- Status dos serviços (frontend/backend)
- Links rápidos para Login, Registro e Debug
- Spinner de carregamento

---

### 5. Documentação de Debug
**Arquivo:** `frontend/DEBUG.md`

Guia completo de troubleshooting com:
- Problemas comuns e soluções
- Comandos úteis Docker
- URLs de teste
- Estrutura de arquivos
- Dicas de debug no navegador

---

### 6. Correção de Imports no Backend
**Arquivo:** `backend/src/server.js`

Corrigidos os caminhos de importação que estavam causando erro no Docker:
```javascript
// Antes (incorreto no Docker)
require('./src/database/database');
require('./src/routes/authRoutes');

// Depois (correto)
require('./database/database');
require('./routes/authRoutes');
```

---

## 🚀 Como Usar

### Acessar a Página de Debug
```
http://localhost:5173/debug
```

### Acessar a Página de Fallback
```
http://localhost:5173/fallback.html
```

### Verificar Logs em Tempo Real
```bash
# Frontend
docker compose -f docker-compose.dev.yml logs -f frontend

# Backend
docker compose -f docker-compose.dev.yml logs -f backend

# Ambos
docker compose -f docker-compose.dev.yml logs -f
```

### Comandos de Debug
```bash
# Ver status dos containers
docker compose -f docker-compose.dev.yml ps

# Reiniciar frontend
docker compose -f docker-compose.dev.yml restart frontend

# Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend

# Ver logs específicos
docker compose -f docker-compose.dev.yml logs frontend --tail=50

# Acessar shell do container
docker compose -f docker-compose.dev.yml exec nutribot-frontend-dev sh
```

---

## 🎯 Fluxo de Debug

1. **Tela branca?** → Acesse `/debug` ou `/fallback.html`
2. **Erro no React?** → Error Boundary vai capturar e mostrar o erro
3. **Backend offline?** → Página de debug vai indicar
4. **Problema de autenticação?** → Use "Limpar LocalStorage" no debug

---

## 📊 Status Atual

| Serviço | Status | URL |
|---------|--------|-----|
| Frontend | ✅ Rodando | http://localhost:5173 |
| Backend | ✅ Rodando | http://localhost:3333 |
| Debug | ✅ Disponível | http://localhost:5173/debug |
| Fallback | ✅ Disponível | http://localhost:5173/fallback.html |

---

## 📁 Estrutura Atualizada

```
frontend/
├── public/
│   ├── fallback.html          ← NOVO: Página de fallback
│   └── index.html             ← NOVO: Página de índice de debug
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx  ← NOVO: Captura erros React
│   │   └── Sidebar.jsx        ← ATUALIZADO: Menu Debug
│   ├── pages/
│   │   ├── Debug.jsx          ← NOVO: Página de diagnóstico
│   │   ├── Login.jsx
│   │   └── ... (outras páginas)
│   ├── services/
│   │   └── api.js
│   ├── App.jsx                ← ATUALIZADO: Rota /debug
│   ├── main.jsx               ← ATUALIZADO: Com ErrorBoundary
│   └── index.css
└── DEBUG.md                   ← NOVO: Documentação de debug
```

---

## 🔍 Próximos Passos

Se ainda houver problemas:

1. **Abra o Console do Navegador (F12)**
   - Verifique a aba "Console" por erros
   - Verifique a aba "Network" por requisições falhando

2. **Acesse `/debug`**
   - Veja o status de cada serviço
   - Verifique variáveis de ambiente

3. **Verifique os logs Docker**
   ```bash
   docker compose -f docker-compose.dev.yml logs -f
   ```

4. **Teste o Backend diretamente**
   ```
   http://localhost:3333/health
   ```

---

**Desenvolvido com ❤️ para debugar mais rápido!**
