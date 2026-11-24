# API e integraciones

## Convenciones

Base local: `http://localhost:3000`. Salvo `/health`, `/ready` y estáticos, las rutas empiezan `/api`.

- Autenticación API: `Authorization: Bearer <JWT>`.
- Cuerpos: JSON, excepto tours/promociones/media con `multipart/form-data`.
- Paginación habitual: `page` (1+), `limit` (1–100).
- Error recomendado: `{ "success": false, "code": "...", "message": "...", "details": [] }`.
- Existen endpoints heredados que responden `{ "error": "..." }`.

## Salud

| Método/ruta | Auth | Respuesta |
| --- | --- | --- |
| `GET /health` | No | 200 `{status:"ok", timestamp}`; no prueba BD. |
| `GET /ready` | No | 200 si BD responde; 503 `DATABASE_UNAVAILABLE` si no. |

## Autenticación y dashboard

| Método/ruta | Permiso | Finalidad |
| --- | --- | --- |
| `POST /api/auth/login` | Público + rate limit | Login; email y password. 200 token/usuario. |
| `POST /api/auth/register` | `admin` | Crear `admin/editor`; password 12–128. 201. |
| `GET /api/auth/profile` | Autenticado | Perfil actual. |
| `PUT /api/auth/profile` | Autenticado | Nombre/email/password propios. |
| `GET /api/auth/users` | `admin` | Listar usuarios. |
| `PUT /api/auth/users/:id/role` | `admin` | Cambiar rol. |
| `PUT /api/auth/users/:id/toggle` | `admin` | Activar/desactivar. |
| `GET /api/dashboard/stats` | Autenticado | Conteos y actividad reciente. |

Ejemplo de login:

```json
{ "email": "admin@example.test", "password": "contraseña-ficticia" }
```

```json
{ "token": "<jwt>", "user": { "id": "<uuid>", "name": "Admin", "role": "admin" } }
```

## Tours, salidas y precios

| Método/ruta | Permiso | Descripción |
| --- | --- | --- |
| `GET /api/tours` | Público; token opcional | Activos para público; autenticados pueden filtrar `active`; búsqueda/paginación. |
| `GET /api/tours/:id` | Público; token opcional | Detalle activo; autenticado incluye precios. |
| `POST /api/tours` | admin/editor | Alta multipart e imagen opcional. |
| `PUT /api/tours/reorder` | admin | Array `{id, sortOrder}`. |
| `PUT /api/tours/:id` | admin/editor | Edición multipart. |
| `DELETE /api/tours/:id` | admin | Desactivación lógica. |
| `POST /api/tours/:id/images` | admin/editor | Agrega imagen de galería. |
| `DELETE /api/tours/:id/images/:imageId` | admin | Borra imagen y almacenamiento. |
| `GET /api/tours/:id/departures` | Público/token opcional | Público: próximas disponibles; admin: filtro status. |
| `POST /api/tours/:id/departures` | admin/editor | Crea salida. |
| `PUT /api/tours/:id/departures/:departureId` | admin/editor | Actualiza respetando confirmadas. |
| `DELETE /api/tours/:id/departures/:departureId` | admin | Cancela si no hay confirmadas. |
| `GET /api/pricing/active/:tourId` | Público | Precio activo calculado por vigencia. |
| `GET /api/pricing` | Autenticado | Listado/filtros. |
| `GET /api/pricing/:id` | Autenticado | Detalle. |
| `POST /api/pricing` | admin/editor | Alta. |
| `PUT /api/pricing/:id` | admin/editor | Edición. |
| `DELETE /api/pricing/:id` | admin | Eliminación física. |

Tour mínimo multipart: `name`, `description`, `duration`, `price`; arrays como JSON. Errores frecuentes: 400 validación, 404 recurso, 409 slug duplicado, 413 archivo, 502 almacenamiento.

## Promociones

| Método/ruta | Permiso | Descripción |
| --- | --- | --- |
| `GET /api/promotions` | Público/token opcional | Público sólo vigentes/activas y tour activo; filtros. |
| `GET /api/promotions/:id` | Público/token opcional | Detalle con tour e imágenes. |
| `POST /api/promotions` | admin/editor | Alta multipart. |
| `PUT /api/promotions/:id` | admin/editor | Edición multipart. |
| `DELETE /api/promotions/:id` | admin | Desactivación. |
| `POST /api/promotions/:id/images` | admin/editor | Imagen de galería. |
| `DELETE /api/promotions/:id/images/:imageId` | admin | Borrado. |

## Cotizaciones

| Método/ruta | Permiso | Descripción |
| --- | --- | --- |
| `POST /api/quotes` | Público + rate limit | Crea solicitud y folio. |
| `GET /api/quotes` | Autenticado | Lista por status/customer/search. |
| `GET /api/quotes/:id` | Autenticado | Detalle, historial y reservación. |
| `GET /api/quotes/:id/history` | Autenticado | Historial cronológico. |
| `PATCH /api/quotes/:id` | admin/editor | Edita datos permitidos. |
| `PATCH /api/quotes/:id/status` | admin/editor | Transición con nota. |
| `POST /api/quotes/:id/convert-to-reservation` | admin/editor | Convierte aceptada en reservación pendiente. |

Solicitud pública:

```json
{
  "customerName": "Ana Ejemplo",
  "phone": "+52 449 000 0000",
  "email": "ana@example.test",
  "destination": "Patagonia",
  "travelers": 3,
  "adults": 2,
  "minors": 1,
  "departureDate": "2027-02-10",
  "returnDate": "2027-02-20",
  "comments": "Viaje familiar"
}
```

Respuesta 201:

```json
{ "quote": { "id": "<uuid>", "code": "CG-2027-AB2CD", "status": "new", "createdAt": "<ISO-8601>" } }
```

Reglas 422: rango de fechas y totales de viajeros. Transición inválida: 409.

## Reservaciones y clientes

| Método/ruta | Permiso | Descripción |
| --- | --- | --- |
| `POST /api/reservations` | Público + rate limit | Solicitud con tour, fechas/salida y viajeros. |
| `GET /api/reservations` | Autenticado | Lista y filtros. |
| `GET /api/reservations/:id` | Autenticado | Detalle completo. |
| `GET /api/reservations/:id/history` | Autenticado | Historial. |
| `PATCH /api/reservations/:id` | admin/editor | Edición según estado. |
| `PATCH /api/reservations/:id/status` | admin/editor | Transición y cupos. |
| `POST /api/reservations/:id/cancel` | admin/editor | Cancelación con razón. |
| `GET /api/customers` | Autenticado | Lista/búsqueda. |
| `GET /api/customers/:id` | Autenticado | Detalle. |
| `GET /api/customers/:id/quotes` | Autenticado | Relacionadas. |
| `GET /api/customers/:id/reservations` | Autenticado | Relacionadas. |
| `POST /api/customers` | admin/editor | Alta. |
| `PUT /api/customers/:id` | admin/editor | Edición. |
| `DELETE /api/customers/:id` | admin | Desactivación. |

Errores comerciales: `INVALID_TOUR`, `INVALID_DEPARTURE`, `DEPARTURE_CANCELLED`, `INVALID_PROMOTION`, `INSUFFICIENT_AVAILABILITY`, `RESERVATION_LOCKED`.

## Contenido, ajustes y media

| Método/ruta | Permiso | Descripción |
| --- | --- | --- |
| `GET /api/content/:page` | Público | Contenido activo agrupado. |
| `GET /api/public/settings` | Público | Lista permitida de ajustes. |
| `GET /api/pages/content/:page` | Público | Variante equivalente por módulo. |
| `GET /api/pages/content` | Autenticado | Todo el contenido. |
| `PUT /api/pages/content/:page/:section/:key` | admin/editor | Upsert. |
| `POST /api/pages/content/bulk` | admin/editor | Hasta 500 items. |
| `DELETE /api/pages/content/:page/:section/:key` | admin | Borrado. |
| `GET /api/pages/settings` | Autenticado | Ajustes, filtro group. |
| `PUT /api/pages/settings/:key` | admin | Upsert. |
| `POST /api/pages/settings/bulk` | admin | Hasta 500 ajustes. |
| `GET /api/media`, `GET /api/media/:id` | Autenticado | Biblioteca. |
| `POST /api/media`, `/multiple` | admin/editor | Sube una/hasta 10 imágenes. |
| `PUT /api/media/:id` | admin/editor | Alt/categoría. |
| `PUT /api/media/:id/resize` | admin | Redimensiona almacenamiento local. |
| `DELETE /api/media/:id` | admin | Borra registro/archivo. |

## WhatsApp

| Método/ruta | Permiso | Descripción |
| --- | --- | --- |
| `GET /api/whatsapp/webhook` | Token Meta | Challenge de verificación. |
| `POST /api/whatsapp/webhook` | Firma HMAC | Recibe mensajes. |
| `GET /api/whatsapp/messages` | Autenticado | Bandeja paginada. |
| `GET /api/whatsapp/conversation/:phone` | Autenticado | Conversación. |
| `GET /api/whatsapp/unread` | Autenticado | Conteo. |
| `PUT /api/whatsapp/read/:id` | Autenticado | Marca leído localmente. |
| `POST /api/whatsapp/send` | admin/editor | Texto/template/imagen. |
| `POST /api/whatsapp/send-tour` | admin/editor | Texto compuesto desde tour. |

## BFF de Next.js

- `POST /api/quotes`: valida y reenvía al backend; oculta detalles 5xx.
- `POST|DELETE /api/admin/session`: login/logout; cookie `cielito_admin_session`.
- `/api/admin/backend/[...path]`: proxy de lista blanca. Sólo permite las operaciones usadas por el panel; no es un proxy general.

## Integraciones externas

### Cloudinary

Se activa únicamente si existen las tres credenciales. Usa `upload_stream`, HTTPS y carpetas bajo `CLOUDINARY_FOLDER`. El public ID se persiste para borrar/reemplazar y para generar URLs de transformación de tamaño sin depender de archivos locales.

### WhatsApp Cloud API

Base predeterminada `https://graph.facebook.com/v18.0`, configurable. Bearer token en servidor. Requiere webhook HTTPS público y app secret para HMAC. **Pendiente de validación:** versión vigente de Graph API, plantillas aprobadas, estados de entrega y manejo de reintentos.

### OpenAPI

No existe especificación OpenAPI/Swagger. Esta referencia se reconstruyó de las rutas; crear una especificación versionada es una recomendación de mantenimiento.

