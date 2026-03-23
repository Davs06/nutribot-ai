const db = require('../database/database');
const WaterService = require('../services/waterService');
const TMBService = require('../services/tmbService');

/**
 * Controller de Controle de Consumo de Água
 */

class WaterController {
  /**
   * Registra consumo de água
   * POST /api/water
   */
  async registrarConsumo(req, res) {
    try {
      const { amount_ml } = req.body;
      const userId = req.userId;

      if (!amount_ml || amount_ml <= 0) {
        return res.status(400).json({ erro: 'Quantidade inválida' });
      }

      let result;
      try {
        const query = `
          INSERT INTO water_logs (user_id, amount_ml)
          VALUES (?, ?)
        `;
        const stmt = db.prepare(query);
        result = stmt.run(userId, amount_ml);
      } catch (e) {
        return res.status(500).json({ 
          erro: 'Funcionalidade de água não disponível. Tabela water_logs não existe.',
          dica: 'Execute o migration para adicionar esta funcionalidade.'
        });
      }

      // Buscar consumo total do dia
      const hoje = new Date().toISOString().split('T')[0];
      let consumoHoje;
      try {
        consumoHoje = db.prepare(`
          SELECT COALESCE(SUM(amount_ml), 0) as total
          FROM water_logs
          WHERE user_id = ? AND DATE(consumed_at) = ?
        `).get(userId, hoje);
      } catch (e) {
        consumoHoje = { total: 0 };
      }

      // Buscar meta do usuário (com fallback para bancos antigos)
      let user;
      try {
        user = db.prepare('SELECT weight, body_type, water_goal_ml FROM users WHERE id = ?').get(userId);
      } catch (e) {
        user = db.prepare('SELECT weight, NULL as body_type, 0 as water_goal_ml FROM users WHERE id = ?').get(userId);
      }
      
      const meta = user.water_goal_ml > 0 ? user.water_goal_ml : WaterService.calcularMetaAgua({
        weight: user.weight,
        bodyType: user.body_type
      });

      res.status(201).json({
        message: 'Consumo de água registrado com sucesso',
        registro: {
          id: result.lastInsertRowid,
          amount_ml,
          consumed_at: new Date().toISOString()
        },
        consumo_hoje: consumoHoje.total,
        meta,
        porcentagem: Math.round((consumoHoje.total / meta) * 100),
        restante: Math.max(0, meta - consumoHoje.total)
      });
    } catch (error) {
      console.error('Erro ao registrar consumo de água:', error);
      res.status(500).json({ erro: 'Erro ao registrar consumo' });
    }
  }

  /**
   * Obtém consumo de água de hoje
   * GET /api/water/today
   */
  async getConsumoHoje(req, res) {
    try {
      const userId = req.userId;
      const hoje = new Date().toISOString().split('T')[0];

      // Buscar consumo total e registros do dia
      const consumoHoje = db.prepare(`
        SELECT 
          COALESCE(SUM(amount_ml), 0) as total,
          COUNT(*) as registros
        FROM water_logs
        WHERE user_id = ? AND DATE(consumed_at) = ?
      `).get(userId, hoje);

      // Buscar registros individuais do dia
      let registros = [];
      try {
        registros = db.prepare(`
          SELECT id, amount_ml, consumed_at
          FROM water_logs
          WHERE user_id = ? AND DATE(consumed_at) = ?
          ORDER BY consumed_at DESC
        `).all(userId, hoje);
      } catch (e) {
        // Tabela water_logs não existe
        console.warn('Tabela water_logs não existe');
      }

      // Buscar usuário e calcular meta
      let user;
      try {
        user = db.prepare('SELECT weight, height, body_type, water_goal_ml FROM users WHERE id = ?').get(userId);
      } catch (e) {
        user = db.prepare('SELECT weight, height, NULL as body_type, 0 as water_goal_ml FROM users WHERE id = ?').get(userId);
      }
      
      let meta;
      if (user.water_goal_ml > 0) {
        meta = user.water_goal_ml;
      } else {
        // Calcular meta automática
        const imc = TMBService.calcularIMC(user.weight, user.height);
        meta = WaterService.calcularMetaAguaComIMC(user.weight, user.height);
      }

      res.json({
        data: hoje,
        consumo_total: consumoHoje.total,
        meta,
        porcentagem: Math.round((consumoHoje.total / meta) * 100),
        restante: Math.max(0, meta - consumoHoje.total),
        registros_count: consumoHoje.registros,
        registros
      });
    } catch (error) {
      console.error('Erro ao buscar consumo de água:', error);
      res.status(500).json({ erro: 'Erro ao buscar consumo' });
    }
  }

  /**
   * Obtém estatísticas de consumo de água
   * GET /api/water/stats?period=week
   */
  async getEstatisticas(req, res) {
    try {
      const userId = req.userId;
      const { period = 'week' } = req.query;

      let dateFilter;
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
        default:
          dateFilter = "consumed_at >= datetime('now', '-7 days')";
      }

      // Estatísticas gerais
      let stats;
      try {
        stats = db.prepare(`
          SELECT
            COUNT(*) as total_registros,
            COALESCE(SUM(amount_ml), 0) as total_consumido,
            COALESCE(AVG(amount_ml), 0) as media_por_registro,
            COALESCE(MAX(amount_ml), 0) as maximo_registro,
            COUNT(DISTINCT DATE(consumed_at)) as dias_registrados
          FROM water_logs
          WHERE user_id = ? AND ${dateFilter}
        `).get(userId);
      } catch (e) {
        // Tabela não existe
        stats = {
          total_registros: 0,
          total_consumido: 0,
          media_por_registro: 0,
          maximo_registro: 0,
          dias_registrados: 0
        };
      }

      // Média diária
      const dias = Math.max(1, period === 'today' ? 1 : period === 'week' ? 7 : 30);
      const mediaDiaria = Math.round(stats.total_consumido / dias);

      // Buscar usuário para calcular meta (com fallback)
      let user;
      try {
        user = db.prepare('SELECT weight, body_type, water_goal_ml FROM users WHERE id = ?').get(userId);
      } catch (e) {
        user = db.prepare('SELECT weight, NULL as body_type, 0 as water_goal_ml FROM users WHERE id = ?').get(userId);
      }
      
      const meta = user.water_goal_ml > 0 ? user.water_goal_ml : WaterService.calcularMetaAgua({
        weight: user.weight,
        bodyType: user.body_type
      });

      // Dias consecutivos batendo a meta
      const diasConsecutivos = this.calcularDiasConsecutivos(userId, meta);

      res.json({
        periodo: period,
        total_consumido: Math.round(stats.total_consumido),
        media_diaria: mediaDiaria,
        meta_diaria: meta,
        porcentagem_meta: Math.round((mediaDiaria / meta) * 100),
        total_registros: stats.total_registros,
        media_por_registro: Math.round(stats.media_por_registro),
        dias_registrados: stats.dias_registrados,
        dias_consecutivos: diasConsecutivos,
        conquistas: this.getConquistas(stats, meta, dias)
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * Calcula dias consecutivos batendo a meta
   */
  calcularDiasConsecutivos(userId, meta) {
    let ultimos30Dias;
    try {
      ultimos30Dias = db.prepare(`
        SELECT DATE(consumed_at) as data, SUM(amount_ml) as total
        FROM water_logs
        WHERE user_id = ? AND consumed_at >= datetime('now', '-30 days')
        GROUP BY DATE(consumed_at)
        ORDER BY data DESC
      `).all(userId);
    } catch (e) {
      return 0; // Tabela não existe
    }

    let consecutivos = 0;
    const hoje = new Date().toISOString().split('T')[0];

    for (const dia of ultimos30Dias) {
      if (dia.data === hoje || new Date(dia.data) >= new Date(Date.now() - 86400000)) {
        if (dia.total >= meta) {
          consecutivos++;
        } else {
          break;
        }
      }
    }

    return consecutivos;
  }

  /**
   * Retorna conquistas baseadas no consumo
   */
  getConquistas(stats, meta, dias) {
    const conquistas = [];

    if (stats.total_consumido >= meta * dias) {
      conquistas.push({
        id: 'meta_semanal',
        titulo: 'Meta Semanal',
        descricao: 'Bateu a meta de água na semana!',
        icone: '💧'
      });
    }

    if (stats.total_registros >= 20) {
      conquistas.push({
        id: 'hidratado',
        titulo: 'Hidratado',
        descricao: '20+ registros de água',
        icone: '🏆'
      });
    }

    if (stats.maximo_registro >= 1000) {
      conquistas.push({
        id: 'bebedor',
        titulo: 'Grande Bebedor',
        descricao: 'Bebeu 1L+ de uma vez',
        icone: '🥤'
      });
    }

    return conquistas;
  }

  /**
   * Atualiza meta de água do usuário
   * PUT /api/water/goal
   */
  async atualizarMeta(req, res) {
    try {
      const { water_goal_ml } = req.body;
      const userId = req.userId;

      if (!water_goal_ml || water_goal_ml < 500 || water_goal_ml > 10000) {
        return res.status(400).json({ erro: 'Meta inválida (500-10000ml)' });
      }

      try {
        db.prepare(`
          UPDATE users
          SET water_goal_ml = ?
          WHERE id = ?
        `).run(water_goal_ml, userId);
      } catch (e) {
        return res.status(500).json({ 
          erro: 'Banco de dados não suporta meta de água. Execute o migration primeiro.' 
        });
      }

      res.json({
        message: 'Meta de água atualizada com sucesso',
        water_goal_ml
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      res.status(500).json({ erro: 'Erro ao atualizar meta' });
    }
  }

  /**
   * Deleta registro de consumo
   * DELETE /api/water/:id
   */
  async deletarRegistro(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const result = db.prepare(`
        DELETE FROM water_logs
        WHERE id = ? AND user_id = ?
      `).run(id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ erro: 'Registro não encontrado' });
      }

      res.json({ message: 'Registro deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      res.status(500).json({ erro: 'Erro ao deletar registro' });
    }
  }

  /**
   * Calcula meta recomendada para o usuário
   * GET /api/water/recommended-goal
   */
  async getMetaRecomendada(req, res) {
    try {
      let user;
      try {
        user = db.prepare('SELECT weight, height, body_type, activity_level FROM users WHERE id = ?').get(userId);
      } catch (e) {
        user = db.prepare('SELECT weight, height, NULL as body_type, activity_level FROM users WHERE id = ?').get(userId);
      }

      const relatorio = WaterService.gerarRelatorioHidratacao({
        weight: user.weight,
        height: user.height,
        bodyType: user.body_type,
        activityLevel: user.activity_level
      });

      res.json({
        meta_recomendada: relatorio.metaRecomendada,
        meta_por_peso: relatorio.metaPorPeso,
        ajustes: relatorio.ajustes,
        dicas: relatorio.dicas
      });
    } catch (error) {
      console.error('Erro ao calcular meta recomendada:', error);
      res.status(500).json({ erro: 'Erro ao calcular meta' });
    }
  }
}

module.exports = new WaterController();
