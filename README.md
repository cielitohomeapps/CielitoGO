# Cielito Go

Cielito Go es una plataforma web para presentar tours y promociones, recibir solicitudes de cotización y administrar la operación comercial de una agencia de viajes. El repositorio contiene dos aplicaciones Node.js independientes:

- `CielitoGoFrontend`: sitio público y panel administrativo en Next.js.
- `CielitoGoBackend`: API REST en Express, Sequelize y PostgreSQL.

La persistencia está orientada a PostgreSQL/Supabase y el despliegue declarado usa dos Web Services de Render. La integración opcional con Cloudinary almacena imágenes y la integración opcional con WhatsApp Cloud API recibe y envía mensajes.

## Inicio rápido

Requisitos mínimos: Node.js 20, npm y PostgreSQL accesible.

```bash
cd CielitoGoBackend
npm ci
# Crear .env a partir de .env.example
npm run migrate
npm run seed
npm run dev
```

En otra terminal:

```bash
cd CielitoGoFrontend
npm ci
# Crear .env.local a partir de .env.example
npm run dev
```

Por defecto, el backend escucha en `http://localhost:3000` y el frontend en `http://localhost:3001`. El seed requiere credenciales temporales para el administrador inicial; consulte la guía antes de ejecutarlo.

## Documentación técnica

La documentación consolidada comienza en [`docs/00_INDICE.md`](docs/00_INDICE.md). Incluye:

- arquitectura y diagramas;
- estructura del repositorio y guía de ubicación;
- inventario funcional y módulos críticos;
- modelo de datos y diagrama entidad-relación;
- referencia de API e integraciones;
- variables de entorno, instalación y despliegue;
- seguridad, pruebas, auditoría técnica y transferencia de conocimiento.

## Comandos principales

| Aplicación | Comando | Finalidad |
| --- | --- | --- |
| Backend | `npm run dev` | Desarrollo con `nodemon`. |
| Backend | `npm start` | Inicio productivo con Node.js. |
| Backend | `npm test` | Pruebas con `node:test`. |
| Backend | `npm run migrate` | Aplica migraciones pendientes. |
| Backend | `npm run seed` | Crea el administrador inicial y ajustes base. |
| Frontend | `npm run dev` | Desarrollo en el puerto 3001. |
| Frontend | `npm run check` | Lint, tipos, pruebas y build. |
| Frontend | `npm start` | Sirve el build de Next.js. |

## Estado y límites relevantes

- El sitio público, el formulario de cotización y el panel cubren tours, promociones, cotizaciones, reservaciones, usuarios, clientes, salidas, precios, contenido, media y WhatsApp.
- Producción falla de forma segura si se intenta cargar una imagen sin Cloudinary; el filesystem local sólo queda disponible para desarrollo o aceptación explícita del riesgo.
- El workflow versionado en `.github/workflows/ci.yml` valida ambos proyectos, PostgreSQL, migraciones, concurrencia, respaldo y restauración.
- Los procedimientos de privacidad, retención, respaldo y recuperación están en `docs/17_PRIVACIDAD_RETENCION.md` y `docs/18_RESPALDO_RECUPERACION.md`; su aprobación legal y los simulacros con proveedores siguen siendo tareas operativas.
- Consulte [`docs/13_AUDITORIA_TECNICA.md`](docs/13_AUDITORIA_TECNICA.md) para el estado verificable de cada hallazgo.

