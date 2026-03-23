# 🔍 Debug do NutriBot Frontend

## Página de Debug

Acesse **http://localhost:5173/debug** para visualizar a página de diagnóstico que mostra:

- ✅ Status da conexão com o Backend
- ✅ Status dos componentes React/Tailwind
- ✅ Variáveis de ambiente
- ✅ Conteúdo do LocalStorage
- ✅ Informações do navegador
- ✅ Erros encontrados

## Tela Inicial de Fallback

Se houver problemas ao carregar o React, você verá uma página de fallback em **http://localhost:5173/** com:

- Status do frontend/backend
- Botões de acesso rápido (Login, Registro, Debug)
- Diagnóstico de problemas

## Error Boundary

O aplicativo agora possui um **Error Boundary** que captura erros do React e exibe:

- Mensagem do erro
- Stack trace completo
- Botões para recarregar ou limpar dados

## Problemas Comuns e Soluções

### 1. Tela Branca

**Causas possíveis:**
- Erro ao carregar componentes React
- Erro de importação de módulos
- Problema com rotas do React Router

**Soluções:**
1. Acesse `/debug` para diagnosticar
2. Abra o Console do navegador (F12) e verifique erros
3. Verifique os logs do container: `docker compose -f docker-compose.dev.yml logs frontend`

### 2. Erro "Cannot GET /"

**Causa:** Vite não está servindo o index.html corretamente

**Solução:**
```bash
# Reiniciar o container
docker compose -f docker-compose.dev.yml restart frontend
```

### 3. Erro de CORS / Backend indisponível

**Solução:**
```bash
# Verificar status do backend
docker compose -f docker-compose.dev.yml ps

# Ver logs do backend
docker compose -f docker-compose.dev.yml logs backend

# Reiniciar backend
docker compose -f docker-compose.dev.yml restart backend
```

### 4. Erro ao carregar componentes (imports)

**Verificar:**
- Se todos os arquivos nas pastas `src/pages` e `src/components` existem
- Se os imports no `App.jsx` estão corretos
- Se há erros de sintaxe nos arquivos

### 5. LocalStorage corrompido

**Solução:**
1. Acesse `/debug`
2. Clique em "Limpar LocalStorage"
3. Recarregue a página

## Comandos Úteis

```bash
# Ver logs em tempo real
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f backend

# Verificar status dos containers
docker compose -f docker-compose.dev.yml ps

# Reiniciar um serviço específico
docker compose -f docker-compose.dev.yml restart frontend
docker compose -f docker-compose.dev.yml restart backend

# Parar e subir tudo
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build

# Acessar shell do container
docker compose -f docker-compose.dev.yml exec nutribot-frontend-dev sh
docker compose -f docker-compose.dev.yml exec nutribot-backend-dev sh
```

## URLs de Teste

| Página | URL |
|--------|-----|
| **Debug** | http://localhost:5173/debug |
| **Login** | http://localhost:5173/login |
| **Registro** | http://localhost:5173/register |
| **Dashboard** | http://localhost:5173/dashboard |
| **Health Check Backend** | http://localhost:3333/health |

## Estrutura de Arquivos

```
frontend/src/
├── components/
│   ├── ErrorBoundary.jsx    ← Captura erros do React
│   └── Sidebar.jsx          ← Menu lateral
├── pages/
│   ├── Debug.jsx            ← Página de diagnóstico
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Meals.jsx
│   ├── Exercises.jsx
│   ├── Profile.jsx
│   └── Coach.jsx
├── services/
│   └── api.js               ← Configuração da API
├── App.jsx                  ← Rotas principais
├── main.jsx                 ← Ponto de entrada
└── index.css                ← Estilos globais
```

## Debug no Navegador

1. Pressione **F12** para abrir DevTools
2. Vá para a aba **Console** e verifique erros
3. Vá para a aba **Network** e verifique requisições falhando
4. No **Console**, execute:
   ```javascript
   localStorage.getItem('token')  // Verificar token
   ```

## Variáveis de Ambiente

O frontend usa:
- `VITE_API_URL` - URL da API backend (padrão: `http://localhost:3333/api`)

Para verificar:
```javascript
// No console do navegador
import.meta.env.VITE_API_URL
```
