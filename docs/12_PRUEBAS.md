# Pruebas

## Backend

Framework: `node:test` y `assert`.

Cobertura observada:

- dialecto PostgreSQL;
- carga de app, `/health`, headers y 404 JSON;
- protección de registro y endpoints administrativos;
- firma válida/inválida de webhook;
- fallo cerrado sin `JWT_SECRET` en producción;
- rechazo de imagen falsificada, falla cerrada sin almacenamiento persistente y adaptación múltiple a Cloudinary;
- validación previa de formularios públicos;
- contrato simulado de texto, plantilla, imagen, idempotencia y estados de WhatsApp;
- formato de folio, slugs, rangos, viajeros y máquinas de estados.

Comando:

```bash
cd CielitoGoBackend
npm test
```

Resultado verificado el 24-11-2026: **20/20 aprobadas**.

Las pruebas unitarias levantan Express en puerto efímero y no tocan PostgreSQL. `npm run test:integration` usa exclusivamente `DB_TEST_URL`, valida migraciones y ejecuta confirmaciones concurrentes de reservaciones para comprobar bloqueo y cupos. En CI corre contra PostgreSQL 16; localmente se omite si no existe una base dedicada cuyo nombre contenga `test`.

## Frontend

Frameworks: Vitest, jsdom y Testing Library.

Cobertura observada:

- `QuoteForm`: totales, contrato, 201, WhatsApp, errores y red;
- activación automática del backend, recarga y reintento tras un arranque fallido;
- `Header`: accesibilidad y menú móvil;
- cliente API: éxito, error heredado y contrato inválido;
- schema de cotización;
- resolución segura de assets;
- normalizadores del panel.

Comandos:

```bash
cd CielitoGoFrontend
npm run lint
npm run typecheck
npm test
npm run build
```

Resultado verificado el 24-11-2026:

- lint aprobado;
- typecheck aprobado;
- 6 archivos y 21/21 pruebas aprobadas;
- build aprobado con Next.js 16.4.5;
- auditoría de dependencias productivas sin vulnerabilidades.

`npm run check` terminó con código 0 y ejecutó lint, TypeScript, las 21 pruebas y el build optimizado.

## Pruebas faltantes prioritarias

1. Ampliar integración PostgreSQL a cancelación concurrente y CRUD completo.
2. CRUD y permisos por rol para todos los endpoints.
3. Prueba contractual contra una cuenta Cloudinary de staging.
4. Webhook con fixtures capturados de una cuenta Meta de staging.
5. BFF administrativo: lista blanca, CSRF/mismo origen y expiración.
6. E2E de visitante y panel con navegador.
7. Accesibilidad automatizada.
8. Simulacro periódico de restauración sobre infraestructura del proveedor.

## Datos y aislamiento

Toda prueba futura de integración debe usar `DB_TEST_URL` o `PG_TEST_DATABASE`, nunca producción. Debe limpiar transacciones/datos propios y no depender del seed real.

