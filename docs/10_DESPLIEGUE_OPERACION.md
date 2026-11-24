# Despliegue y operación

## Plataforma identificada

`render.yaml` define dos Web Services:

| Servicio | Root | Build | Predeploy | Start | Health |
| --- | --- | --- | --- | --- | --- |
| `cielitogo-api` | `CielitoGoBackend` | `npm ci` | `npm run migrate` | `npm start` | `/health` |
| `cielitogo-web` | `CielitoGoFrontend` | `npm ci --include=dev && npm run build` | — | `npm start` | `/` |

Node queda en 20.x para frontend; el Blueprint declara 20.19.0 para ambos. Render puede seleccionar un patch posterior compatible.

## Orden recomendado

1. Aprovisionar PostgreSQL/Supabase.
2. Configurar API, incluida `DATABASE_URL` Session pooler, `JWT_SECRET`, SSL y frontend URL.
3. Desplegar API; `preDeployCommand` aplica migraciones.
4. Ejecutar seed inicial controlado si no existe admin.
5. Configurar y desplegar frontend con URL pública del API y del sitio.
6. Actualizar `FRONTEND_URL` del API con el origen definitivo.
7. Validar health, ready, login y cotización.

## Variables de producción mínimas

API: `NODE_ENV`, `DATABASE_URL`, `DB_SSL`, `JWT_SECRET`, `TRUST_PROXY`, `FRONTEND_URL`. Web: `NODE_ENV`, `API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `TRUST_BACKEND_PUBLIC_SETTINGS`.

## Particularidades Render/Supabase

- Usar la cadena **Session pooler** de Supabase si Render no tiene salida IPv6. Host `*.pooler.supabase.com:5432` y usuario `postgres.<project-ref>`.
- En el plan gratuito, la API puede suspenderse por inactividad. Al abrir la portada, el navegador consulta `/api/backend-status` y reintenta durante un máximo de 90 segundos. La ruta confirma la respuesta JSON de `/ready` (Express y PostgreSQL). Si el catálogo no cargó, la portada solicita invalidar la caché y se actualiza al confirmar que la API está lista.
- El build command efectivo de un servicio ya creado puede conservarse en el panel aunque cambie `render.yaml`; sincronizar Blueprint o editar Settings.
- `NODE_ENV=production` omite devDependencies con `npm ci`; el frontend requiere `--include=dev` para compilar TypeScript.
- El filesystem del servicio es efímero. Cloudinary es la vía implementada para tours, promociones y `media`; las cargas fallan con 503 en producción si no está configurado, salvo aceptación explícita mediante `ALLOW_EPHEMERAL_UPLOADS=true`.

## Logs y monitoreo

La aplicación registra:

- conexión y puerto al arrancar;
- cierre controlado por SIGTERM/SIGINT;
- errores HTTP con nombre/mensaje y stack sólo en desarrollo;
- errores de limpieza/upload y WhatsApp sin tokens.

No se identificó APM, tracing, métricas, alertas, correlación de requests ni logging estructurado persistente. Depende de logs/health checks de Render.

## Operación diaria

- Revisar `/health` y `/ready`.
- Revisar reinicios, errores 5xx, 429, timeouts de API y fallos Cloudinary/WhatsApp.
- Vigilar conexiones PostgreSQL y límites del pooler.
- Ejecutar `audit:db-security` después de cambios de esquema/permisos.
- Mantener `TRUST_BACKEND_PUBLIC_SETTINGS=false` hasta validar contenidos.
- Retirar variables del seed tras uso.

## Actualización

1. Ejecutar pruebas y build local.
2. Revisar nuevas migraciones y su `down`.
3. Respaldar BD según proveedor antes de cambios destructivos.
4. Fusionar a la rama conectada.
5. Render construye; API migra antes de iniciar.
6. Verificar health/ready, logs y smoke funcional.

## Reversión

Existe un runbook verificable en `docs/18_RESPALDO_RECUPERACION.md` y comandos protegidos `npm run backup:db` / `npm run restore:db`. Procedimiento:

1. identificar último deploy estable en Render;
2. restaurar ese commit/deploy;
3. no ejecutar `migrate:undo` automáticamente: evaluar compatibilidad del código anterior con el esquema nuevo;
4. si la migración fue destructiva, restaurar backup del proveedor;
5. validar ready y operaciones críticas.

La restauración se prueba en CI contra PostgreSQL temporal. La disponibilidad, retención y restauración del proveedor productivo deben ensayarse con las cuentas reales antes del go-live.

## CI/CD

`.github/workflows/ci.yml` ejecuta auditoría de dependencias productivas, migraciones desde cero, pruebas unitarias e integración concurrente contra PostgreSQL 16, respaldo/restauración, auditoría RLS, lint, tipos y build. El repositorio debe configurar esta verificación como obligatoria antes de fusionar a la rama desplegada.

