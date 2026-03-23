================================================================================
                         ESCOPO DO PROJETO
                         NutriBot AI
              Sistema de Acompanhamento Nutricional com IA
================================================================================

DATA: 19 de março de 2026
VERSÃO: 1.0
STATUS: Concluído

================================================================================
1. IDENTIFICAÇÃO DO PROJETO
================================================================================

NOME DO PROJETO: NutriBot AI
TIPO: Aplicação Web + Chatbot
ÁREA: Saúde, Nutrição e Fitness
TECNOLOGIA PRINCIPAL: Inteligência Artificial

RESUMO:
Sistema inteligente de acompanhamento nutricional que utiliza IA para analisar
alimentos através de fotos ou descrições textuais, calcular calorias consumidas
e gastas, e atuar como assistente pessoal para perda de peso e ganho de massa
muscular.

================================================================================
2. OBJETIVOS DO PROJETO
================================================================================

2.1 OBJETIVO GERAL
------------------
Desenvolver uma solução acessível e inteligente para acompanhamento nutricional
que elimine a necessidade de registro manual de calorias, utilizando IA para
automatizar o processo e fornecer recomendações personalizadas.

2.2 OBJETIVOS ESPECÍFICOS
-------------------------
• Permitir registro de alimentação através de fotos de refeições
• Permitir registro de alimentação através de descrições textuais
• Calcular automaticamente calorias e macronutrientes
• Medir a Taxa Metabólica Basal (TMB) do usuário
• Calcular gasto calórico de exercícios físicos
• Atuar como coach/assistente de nutrição com IA
• Fornecer dashboard com acompanhamento visual do progresso
• Disponibilizar interface via Web App e Chatbot Telegram

================================================================================
3. ENTREGÁVEIS DO PROJETO
================================================================================

3.1 BACKEND (API REST)
----------------------
✓ Servidor Node.js com Express
✓ Banco de dados SQLite
✓ Autenticação JWT
✓ 4 controllers (Auth, Food, Exercise, Dashboard)
✓ 4 serviços (TMB, Nutrition, AI, Exercise)
✓ Integração com Google Gemini API
✓ Integração com USDA FoodData API
✓ Chatbot Telegram integrado

3.2 FRONTEND (WEB APP)
----------------------
✓ Aplicação React com Vite
✓ 7 páginas completas:
  - Login
  - Registro (3 passos)
  - Dashboard (visão geral)
  - Refeições (lista, adicionar, analisar foto)
  - Exercícios (lista, registrar, histórico)
  - Perfil (dados, métricas, macros)
  - Coach IA (chat)
✓ Design responsivo com TailwindCSS
✓ Gráficos com Recharts
✓ Ícones com Lucide React

3.3 CHATBOT TELEGRAM
--------------------
✓ Comandos implementados:
  - /start - Iniciar/reiniciar
  - /register - Cadastro rápido
  - /foto - Analisar imagem da refeição
  - /refeicao - Registrar refeição por texto
  - /exercicio - Registrar exercício
  - /status - Resumo do dia
  - /meta - Metas diárias
  - /coach - Tire dúvidas com IA
  - /ajuda - Lista de comandos
✓ Onboarding interativo
✓ Análise de imagens integrada

3.4 DOCUMENTAÇÃO
----------------
✓ README.md - Documentação completa
✓ QUICKSTART.md - Guia de inicialização rápida
✓ PROJECT_SUMMARY.md - Resumo técnico
✓ INSTRUCCOES.md - Manual do usuário
✓ ESCOPO.md - Este arquivo

================================================================================
4. FUNCIONALIDADES IMPLEMENTADAS
================================================================================

4.1 AUTENTICAÇÃO E PERFIL
-------------------------
✓ Registro de usuário com dados completos
✓ Login com JWT
✓ Perfil com dados pessoais e metabólicos
✓ Histórico de peso
✓ Atualização de dados

4.2 CÁLCULOS METABÓLICOS
------------------------
✓ Taxa Metabólica Basal (Fórmula Mifflin-St Jeor)
✓ Gasto Energético Total (TDEE)
✓ Índice de Massa Corporal (IMC)
✓ Distribuição de macronutrientes
✓ Meta calórica por objetivo (perder/manter/ganhar)

4.3 REGISTRO DE ALIMENTAÇÃO
---------------------------
✓ Análise de imagens com IA (Google Gemini)
✓ Análise de descrições textuais com IA
✓ Busca em banco de dados USDA (+380k alimentos)
✓ Registro manual de refeições
✓ Cálculo automático de calorias e macros
✓ Histórico de refeições
✓ Resumo nutricional diário

4.4 REGISTRO DE EXERCÍCIOS
--------------------------
✓ +40 exercícios pré-cadastrados com valores MET
✓ Cálculo de calorias gastas (fórmula MET)
✓ Registro de exercícios personalizados
✓ Histórico de exercícios
✓ Estatísticas e rankings

4.5 DASHBOARD E ACOMPANHAMENTO
------------------------------
✓ Visão geral de calorias (consumo, gasto, saldo)
✓ Gráfico de macronutrientes
✓ Gráfico semanal de calorias
✓ Métricas metabólicas (TMB, TDEE, IMC)
✓ Progresso de peso
✓ Estatísticas de exercícios

4.6 COACH IA
------------
✓ Chat com assistente virtual
✓ Recomendações personalizadas
✓ Respostas baseadas no perfil do usuário
✓ Dicas de nutrição e fitness
✓ Suporte motivacional

================================================================================
5. TECNOLOGIAS UTILIZADAS
================================================================================

5.1 BACKEND
-----------
• Node.js (versão 18+)
• Express.js (framework web)
• Better-SQLite3 (banco de dados)
• JSON Web Token (autenticação)
• Bcrypt.js (criptografia de senhas)
• Multer (upload de arquivos)
• Axios (requisições HTTP)
• Dotenv (variáveis de ambiente)
• CORS (segurança)

5.2 FRONTEND
------------
• React 19
• Vite (build tool)
• React Router DOM (rotas)
• TailwindCSS (estilização)
• Recharts (gráficos)
• Lucide React (ícones)
• Axios (API client)

5.3 APIs EXTERNAS
-----------------
• Google Gemini API (IA para análise de imagens e texto)
• USDA FoodData Central API (banco de alimentos)
• Telegram Bot API (chatbot)

5.4 FERRAMENTAS
---------------
• Git (controle de versão)
• npm (gerenciador de pacotes)

================================================================================
6. FÓRMULAS CIENTÍFICAS IMPLEMENTADAS
================================================================================

6.1 TAXA METABÓLICA BASAL (Mifflin-St Jeor)
-------------------------------------------
Homens:  TMB = (10 × peso) + (6,25 × altura) - (5 × idade) + 5
Mulheres: TMB = (10 × peso) + (6,25 × altura) - (5 × idade) - 161

Onde:
• peso em quilogramas (kg)
• altura em centímetros (cm)
• idade em anos

6.2 GASTO ENERGÉTICO TOTAL (TDEE)
---------------------------------
TDEE = TMB × Fator de Atividade

Fatores:
• Sedentário (pouco/nenhum exercício): 1.2
• Leve (1-3 dias/semana): 1.375
• Moderado (3-5 dias/semana): 1.55
• Ativo (6-7 dias/semana): 1.725
• Muito ativo (trabalho físico + exercício): 1.9

6.3 CALORIAS GASTAS EM EXERCÍCIO (MET)
--------------------------------------
Calorias = 0,0175 × MET × peso(kg) × duração(minutos)

Onde MET (Metabolic Equivalent of Task) varia por exercício:
• Caminhada leve: 3.5 MET
• Corrida (8 km/h): 8.3 MET
• Musculação: 3.5-6.0 MET
• Natação: 6.0-10.0 MET
• Ciclismo: 4.0-12.0 MET

6.4 ÍNDICE DE MASSA CORPORAL (IMC)
----------------------------------
IMC = peso(kg) / (altura(m)²)

Classificação:
• < 18.5: Abaixo do peso
• 18.5-24.9: Peso normal
• 25-29.9: Sobrepeso
• 30-34.9: Obesidade grau 1
• 35-39.9: Obesidade grau 2
• ≥ 40: Obesidade grau 3

6.5 DISTRIBUIÇÃO DE MACRONUTRIENTES
-----------------------------------
Proteína: 1.6-2.2g por kg de peso corporal
Gordura: 0.8-1.0g por kg de peso corporal
Carboidratos: Restante das calorias

Valores calóricos:
• 1g proteína = 4 kcal
• 1g carboidrato = 4 kcal
• 1g gordura = 9 kcal

================================================================================
7. ESTRUTURA DO BANCO DE DADOS
================================================================================

7.1 TABELAS CRIADAS
-------------------

TABELA: users
-------------
• id (INTEGER, PRIMARY KEY)
• telegram_id (INTEGER, UNIQUE)
• name (TEXT, NOT NULL)
• email (TEXT, UNIQUE, NOT NULL)
• password (TEXT, NOT NULL)
• gender (TEXT: male|female|other)
• age (INTEGER, NOT NULL)
• weight (REAL, NOT NULL)
• height (REAL, NOT NULL)
• activity_level (TEXT: sedentary|light|moderate|active|very_active)
• goal (TEXT: lose_weight|maintain|gain_muscle)
• created_at (DATETIME)
• updated_at (DATETIME)

TABELA: meals
-------------
• id (INTEGER, PRIMARY KEY)
• user_id (INTEGER, FOREIGN KEY)
• name (TEXT, NOT NULL)
• description (TEXT)
• image_url (TEXT)
• calories (REAL, NOT NULL)
• protein (REAL)
• carbs (REAL)
• fat (REAL)
• fiber (REAL)
• meal_type (TEXT: breakfast|lunch|dinner|snack)
• consumed_at (DATETIME)
• created_at (DATETIME)

TABELA: exercises
-----------------
• id (INTEGER, PRIMARY KEY)
• user_id (INTEGER, FOREIGN KEY)
• name (TEXT, NOT NULL)
• met_value (REAL, NOT NULL)
• duration_minutes (INTEGER, NOT NULL)
• calories_burned (REAL, NOT NULL)
• performed_at (DATETIME)
• created_at (DATETIME)

TABELA: weight_logs
-------------------
• id (INTEGER, PRIMARY KEY)
• user_id (INTEGER, FOREIGN KEY)
• weight (REAL, NOT NULL)
• body_fat_percentage (REAL)
• logged_at (DATETIME)

TABELA: exercise_templates
--------------------------
• id (INTEGER, PRIMARY KEY)
• name (TEXT, UNIQUE, NOT NULL)
• met_value (REAL, NOT NULL)
• category (TEXT)

+40 exercícios pré-cadastrados incluindo:
• Caminhada (leve, moderada, rápida)
• Corrida (8, 10, 12 km/h)
• Natação (leve, moderada, intensa)
• Ciclismo (leve, moderado, intenso)
• Musculação (leve, moderada, intensa)
• CrossFit, HIIT, Yoga, Pilates
• Esportes (futebol, basquete, tênis)
• E muitos mais...

TABELA: telegram_states
-----------------------
• telegram_id (INTEGER, PRIMARY KEY)
• current_step (TEXT)
• data (TEXT)
• updated_at (DATETIME)

================================================================================
8. API ENDPOINTS
================================================================================

8.1 AUTENTICAÇÃO
----------------
POST   /api/auth/register      - Registrar novo usuário
POST   /api/auth/login         - Login de usuário
GET    /api/auth/me            - Obter perfil do usuário
PUT    /api/auth/profile       - Atualizar perfil
POST   /api/auth/weight-log    - Registrar peso diário
GET    /api/auth/weight-log    - Histórico de peso

8.2 ALIMENTAÇÃO
---------------
GET    /api/food/search        - Buscar alimentos (USDA)
GET    /api/food/nutrients/:id - Obter nutrientes de alimento
POST   /api/food/analyze-image - Analisar imagem de refeição
POST   /api/food/analyze-text  - Analisar descrição textual
POST   /api/food/meal          - Registrar refeição
GET    /api/food/meals         - Histórico de refeições
GET    /api/food/daily-summary - Resumo nutricional do dia
DELETE /api/food/meals/:id     - Deletar refeição

8.3 EXERCÍCIOS
--------------
GET    /api/exercises          - Listar exercícios disponíveis
GET    /api/exercises/search   - Buscar exercícios
POST   /api/exercises          - Registrar exercício realizado
GET    /api/exercises/history  - Histórico de exercícios
GET    /api/exercises/stats    - Estatísticas do usuário
DELETE /api/exercises/:id      - Deletar exercício
POST   /api/exercises/custom   - Adicionar exercício personalizado

8.4 DASHBOARD
-------------
GET    /api/dashboard              - Dashboard completo
GET    /api/dashboard/recommendations - Recomendações da IA
POST   /api/dashboard/coach        - Chat com coach IA

================================================================================
9. REQUISITOS TÉCNICOS
================================================================================

9.1 PRÉ-REQUISITOS
------------------
• Node.js versão 18 ou superior
• npm ou yarn
• Conexão com internet (para APIs)

9.2 DEPENDÊNCIAS DO BACKEND
---------------------------
• express: ^5.2.1
• cors: ^2.8.6
• dotenv: ^17.3.1
• better-sqlite3: ^12.8.0
• jsonwebtoken: ^9.0.3
• bcryptjs: ^3.0.3
• multer: ^2.1.1
• @google/generative-ai: ^0.24.1
• axios: ^1.13.6
• node-telegram-bot-api: ^0.67.0

9.3 DEPENDÊNCIAS DO FRONTEND
----------------------------
• react: ^19.1.0
• react-dom: ^19.1.0
• react-router-dom: ^7.6.0
• axios: ^1.13.6
• recharts: ^3.0.0
• lucide-react: ^0.514.0
• tailwindcss: ^3.4.17
• vite: ^6.3.5
• @vitejs/plugin-react: ^5.1.4

================================================================================
10. CONFIGURAÇÃO E INSTALAÇÃO
================================================================================

10.1 VARIÁVEIS DE AMBIENTE (.env)
---------------------------------
# Backend
GEMINI_API_KEY=sua_chave_gemini_aqui
TELEGRAM_BOT_TOKEN=seu_token_telegram_aqui
USDA_API_KEY=sua_chave_usda_aqui
PORT=3333
NODE_ENV=development
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3333/api

10.2 PASSOS PARA INSTALAÇÃO
---------------------------
1. Clonar/copiar projeto
2. Executar 'npm install' no backend
3. Executar 'npm install' no frontend
4. Configurar arquivo .env com chaves de API
5. Executar 'npm run dev' no backend
6. Executar 'npm run dev' no frontend
7. Acessar http://localhost:5173

================================================================================
11. FUNCIONALIDADES POR PLATAFORMA
================================================================================

11.1 WEB APP
------------
✓ Dashboard com visão geral completa
✓ Gráficos de macros e histórico
✓ Registro de refeições com upload de imagem
✓ Busca de alimentos na base USDA
✓ Registro de exercícios
✓ Perfil com todas as métricas
✓ Chat com coach IA
✓ Design responsivo

11.2 CHATBOT TELEGRAM
---------------------
✓ Onboarding interativo passo-a-passo
✓ Análise de fotos enviadas
✓ Registro rápido de refeições por texto
✓ Registro de exercícios por comando
✓ Resumo diário sob demanda
✓ Metas e macros sob demanda
✓ Chat com IA para dúvidas
✓ Comandos intuitivos e fáceis

================================================================================
12. LIMITAÇÕES E CONSIDERAÇÕES
================================================================================

12.1 LIMITAÇÕES TÉCNICAS
------------------------
• Análise de imagens é estimativa (pode haver margem de erro)
• USDA API focada em alimentos internacionais (poucos brasileiros)
• Gemini API free tem limite de 60 requisições/minuto
• SQLite não é ideal para produção em larga escala

12.2 RECOMENDAÇÕES DE USO
-------------------------
• Sempre revisar estimativas da IA
• Complementar com orientação de nutricionista
• Usar como ferramenta de acompanhamento, não diagnóstico
• Manter consistência nos registros para melhores resultados

12.3 MELHORIAS FUTURAS SUGERIDAS
--------------------------------
• Upload de imagens para cloud storage (S3, Cloudinary)
• Exportação de relatórios em PDF/CSV
• Integração com wearables (Fitbit, Apple Health, Garmin)
• Receitas saudáveis personalizadas
• Notificações push e lembretes
• Modo escuro
• Multi-idioma (português, inglês, espanhol)
• Banco de dados PostgreSQL para produção
• Autenticação social (Google, Facebook)
• Compartilhamento de progresso em redes sociais

================================================================================
13. CRONOGRAMA DE DESENVOLVIMENTO
================================================================================

FASE 1: Planejamento e Pesquisa (Concluída)
-------------------------------------------
• Pesquisa de APIs de nutrição
• Estudo de fórmulas metabólicas
• Definição de arquitetura

FASE 2: Desenvolvimento Backend (Concluída)
-------------------------------------------
• Setup do servidor Node.js
• Implementação de serviços (TMB, IA, Nutrição)
• Criação de controllers e rotas
• Integração com APIs externas
• Desenvolvimento do chatbot Telegram

FASE 3: Desenvolvimento Frontend (Concluída)
--------------------------------------------
• Setup do React com Vite
• Criação de páginas e componentes
• Integração com API backend
• Implementação de gráficos
• Estilização com TailwindCSS

FASE 4: Testes e Documentação (Concluída)
-----------------------------------------
• Testes de integração
• Testes de funcionalidades
• Criação de documentação
• Guia de instalação e uso

STATUS ATUAL: 100% CONCLUÍDO

================================================================================
14. CUSTOS DO PROJETO
================================================================================

14.1 DESENVOLVIMENTO
--------------------
• Mão de obra: Projeto próprio
• Ferramentas: Todas gratuitas (Node.js, React, VS Code)

14.2 APIs E SERVIÇOS
--------------------
• Google Gemini API: GRATUITO (60 req/min)
• USDA FoodData API: GRATUITO
• Telegram Bot API: GRATUITO
• Hospedagem (sugestão):
  - Backend: Railway/Render (free tier)
  - Frontend: Vercel/Netlify (free tier)
  - Banco de dados: SQLite (local) ou PostgreSQL (free tier)

14.3 CUSTO TOTAL ESTIMADO
-------------------------
• Desenvolvimento: R$ 0,00
• APIs: R$ 0,00
• Hospedagem: R$ 0,00 (free tiers)
• **TOTAL: R$ 0,00** 🎉

================================================================================
15. CONCLUSÃO
================================================================================

O projeto NutriBot AI foi desenvolvido com sucesso, entregando uma solução
completa e funcional para acompanhamento nutricional inteligente.

PRINCIPAIS CONQUISTAS:
✓ Sistema 100% funcional e testado
✓ IA integrada para análise de alimentos
✓ Multi-plataforma (Web + Telegram)
✓ Custo zero de operação
✓ Código bem estruturado e documentado
✓ Escalável e extensível

O sistema está pronto para uso e pode ser facilmente expandido com novas
funcionalidades conforme necessidade.

================================================================================
                         FIM DO DOCUMENTO DE ESCOPO
================================================================================

Documento elaborado em: 19 de março de 2026
Projeto: NutriBot AI
Versão: 1.0
Status: CONCLUÍDO

================================================================================
