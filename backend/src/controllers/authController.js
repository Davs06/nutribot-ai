const db = require('../database/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TMBService = require('../services/tmbService');

/**
 * Controller de Autenticação e Usuários
 */

class AuthController {
  /**
   * Registra um novo usuário
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const { name, email, password, gender, age, weight, height, activity_level, goal, body_type } = req.body;

      // Validações básicas
      if (!name || !email || !password || !gender || !age || !weight || !height || !activity_level || !goal) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
      }

      // Verificar se email já existe
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(409).json({ erro: 'Email já cadastrado' });
      }

      // Hash da senha
      const passwordHash = await bcrypt.hash(password, 10);

      // Inserir usuário (body_type é opcional)
      const query = `
        INSERT INTO users (name, email, password, gender, age, weight, height, activity_level, goal, body_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const stmt = db.prepare(query);
      const result = stmt.run(name, email, passwordHash, gender, age, weight, height, activity_level, goal, body_type || null);

      // Gerar token JWT
      const token = jwt.sign(
        { userId: result.lastInsertRowid, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Calcular dados metabólicos do usuário
      const relatorioMetabolico = TMBService.gerarRelatorioMetabolico({
        weight,
        height,
        age,
        gender,
        activityLevel: activity_level,
        goal,
        bodyType: body_type
      });

      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        usuario: {
          id: result.lastInsertRowid,
          name,
          email,
          ...relatorioMetabolico
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ erro: 'Erro ao registrar usuário' });
    }
  }

  /**
   * Login do usuário
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
      }

      // Buscar usuário
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Calcular dados metabólicos atualizados
      const relatorioMetabolico = TMBService.gerarRelatorioMetabolico({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activity_level,
        goal: user.goal
      });

      res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: user.id,
          name: user.name,
          email: user.email,
          ...relatorioMetabolico
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ erro: 'Erro ao fazer login' });
    }
  }

  /**
   * Obtém perfil do usuário autenticado
   * GET /api/auth/me
   */
  async getProfile(req, res) {
    try {
      // Query sem as colunas novas (pode falhar em bancos antigos)
      let user;
      try {
        user = db.prepare(`
          SELECT id, name, email, gender, age, weight, height, activity_level, goal, body_type, water_goal_ml, created_at
          FROM users WHERE id = ?
        `).get(req.userId);
      } catch (e) {
        // Fallback para bancos sem as colunas novas
        user = db.prepare(`
          SELECT id, name, email, gender, age, weight, height, activity_level, goal, created_at, NULL as body_type, 0 as water_goal_ml
          FROM users WHERE id = ?
        `).get(req.userId);
      }

      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      const relatorioMetabolico = TMBService.gerarRelatorioMetabolico({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activity_level,
        goal: user.goal,
        bodyType: user.body_type
      });

      res.json({
        usuario: user,
        ...relatorioMetabolico
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ erro: 'Erro ao obter perfil' });
    }
  }

  /**
   * Atualiza perfil do usuário
   * PUT /api/auth/profile
   */
  async updateProfile(req, res) {
    try {
      const { name, weight, height, goal, activity_level, body_type, water_goal_ml } = req.body;
      const userId = req.userId;

      // Buscar usuário atual
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Atualizar campos permitidos
      const updates = [];
      const values = [];
      const updatesMap = {}; // Mapeia update -> valor

      if (name) {
        updates.push('name = ?');
        values.push(name);
        updatesMap['name'] = name;
      }
      if (weight) {
        updates.push('weight = ?');
        values.push(weight);
        updatesMap['weight'] = weight;
      }
      if (height) {
        updates.push('height = ?');
        values.push(height);
        updatesMap['height'] = height;
      }
      if (goal) {
        updates.push('goal = ?');
        values.push(goal);
        updatesMap['goal'] = goal;
      }
      if (activity_level) {
        updates.push('activity_level = ?');
        values.push(activity_level);
        updatesMap['activity_level'] = activity_level;
      }
      
      // Campos opcionais (podem não existir em bancos antigos)
      if (body_type) {
        try {
          updates.push('body_type = ?');
          values.push(body_type);
          updatesMap['body_type'] = body_type;
        } catch (e) {
          console.warn('Coluna body_type não existe, ignorando');
        }
      }
      if (water_goal_ml) {
        try {
          updates.push('water_goal_ml = ?');
          values.push(water_goal_ml);
          updatesMap['water_goal_ml'] = water_goal_ml;
        } catch (e) {
          console.warn('Coluna water_goal_ml não existe, ignorando');
        }
      }

      if (updates.length > 0) {
        try {
          updates.push('updated_at = CURRENT_TIMESTAMP');
          values.push(userId);

          const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
          const stmt = db.prepare(query);
          stmt.run(...values);
        } catch (e) {
          // Fallback para bancos sem as colunas novas
          console.warn('Colunas novas não existem, usando fallback:', e.message);
          const updatesSimples = [];
          const valoresSimples = [];
          
          // Reconstruir updates e valores sem colunas novas
          if (updatesMap['name']) {
            updatesSimples.push('name = ?');
            valoresSimples.push(updatesMap['name']);
          }
          if (updatesMap['weight']) {
            updatesSimples.push('weight = ?');
            valoresSimples.push(updatesMap['weight']);
          }
          if (updatesMap['height']) {
            updatesSimples.push('height = ?');
            valoresSimples.push(updatesMap['height']);
          }
          if (updatesMap['goal']) {
            updatesSimples.push('goal = ?');
            valoresSimples.push(updatesMap['goal']);
          }
          if (updatesMap['activity_level']) {
            updatesSimples.push('activity_level = ?');
            valoresSimples.push(updatesMap['activity_level']);
          }
          
          if (updatesSimples.length > 0) {
            updatesSimples.push('updated_at = CURRENT_TIMESTAMP');
            valoresSimples.push(userId);
            const query = `UPDATE users SET ${updatesSimples.join(', ')} WHERE id = ?`;
            const stmt = db.prepare(query);
            stmt.run(...valoresSimples);
          }
        }
      }

      // Se peso foi atualizado, registrar no histórico
      if (weight) {
        db.prepare(`
          INSERT INTO weight_logs (user_id, weight) VALUES (?, ?)
        `).run(userId, weight);
      }

      // Retornar dados atualizados
      const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      const relatorioMetabolico = TMBService.gerarRelatorioMetabolico({
        weight: updatedUser.weight,
        height: updatedUser.height,
        age: updatedUser.age,
        gender: updatedUser.gender,
        activityLevel: updatedUser.activity_level,
        goal: updatedUser.goal
      });

      res.json({
        message: 'Perfil atualizado com sucesso',
        usuario: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          ...relatorioMetabolico
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ erro: 'Erro ao atualizar perfil' });
    }
  }

  /**
   * Registra peso diário
   * POST /api/auth/weight-log
   */
  async registerWeightLog(req, res) {
    try {
      const { weight, body_fat_percentage } = req.body;
      const userId = req.userId;

      if (!weight) {
        return res.status(400).json({ erro: 'Peso é obrigatório' });
      }

      db.prepare(`
        INSERT INTO weight_logs (user_id, weight, body_fat_percentage)
        VALUES (?, ?, ?)
      `).run(userId, weight, body_fat_percentage || null);

      // Atualizar peso atual do usuário
      db.prepare('UPDATE users SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(weight, userId);

      res.json({ message: 'Peso registrado com sucesso' });
    } catch (error) {
      console.error('Erro ao registrar peso:', error);
      res.status(500).json({ erro: 'Erro ao registrar peso' });
    }
  }

  /**
   * Obtém histórico de pesos
   * GET /api/auth/weight-log
   */
  async getWeightHistory(req, res) {
    try {
      const userId = req.userId;
      const days = req.query.days || 30;

      const logs = db.prepare(`
        SELECT weight, body_fat_percentage, logged_at
        FROM weight_logs
        WHERE user_id = ? AND logged_at >= datetime('now', ?)
        ORDER BY logged_at DESC
      `).all(userId, `-${days} days`);

      res.json({ logs });
    } catch (error) {
      console.error('Erro ao obter histórico de peso:', error);
      res.status(500).json({ erro: 'Erro ao obter histórico' });
    }
  }
}

module.exports = new AuthController();
