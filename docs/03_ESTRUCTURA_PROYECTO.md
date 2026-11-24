# Estructura del proyecto

## Árbol relevante

```text
CielitoGo/
├── README.md
├── render.yaml
├── DEPLOY_RENDER.md
├── docs/                         # Documentación consolidada y auditorías
├── CielitoGoBackend/
│   ├── package.json
│   ├── scripts/                  # Auditorías operativas de BD
│   ├── test/                     # node:test
│   └── src/
│       ├── server.js             # Arranque y cierre controlado
│       ├── app.js                # Pipeline Express y health checks
│       ├── config/               # Entorno y Sequelize CLI
│       ├── database/             # Conexión, migraciones y seeds
│       ├── middleware/           # Auth, límites, uploads, firma, errores
│       ├── models/               # Entidades y asociaciones Sequelize
│       ├── modules/              # Rutas/controladores/servicios por dominio
│       ├── routes/               # Composición raíz de /api
│       ├── services/             # Cloudinary
│       └── utils/                # Reglas y utilidades compartidas
└── CielitoGoFrontend/
    ├── package.json
    ├── next.config.ts
    ├── public/                   # Marca e imágenes estáticas
    └── src/
        ├── app/                  # App Router, páginas y Route Handlers
        ├── components/
        │   ├── admin/            # Panel y formularios reutilizables
        │   ├── forms/            # Cotización pública
        │   ├── home/             # Landing y tarjetas
        │   ├── layout/           # Header y Footer
        │   └── ui/               # Componentes visuales genéricos
        ├── content/              # Copia estática en español
        ├── lib/
        │   ├── admin/            # Sesión, cliente y normalización admin
        │   └── api/              # Cliente público, contratos Zod y queries
        └── test/                 # Configuración Vitest
```

Se omiten `node_modules`, `.next`, lockfiles en detalle, cachés y binarios de imágenes.

## Organización del backend

Cada módulo de `src/modules` suele tener `*Routes.js` y `*Controller.js`; reservaciones y WhatsApp agregan servicios. `src/routes/index.js` monta todos los módulos y define estadísticas y contenido público adicional. Las reglas transversales se ubican en `middleware` y `utils`.

Los modelos no declaran todas sus relaciones localmente: deben consultarse junto con `src/models/index.js` y las migraciones. Las migraciones son la fuente de verdad de constraints físicos.

## Organización del frontend

El App Router separa:

- `/`: landing renderizada en servidor con ISR;
- `/api/quotes`: BFF público;
- `/api/admin/session`: login/logout y cookie;
- `/api/admin/backend/[...path]`: proxy administrativo con lista blanca;
- `/admin/login`: acceso;
- `/admin/(protected)`: páginas que exigen perfil válido.

Los componentes de formularios y acciones usan `fetch` contra rutas del mismo frontend. Los Server Components usan `adminApiRequest` directamente contra el backend con el token obtenido de la cookie.

## Guía: dónde modificar cada funcionalidad

| Necesidad | Ubicación primaria | Revisar también |
| --- | --- | --- |
| Cambiar landing/copia | `Frontend/src/components/home`, `src/content/es.ts` | `src/app/page.tsx`, `globals.css`. |
| Cambiar contrato de cotización | `Backend/src/modules/quotes` | `Frontend/src/lib/api/schemas.ts`, `QuoteForm.tsx`, migraciones y pruebas. |
| Añadir campo de tour | Modelo + nueva migración + rutas/controlador | `ResourceForm`, schemas Zod, tarjetas y API proxy. |
| Cambiar permisos | `Backend/src/middleware/auth.js` y ruta afectada | Proxy `ALLOWED`, navegación/páginas admin. |
| Agregar endpoint | Módulo de backend y montaje en rutas | BFF/lista blanca si se consume desde navegador. |
| Cambiar estados comerciales | `utils/workflow.js` y modelos | rutas, servicios, UI de selects y pruebas. |
| Cambiar cupos | `reservationService.js`, `departureController.js` | migraciones y `test/integration.test.js` con PostgreSQL/concurrencia. |
| Cambiar imágenes | `middleware/upload.js`, Cloudinary, controlador del recurso | `next.config.ts`, `assets.ts`, Render. |
| Cambiar contenido editable | `modules/pages`, modelos `PageContent`/`Setting` | `TRUST_BACKEND_PUBLIC_SETTINGS`, consumo en landing. |
| Cambiar sesión admin | Backend `auth`, frontend `api/admin/session` y `lib/admin/session` | cookies, proxy, layouts y seguridad. |
| Cambiar despliegue | `render.yaml` | `DEPLOY_RENDER.md`, variables y panel de Render. |

## Convenciones observadas

- Backend: CommonJS, nombres camelCase en JavaScript y snake_case en BD mediante Sequelize.
- Frontend: TypeScript estricto, alias `@/*`, componentes con nombre y App Router.
- Respuestas de colecciones: recurso plural y `pagination`.
- Errores nuevos: `code` estable y mensaje en español.
- Borrado lógico: `isActive=false` para tours, promociones y clientes.
- Cambios de esquema: siempre mediante una nueva migración; no editar migraciones ya aplicadas.

