require('dotenv').config();

const config = require('./config');
const { sequelize } = require('./models');
const app = require('./app');

let server;
let shuttingDown = false;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  }
};

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received. Shutting down gracefully.`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await sequelize.close();
  clearTimeout(forceExit);
};

if (require.main === module) {
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
  start();
}

module.exports = { start, shutdown };
