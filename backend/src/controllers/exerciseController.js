const db = require('../database/database');
const ExerciseService = require('../services/exerciseService');
const TMBService = require('../services/tmbService');
const AIService = require('../services/aiService');

/**
 * Controller de Exercícios
 */

class ExerciseController {
  /**
   * Lista todos os exercícios disponíveis
   * GET /api/exercises
   */
  async listarExercicios(req, res) {
    try {
      const { category } = req.query;
      const exercicios = ExerciseService.listarExercicios(category);
      res.json({ exercicios });
    } catch (error) {
      console.error('Erro ao listar exercícios:', error);
      res.status(500).json({ erro: 'Erro ao listar exercícios' });
    }
  }

  /**
   * Busca exercícios por nome
   * GET /api/exercises/search?query=corrida
   */
  async buscarExercicio(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ erro: 'Termo de busca é obrigatório' });
      }

      const exercicios = ExerciseService.buscarExercicio(query);
      res.json({ exercicios });
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      res.status(500).json({ erro: 'Erro ao buscar exercício' });
    }
  }

  /**
   * Registra um exercício realizado
   * POST /api/exercises
   */
  async registrarExercicio(req, res) {
    try {
      const { name, met_value, duration_minutes, use_ai } = req.body;
      const userId = req.userId;

      if (!name || !duration_minutes) {
        return res.status(400).json({ erro: 'Nome e duração são obrigatórios' });
      }

      // Buscar usuário para calcular calorias
      const user = db.prepare('SELECT weight FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      let met = met_value;
      let caloriasCalculadoIA = false;

      // Se use_ai=true, tentar usar IA para calcular MET e calorias
      if (use_ai === true) {
        try {
          const resultadoIA = await AIService.calcularCaloriasExercicio(
            name,
            duration_minutes,
            user.weight
          );

          if (resultadoIA.sucesso) {
            met = resultadoIA.dados.met_value;
            caloriasCalculadoIA = true;
            console.log(`[IA] Exercício "${name}": MET=${met}, Calorias=${resultadoIA.dados.calorias_gastas}`);
          }
        } catch (iaError) {
          console.warn('IA falhou, usando método padrão:', iaError.message);
          // Continua com o método padrão
        }
      }

      // Se não passou MET e IA não foi usada, buscar do template
      if (!met) {
        const template = db.prepare('SELECT met_value FROM exercise_templates WHERE name = ?').get(name);
        if (template) {
          met = template.met_value;
        } else {
          // MET padrão para exercício moderado
          met = 5.0;
        }
      }

      // Calcular calorias gastas
      const calories_burned = TMBService.calcularCaloriasExercicio(met, user.weight, duration_minutes);

      // Registrar exercício
      const exercicio = ExerciseService.registrarExercicio({
        user_id: userId,
        name,
        met_value: met,
        duration_minutes,
        calories_burned
      });

      res.status(201).json({
        message: 'Exercício registrado com sucesso',
        exercicio,
        ia_used: caloriasCalculadoIA
      });
    } catch (error) {
      console.error('Erro ao registrar exercício:', error);
      res.status(500).json({ erro: 'Erro ao registrar exercício' });
    }
  }

  /**
   * Obtém histórico de exercícios
   * GET /api/exercises/history?period=week
   */
  async obterHistorico(req, res) {
    try {
      const userId = req.userId;
      const { period = 'all' } = req.query;

      const exercicios = ExerciseService.obterHistorico(userId, period);
      const totalCalorias = exercicios.reduce((acc, ex) => acc + ex.calories_burned, 0);

      res.json({
        exercicios,
        total_calorias: totalCalorias,
        periodo: period
      });
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({ erro: 'Erro ao obter histórico' });
    }
  }

  /**
   * Obtém estatísticas de exercícios
   * GET /api/exercises/stats
   */
  async obterEstatisticas(req, res) {
    try {
      const userId = req.userId;
      const stats = ExerciseService.obterEstatisticas(userId);
      res.json(stats);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ erro: 'Erro ao obter estatísticas' });
    }
  }

  /**
   * Deleta um exercício
   * DELETE /api/exercises/:id
   */
  async deletarExercicio(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const success = ExerciseService.deletarExercicio(id, userId);

      if (!success) {
        return res.status(404).json({ erro: 'Exercício não encontrado' });
      }

      res.json({ message: 'Exercício deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      res.status(500).json({ erro: 'Erro ao deletar exercício' });
    }
  }

  /**
   * Adiciona exercício personalizado
   * POST /api/exercises/custom
   */
  async adicionarExercicioPersonalizado(req, res) {
    try {
      const { name, met_value, category } = req.body;

      if (!name || !met_value) {
        return res.status(400).json({ erro: 'Nome e valor MET são obrigatórios' });
      }

      const resultado = ExerciseService.adicionarExercicioPersonalizado({
        name,
        met_value,
        category: category || 'personalizado'
      });

      if (resultado.erro) {
        return res.status(409).json({ erro: resultado.erro });
      }

      res.status(201).json({
        message: 'Exercício personalizado criado com sucesso',
        exercicio: resultado
      });
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
      res.status(500).json({ erro: 'Erro ao adicionar exercício' });
    }
  }
}

module.exports = new ExerciseController();
