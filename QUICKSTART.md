# Guia de Inicialização Rápida

## 🚀 Comece em 5 minutos!

### Passo 1: Obter API Key do Gemini (Grátis)

1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada

### Passo 2: Configurar Backend

```bash
cd backend

# Instalar dependências (se ainda não fez)
npm install

# Editar o arquivo .env
# Substitua "sua_chave_gemini_aqui" pela sua chave do Gemini
```

Exemplo de `.env` configurado:
```
GEMINI_API_KEY=AIzaSy...sua_chave_aqui
TELEGRAM_BOT_TOKEN=opcional_por_enquanto
USDA_API_KEY=opcional_por_enquanto
PORT=3333
JWT_SECRET=meu_segredo_jwt_123456
```

### Passo 3: Iniciar Backend

```bash
cd backend
npm run dev
```

Você deve ver:
```
╔══════════════════════════════════════════════════════════╗
║   🏋️  NutriBot AI API - Servidor Iniciado!              ║
║   Porta: 3333                                             ║
╚══════════════════════════════════════════════════════════╝
```

### Passo 4: Iniciar Frontend (novo terminal)

```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

### Passo 5: Criar Conta

1. Clique em "Cadastre-se"
2. Preencha seus dados
3. Complete o formulário em 3 passos
4. Pronto! 🎉

---

## 📱 Configurar Telegram Bot (Opcional)

1. No Telegram, busque por @BotFather
2. Envie `/newbot`
3. Dê um nome ao seu bot
4. Copie o token gerado
5. Cole no `.env` do backend em `TELEGRAM_BOT_TOKEN`
6. Reinicie o backend

---

## ❓ Problemas Comuns

### Erro: "Token não fornecido"
- Verifique se o frontend está enviando o token no header
- Faça login novamente

### Erro: "Gemini API error"
- Verifique se a API Key está correta no .env
- Reinicie o backend

### Frontend não carrega
- Verifique se o backend está rodando na porta 3333
- Limpe o cache do navegador

---

## 🎯 Testando as Funcionalidades

### 1. Dashboard
- Acesse `/dashboard`
- Veja suas métricas metabólicas
- Confira os gráficos de macros

### 2. Registrar Refeição
- Vá em "Refeições"
- Clique em "Adicionar" ou "Analisar Foto"
- Preencha os dados ou envie uma imagem

### 3. Registrar Exercício
- Vá em "Exercícios"
- Busque um exercício ou selecione da lista
- Informe a duração em minutos

### 4. Coach IA
- Vá em "Coach IA"
- Faça uma pergunta sobre nutrição ou fitness
- Receba uma resposta personalizada!

---

**Divirta-se! 🏋️**
