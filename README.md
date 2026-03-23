# 🏋️ NutriBot AI

Sistema inteligente de acompanhamento nutricional e fitness com IA. Conte calorias através de fotos ou descrições de refeições, registre exercícios e receba recomendações personalizadas.

## 🎉 Agora Dockerizado!

O projeto agora pode ser implantado em produção com **Docker + Traefik**! 🐳

```bash
# Produção (com Traefik e SSL automático)
docker compose up -d

# Desenvolvimento
docker compose -f docker-compose.dev.yml up -d
```

📖 **Veja [DOCKER.md](DOCKER.md) para o guia completo de Dockerização.**

---

## ✨ Funcionalidades

### 🍽️ **Registro de Alimentação**
- 📸 **Análise de imagens**: Tire uma foto da sua refeição e a IA identifica os alimentos
- 📝 **Descrição textual**: Descreva o que comeu em linguagem natural
- 🔍 **Busca em banco de dados**: +380.000 alimentos da USDA
- 📊 **Cálculo automático**: Calorias e macronutrientes calculados automaticamente

### 🏃 **Registro de Exercícios**
- 📋 **Lista de exercícios**: +40 exercícios pré-cadastrados com valores MET
- 🔥 **Cálculo de calorias**: Baseado no seu peso e duração do exercício
- 📈 **Histórico e estatísticas**: Acompanhe sua evolução

### 🤖 **IA como Coach**
- 💬 **Chat inteligente**: Tire dúvidas sobre nutrição e fitness
- 📊 **Recomendações personalizadas**: Baseadas no seu histórico
- 🎯 **Metas automáticas**: Calculadas conforme seu objetivo

### 📱 **Multi-plataforma**
- 🌐 **Web App**: Dashboard completo com gráficos
- 💬 **Chatbot Telegram**: Registre refeições via chat

## 🛠️ Tecnologias

| Componente | Tecnologia |
|------------|------------|
| Backend | Node.js + Express |
| Frontend | React + Vite + TailwindCSS |
| Banco de Dados | SQLite |
| IA | Google Gemini API |
| Bot | Telegram Bot API |
| API Nutrição | USDA FoodData Central |

## 🚀 Instalação

### Opção 1: Docker (Recomendado para Produção) 🐳

**Pré-requisitos:**
- Docker 20+ instalado
- Docker Compose 2+ instalado

**Passos:**

```bash
# 1. Copiar .env
cp .env.example .env

# 2. Editar .env com suas chaves de API
# 3. Deploy
docker compose up -d
```

Acesse: **https://nutribot.local**

📖 **Guia completo:** [DOCKER.md](DOCKER.md)

---

### Opção 2: Manual (Desenvolvimento)

### Pré-requisitos
- Node.js 18+ instalado
- Conta no [Google AI Studio](https://aistudio.google.com/) para API Key do Gemini
- (Opcional) Token do Telegram para o chatbot

### 1. Clone o projeto
```bash
cd nutribot-ai
```

### 2. Configure o Backend

```bash
cd backend

# Instale as dependências
npm install

# Copie o arquivo de ambiente
cp .env.example .env

# Edite o .env e adicione suas chaves de API
```

### 3. Obtenha as API Keys

#### Google Gemini API (Grátis)
1. Acesse https://aistudio.google.com/app/apikey
2. Crie uma API Key
3. Cole no arquivo `.env` do backend

#### USDA API Key (Grátis) - Opcional
1. Acesse https://fdc.nal.usda.gov/api-key.html
2. Registre-se para obter uma chave
3. Cole no arquivo `.env`

#### Telegram Bot Token (Opcional)
1. No Telegram, converse com @BotFather
2. Envie `/newbot` e siga as instruções
3. Cole o token no `.env`

### 4. Configure o Frontend

```bash
cd ../frontend

# Instale as dependências
npm install
```

## ▶️ Executando

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
O servidor iniciará em `http://localhost:3333`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
O frontend iniciará em `http://localhost:5173`

## 📱 Usando o Chatbot Telegram

1. Inicie uma conversa com seu bot no Telegram
2. Envie `/start` para começar
3. Siga o onboarding ou use `/register` com seus dados
4. Use os comandos:
   - 📸 Envie uma **foto** para analisar
   - `/refeicao <descrição>` - Registre refeição
   - `/exercicio <nome> <minutos>` - Registre exercício
   - `/status` - Resumo do dia
   - `/meta` - Suas metas
   - `/coach <pergunta>` - Tire dúvidas
   - `/ajuda` - Lista de comandos

## 📖 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Alimentação
- `GET /api/food/search?query=arroz` - Buscar alimentos
- `POST /api/food/analyze-image` - Analisar imagem
- `POST /api/food/analyze-text` - Analisar descrição
- `GET /api/food/meals` - Histórico de refeições
- `POST /api/food/meal` - Registrar refeição

### Exercícios
- `GET /api/exercises` - Listar exercícios
- `POST /api/exercises` - Registrar exercício
- `GET /api/exercises/history` - Histórico

### Dashboard
- `GET /api/dashboard` - Dashboard completo
- `GET /api/dashboard/recommendations` - Recomendações IA
- `POST /api/dashboard/coach` - Chat com coach

## 📊 Fórmulas Utilizadas

### Taxa Metabólica Basal (Mifflin-St Jeor)
- **Homens**: `10 × peso + 6,25 × altura - 5 × idade + 5`
- **Mulheres**: `10 × peso + 6,25 × altura - 5 × idade - 161`

### Gasto Calórico (Método MET)
```
Calorias = 0,0175 × MET × peso(kg) × minutos
```

## 🎯 Estrutura do Projeto

```
nutribot-ai/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Controladores da API
│   │   ├── services/         # Serviços (IA, Nutrição, TMB)
│   │   ├── routes/           # Rotas da API
│   │   ├── middleware/       # Middleware (auth)
│   │   └── database/         # Banco de dados
│   ├── bot/                  # Bot do Telegram
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas
│   │   └── services/         # Serviços API
│   └── package.json
└── README.md
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados de entrada
- CORS configurado

## 📝 Licença

MIT - Sinta-se livre para usar e modificar!

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'Adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ usando IA**
