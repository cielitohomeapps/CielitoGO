const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

if (!config) {
  throw new Error(`Configuración de base de datos inexistente para NODE_ENV=${env}`);
}

const databaseUrl = config.use_env_variable
  ? process.env[config.use_env_variable]
  : null;

if (config.use_env_variable && !databaseUrl) {
  throw new Error(`Falta la variable ${config.use_env_variable} para conectar la base de datos`);
}

if (databaseUrl && !['postgres:', 'postgresql:'].includes(new URL(databaseUrl).protocol)) {
  throw new Error('DATABASE_URL debe ser una URL de PostgreSQL');
}

if (env === 'production' && !databaseUrl) {
  const missing = ['database', 'username', 'password', 'host'].filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de base de datos para producción: ${missing.join(', ')}`);
  }
}

const options = {
  dialect: config.dialect,
  logging: config.logging,
  define: config.define,
  dialectOptions: config.dialectOptions,
  pool: config.pool,
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, options)
  : new Sequelize(config.database, config.username, config.password, {
    ...options,
    host: config.host,
    port: config.port,
  });

module.exports = { sequelize, Sequelize };
