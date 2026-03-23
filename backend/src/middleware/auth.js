const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e extrai o userId
 */

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    // Formato: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ erro: 'Formato do token inválido' });
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
      return res.status(401).json({ erro: 'Formato do token inválido' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar userId ao request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ erro: 'Erro interno na autenticação' });
  }
}

module.exports = authMiddleware;
