const express = require('express');
const foodController = require('../controllers/foodController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Configurar multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

/**
 * Rotas de Alimentação
 */

// Buscar alimentos na base USDA
router.get('/search', foodController.buscarAlimento.bind(foodController));

// Obter nutrientes de um alimento
router.get('/nutrients/:fdcId', foodController.obterNutrientes.bind(foodController));

// Rotas protegidas
router.use(authMiddleware);

// Registrar refeição manualmente
router.post('/meal', foodController.registrarRefeicao.bind(foodController));

// Analisar imagem de alimento
router.post('/analyze-image', upload.single('image'), foodController.analisarImagem.bind(foodController));

// Analisar descrição textual
router.post('/analyze-text', foodController.analisarTexto.bind(foodController));

// Obter histórico de refeições
router.get('/meals', foodController.obterHistorico.bind(foodController));

// Obter resumo diário
router.get('/daily-summary', foodController.obterResumoDiario.bind(foodController));

// Deletar refeição
router.delete('/meals/:id', foodController.deletarRefeicao.bind(foodController));

module.exports = router;
