const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config');
const { sequelize } = require('./models');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
if (config.trustProxy !== false) app.set('trust proxy', config.trustProxy);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json({
  limit: config.requestBodyLimit,
  verify: (req, res, buffer) => {
    if (req.originalUrl === '/api/whatsapp/webhook') req.rawBody = Buffer.from(buffer);
  },
}));
app.use(express.urlencoded({ extended: true, limit: config.requestBodyLimit }));

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({
      success: false,
      code: 'DATABASE_UNAVAILABLE',
      message: 'La base de datos no está disponible',
    });
  }
});

app.use('/api', apiLimiter, routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Ruta no encontrada',
  });
});

app.use(errorHandler);

module.exports = app;
