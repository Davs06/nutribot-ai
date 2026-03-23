const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');

/**
 * Rotas de Teste da IA
 */

class AIController {
  /**
   * Testa se a API do Gemini está funcionando
   * GET /api/ai/test
   */
  async testarAPI(req, res) {
    try {
      const resultado = await AIService.testarAPI();
      
      if (resultado.valido) {
        res.json({
          status: 'success',
          message: '✅ API Gemini funcionando corretamente!',
          detalhes: resultado
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: '❌ API Gemini não está funcionando',
          detalhes: resultado
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Erro ao testar API',
        erro: error.message
      });
    }
  }

  /**
   * Analisa descrição de refeição e calcula calorias automaticamente
   * POST /api/ai/analyze-food
   */
  async analisarComida(req, res) {
    try {
      const { descricao } = req.body;

      if (!descricao) {
        return res.status(400).json({ erro: 'Descrição é obrigatória' });
      }

      const resultado = await AIService.analisarDescricaoRefeicao(descricao);

      if (resultado.sucesso) {
        res.json({
          sucesso: true,
          mensagem: 'Refeição analisada com sucesso!',
          dados: resultado.dados
        });
      } else {
        res.status(500).json({
          sucesso: false,
          erro: resultado.erro
        });
      }
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: error.message
      });
    }
  }

  /**
   * Calcula calorias de exercício
   * POST /api/ai/calculate-exercise
   */
  async calcularExercicio(req, res) {
    try {
      const { exercicio, duracao, peso } = req.body;

      if (!exercicio || !duracao || !peso) {
        return res.status(400).json({ 
          erro: 'Exercício, duração e peso são obrigatórios' 
        });
      }

      const resultado = await AIService.calcularCaloriasExercicio(
        exercicio,
        parseInt(duracao),
        parseFloat(peso)
      );

      if (resultado.sucesso) {
        res.json({
          sucesso: true,
          mensagem: 'Calorias calculadas com sucesso!',
          dados: resultado.dados
        });
      } else {
        res.status(500).json({
          sucesso: false,
          erro: resultado.erro
        });
      }
    } catch (error) {
      res.status(500).json({
        sucesso: false,
        erro: error.message
      });
    }
  }
}

const controller = new AIController();

router.get('/test', (req, res) => controller.testarAPI(req, res));
router.post('/analyze-food', (req, res) => controller.analisarComida(req, res));
router.post('/calculate-exercise', (req, res) => controller.calcularExercicio(req, res));

module.exports = router;
