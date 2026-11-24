const fs = require('node:fs');
const path = require('node:path');
const { getDatabaseConnection, runPostgresCommand, connectionArgs } = require('./postgresCommand');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const requestedPath = process.argv[2];
const outputPath = path.resolve(requestedPath || path.join('backups', `cielito-go-${timestamp}.dump`));

async function main() {
  const connection = getDatabaseConnection();
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await runPostgresCommand('pg_dump', [
    ...connectionArgs(connection),
    '--format', 'custom',
    '--no-owner',
    '--no-privileges',
    '--file', outputPath,
  ], connection);
  const stats = await fs.promises.stat(outputPath);
  if (stats.size === 0) throw new Error('El respaldo generado está vacío');
  console.log(JSON.stringify({ success: true, outputPath, bytes: stats.size }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
