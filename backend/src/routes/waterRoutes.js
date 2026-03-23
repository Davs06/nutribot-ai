const express = require('express');
const waterController = require('../controllers/waterController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas de Controle de Consumo de Água
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Registrar consumo de água
router.post('/', waterController.registrarConsumo.bind(waterController));

// Obter consumo de hoje
router.get('/today', waterController.getConsumoHoje.bind(waterController));

// Obter estatísticas
router.get('/stats', waterController.getEstatisticas.bind(waterController));

// Atualizar meta de água
router.put('/goal', waterController.atualizarMeta.bind(waterController));

// Deletar registro
router.delete('/:id', waterController.deletarRegistro.bind(waterController));

// Obter meta recomendada
router.get('/recommended-goal', waterController.getMetaRecomendada.bind(waterController));

module.exports = router;
