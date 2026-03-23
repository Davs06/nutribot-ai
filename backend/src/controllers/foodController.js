const db = require('../database/database');
const AIService = require('../services/aiService');
const NutritionService = require('../services/nutritionService');

/**
 * Controller de Refeições
 */

class FoodController {
  /**
   * Registra uma refeição manualmente
   * POST /api/food/meal
   */
  async registrarRefeicao(req, res) {
    try {
      const { name, description, calories, protein, carbs, fat, fiber, meal_type } = req.body;
      const userId = req.userId;

      if (!name || !calories) {
        return res.status(400).json({ erro: 'Nome e calorias são obrigatórios' });
      }

      const query = `
        INSERT INTO meals (user_id, name, description, calories, protein, carbs, fat, fiber, meal_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const stmt = db.prepare(query);
      const result = stmt.run(
        userId,
        name,
        description || null,
        calories,
        protein || 0,
        carbs || 0,
        fat || 0,
        fiber || 0,
        meal_type || 'snack'
      );

      res.status(201).json({
        message: 'Refeição registrada com sucesso',
        refeicao: {
          id: result.lastInsertRowid,
          user_id: userId,
          name,
          description,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          meal_type,
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar refeição:', error);
      res.status(500).json({ erro: 'Erro ao registrar refeição' });
    }
  }

  /**
   * Analisa e registra uma refeição por imagem
   * POST /api/food/analyze-image
   */
  async analisarImagem(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhuma imagem enviada' });
      }

      // Analisar imagem com IA
      const analise = await AIService.analisarImagemAlimento(req.file.buffer, req.file.mimetype);

      if (!analise.sucesso) {
        return res.status(500).json({
          erro: 'Não foi possível analisar a imagem',
          detalhes: analise.erro
        });
      }

      res.json({
        analise,
        mensagem: 'Imagem analisada com sucesso. Use POST /api/food/meal para registrar.'
      });
    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      res.status(500).json({ erro: 'Erro ao analisar imagem' });
    }
  }

  /**
   * Analisa descrição textual de refeição e JÁ REGISTRA automaticamente
   * POST /api/food/analyze-text
   */
  async analisarTexto(req, res) {
    try {
      const { description } = req.body;
      const userId = req.userId;

      if (!description) {
        return res.status(400).json({ erro: 'Descrição é obrigatória' });
      }

      // Analisar com IA
      const analise = await AIService.analisarDescricaoRefeicao(description);

      if (!analise.sucesso) {
        return res.status(500).json({
          erro: 'Não foi possível analisar a descrição',
          detalhes: analise.erro
        });
      }

      // Registrar automaticamente a refeição analisada
      const { refeicao_completa, alimentos } = analise.dados;

      const query = `
        INSERT INTO meals (user_id, name, description, calories, protein, carbs, fat, fiber, meal_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const stmt = db.prepare(query);
      const result = stmt.run(
        userId,
        refeicao_completa.descricao || 'Refeição analisada por IA',
        description,
        refeicao_completa.calorias_totais || 0,
        refeicao_completa.proteina_total || 0,
        refeicao_completa.carboidratos_total || 0,
        refeicao_completa.gordura_total || 0,
        0,
        'snack'
      );

      res.status(201).json({
        mensagem: 'Refeição analisada e registrada automaticamente!',
        analise,
        refeicao_registrada: {
          id: result.lastInsertRowid,
          nome: refeicao_completa.descricao || 'Refeição analisada por IA',
          calorias: refeicao_completa.calorias_totais,
          proteinas: refeicao_completa.proteina_total,
          carboidratos: refeicao_completa.carboidratos_total,
          gorduras: refeicao_completa.gordura_total,
          alimentos
        }
      });
    } catch (error) {
      console.error('Erro ao analisar texto:', error);
      res.status(500).json({ erro: 'Erro ao analisar texto' });
    }
  }

  /**
   * Busca alimentos na base USDA
   * GET /api/food/search?query=arroz
   */
  async buscarAlimento(req, res) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({ erro: 'Termo de busca é obrigatório' });
      }

      const resultados = await NutritionService.buscarAlimento(query);
      res.json({ resultados });
    } catch (error) {
      console.error('Erro ao buscar alimento:', error);
      res.status(500).json({ erro: 'Erro ao buscar alimento' });
    }
  }

  /**
   * Obtém nutrientes de um alimento específico
   * GET /api/food/nutrients/:fdcId
   */
  async obterNutrientes(req, res) {
    try {
      const { fdcId } = req.params;

      const nutrientes = await NutritionService.obterNutrientes(fdcId);
      
      if (!nutrientes) {
        return res.status(404).json({ erro: 'Alimento não encontrado' });
      }

      res.json({ nutrientes });
    } catch (error) {
      console.error('Erro ao obter nutrientes:', error);
      res.status(500).json({ erro: 'Erro ao obter nutrientes' });
    }
  }

  /**
   * Obtém histórico de refeições do usuário
   * GET /api/food/meals?period=today&meal_type=lunch
   */
  async obterHistorico(req, res) {
    try {
      const userId = req.userId;
      const { period = 'today', meal_type } = req.query;

      let dateFilter = '';
      const now = new Date();

      switch (period) {
        case 'today':
          dateFilter = "DATE(consumed_at) = DATE('now')";
          break;
        case 'week':
          dateFilter = "consumed_at >= datetime('now', '-7 days')";
          break;
        case 'month':
          dateFilter = "consumed_at >= datetime('now', '-30 days')";
          break;
        case 'all':
          dateFilter = '1=1';
          break;
        default:
          dateFilter = "DATE(consumed_at) = DATE('now')";
      }

      let query = `SELECT * FROM meals WHERE user_id = ? AND ${dateFilter}`;
      const params = [userId];

      if (meal_type) {
        query += ' AND meal_type = ?';
        params.push(meal_type);
      }

      query += ' ORDER BY consumed_at DESC';

      const stmt = db.prepare(query);
      const meals = stmt.all(...params);

      // Calcular totais
      const totais = meals.reduce((acc, meal) => ({
        calorias: acc.calorias + (meal.calories || 0),
        proteina: acc.proteina + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0),
        fibra: acc.fibra + (meal.fiber || 0)
      }), { calorias: 0, proteina: 0, carbs: 0, fat: 0, fibra: 0 });

      res.json({
        meals,
        totais,
        periodo: period
      });
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({ erro: 'Erro ao obter histórico' });
    }
  }

  /**
   * Obtém resumo nutricional do dia
   * GET /api/food/daily-summary
   */
  async obterResumoDiario(req, res) {
    try {
      const userId = req.userId;

      // Buscar refeição do dia
      const meals = db.prepare(`
        SELECT * FROM meals 
        WHERE user_id = ? AND DATE(consumed_at) = DATE('now')
      `).all(userId);

      // Buscar exercícios do dia
      const exercises = db.prepare(`
        SELECT * FROM exercises 
        WHERE user_id = ? AND DATE(performed_at) = DATE('now')
      `).all(userId);

      // Calcular totais
      const consumoTotal = meals.reduce((acc, meal) => ({
        calorias: acc.calorias + (meal.calories || 0),
        proteina: acc.proteina + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fat: acc.fat + (meal.fat || 0)
      }), { calorias: 0, proteina: 0, carbs: 0, fat: 0 });

      const gastoTotal = exercises.reduce((acc, ex) => acc + (ex.calories_burned || 0), 0);

      // Buscar dados do usuário para meta
      const user = db.prepare('SELECT weight, height, age, gender, activity_level, goal FROM users WHERE id = ?').get(userId);
      
      const TMBService = require('../services/tmbService');
      const tmb = TMBService.calcularTMB({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender
      });
      const tdee = TMBService.calcularTDEE(tmb, user.activity_level);
      const meta = TMBService.calcularMetaCalorica(tdee, user.goal);

      const saldoCalorico = consumoTotal.calorias - gastoTotal - meta.caloriasAlvo;

      res.json({
        data: new Date().toISOString().split('T')[0],
        consumo: consumoTotal,
        gasto_exercicio: gastoTotal,
        meta: {
          calorias: meta.caloriasAlvo,
          tdee
        },
        saldo: {
          calorias: Math.round(saldoCalorico),
          descricao: saldoCalorico > 0 ? 'Superávit' : saldoCalorico < 0 ? 'Déficit' : 'Equilibrado'
        },
        refeicoes_count: meals.length,
        exercicios_count: exercises.length
      });
    } catch (error) {
      console.error('Erro ao obter resumo:', error);
      res.status(500).json({ erro: 'Erro ao obter resumo diário' });
    }
  }

  /**
   * Deleta uma refeição
   * DELETE /api/food/meals/:id
   */
  async deletarRefeicao(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const result = db.prepare('DELETE FROM meals WHERE id = ? AND user_id = ?').run(id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ erro: 'Refeição não encontrada' });
      }

      res.json({ message: 'Refeição deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar refeição:', error);
      res.status(500).json({ erro: 'Erro ao deletar refeição' });
    }
  }
}

module.exports = new FoodController();
