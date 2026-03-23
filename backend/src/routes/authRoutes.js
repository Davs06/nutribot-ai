const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas de Autenticação
 */

// Registro
router.post('/register', authController.register.bind(authController));

// Login
router.post('/login', authController.login.bind(authController));

// Rotas protegidas (requerem autenticação)
router.get('/me', authMiddleware, authController.getProfile.bind(authController));
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController));
router.post('/weight-log', authMiddleware, authController.registerWeightLog.bind(authController));
router.get('/weight-log', authMiddleware, authController.getWeightHistory.bind(authController));

module.exports = router;
