# Configuración y variables de entorno

## Backend

| Variable | Obligatoria | Ejemplo seguro | Uso/ambiente |
| --- | --- | --- | --- |
| `NODE_ENV` | Producción | `production` | Selecciona config y seguridad. |
| `PORT` | No | `3000` | Puerto HTTP; Render lo inyecta. |
| `JWT_SECRET` | Sí | `<secreto-aleatorio-32+>` | Firma JWT; mínimo 32 en producción. |
| `JWT_EXPIRATION` | No | `24h` | Duración JWT. |
| `JWT_ISSUER` | No | `cielito-go-api` | Claim issuer. |
| `JWT_AUDIENCE` | No | `cielito-go-admin` | Claim audience. |
| `DATABASE_URL` | Producción recomendada | `postgresql://usuario:clave@host:5432/db` | Conexión PostgreSQL. |
| `DB_TEST_URL` | Pruebas integradas | URL de BD aislada | BD de pruebas. |
| `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` | Alternativa | `localhost`, `5432`, etc. | Conexión desglosada. |
| `PG_TEST_DATABASE` | No | `cielito_go_test` | Nombre local de pruebas. |
| `DB_SSL` | Producción | `true` | SSL Sequelize. |
| `FRONTEND_URL` | Producción | `https://web.example.test` | Único origen CORS permitido. |
| `TRUST_PROXY` | Render | `1` | IP/protocolo tras proxy. |
| `REQUEST_BODY_LIMIT` | No | `1mb` | JSON/urlencoded. |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Ventana común. |
| `RATE_LIMIT_MAX` | No | `300` | API general. |
| `AUTH_RATE_LIMIT_MAX` | No | `10` | Login/registro. |
| `WEBHOOK_RATE_LIMIT_MAX` | No | `120` | Webhook. |
| `PUBLIC_FORM_RATE_LIMIT_MAX` | No | `20` | Cotización/reservación. |
| `UPLOAD_DIR` | No | `./public/uploads` | Almacenamiento local. |
| `MAX_FILE_SIZE` | No | `10485760` | Bytes por imagen. |
| `MAX_IMAGE_WIDTH`, `MAX_IMAGE_HEIGHT` | No | `8000` | Dimensiones. |
| `MAX_IMAGE_PIXELS` | No | `40000000` | Protección Sharp. |
| `CLOUDINARY_CLOUD_NAME` | Grupo opcional | `<cloud>` | Habilita Cloudinary con key/secret. |
| `CLOUDINARY_API_KEY` | Grupo opcional | `<key>` | Credencial servidor. |
| `CLOUDINARY_API_SECRET` | Grupo opcional | `<secret>` | Secreto servidor. |
| `CLOUDINARY_FOLDER` | No | `cielito-go` | Prefijo remoto. |
| `WHATSAPP_API_URL` | No | `https://graph.facebook.com/v18.0` | Base Graph API. |
| `WHATSAPP_PHONE_NUMBER_ID` | Integración | `<id>` | Remitente. |
| `WHATSAPP_ACCESS_TOKEN` | Integración | `<token>` | Bearer secreto. |
| `WHATSAPP_VERIFY_TOKEN` | Webhook | `<token-verificacion>` | Challenge. |
| `WHATSAPP_APP_SECRET` | Webhook POST | `<app-secret>` | Firma HMAC. |
| `INITIAL_ADMIN_NAME` | Seed | `Administrador` | Seed único. |
| `INITIAL_ADMIN_EMAIL` | Seed | `admin@example.test` | Seed único. |
| `INITIAL_ADMIN_PASSWORD` | Seed | `<12+ caracteres>` | Temporal; retirar luego. |

Consumidores: `src/config/index.js`, `src/config/database.js`, seed y servicios.

## Frontend

| Variable | Obligatoria | Ejemplo seguro | Uso |
| --- | --- | --- | --- |
| `NODE_ENV` | Producción | `production` | Cookies Secure y Next.js. |
| `API_BASE_URL` | Sí | `https://api.example.test` | Sólo servidor; sin `/api`, path ni credenciales. |
| `NEXT_PUBLIC_SITE_URL` | Producción | `https://web.example.test` | Metadata, robots y sitemap. Pública. |
| `TRUST_BACKEND_PUBLIC_SETTINGS` | No | `false` | Permite contacto/redes desde BD. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | No | `contacto@example.test` | Fallback público. |
| `NEXT_PUBLIC_ADVISOR_URL` | No | `https://wa.me/5210000000000` | WhatsApp público permitido. |

Todo `NEXT_PUBLIC_*` queda expuesto al navegador. Nunca incluir secretos.

## Archivos de ejemplo

Se proporcionan:

- `CielitoGoBackend/.env.example`;
- `CielitoGoFrontend/.env.example`.

Copiar a `.env` y `.env.local`, respectivamente. Los archivos reales están ignorados por Git.

## Requisitos mínimos

- Node.js 20.x y npm compatible con lockfile v3.
- PostgreSQL compatible con enums, JSON, UUID, RLS y locks de fila.
- Acceso de red a la BD. Para Supabase/Render, Session pooler IPv4.
- Credenciales opcionales de Cloudinary/Meta según módulos habilitados.

## Reglas de configuración

- No combinar `DATABASE_URL` real con variables `PG*` contradictorias; la URL tiene prioridad.
- En Render, `NODE_ENV=production` hace que npm omita devDependencies; el build frontend debe usar `npm ci --include=dev`.
- Cambios en variables del frontend requieren rebuild.
- `FRONTEND_URL` debe ser el origen exacto sin path ni slash final para CORS.
- No activar `TRUST_BACKEND_PUBLIC_SETTINGS` hasta verificar que los valores de BD sean oficiales.

