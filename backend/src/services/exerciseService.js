const db = require('../database/database');

/**
 * Serviço de Exercícios
 * Gerencia exercícios, cálculos de calorias gastas e histórico
 */

class ExerciseService {
  /**
   * Lista todos os exercícios disponíveis com valores MET
   * 
   * @param {string} category - Filtro por categoria (opcional)
   * @returns {Array} Lista de exercícios
   */
  listarExercicios(category = null) {
    let query = 'SELECT * FROM exercise_templates';
    let params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY category, name';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Busca exercícios por nome (busca fuzzy)
   * 
   * @param {string} searchTerm - Termo de busca
   * @returns {Array} Exercícios encontrados
   */
  buscarExercicio(searchTerm) {
    const query = `
      SELECT * FROM exercise_templates 
      WHERE name LIKE ? 
      ORDER BY met_value DESC
      LIMIT 10
    `;
    
    const stmt = db.prepare(query);
    return stmt.all(`%${searchTerm}%`);
  }

  /**
   * Registra um exercício realizado pelo usuário
   * 
   * @param {Object} exerciseData - Dados do exercício
   * @returns {Object} Exercício registrado com ID
   */
  registrarExercicio(exerciseData) {
    const { user_id, name, met_value, duration_minutes, calories_burned } = exerciseData;

    const query = `
      INSERT INTO exercises (user_id, name, met_value, duration_minutes, calories_burned, performed_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const stmt = db.prepare(query);
    const result = stmt.run(user_id, name, met_value, duration_minutes, calories_burned);

    return {
      id: result.lastInsertRowid,
      user_id,
      name,
      met_value,
      duration_minutes,
      calories_burned,
      performed_at: new Date().toISOString()
    };
  }

  /**
   * Obtém histórico de exercícios do usuário
   * 
   * @param {number} userId - ID do usuário
   * @param {string} period - Período ('today', 'week', 'month', 'all')
   * @returns {Array} Histórico de exercícios
   */
  obterHistorico(userId, period = 'all') {
    let dateFilter = '';
    const now = new Date();

    switch (period) {
      case 'today':
        dateFilter = "DATE(performed_at) = DATE('now')";
        break;
      case 'week':
        dateFilter = "performed_at >= datetime('now', '-7 days')";
        break;
      case 'month':
        dateFilter = "performed_at >= datetime('now', '-30 days')";
        break;
    }

    let query = `SELECT * FROM exercises WHERE user_id = ?`;
    
    if (dateFilter) {
      query += ` AND ${dateFilter}`;
    }

    query += ' ORDER BY performed_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(userId);
  }

  /**
   * Calcula total de calorias gastas em exercícios
   * 
   * @param {number} userId - ID do usuário
   * @param {string} period - Período
   * @returns {number} Total de calorias
   */
  totalCaloriasGastas(userId, period = 'today') {
    const exercicios = this.obterHistorico(userId, period);
    return exercicios.reduce((total, ex) => total + ex.calories_burned, 0);
  }

  /**
   * Obtém estatísticas de exercícios do usuário
   * 
   * @param {number} userId - ID do usuário
   * @returns {Object} Estatísticas
   */
  obterEstatisticas(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_exercicios,
        SUM(calories_burned) as total_calorias,
        AVG(calories_burned) as media_calorias,
        SUM(duration_minutes) as total_minutos,
        COUNT(DISTINCT DATE(performed_at)) as dias_ativos
      FROM exercises
      WHERE user_id = ?
    `;

    const stmt = db.prepare(query);
    const stats = stmt.get(userId);

    // Exercícios mais praticados
    const topExerciciosQuery = `
      SELECT name, COUNT(*) as vezes, SUM(calories_burned) as total_calorias
      FROM exercises
      WHERE user_id = ?
      GROUP BY name
      ORDER BY vezes DESC
      LIMIT 5
    `;

    const topExercicios = db.prepare(topExerciciosQuery).all(userId);

    return {
      ...stats,
      top_exercicios: topExercicios
    };
  }

  /**
   * Deleta um exercício do registro
   * 
   * @param {number} exerciseId - ID do exercício
   * @param {number} userId - ID do usuário (para validação)
   * @returns {boolean} Sucesso da operação
   */
  deletarExercicio(exerciseId, userId) {
    const query = `DELETE FROM exercises WHERE id = ? AND user_id = ?`;
    const stmt = db.prepare(query);
    const result = stmt.run(exerciseId, userId);
    return result.changes > 0;
  }

  /**
   * Adiciona um exercício personalizado à lista de templates
   * 
   * @param {Object} exerciseData - Dados do exercício
   * @returns {Object} Exercício criado
   */
  adicionarExercicioPersonalizado(exerciseData) {
    const { name, met_value, category = 'personalizado' } = exerciseData;

    // Verificar se já existe
    const existing = db.prepare('SELECT * FROM exercise_templates WHERE name = ?').get(name);
    if (existing) {
      return { erro: 'Exercício já existe' };
    }

    const query = `INSERT INTO exercise_templates (name, met_value, category) VALUES (?, ?, ?)`;
    const stmt = db.prepare(query);
    const result = stmt.run(name, met_value, category);

    return {
      id: result.lastInsertRowid,
      name,
      met_value,
      category
    };
  }
}

module.exports = new ExerciseService();
