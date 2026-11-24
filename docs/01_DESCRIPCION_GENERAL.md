# Descripción general

## Objetivo y problema de negocio

Cielito Go digitaliza dos frentes de una agencia de viajes:

1. adquisición: presenta tours y promociones, muestra datos de contacto y recibe cotizaciones;
2. operación: permite al equipo gestionar catálogo, campañas, solicitudes comerciales, reservaciones y usuarios.

La API también contiene capacidades para clientes, tarifas estacionales, salidas con cupo, contenido editable, biblioteca de medios y mensajería de WhatsApp. El panel administrativo ofrece una interfaz operativa para estos módulos.

## Usuarios y roles

| Actor | Capacidades verificadas |
| --- | --- |
| Visitante | Consulta tours/promociones activos, datos públicos y contenido; envía cotizaciones y solicitudes de reservación. |
| `editor` | Opera tours, promociones, cotizaciones, reservaciones, clientes, precios, contenido, media y WhatsApp según las rutas autorizadas. No administra roles ni operaciones destructivas reservadas a `admin`. |
| `admin` | Todas las capacidades de `editor`, más usuarios, desactivaciones, borrado de imágenes, ajustes, reordenamiento y otras operaciones restringidas. |
| Meta/WhatsApp | Verifica el webhook y entrega eventos firmados de mensajes entrantes. |

Referencias: `CielitoGoBackend/src/middleware/auth.js`, rutas en `CielitoGoBackend/src/modules/*/*Routes.js` y `CielitoGoFrontend/src/app/admin`.

## Tecnologías declaradas

### Backend

- JavaScript CommonJS, Node.js 20 en Render.
- Express 4.21, Sequelize 6.37 y PostgreSQL (`pg` 8.23).
- JWT HS256, `bcryptjs`, `express-validator`, `express-rate-limit`, Helmet y CORS.
- Multer y Sharp para imágenes; Cloudinary opcional.
- Axios para WhatsApp Cloud API.
- `node:test` para pruebas.

### Frontend

- TypeScript 5.9, Next.js 16, React 19 y App Router.
- Zod 4 para contratos de datos.
- Vitest 4, Testing Library y ESLint 9.
- Renderizado estático, ISR (`revalidate = 60`), Server Components, Client Components y Route Handlers.

Las versiones exactas resueltas están en los respectivos `package-lock.json`; los rangos soportados se encuentran en ambos `package.json`.

## Aplicaciones y procesos

| Proceso | Entrada | Puerto local | Responsabilidad |
| --- | --- | --- | --- |
| API | `CielitoGoBackend/src/server.js` | 3000 | Autentica, valida, aplica reglas y persiste. |
| Web | Next.js App Router | 3001 en desarrollo | Sitio público, panel y BFF para ocultar JWT/API. |
| Migraciones | Sequelize CLI | No aplica | Evolución versionada de PostgreSQL. |
| Seed | Sequelize CLI | No aplica | Administrador inicial y ajustes base. |
| Auditoría BD | `scripts/auditDatabaseSecurity.js` | No aplica | Comprueba RLS y privilegios de roles de Supabase. |

No se identificaron workers, colas, cron jobs ni tareas programadas.

## Ambientes

- **Desarrollo:** PostgreSQL local o `DATABASE_URL`; logs SQL habilitados; frontend en 3001.
- **Pruebas:** backend usa `DB_TEST_URL` o `PG_TEST_DATABASE`; JWT de prueba interno. Las pruebas smoke no requieren autenticar la BD, salvo pruebas futuras de integración.
- **Producción:** dos servicios Render, SSL de BD, `JWT_SECRET` obligatorio de al menos 32 caracteres y pool Sequelize de máximo 10 conexiones.

## Dependencias externas

- PostgreSQL, previsto para Supabase.
- Render para alojamiento declarado.
- Cloudinary, opcional, para persistencia de imágenes.
- Meta Graph/WhatsApp Cloud API, opcional.
- No se identificó servicio de correo, pagos, analítica, cola ni almacenamiento de respaldos administrado por la aplicación.

## Estado funcional resumido

| Área | Estado verificable |
| --- | --- |
| Landing pública | Implementada con tolerancia a fallos parciales del backend. |
| Cotización pública | Implementada extremo a extremo, con folio público. |
| Login y sesión admin | Implementados mediante JWT en cookie `HttpOnly`. |
| Tours y promociones admin | CRUD parcial: alta, edición, consulta y desactivación. |
| Cotizaciones/reservaciones admin | Listado y cambios de estado; varias operaciones API avanzadas no tienen UI. |
| Usuarios admin | Alta, rol y activación/desactivación. |
| Clientes/precios/salidas/contenido/media/WhatsApp | API e interfaz administrativa implementadas; las operaciones especializadas pueden seguir realizándose por API. |
| OpenAPI/Swagger | No existe. |

