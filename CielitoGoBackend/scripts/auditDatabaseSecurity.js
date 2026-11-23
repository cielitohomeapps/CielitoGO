require('dotenv').config();

const { sequelize } = require('../src/database');

async function auditDatabaseSecurity() {
  const [tables] = await sequelize.query(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  const [clientRoleGrants] = await sequelize.query(`
    SELECT table_name, grantee, privilege_type
    FROM information_schema.table_privileges
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated')
    ORDER BY table_name, grantee, privilege_type
  `);

  const unprotectedTables = tables.filter((table) => !table.rowsecurity);
  console.log(JSON.stringify({ tables, unprotectedTables, clientRoleGrants }, null, 2));

  if (unprotectedTables.length || clientRoleGrants.length) process.exitCode = 1;
}

auditDatabaseSecurity()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
