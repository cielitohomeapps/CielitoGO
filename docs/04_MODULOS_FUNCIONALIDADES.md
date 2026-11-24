# Módulos y funcionalidades

## Matriz funcional

| Módulo | Objetivo | Usuarios | UI | Estado |
| --- | --- | --- | --- | --- |
| Sitio público | Presentar marca, destinos, tours, promociones y contacto. | Visitante | `/` | Completo para el alcance actual. |
| Cotizaciones | Captar solicitudes, asignar folio y gestionar ciclo comercial. | Visitante, editor, admin | Formulario y `/admin/quotes` | Parcial: UI sólo lista/cambia estado; edición, historial y conversión existen sólo en API. |
| Reservaciones | Registrar solicitudes, viajeros, referencias y cupos. | Visitante/API, editor, admin | `/admin/reservations` | Parcial: UI sólo lista/cambia estado. |
| Tours | Catálogo, galería, orden y activación. | Visitante, editor, admin | Landing y CRUD admin básico | Parcial: galería, orden, tarifas y salidas no están expuestos en UI. |
| Promociones | Campañas vigentes/destacadas ligadas opcionalmente a tour. | Visitante, editor, admin | Landing y CRUD admin básico | Parcial: galería y relación con tour no se editan desde UI. |
| Usuarios | Login, perfil, alta, roles y activación. | admin/editor | Login y `/admin/users` | Parcial: no hay UI para editar el perfil. |
| Dashboard | Conteos y actividad reciente. | admin/editor | `/admin/dashboard` | Implementado. |
| Clientes | Directorio y relaciones con cotizaciones/reservaciones. | admin/editor | `/admin/customers` | API e interfaz operativa. |
| Salidas | Fechas, capacidad, disponibilidad y cancelación. | visitante, admin/editor | `/admin/departures` | API e interfaz operativa. |
| Precios | Tarifas por temporada y precio activo. | visitante, admin/editor | `/admin/pricing` | API e interfaz operativa. |
| Contenido/ajustes | CMS por clave y ajustes públicos. | visitante, admin/editor | `/admin/content` | API e interfaz operativa; consumo público parcial. |
| Media | Biblioteca, metadatos, carga múltiple y transformación. | admin/editor | `/admin/media` | Compatible con Cloudinary y con fallback local sólo fuera de producción. |
| WhatsApp | Webhook, conversación, envío, estados y conteo no leído. | Meta, admin/editor | `/admin/whatsapp` | Contrato probado con servidor simulado; credenciales reales requieren validación operativa. |

## Sitio público

`CielitoGoFrontend/src/app/page.tsx` consulta en paralelo tours, promociones y ajustes con timeout de 2.5 segundos. Usa `Promise.allSettled`, por lo que una fuente fallida no derriba toda la página. Los tours y promociones se normalizan a vistas compactas; las imágenes relativas se resuelven sólo contra el backend y Cloudinary autorizado.

La página se regenera cada 60 segundos. Las consultas internas declaran revalidación de 300 segundos, aunque el límite efectivo debe validarse con el comportamiento de caché de la versión de Next.js desplegada.

## Cotizaciones

### Flujo

1. `QuoteForm` recolecta identidad, contacto, destino, viajeros, fechas, presupuesto y comentarios.
2. Valida consentimiento y un honeypot básico.
3. El Route Handler valida con `quoteRequestSchema`.
4. La API repite validaciones, crea `Quote` y su primer `QuoteStatusHistory` en una transacción.
5. Devuelve folio `CG-AAAA-XXXXX`; opcionalmente la UI abre WhatsApp con el folio.

Estados permitidos:

```text
new → reviewing | cancelled
reviewing → contacted | sent | rejected | cancelled
contacted → sent | rejected | cancelled
sent → accepted | rejected | cancelled
accepted → cancelled
rejected, cancelled → terminales
```

La conversión a reservación exige estado `accepted`, una sola reservación por cotización, tour válido y reglas de reservación. Referencias: `quoteController.js`, `quoteRoutes.js`, `workflow.js`.

## Reservaciones y disponibilidad

Una reservación requiere tour activo, rango de fechas válido y consistencia `travelers = adults + minors`. Si incluye salida, debe pertenecer al tour, no estar cancelada y tener cupo. Una promoción debe estar activa, vigente y ser compatible con el tour.

Estados:

```text
request → pending | confirmed | cancelled
pending → confirmed | cancelled
confirmed → completed | cancelled
completed, cancelled → terminales
```

Al confirmar se resta cupo bajo bloqueo de fila; al cancelar una confirmada se devuelve cupo sin superar capacidad. En estados `confirmed`, `completed` o `cancelled` no se permiten cambios operativos. Referencias: `reservationService.js`, `reservationController.js`, `departureController.js`.

## Tours y promociones

Las consultas públicas sólo muestran tours activos y promociones activas/vigentes. Usuarios autenticados pueden filtrar y ver registros inactivos. El alta/edición acepta `multipart/form-data`, arrays JSON normalizados y una imagen principal. El borrado es una desactivación lógica.

Las galerías tienen entidades separadas. Promociones fuerzan una única imagen primaria al agregar una nueva primaria; tours no aplican esa exclusividad en controlador. Los slugs se regeneran desde nombre/título y la unicidad depende de BD; títulos duplicados pueden producir 409.

## Usuarios y permisos

- `login`: sólo usuarios activos; actualiza `lastLogin`.
- `register`: sólo `admin`, contraseña mínima de 12 caracteres.
- perfil: lectura/edición propia.
- usuarios: listado, cambio de rol y activación sólo para `admin`.
- protección: el último administrador activo no puede degradarse o desactivarse, según `isLastActiveAdmin` en `authController.js`.

## Clientes

CRUD con desactivación lógica y consultas de cotizaciones/reservaciones relacionadas. Las creaciones públicas de cotización/reservación fuerzan `customerId=null`; la asociación se realiza administrativamente. No hay deduplicación automática por email/teléfono.

## Contenido y ajustes

`PageContent` almacena claves jerárquicas `page/section/key`; `Setting` almacena valores globales por grupo. Los controladores convierten valores según `type` y permiten upsert individual o masivo. `/api/public/settings` limita las claves expuestas. La landing sólo confía en esos valores si `TRUST_BACKEND_PUBLIC_SETTINGS=true`.

## Media e imágenes

MIME y contenido real se validan con Sharp; existen límites de tamaño, dimensiones y píxeles. Tours, promociones y `media` comparten el adaptador de almacenamiento: con Cloudinary procesan `buffer`, persisten URL y `publicId`, y eliminan el objeto remoto cuando corresponde. En producción, una carga sin almacenamiento persistente configurado devuelve 503.

## WhatsApp

- verifica el webhook con `WHATSAPP_VERIFY_TOKEN`;
- verifica POST con HMAC SHA-256 y `WHATSAPP_APP_SECRET`;
- persiste entrantes y salientes de texto/template;
- consulta conversaciones y no leídos;
- envía texto, template, imagen o resumen de tour.

No procesa actualizaciones de estado de entrega del webhook; `sendImageMessage` tampoco persiste el saliente. Integración real: **Pendiente de validación**.

## Dashboard

Calcula diez conteos y obtiene cinco elementos recientes por colección relevante mediante consultas paralelas. No existe agregación temporal ni caché. Archivo: `CielitoGoBackend/src/routes/index.js`; UI: `admin/(protected)/dashboard/page.tsx`.

