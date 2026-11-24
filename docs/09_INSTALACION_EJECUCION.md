# Instalación y ejecución

## Requisitos

- Git.
- Node.js 20.x y npm.
- PostgreSQL accesible.
- Opcional: cuentas Cloudinary y Meta/WhatsApp.

## Clonar e instalar

```bash
git clone <URL_DEL_REPOSITORIO>
cd CielitoGo
cd CielitoGoBackend
npm ci
cd ../CielitoGoFrontend
npm ci
```

`npm ci` fue usado satisfactoriamente en los despliegues registrados. No borrar ni regenerar lockfiles sin una actualización deliberada.

## Base de datos local

1. Crear una base PostgreSQL `cielito_go` y, si se requieren integraciones, `cielito_go_test`.
2. Copiar `CielitoGoBackend/.env.example` a `.env`.
3. Definir `JWT_SECRET` local y conexión mediante `DATABASE_URL` o `PG*`.
4. Aplicar migraciones:

```bash
cd CielitoGoBackend
npm run migrate
```

El comando existe y su configuración fue inspeccionada; no se ejecutó durante esta auditoría para evitar modificar una BD desconocida.

## Administrador inicial

Definir temporalmente:

```env
INITIAL_ADMIN_NAME=Administrador
INITIAL_ADMIN_EMAIL=admin@example.test
INITIAL_ADMIN_PASSWORD=<contraseña-de-12-o-más-caracteres>
```

Ejecutar una sola vez:

```bash
npm run seed
```

Después, eliminar `INITIAL_ADMIN_PASSWORD`. El seed no es idempotente.

## Ejecutar backend

```bash
cd CielitoGoBackend
npm run dev
```

Verificar:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

`/health` confirma proceso; `/ready` confirma BD.

## Ejecutar frontend

Copiar `CielitoGoFrontend/.env.example` a `.env.local` y mantener:

```env
API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
TRUST_BACKEND_PUBLIC_SETTINGS=false
```

```bash
cd CielitoGoFrontend
npm run dev
```

Abrir `http://localhost:3001` y `http://localhost:3001/admin/login`.

## Comandos disponibles

### Backend

| Comando | Uso |
| --- | --- |
| `npm start` | Producción. |
| `npm run dev` | Nodemon. |
| `npm test` | Pruebas unitarias/smoke. |
| `npm run migrate` | Aplica migraciones. |
| `npm run migrate:undo` | Revierte una migración; requiere evaluación previa. |
| `npm run seed` / `seed:undo` | Seed inicial/reversión. |
| `npm run audit:db-security` | RLS/grants de PostgreSQL. |

### Frontend

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo en 3001. |
| `npm run lint` | ESLint sin warnings. |
| `npm run typecheck` | TypeScript. |
| `npm test` | Vitest. |
| `npm run build` | Build productivo. |
| `npm run check` | Cadena completa. |

## Verificación funcional mínima

1. `/health` 200 y `/ready` 200.
2. Landing muestra tours/promociones o estados vacíos controlados.
3. Enviar cotización devuelve folio `CG-*`.
4. Login administrativo establece cookie `HttpOnly`.
5. Crear/editar un tour de prueba y verificar revalidación de landing.
6. Cambiar estados sólo siguiendo la máquina permitida.

## Problemas frecuentes

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| `ENETUNREACH 2600:...:5432` | Endpoint directo IPv6 de Supabase. | Usar Session pooler IPv4 y su usuario completo. |
| Falta TypeScript en Render | `NODE_ENV=production` omitió devDependencies. | Build: `npm ci --include=dev && npm run build`. |
| 401 panel | Cookie ausente/expirada, JWT inválido o usuario inactivo. | Login y verificar issuer/audience/secret. |
| CORS | `FRONTEND_URL` distinto del origen real. | Ajustar origen exacto. |
| Imágenes desaparecen en Render | Filesystem efímero sin Cloudinary. | Configurar almacenamiento persistente. |
| 409 al cambiar estado | Transición no permitida. | Consultar `workflow.js`. |
| 503 WhatsApp | Variables incompletas. | Configurar credenciales o mantener módulo deshabilitado. |

## Resultados de comandos verificados el 24 de noviembre de 2026

- Backend `npm test`: 16/16 pruebas aprobadas.
- Frontend lint: aprobado.
- Frontend TypeScript: aprobado.
- Frontend Vitest: 6 archivos, 21/21 pruebas aprobadas.
- Frontend: lint, tipos, 21 pruebas y build aprobados con Next.js 16.4.5; auditoría de dependencias de producción sin vulnerabilidades.

