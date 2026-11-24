const fs = require('node:fs');
const path = require('node:path');
const { getDatabaseConnection, runPostgresCommand, connectionArgs } = require('./postgresCommand');

async function main() {
  const backupPath = process.argv[2] ? path.resolve(process.argv[2]) : null;
  const confirmed = process.argv.includes('--confirm-restore');
  if (!backupPath || !confirmed || process.env.ALLOW_DATABASE_RESTORE !== 'true') {
    throw new Error('Uso: ALLOW_DATABASE_RESTORE=true npm run restore -- <archivo.dump> --confirm-restore');
  }
  const stats = await fs.promises.stat(backupPath);
  if (!stats.isFile() || stats.size === 0) throw new Error('El archivo de respaldo no es válido');

  const connection = getDatabaseConnection();
  await runPostgresCommand('pg_restore', [
    ...connectionArgs(connection),
    '--clean',
    '--if-exists',
    '--no-owner',
    '--no-privileges',
    '--exit-on-error',
    backupPath,
  ], connection);
  console.log(JSON.stringify({ success: true, restoredFrom: backupPath }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
