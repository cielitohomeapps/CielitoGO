# Despliegue en Render

El repositorio contiene dos aplicaciones que se despliegan como servicios independientes:

| Servicio | Directorio raíz | Tipo | Comando de construcción | Comando de inicio |
| --- | --- | --- | --- | --- |
| API | `CielitoGoBackend` | Web Service (Node) | `npm ci` | `npm start` |
| Web | `CielitoGoFrontend` | Web Service (Node / Next.js) | `npm ci && npm run build` | `npm start` |

El archivo `render.yaml` de la raíz define ambos servicios. El frontend no es un Static Site porque usa renderizado de servidor y un Route Handler (`/api/quotes`).

## Crear los servicios

1. En Render, crea un **Blueprint** y conecta `cielitohomeapps/CielitoGO` en la rama `main`.
2. Render detectará el archivo `render.yaml` y propondrá `cielitogo-api` y `cielitogo-web` como servicios separados.
3. Cuando Render solicite los valores marcados como secretos, configura primero el API y después el frontend.

## Variables del API (`cielitogo-api`)

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | URL de conexión PostgreSQL de producción. No la confirmes en Git. |
| `FRONTEND_URL` | URL pública exacta de `cielitogo-web`, por ejemplo `https://cielitogo-web.onrender.com`. |
| `JWT_SECRET` | Render la genera automáticamente. Conserva el valor generado. |
| `DB_SSL` | `true` |
| `TRUST_PROXY` | `1` |

Configura además las variables `WHATSAPP_*` sólo si se activará la integración de WhatsApp. Para crear el administrador inicial, define temporalmente `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL` e `INITIAL_ADMIN_PASSWORD`, ejecuta el seed una única vez y luego elimina `INITIAL_ADMIN_PASSWORD` de Render.

## Variables del frontend (`cielitogo-web`)

| Variable | Valor |
| --- | --- |
| `API_BASE_URL` | URL pública del API, por ejemplo `https://cielitogo-api.onrender.com`. Sin `/api` al final. |
| `NEXT_PUBLIC_SITE_URL` | URL pública exacta del frontend, por ejemplo `https://cielitogo-web.onrender.com`. |
| `TRUST_BACKEND_PUBLIC_SETTINGS` | `false` hasta validar el contenido público de la base de datos. |

Después de guardar `API_BASE_URL` o `NEXT_PUBLIC_SITE_URL`, ejecuta una nueva construcción del frontend para que Next.js use los valores también durante el build.

## Validación posterior

1. Abre `https://<api>/health`; debe responder JSON con `status: "ok"`.
2. Abre `https://<api>/ready`; debe responder `status: "ready"` cuando la base de datos esté disponible.
3. Abre la URL del frontend y prueba el formulario de cotización.
4. Confirma que `FRONTEND_URL` sea exactamente el origen del frontend, sin una barra final ni rutas, para que CORS funcione.

## Datos subidos por usuarios

El backend guarda cargas en `public/uploads`. El sistema de archivos normal de un Web Service de Render no es persistente entre despliegues ni reinicios. Antes de habilitar carga de media en producción, usa almacenamiento de objetos (recomendado) o un disco persistente de Render en un plan compatible.
