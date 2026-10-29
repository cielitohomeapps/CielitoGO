# Integración con la API de Cielito Go

## Estado de la auditoría

El backend existente fue inspeccionado en modo de solo lectura en
`C:\Users\DIEGO\Documents\CielitoGoBackend`. No se modificaron archivos,
bases de datos, migraciones, seeds ni configuraciones.

La API es una aplicación Node.js con Express 4, JavaScript CommonJS,
Sequelize 6 y MySQL. Expone sus rutas bajo `/api`.

La URL del backend se configura exclusivamente en el servidor de Next.js:

```dotenv
API_BASE_URL=http://localhost:3000
```

`API_BASE_URL` no lleva el prefijo `NEXT_PUBLIC_`: el navegador consume las
rutas del frontend y no necesita conocer la topología interna del backend.

## Endpoints públicos

| Método | Endpoint | Uso previsto | Autenticación | Estado de la primera versión |
| --- | --- | --- | --- | --- |
| `GET` | `/api/content/home` | Contenido editorial administrable de la portada | No | Integración preparada |
| `GET` | `/api/pages/content/home` | Alias del endpoint de contenido | No | No se usa para evitar duplicidad |
| `GET` | `/api/public/settings` | Nombre, logo y contactos públicos | No | Integración preparada; sólo se muestran valores recibidos y confirmados |
| `GET` | `/api/tours` | Tours/experiencias activas con paginación y búsqueda | No | Integración preparada |
| `GET` | `/api/tours/:id` | Detalle de tour por UUID | No | Preparado para una fase de detalle |
| `GET` | `/api/tours/:id/departures` | Salidas futuras disponibles | No | Preparado para una fase de detalle |
| `GET` | `/api/pricing/active/:tourId` | Precio activo de un tour | No | Preparado; no se muestra precio sin respuesta real |
| `GET` | `/api/promotions` | Promociones activas y vigentes | No | Integración preparada, sin crear promociones de respaldo |
| `GET` | `/api/promotions/:id` | Detalle de promoción | No | Preparado para una fase de detalle |
| `POST` | `/api/quotes` | Solicitud real de cotización | No | Integrado mediante proxy y formulario de contrato completo |
| `POST` | `/api/reservations` | Solicitud de reservación de un tour real | No | Fuera de la landing; requiere UUID, fechas y disponibilidad verificables |

## Contratos consumidos

### Contenido de portada

`GET /api/content/home`

```json
{
  "page": "home",
  "content": {
    "section": {
      "key": {
        "value": "...",
        "type": "text",
        "metadata": {}
      }
    }
  }
}
```

El contenido remoto se valida antes de utilizarse. Si está ausente o no es
válido, la interfaz utiliza el contenido editorial local aprobado, identificado
en el código por su procedencia. Un error remoto no convierte contenido
provisional en una afirmación comercial.

### Configuración pública

`GET /api/public/settings` sólo permite las siguientes claves:

- `site_name`
- `site_logo`
- `site_email`
- `site_phone`
- `whatsapp_number`
- `facebook_url`
- `instagram_url`

Los seeds del backend contienen valores con apariencia demostrativa. El
frontend no debe mostrar un dato de contacto simplemente porque exista en un
seed; sólo utilizará valores obtenidos de la instancia configurada y que hayan
sido confirmados como publicables.

### Lista de tours

```http
GET /api/tours?page=1&limit=12&search=termino
```

```json
{
  "tours": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "pages": 0
  }
}
```

Reglas verificadas:

- El acceso público sólo devuelve tours activos.
- La búsqueda cubre nombre y descripción.
- El orden es fijo: `sortOrder ASC`, seguido de `createdAt DESC`.
- El límite máximo aceptado es 100.
- Las imágenes pueden usar rutas relativas `/uploads/...`; deben resolverse
  contra el origen de `API_BASE_URL`, nunca contra el dominio del frontend.
- El detalle utiliza UUID, no slug.
- No existen filtros públicos por ubicación, dificultad, duración, fecha o
  rango de precio.

### Promociones

```http
GET /api/promotions?featured=true&page=1&limit=6
```

Filtros disponibles: `page`, `limit`, `featured`, `tourId` y `destination`.
La respuesta pública sólo contiene promociones activas y vigentes cuyo tour
relacionado también está activo.

```json
{
  "promotions": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 20,
    "pages": 0
  }
}
```

La ausencia de promociones se representa como estado vacío. No se crean
descuentos, fechas ni disponibilidad ficticios.

### Solicitud de cotización

`POST /api/quotes`

Campos obligatorios:

```json
{
  "customerName": "Nombre completo",
  "phone": "+52 ...",
  "email": "persona@example.com",
  "destination": "Destino de interés",
  "travelers": 2,
  "adults": 2,
  "minors": 0
}
```

Campos opcionales:

- `departureDate`
- `returnDate`
- `budget`
- `comments`

Restricciones del contrato:

- `customerName`: 2–200 caracteres.
- `phone`: 7–50 caracteres.
- `email`: correo válido.
- `destination`: 2–200 caracteres.
- `travelers === adults + minors`.
- La fecha de regreso no puede ser anterior a la fecha de salida.
- El endpoint aplica rate limiting específico para formularios.

Respuesta exitosa real (`201`):

```json
{
  "quote": {
    "id": "uuid",
    "status": "new",
    "createdAt": "..."
  }
}
```

El formulario breve de Figma (nombre, correo, destino y mensaje) no cumple este
contrato. La implementación utiliza un formulario de cotización ampliado y no
simula confirmaciones. El botón se bloquea durante la solicitud para reducir
envíos duplicados en la sesión del navegador; el backend todavía no ofrece una
clave de idempotencia.

## Capa de acceso a datos

El acceso remoto queda centralizado en `src/lib/api`:

- Construcción de URL a partir de `API_BASE_URL`.
- Timeout mediante `AbortController`.
- Encabezados y serialización JSON consistentes.
- Validación de respuestas con Zod.
- Normalización de errores heredados y modernos.
- Helpers por recurso para evitar `fetch` dispersos en componentes.
- Resolución controlada de medios relativos del backend.

Las lecturas públicas se ejecutan preferentemente en Server Components. Esto
evita exponer configuración interna, reduce JavaScript cliente y permite cache
y revalidación. Las mutaciones del navegador pasan por Route Handlers del
frontend.

## Errores

El formato predominante del backend es:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "...",
  "details": []
}
```

Algunos controladores heredados devuelven `{ "error": "..." }`. La capa de
cliente acepta ambos formatos y produce un error interno uniforme. Deben
tratarse explícitamente los estados `400`, `401`, `403`, `404`, `409`, `413`,
`422`, `429`, `500` y `503`.

Los mensajes públicos no revelan payloads sensibles ni detalles internos. Los
errores de validación pueden asociarse a campos; los fallos de red ofrecen una
acción de reintento sin afirmar que la operación fue registrada.

## Autenticación

Las funciones públicas integradas no requieren autenticación. El backend usa
JWT Bearer HS256 para administración y roles `admin`/`editor`. El panel
administrativo está fuera del alcance de esta primera versión.

No se guarda ningún JWT en `localStorage`. Una futura interfaz administrativa
requiere una decisión específica sobre sesión, rotación y almacenamiento
seguro; el backend no dispone actualmente de refresh token ni logout de
servidor.

## CORS y seguridad operativa

- El backend permite un único origen configurado mediante `FRONTEND_URL`.
- `credentials: true` está activo en CORS, aunque los endpoints públicos
  integrados no necesitan cookie.
- Helmet y rate limiting permanecen activos.
- No se relajan cabeceras ni validaciones para facilitar la integración.
- Para desarrollo, `FRONTEND_URL` debe coincidir con el origen real del
  frontend, por ejemplo `http://localhost:3001` durante desarrollo.

## Endpoints o capacidades faltantes

- Contacto genérico compatible con el formulario corto del mockup.
- Testimonios públicos, verificados y autorizados.
- Recursos formales de destinos y categorías.
- Recurso separado de experiencias, si debe diferenciarse de tours.
- Obtención de tour/promoción por slug para URLs SEO.
- Filtros avanzados, ordenamiento configurable y búsqueda consolidada.
- Contenido localizado por idioma.
- Consentimiento de privacidad versionado en cotizaciones.
- Idempotencia y protección antispam adicional.
- Variantes responsivas/AVIF o CDN de medios.
- Especificación OpenAPI/JSON Schema.

Estas ausencias se documentan y la interfaz degrada de manera honesta; no se
inventan respuestas ni contratos.
