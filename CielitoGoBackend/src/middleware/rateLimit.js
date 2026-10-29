const { rateLimit } = require('express-rate-limit');
const config = require('../config');

const createLimiter = (max, message) => rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: max,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message,
  }),
});

const apiLimiter = createLimiter(config.rateLimit.max, 'Demasiadas solicitudes. Intenta de nuevo más tarde.');
const authLimiter = createLimiter(config.rateLimit.authMax, 'Demasiados intentos de autenticación. Intenta de nuevo más tarde.');
const webhookLimiter = createLimiter(config.rateLimit.webhookMax, 'Demasiadas solicitudes al webhook.');
const publicFormLimiter = createLimiter(config.rateLimit.publicFormMax, 'Demasiados formularios enviados. Intenta de nuevo más tarde.');

module.exports = { apiLimiter, authLimiter, webhookLimiter, publicFormLimiter };
