const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, code: 'ACCESS_TOKEN_REQUIRED', message: 'Token de acceso requerido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });

    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, code: 'INVALID_ACCOUNT', message: 'Usuario no encontrado o inactivo' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Token expirado' });
    }
    next(error);
  }
};

const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  return authenticate(req, res, next);
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, code: 'NOT_AUTHENTICATED', message: 'No autenticado' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', message: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
};

module.exports = { authenticate, optionalAuthenticate, authorize };
