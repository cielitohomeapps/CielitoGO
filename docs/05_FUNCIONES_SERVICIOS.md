# Funciones y servicios críticos

## Backend

### Arranque y aplicación

| Símbolo | Ubicación | Entrada/retorno | Responsabilidad y efectos |
| --- | --- | --- | --- |
| `start` | `src/server.js` | Sin parámetros; `Promise<void>` | Autentica Sequelize y abre HTTP. Ante fallo deja `process.exitCode=1`. |
| `shutdown` | `src/server.js` | Señal; `Promise<void>` | Cierra servidor y pool; fuerza salida tras 10 s. |
| `app` | `src/app.js` | Express app | Helmet, CORS, parsers, estáticos, health/readiness, rate limit, rutas y errores. |

### Autenticación

| Símbolo | Entrada | Retorno/efecto | Errores relevantes |
| --- | --- | --- | --- |
| `authenticate` | `Authorization: Bearer` | Verifica JWT, carga usuario activo y asigna `req.user`. | 401 por ausencia, firma, expiración o cuenta inválida. |
| `optionalAuthenticate` | Header opcional | Continúa anónimo o delega a `authenticate`. | Un token inválido no se ignora. |
| `authorize(...roles)` | Roles permitidos | Middleware 401/403. | `NOT_AUTHENTICATED`, `FORBIDDEN`. |
| `login` | email/password | JWT y usuario público; actualiza `lastLogin`. | Credenciales/cuenta inválida, rate limit. |
| `isLastActiveAdmin` | `User` | Booleano tras contar admins activos. | Protege continuidad administrativa. |

JWT incluye `id`, usa HS256, issuer, audience y expiración configurables. `User` aplica bcrypt con costo 12 en hooks y elimina password mediante `toPublicJSON`.

### Reglas comerciales

| Símbolo | Entrada | Resultado | Reglas/errores |
| --- | --- | --- | --- |
| `validateDateRange` | fecha inicial/final | Sin retorno | 422 `INVALID_DATE_RANGE`. |
| `validateParty` | totales y lista opcional | Sin retorno | Totales, longitud y tipos deben coincidir. |
| `assertTransition` | mapa, origen, destino | Sin retorno | 409 si no cambia o transición inválida. |
| `generateQuoteCode` | fecha opcional | `CG-AAAA-XXXXX` | Aleatorio; unicidad final en BD. |
| `createReservation` | datos + transacción | `Reservation` | Valida referencias; crea reserva, viajeros e historial. |
| `transitionReservation` | sequelize, id, estado, nota, usuario | Reserva recargada | Bloquea filas y ajusta cupos en confirmación/cancelación. |
| `validateReferences` | datos + transacción | tour/salida/promoción | Verifica actividad, vigencia, relación, fechas y disponibilidad. |

### Controladores de cotización

- `create`: fuerza `customerId=null`; crea cabecera e historial en transacción.
- `getAll`: paginación, estado, cliente y búsqueda `iLike`.
- `update`: sólo campos permitidos; revalida fechas y viajeros.
- `updateStatus`: bloqueo de cotización, máquina de estados e historial con usuario.
- `convertToReservation`: exige aceptada y no convertida; crea reservación `pending`.

Archivo: `src/modules/quotes/quoteController.js`.

### Salidas y capacidad

- `departureController.create`: inicializa `availableSpots=capacity` si falta.
- `validateRules`: sincroniza `available/sold_out` y limita disponibilidad.
- `update`: computa asientos confirmados y rechaza capacidad incompatible.
- `cancel`: rechaza si existen reservaciones confirmadas.

### Upload y Cloudinary

| Símbolo | Entrada | Resultado/efecto |
| --- | --- | --- |
| `validateImages` | `req.file(s)` | Sharp verifica formato, dimensiones y límite de píxeles; limpia rechazados. |
| `storeImage(folder)` | buffer en memoria | Sube a Cloudinary y anota URL/public ID. |
| `getStoredImage` | archivo Multer | Abstracción `{imageUrl, publicId}` local/remota. |
| `removeStoredImage` | URL/public ID | Borra Cloudinary o archivo bajo `/uploads`. |
| `uploadImage` | buffer/carpeta | Promise con URL segura e ID de Cloudinary. |

Efectos secundarios: filesystem, red y BD. Los controladores intentan compensar uploads si falla la persistencia; el borrado remoto posterior al update no participa en transacción.

### WhatsAppService

`ensureConfigured` falla con 503 si faltan identificador o token. `sendTextMessage`, `sendTemplateMessage` y `sendImageMessage` llaman Graph API. `handleIncomingMessage` persiste eventos; `getMessages`, `markAsRead` y `getUnreadCount` operan la bandeja. Los errores externos se registran sin imprimir el token.

## Frontend

### Cliente público

| Símbolo | Ubicación | Responsabilidad |
| --- | --- | --- |
| `apiRequest` | `src/lib/api/client.ts` | Valida base/path, timeout, JSON, errores HTTP y respuesta Zod. |
| `getTours`, `getPromotions`, `getPublicSettings` | `src/lib/api/queries.ts` | Construyen consultas seguras y política de caché. |
| `submitQuote` | mismo archivo | Valida request y envía POST sin caché. |
| `resolveBackendAssetUrl` | `src/lib/api/assets.ts` | Acepta mismo origen del backend o ruta Cloudinary image/upload; rechaza otros orígenes/protocolos. |

`apiRequest` sólo permite paths que comiencen `/api/`, exige JSON y convierte timeouts a `API_TIMEOUT`. Un contrato inválido produce `ApiContractError`.

### Sesión y BFF administrativo

| Símbolo | Responsabilidad |
| --- | --- |
| `POST /api/admin/session` | Mismo origen, login backend y cookie segura. |
| `DELETE /api/admin/session` | Mismo origen y expiración de cookie. |
| `proxy` | Lista blanca método/ruta, mismo origen para mutaciones, bearer interno, timeout y revalidación. |
| `adminApiRequest` | Petición server-side autenticada; normaliza error backend. |
| `sessionMaxAge` | Limita cookie al `exp` JWT y máximo 24 h. No verifica firma; la API sí lo hace al usarlo. |

### Formularios

- `QuoteForm.handleSubmit`: honeypot, arma totales, envía, mapea errores de campo y exige HTTP 201 antes de mostrar éxito.
- `ResourceForm.submit`: arma `FormData` para tours/promociones y consume el proxy.
- `InlineSelectAction`/`ButtonAction`: mutaciones administrativas en línea.
- `LoginForm.submit`: establece sesión por el Route Handler.

## Utilidades agrupadas

- `pagination.js`: límites numéricos y metadatos comunes.
- `slug.js`: normalización Unicode y slug legible.
- `normalizeMultipart.js`: parseo controlado de campos JSON.
- `validators.js`: convierte `express-validator` a contrato de error.
- `httpError.js`: error con status/code.
- `lib/admin/data.ts`: lectura defensiva y formateo de payloads no tipados.

Las funciones triviales de presentación no se enumeran individualmente; no contienen reglas de negocio.

