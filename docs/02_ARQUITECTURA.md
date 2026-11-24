# Arquitectura

## Vista general

El sistema es un monorepositorio lógico con dos aplicaciones desplegables. El frontend funciona también como Backend for Frontend (BFF): los navegadores no reciben `API_BASE_URL` ni el JWT. Los Route Handlers de Next.js reenvían peticiones autorizadas al API Express.

```mermaid
flowchart LR
    V[Visitante] --> W[Next.js Web]
    A[Administrador o editor] --> W
    W -->|HTTP JSON /api/*| E[Express API]
    W -->|Proxy admin con Bearer interno| E
    E -->|Sequelize| P[(PostgreSQL / Supabase)]
    E -->|Carga y borrado opcional| C[Cloudinary]
    E <-->|Graph API y webhook firmado| M[WhatsApp Cloud API]
    E -->|Fallback local| F[(public/uploads)]
    R[Render] -. aloja .-> W
    R -. aloja .-> E
```

## Componentes y responsabilidades

| Componente | Responsabilidad | Referencias |
| --- | --- | --- |
| App pública | Compone landing, catálogo, promociones y formulario. | `src/app/page.tsx`, `components/home`, `components/forms/QuoteForm.tsx` del frontend. |
| Panel | Protege páginas, consulta API y permite operaciones administrativas seleccionadas. | `src/app/admin`, `components/admin`. |
| BFF público | Valida cotización con Zod y normaliza errores antes de llamar al backend. | `src/app/api/quotes/route.ts`. |
| BFF admin | Gestiona cookie, lista blanca de rutas y proxy con `Authorization`. | `src/app/api/admin`. |
| API REST | Seguridad HTTP, validación, controladores y contrato JSON. | `src/app.js`, `src/routes/index.js`. |
| Dominio comercial | Cotizaciones, reservaciones, cupos, promociones, clientes y estados. | `src/modules/quotes`, `reservations`, `departures`, `promotions`, `customers`. |
| Persistencia | Modelos, relaciones, transacciones y migraciones. | `src/models`, `src/database`. |
| Integraciones | Cloudinary y WhatsApp. | `src/services/cloudinaryService.js`, `src/modules/whatsapp`. |

## Flujo público de cotización

```mermaid
sequenceDiagram
    participant U as Visitante
    participant F as QuoteForm
    participant B as Route Handler Next.js
    participant API as Express /api/quotes
    participant DB as PostgreSQL
    U->>F: Completa datos y consentimiento
    F->>F: Honeypot y restricciones HTML
    F->>B: POST /api/quotes
    B->>B: quoteRequestSchema (Zod)
    B->>API: POST /api/quotes
    API->>API: express-validator + validateDateRange + validateParty
    API->>DB: Transacción: Quote + QuoteStatusHistory
    DB-->>API: Cotización creada
    API-->>B: 201 {id, code, status, createdAt}
    B-->>F: 201 normalizado
    F-->>U: Folio y enlace opcional a WhatsApp
```

El código de cotización usa `CG-AAAA-XXXXX`; una colisión se traduce en conflicto de restricción única y no se reintenta automáticamente.

## Autenticación y sesión administrativa

```mermaid
sequenceDiagram
    participant N as Navegador
    participant W as Next.js
    participant API as Express
    participant DB as PostgreSQL
    N->>W: POST /api/admin/session
    W->>W: Verifica mismo origen
    W->>API: POST /api/auth/login
    API->>DB: Busca User activo
    API->>API: bcrypt.compare + firma JWT HS256
    API-->>W: token + user
    W-->>N: Cookie HttpOnly, SameSite=Lax, Secure en producción
    N->>W: Solicita /admin/(protected)
    W->>API: Bearer token desde cookie
    API->>API: jwt.verify + consulta User activo
    API-->>W: Datos o 401/403
```

No existe refresh token ni tabla de sesiones. La desactivación del usuario invalida efectivamente el acceso en la siguiente solicitud porque `authenticate` consulta el usuario en BD. El logout borra la cookie, pero no revoca criptográficamente el JWT.

## Flujo de reservación y cupos

```mermaid
flowchart TD
    I[Crear reservación pública o convertir cotización] --> V[Validar tour activo, promoción, salida, fechas y viajeros]
    V --> T[Transacción: Reservation + viajeros + historial]
    T --> R{Cambio de estado}
    R -->|confirmed| L[Bloquear fila TourDeparture]
    L --> S[Restar travelers de availableSpots]
    S --> O[Marcar sold_out si llega a cero]
    R -->|cancelled desde confirmed| C[Bloquear salida y devolver cupos]
    R -->|completed/cancelled| F[Estado terminal]
```

Las transiciones están declaradas en `src/utils/workflow.js`; `transitionReservation` usa bloqueo de fila para reducir carreras de disponibilidad.

## Persistencia y consistencia

- Sequelize usa `underscored` y timestamps.
- Las operaciones compuestas críticas usan transacciones: creación y transición de reservaciones, creación y estado de cotizaciones, imágenes primarias de promoción.
- Las asociaciones se definen centralmente en `src/models/index.js`.
- Las migraciones crean constraints, índices y RLS; no se usa `sequelize.sync`.
- El acceso de clientes Supabase `anon`/`authenticated` a tablas se revoca; la aplicación se conecta como rol de base de datos.

## Errores y validación

La API combina:

1. validadores sintácticos de `express-validator`;
2. reglas de dominio (`domainValidation`, `workflow`, servicios);
3. validaciones y constraints de Sequelize/PostgreSQL;
4. `errorHandler` como contrato común `{success, code, message, details?}`.

Existen respuestas heredadas `{error: string}` en algunos controladores. El frontend normaliza ambos formatos.

## Procesos asíncronos

Todas las tareas asíncronas ocurren dentro de la solicitud HTTP: consultas, subida a Cloudinary, procesamiento de imágenes y llamadas a WhatsApp. No hay colas; una latencia o caída externa afecta directamente la solicitud.

## Patrones identificados

- modularización por dominio en Express;
- controlador-servicio para reservaciones y WhatsApp;
- Repository implícito mediante modelos Sequelize;
- BFF/proxy con lista blanca en Next.js;
- Server Components para lecturas y Client Components para formularios;
- validación de contratos externos con Zod;
- soft delete mediante `isActive` en varias entidades;
- máquina de estados explícita para cotizaciones y reservaciones.

## Puntos de entrada

- API: `CielitoGoBackend/src/server.js` → `src/app.js` → `src/routes/index.js`.
- Web: `CielitoGoFrontend/src/app/layout.tsx` y `src/app/page.tsx`.
- Panel: `src/app/admin/(protected)/layout.tsx`.
- Migraciones: `src/config/database.js` mediante Sequelize CLI.

