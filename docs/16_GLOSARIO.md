# Glosario

| Término | Definición en este proyecto |
| --- | --- |
| API | Servicio Express que aplica reglas y accede a PostgreSQL. |
| BFF | Backend for Frontend implementado con Route Handlers de Next.js. |
| Cotización (`Quote`) | Solicitud comercial previa a una reservación. |
| Reservación (`Reservation`) | Registro operativo de viaje con estado, referencias y viajeros. |
| Salida (`TourDeparture`) | Fechas y cupo concreto de un tour. |
| Tarifa (`Pricing`) | Precio estacional/vigente asociado a un tour. |
| Promoción | Oferta vigente, opcionalmente asociada a un tour. |
| Folio | Código público `CG-AAAA-*` de cotización/reservación. |
| Soft delete | Desactivación mediante `isActive=false` en vez de borrar fila. |
| JWT | Token firmado usado por la API para autenticar usuarios. |
| RBAC | Autorización por roles `admin` y `editor`. |
| RLS | Row Level Security de PostgreSQL/Supabase. |
| Session pooler | Endpoint Supabase IPv4 para sesiones persistentes en redes sin IPv6. |
| ISR | Regeneración incremental de la landing de Next.js. |
| Route Handler | Endpoint server-side dentro del App Router de Next.js. |
| Same origin | Validación de que la mutación proviene del mismo host del frontend. |
| Cloudinary | Almacenamiento opcional de imágenes. |
| Webhook | Endpoint invocado por Meta para verificación y mensajes entrantes. |
| HMAC | Firma criptográfica usada para autenticar webhook WhatsApp. |
| Readiness | Capacidad de atender tráfico con BD disponible (`/ready`). |
| Liveness | Proceso HTTP activo (`/health`). |
| Migración | Cambio versionado del esquema PostgreSQL. |
| Seed | Carga inicial de administrador y ajustes base. |
| Constraint | Regla física de integridad de PostgreSQL. |
| Borrado terminal | Estado que no permite nuevas transiciones (`cancelled`, etc.). |

