const { spawn } = require('node:child_process');

const getDatabaseConnection = () => {
  const value = process.env.DATABASE_URL || process.env.DB_TEST_URL;
  if (!value) throw new Error('DATABASE_URL o DB_TEST_URL es obligatoria');
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('La conexión debe ser PostgreSQL');
  return {
    host: url.hostname,
    port: url.port || '5432',
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    sslMode: url.searchParams.get('sslmode') || (process.env.DB_SSL === 'false' ? 'disable' : 'require'),
  };
};

const runPostgresCommand = (command, args, connection) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      PGPASSWORD: connection.password,
      PGSSLMODE: connection.sslMode,
    },
    shell: false,
  });
  child.once('error', reject);
  child.once('exit', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`${command} terminó con código ${code}`));
  });
});

const connectionArgs = (connection) => [
  '--host', connection.host,
  '--port', connection.port,
  '--username', connection.user,
  '--dbname', connection.database,
];

module.exports = { getDatabaseConnection, runPostgresCommand, connectionArgs };
