# Cielito Go Frontend

Frontend público de Cielito Go para descubrir destinos y experiencias y enviar solicitudes reales de cotización. Es un proyecto nuevo e independiente del frontend anterior y consume el backend existente sin modificarlo.

La interfaz toma como referencia el mockup de Figma, la normativa gráfica proporcionada y el manual editorial. El contenido no confirmado se identifica como provisional; la aplicación no inventa precios, disponibilidad, promociones, contactos ni testimonios.

## Tecnologías

- Next.js 16 con App Router y React 19.
- TypeScript en modo estricto.
- CSS nativo, con tokens visuales centralizados y diseño responsive.
- Zod para validar entradas y respuestas externas.
- Vitest, Testing Library y jsdom para pruebas automatizadas.
- ESLint con las reglas recomendadas de Next.js y Core Web Vitals.
- `next/image` y `next/font` para optimización de imágenes y fuentes.

No se utiliza Tailwind CSS ni una biblioteca de estado global: la primera versión no las necesita.

## Requisitos

- Node.js `20.9.0` o posterior. Node 22 LTS es una opción recomendada.
- npm incluido con Node.js.
- El backend de Cielito Go, si se probarán catálogo, promociones o cotizaciones reales.

El backend vive en un proyecto separado y conserva su propio proceso, variables y base de datos. Este repositorio no ejecuta migraciones, seeds ni modificaciones sobre él.

## Instalación

Desde PowerShell:

```powershell
cd C:\Users\DIEGO\Documents\CielitoGo\CielitoGoFrontend
npm install
Copy-Item .env.example .env.local
```

En macOS o Linux, el último comando equivalente es:

```bash
cp .env.example .env.local
```

Después, revisa `.env.local` antes de iniciar el proyecto.

## Variables de entorno

| Variable | Visibilidad | Obligatoria | Uso |
| --- | --- | --- | --- |
| `API_BASE_URL` | Sólo servidor | Para datos e integración real | Origen del backend, por ejemplo `http://localhost:3000`. No debe incluir credenciales. |
| `NEXT_PUBLIC_SITE_URL` | Pública | Sí para producción | URL canónica del frontend utilizada en metadata, `robots.txt` y sitemap. |
| `TRUST_BACKEND_PUBLIC_SETTINGS` | Sólo servidor | No | Debe permanecer en `false` hasta comprobar que los contactos y redes de la base de datos son oficiales y no valores de demostración. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Pública | No | Campo reservado para un contacto confirmado; puede dejarse vacío mientras no exista aprobación. |
| `NEXT_PUBLIC_ADVISOR_URL` | Pública | No | Campo reservado para un canal de asesoría confirmado; puede dejarse vacío mientras no exista aprobación. |

Nunca agregues secretos, tokens ni credenciales reales a variables con prefijo `NEXT_PUBLIC_`. No confirmes `API_BASE_URL` ni `.env.local` en Git.

## Ejecución local

Inicia el frontend:

```powershell
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001). El proyecto usa ese puerto en desarrollo para no competir con el puerto `3000` predeterminado del backend. Si el backend está configurado y en ejecución, el frontend consulta sus endpoints públicos. Si no está disponible, la landing conserva contenido editorial claramente identificado y no simula respuestas exitosas.

Para probar una cotización real, el backend debe aceptar `POST /api/quotes` y `API_BASE_URL` debe apuntar a ese servidor. La confirmación de la interfaz sólo aparece después de recibir una respuesta satisfactoria del backend.

## Scripts

| Comando | Función |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo desarrollo. |
| `npm run build` | Genera el build de producción. |
| `npm run start` | Sirve un build ya generado. |
| `npm run lint` | Ejecuta ESLint y falla ante cualquier advertencia. |
| `npm run lint:fix` | Aplica correcciones automáticas seguras de ESLint cuando existan. |
| `npm run typecheck` | Comprueba TypeScript sin emitir archivos. |
| `npm run test` | Ejecuta una vez las pruebas de Vitest. |
| `npm run test:watch` | Ejecuta Vitest en modo interactivo. |
| `npm run check` | Ejecuta lint, TypeScript, pruebas y build, en ese orden. |

Antes de entregar o desplegar una revisión:

```powershell
npm run check
```

El resultado de cada ejecución debe registrarse en la entrega o en el sistema de integración continua; este documento no presupone que las comprobaciones hayan sido ejecutadas.

## Compilación y ejecución de producción

```powershell
npm run build
npm run start
```

Por defecto, `next start` escucha en el puerto 3000. Para ejecutar simultáneamente el backend local y el build del frontend, selecciona otro puerto en PowerShell:

```powershell
$env:PORT = "3001"
npm run start
```

## Despliegue recomendado

Despliega como aplicación Node.js compatible con Next.js 16, con Node `>=20.9.0`:

1. Instala dependencias de forma reproducible con `npm ci` cuando exista `package-lock.json`.
2. Configura `API_BASE_URL`, `NEXT_PUBLIC_SITE_URL` y, sólo tras validarlo, `TRUST_BACKEND_PUBLIC_SETTINGS`.
3. Ejecuta `npm run check` en integración continua.
4. Genera el artefacto con `npm run build`.
5. Sirve la aplicación con `npm run start` detrás de HTTPS y un proxy/CDN apropiado.

El backend debe permitir mediante CORS el origen final del frontend usando su variable `FRONTEND_URL`. No desactives CORS, Helmet, rate limiting ni otras defensas para completar la integración.

## Contenido y activos

- Cormorant Garamond se utiliza para títulos y Montserrat para texto funcional.
- Los valores numéricos de color actuales proceden de Figma y son tokens de implementación; no deben presentarse como la paleta institucional definitiva mientras no se entregue una paleta oficial.
- El buscador del mockup no se publica porque el backend no ofrece todavía una búsqueda consolidada compatible.
- No se muestran testimonios de demostración. El espacio queda reservado para testimonios reales y autorizados.
- Los destinos editoriales de respaldo no representan disponibilidad comercial.
- Los contactos del backend no se publican por defecto porque la base auditada puede contener datos de demostración.
- El logo local conserva sus proporciones y no debe recolorearse, deformarse ni reconstruirse.
- Los activos de Figma y del workspace requieren confirmación final de licencia y procedencia antes de una publicación comercial.
- Los videos originales del proyecto anterior no se incluyen: necesitan validación de derechos y transcodificación antes de usarse en web.

Consulta también:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`API_INTEGRATION.md`](./API_INTEGRATION.md)
- [`DESIGN_DECISIONS.md`](./DESIGN_DECISIONS.md)
- [`PENDING.md`](./PENDING.md)
- [`docs/ASSET_INVENTORY.md`](./docs/ASSET_INVENTORY.md)

## Backend e integración

La capa API del frontend centraliza timeouts, cancelación, validación de contratos y errores. La primera versión prepara o integra:

- Contenido de inicio y configuración pública.
- Tours activos paginados.
- Promociones destacadas vigentes.
- Envío real de solicitudes de cotización mediante el proxy del frontend `/api/quotes`.

No existe un endpoint de contacto corto. Por eso el formulario implementado solicita todos los campos requeridos por el contrato real de cotización. Las reservaciones requieren un tour, fechas y disponibilidad válidos y no forman parte del formulario genérico de la landing.

Los contratos completos y las limitaciones conocidas están documentados en `API_INTEGRATION.md` y `PENDING.md`.
