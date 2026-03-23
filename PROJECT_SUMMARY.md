# 📦 Resumo do Projeto NutriBot AI

## ✅ O Que Foi Criado

### Backend (Node.js + Express)

#### 📁 Estrutura
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js       # Registro, login, perfil
│   │   ├── foodController.js       # Refeições e análise de alimentos
│   │   ├── exerciseController.js   # Exercícios
│   │   └── dashboardController.js  # Dashboard e coach IA
│   ├── services/
│   │   ├── tmbService.js           # Cálculos metabólicos (TMB, TDEE, IMC)
│   │   ├── nutritionService.js     # Integração com USDA API
│   │   ├── aiService.js            # Google Gemini (análise de imagens e texto)
│   │   └── exerciseService.js      # Gestão de exercícios
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── exerciseRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   └── auth.js                 # Autenticação JWT
│   └── database/
│       └── database.js             # SQLite + tabelas
├── bot/
│   └── telegramBot.js              # Chatbot Telegram
├── .env
├── .env.example
└── package.json
```

#### 🔧 Funcionalidades Implementadas

1. **Autenticação**
   - Registro com dados completos (peso, altura, idade, etc.)
   - Login com JWT
   - Perfil do usuário
   - Histórico de peso

2. **Cálculos Metabólicos**
   - TMB (Mifflin-St Jeor)
   - TDEE (Gasto Energético Total)
   - IMC
   - Distribuição de macros
   - Meta calórica por objetivo

3. **Alimentação**
   - Busca na USDA API (+380k alimentos)
   - Análise de imagens com Gemini IA
   - Análise de descrições textuais
   - Registro de refeições
   - Histórico e resumo diário

4. **Exercícios**
   - +40 exercícios pré-cadastrados com MET
   - Cálculo de calorias gastas
   - Registro e histórico
   - Estatísticas

5. **Dashboard**
   - Visão geral completa
   - Gráficos de macros
   - Histórico semanal
   - Métricas metabólicas

6. **Coach IA**
   - Chat com IA especializada
   - Recomendações personalizadas
   - Respostas baseadas no perfil do usuário

7. **Chatbot Telegram**
   - Onboarding interativo
   - Análise de fotos
   - Registro de refeições e exercícios
   - Comandos: /start, /refeicao, /exercicio, /status, /meta, /coach, /ajuda

---

### Frontend (React + Vite + TailwindCSS)

#### 📁 Estrutura
```
frontend/
├── src/
│   ├── components/
│   │   └── Sidebar.jsx             # Menu lateral
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Meals.jsx
│   │   ├── Exercises.jsx
│   │   ├── Profile.jsx
│   │   └── Coach.jsx
│   ├── services/
│   │   └── api.js                  # Integração com backend
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── vite.config.js
├── tailwind.config.js
└── package.json
```

#### 🎨 Páginas Implementadas

1. **Login** - Autenticação com design moderno
2. **Register** - Cadastro em 3 passos (dados pessoais, medidas, objetivo)
3. **Dashboard** - Visão geral com:
   - Cards de calorias, consumo, gasto, saldo
   - Gráfico de macros
   - Gráfico semanal de calorias
   - TMB, TDEE, IMC
4. **Refeições** - Lista, adição, upload de imagem, deleção
5. **Exercícios** - Lista, busca, registro, histórico, estatísticas
6. **Perfil** - Dados do usuário, métricas, distribuição de macros
7. **Coach IA** - Chat interface com perguntas rápidas

---

## 🎯 Fórmulas Científicas Implementadas

### 1. Taxa Metabólica Basal (Mifflin-St Jeor)
```
Homens:  TMB = 10 × peso(kg) + 6,25 × altura(cm) - 5 × idade + 5
Mulheres: TMB = 10 × peso(kg) + 6,25 × altura(cm) - 5 × idade - 161
```

### 2. Gasto Energético Total (TDEE)
```
TDEE = TMB × fator_atividade
- Sedentário: 1.2
- Leve: 1.375
- Moderado: 1.55
- Ativo: 1.725
- Muito ativo: 1.9
```

### 3. Calorias Gastas em Exercício (MET)
```
Calorias = 0,0175 × MET × peso(kg) × minutos
```

### 4. IMC
```
IMC = peso(kg) / (altura(m)²)
```

---

## 🔑 APIs Utilizadas

| API | Finalidade | Custo |
|-----|------------|-------|
| Google Gemini | Análise de imagens e coach IA | Grátis (60 req/min) |
| USDA FoodData | Banco de alimentos | Grátis |
| Telegram Bot | Chatbot | Grátis |

---

## 📊 Banco de Dados

### Tabelas Criadas

1. **users** - Dados dos usuários
2. **meals** - Refeições registradas
3. **exercises** - Exercícios realizados
4. **weight_logs** - Histórico de peso
5. **exercise_templates** - +40 exercícios com MET
6. **telegram_states** - Estados do bot Telegram

---

## 🚀 Como Rodar

### Backend
```bash
cd backend
npm install
# Editar .env com sua chave do Gemini
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📱 Comandos do Telegram Bot

| Comando | Descrição |
|---------|-----------|
| `/start` | Iniciar/reiniciar |
| `/register` | Cadastro rápido |
| `/foto` (enviar imagem) | Analisar refeição |
| `/refeicao <desc>` | Registrar refeição |
| `/exercicio <nome> <min>` | Registrar exercício |
| `/status` | Resumo do dia |
| `/meta` | Metas diárias |
| `/coach <pergunta>` | Tire dúvidas |
| `/ajuda` | Lista de comandos |

---

## 🎨 Design System

- **Cores**: Verde (primária), Roxo (exercícios), Laranja (calorias)
- **Fontes**: System fonts
- **Componentes**: Cards, gráficos, modais, sidebar
- **Responsivo**: Mobile-first

---

## 🔒 Segurança

- ✅ Senhas com bcrypt
- ✅ Autenticação JWT
- ✅ Validação de dados
- ✅ CORS configurado
- ✅ Proteção de rotas

---

## 📈 Próximos Passos (Sugestões)

1. **Upload de imagens** - Configurar armazenamento (S3, Cloudinary)
2. **Exportar dados** - PDF/CSV de histórico
3. **Notificações** - Lembretes de refeições
4. **Social** - Compartilhar progresso
5. **Receitas** - Sugestões de meals
6. **Integração wearables** - Fitbit, Apple Health

---

## 📝 Considerações Finais

O **NutriBot AI** é um sistema completo de acompanhamento nutricional que usa:
- ✅ IA para análise de alimentos (imagem e texto)
- ✅ Cálculos metabólicos científicos
- ✅ Multi-plataforma (Web + Telegram)
- ✅ 100% gratuito (APIs free tier)

**Tecnologias**: Node.js, Express, React, SQLite, Google Gemini, Telegram Bot

**Tempo estimado de setup**: 5-10 minutos

**Custo**: R$ 0,00 🎉

---

**Desenvolvido com ❤️ para transformar vidas!**
