const express = require('express');
const exerciseController = require('../controllers/exerciseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * Rotas de Exercícios
 */

// Listar exercícios disponíveis (público)
router.get('/', exerciseController.listarExercicios.bind(exerciseController));

// Buscar exercícios por nome (público)
router.get('/search', exerciseController.buscarExercicio.bind(exerciseController));

// Rotas protegidas
router.use(authMiddleware);

// Registrar exercício
router.post('/', exerciseController.registrarExercicio.bind(exerciseController));

// Obter histórico
router.get('/history', exerciseController.obterHistorico.bind(exerciseController));

// Obter estatísticas
router.get('/stats', exerciseController.obterEstatisticas.bind(exerciseController));

// Deletar exercício
router.delete('/:id', exerciseController.deletarExercicio.bind(exerciseController));

// Adicionar exercício personalizado
router.post('/custom', exerciseController.adicionarExercicioPersonalizado.bind(exerciseController));

module.exports = router;
