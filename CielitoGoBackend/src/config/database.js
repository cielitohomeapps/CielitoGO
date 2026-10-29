require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const useSsl = process.env.DB_SSL === 'true'
  || (nodeEnv === 'production' && process.env.DB_SSL !== 'false');

const common = {
  dialect: 'postgres',
  define: {
    timestamps: true,
    underscored: true,
  },
  ...(useSsl ? { dialectOptions: { ssl: { rejectUnauthorized: true } } } : {}),
};

const localConnection = (name) => ({
  username: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || null,
  database: process.env[name] || process.env.PGDATABASE || 'cielito_go',
  host: process.env.PGHOST || 'localhost',
  port: Number.parseInt(process.env.PGPORT, 10) || 5432,
});

module.exports = {
  development: {
    ...common,
    ...(process.env.DATABASE_URL
      ? { use_env_variable: 'DATABASE_URL' }
      : localConnection('PGDATABASE')),
    logging: console.log,
  },
  test: {
    ...common,
    ...(process.env.DB_TEST_URL
      ? { use_env_variable: 'DB_TEST_URL' }
      : {
        ...localConnection('PG_TEST_DATABASE'),
        database: process.env.PG_TEST_DATABASE || 'cielito_go_test',
      }),
    logging: false,
  },
  production: {
    ...common,
    ...(process.env.DATABASE_URL
      ? { use_env_variable: 'DATABASE_URL' }
      : localConnection('PGDATABASE')),
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
