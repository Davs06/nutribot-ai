require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar banco de dados (inicializa as tabelas)
require('./database/database');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const waterRoutes = require('./routes/waterRoutes');

// Importar bot do Telegram (inicialização opcional)
const { iniciarBot } = require('../bot/telegramBot');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs de requisições (dev)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/water', waterRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NutriBot AI API',
    gemini_api_configured: !!process.env.GEMINI_API_KEY,
    gemini_api_key_valid: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'sua_chave_gemini_aqui'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'NutriBot AI API',
    version: '1.0.0',
    description: 'Sistema de acompanhamento nutricional com IA',
    gemini_status: process.env.GEMINI_API_KEY ? 'configurado' : 'não configurado',
    endpoints: {
      auth: '/api/auth',
      food: '/api/food',
      exercises: '/api/exercises',
      dashboard: '/api/dashboard',
      ai: '/api/ai (teste da IA)',
      health: '/health'
    }
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
  }
  
  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🏋️  NutriBot AI API - Servidor Iniciado!              ║
║                                                          ║
║   Porta: ${PORT}                                          ║
║   Ambiente: ${process.env.NODE_ENV || 'development'}                              ║
║   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}                  ║
║                                                          ║
║   Endpoints:                                             ║
║   • GET  /api/auth/register - Registrar usuário          ║
║   • POST /api/auth/login - Login                         ║
║   • GET  /api/food/search - Buscar alimentos             ║
║   • POST /api/food/analyze-image - Analisar imagem       ║
║   • GET  /api/exercises - Listar exercícios              ║
║   • GET  /api/dashboard - Dashboard completo             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
  
  // Iniciar bot do Telegram se configurado
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'seu_token_telegram_aqui') {
    iniciarBot();
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 Recebido SIGTERM, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

module.exports = server;
