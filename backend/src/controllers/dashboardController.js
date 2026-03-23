const db = require('../database/database');
const AIService = require('../services/aiService');
const TMBService = require('../services/tmbService');

/**
 * Controller do Dashboard
 * Fornece visão geral e insights para o usuário
 */

class DashboardController {
  /**
   * Obtém dashboard completo do usuário
   * GET /api/dashboard?period=day|week|month
   */
  async getDashboard(req, res) {
    try {
      const userId = req.userId;
      const { period = 'week' } = req.query; // 'day', 'week' ou 'month'
      
      let days;
      switch (period) {
        case 'day':
          days = 1;
          break;
        case 'month':
          days = 30;
          break;
        default:
          days = 7;
      }

      // Dados do usuário
      const user = db.prepare(`
        SELECT weight, height, age, gender, activity_level, goal, name
        FROM users WHERE id = ?
      `).get(userId);

      // Cálculos metabólicos
      const tmb = TMBService.calcularTMB({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender
      });
      const tdee = TMBService.calcularTDEE(tmb, user.activity_level);
      const meta = TMBService.calcularMetaCalorica(tdee, user.goal);
      const macros = TMBService.calcularMacros(meta.caloriasAlvo, user.weight, user.goal);
      const imc = TMBService.calcularIMC(user.weight, user.height);

      // Consumo de hoje
      const mealsToday = db.prepare(`
        SELECT * FROM meals 
        WHERE user_id = ? AND DATE(consumed_at) = DATE('now')
      `).all(userId);

      const consumoHoje = mealsToday.reduce((acc, meal) => ({
        calorias: acc.calorias + (meal.calories || 0),
        proteina: acc.proteina + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
        fibra: acc.fibra + (meal.fiber || 0)
      }), { calorias: 0, proteina: 0, carbs: 0, fat: 0, fibra: 0 });

      // Exercícios de hoje
      const exercisesToday = db.prepare(`
        SELECT * FROM exercises 
        WHERE user_id = ? AND DATE(performed_at) = DATE('now')
      `).all(userId);

      const gastoExercicios = exercisesToday.reduce((acc, ex) => acc + ex.calories_burned, 0);

      // Saldo calórico
      const caloriasLiquidas = consumoHoje.calorias - gastoExercicios;
      const saldoDoDia = meta.caloriasAlvo - caloriasLiquidas;

      // Estatísticas do período selecionado
      const periodStats = this._getPeriodStats(userId, days);

      // Progresso de peso
      const weightProgress = this._getWeightProgress(userId);

      res.json({
        usuario: {
          nome: user.name,
          objetivo: user.goal,
          peso: user.weight,
          altura: user.height,
          idade: user.age
        },
        metricas: {
          tmb,
          tdee,
          imc,
          meta_calorica: meta.caloriasAlvo,
          macros_alvo: macros
        },
        hoje: {
          consumo: consumoHoje,
          gasto_exercicios: gastoExercicios,
          calorias_liquidas: Math.round(caloriasLiquidas),
          saldo: Math.round(saldoDoDia),
          refeicoes_count: mealsToday.length,
          exercicios_count: exercisesToday.length,
          progresso_macros: {
            proteina: Math.round((consumoHoje.proteina / macros.protein) * 100),
            carbs: Math.round((consumoHoje.carbs / macros.carbs) * 100),
            fat: Math.round((consumoHoje.fat / macros.fat) * 100)
          }
        },
        semana: periodStats,
        progresso_peso: weightProgress
      });
    } catch (error) {
      console.error('Erro ao obter dashboard:', error);
      res.status(500).json({ erro: 'Erro ao obter dashboard' });
    }
  }

  /**
   * Estatísticas do período selecionado
   */
  _getPeriodStats(userId, days = 7) {
    const stats = db.prepare(`
      SELECT
        DATE(consumed_at) as data,
        SUM(calories) as calorias,
        SUM(protein) as proteina,
        SUM(carbs) as carbs,
        SUM(fat) as gordura,
        COUNT(*) as refeicoes
      FROM meals
      WHERE user_id = ? AND consumed_at >= datetime('now', ? || ' days')
      GROUP BY DATE(consumed_at)
      ORDER BY data DESC
    `).all(userId, -days);

    const exerciciosPeriodo = db.prepare(`
      SELECT
        DATE(performed_at) as data,
        SUM(calories_burned) as calorias_gastas,
        COUNT(*) as exercicios
      FROM exercises
      WHERE user_id = ? AND performed_at >= datetime('now', ? || ' days')
      GROUP BY DATE(performed_at)
    `).all(userId, -days);

    // Médias
    const mediaCalorias = stats.length > 0
      ? Math.round(stats.reduce((acc, s) => acc + s.calorias, 0) / stats.length)
      : 0;

    return {
      dias_registrados: stats.length,
      media_calorias_diaria: mediaCalorias,
      total_refeicoes: stats.reduce((acc, s) => acc + s.refeicoes, 0),
      total_exercicios: exerciciosPeriodo.reduce((acc, e) => acc + e.exercicios, 0),
      dias: stats.map(day => ({
        data: day.data,
        calorias: day.calorias,
        proteina: day.proteina,
        carbs: day.carbs,
        gordura: day.gordura,
        refeicoes: day.refeicoes,
        exercicios: exerciciosPeriodo.find(e => e.data === day.data)?.exercicios || 0,
        calorias_gastas: exerciciosPeriodo.find(e => e.data === day.data)?.calorias_gastas || 0
      }))
    };
  }

  /**
   * Progresso de peso
   */
  _getWeightProgress(userId) {
    const logs = db.prepare(`
      SELECT weight, logged_at
      FROM weight_logs
      WHERE user_id = ?
      ORDER BY logged_at DESC
      LIMIT 30
    `).all(userId);

    if (logs.length === 0) {
      return { registros: [], variacao: 0 };
    }

    const pesoAtual = logs[0].weight;
    const pesoAntigo = logs[logs.length - 1].weight;
    const variacao = pesoAtual - pesoAntigo;

    return {
      registros: logs.map(log => ({
        peso: log.weight,
        data: log.logged_at
      })).reverse(),
      peso_atual: pesoAtual,
      variacao_total: parseFloat(variacao.toFixed(2)),
      tendencia: variacao < 0 ? 'perda' : variacao > 0 ? 'ganho' : 'estavel'
    };
  }

  /**
   * Gera recomendações com IA
   * GET /api/dashboard/recommendations
   */
  async getRecomendacoes(req, res) {
    try {
      const userId = req.userId;

      // Dados do usuário
      const user = db.prepare(`
        SELECT weight, height, age, gender, activity_level, goal
        FROM users WHERE id = ?
      `).get(userId);

      const tmb = TMBService.calcularTMB({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender
      });
      const tdee = TMBService.calcularTDEE(tmb, user.activity_level);
      const meta = TMBService.calcularMetaCalorica(tdee, user.goal);

      user.calorieGoal = meta.caloriasAlvo;

      // Histórico de refeições (últimos 3 dias)
      const mealsHistory = db.prepare(`
        SELECT name, calories, protein, carbs, fat, meal_type, consumed_at
        FROM meals
        WHERE user_id = ? AND consumed_at >= datetime('now', '-3 days')
        ORDER BY consumed_at DESC
        LIMIT 20
      `).all(userId);

      // Gerar recomendações com IA
      const recomendacoes = await AIService.gerarRecomendacoes(user, mealsHistory);

      res.json({ recomendacoes });
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      res.status(500).json({ erro: 'Erro ao gerar recomendações' });
    }
  }

  /**
   * Chat com coach de IA
   * POST /api/dashboard/coach
   */
  async chatComCoach(req, res) {
    try {
      const userId = req.userId;
      const { pergunta } = req.body;

      if (!pergunta) {
        return res.status(400).json({ erro: 'Pergunta é obrigatória' });
      }

      // Dados do usuário para contexto
      const user = db.prepare(`
        SELECT weight, height, age, gender, goal
        FROM users WHERE id = ?
      `).get(userId);

      const tmb = TMBService.calcularTMB({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender
      });
      const tdee = TMBService.calcularTDEE(tmb, user.activity_level);
      const meta = TMBService.calcularMetaCalorica(tdee, user.goal);

      user.calorieGoal = meta.caloriasAlvo;

      // Responder com IA
      const resposta = await AIService.responderComoCoach(pergunta, user);

      res.json({ pergunta, resposta });
    } catch (error) {
      console.error('Erro no chat com coach:', error);
      res.status(500).json({ erro: 'Erro ao processar pergunta' });
    }
  }
}

module.exports = new DashboardController();
