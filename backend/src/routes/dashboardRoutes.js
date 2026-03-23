const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas do Dashboard
 */

router.use(authMiddleware);

// Dashboard completo
router.get('/', dashboardController.getDashboard.bind(dashboardController));

// Obter recomendações da IA
router.get('/recommendations', dashboardController.getRecomendacoes.bind(dashboardController));

// Chat com coach
router.post('/coach', dashboardController.chatComCoach.bind(dashboardController));

module.exports = router;
