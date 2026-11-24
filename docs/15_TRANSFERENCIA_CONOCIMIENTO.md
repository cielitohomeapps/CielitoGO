# Transferencia de conocimiento

## Lectura recomendada para el nuevo responsable

1. [Descripción general](01_DESCRIPCION_GENERAL.md).
2. [Arquitectura](02_ARQUITECTURA.md).
3. [Módulos](04_MODULOS_FUNCIONALIDADES.md).
4. [Base de datos](06_BASE_DE_DATOS.md).
5. [Auditoría](13_AUDITORIA_TECNICA.md).
6. Código de `server/app/routes`, `models/index`, `workflow` y `reservationService`.

## Conocimientos necesarios

- Node.js/Express, middleware y REST.
- PostgreSQL, transacciones, locks y migraciones Sequelize.
- Next.js App Router, Server/Client Components y Route Handlers.
- JWT/cookies, CORS/CSRF y RBAC.
- Render/Supabase y redes IPv4/IPv6.
- Cloudinary y Meta Graph API si se operan integraciones.

## Módulos críticos

| Módulo | Motivo |
| --- | --- |
| `config`/`database` | El proceso falla cerrado y depende de red/SSL. |
| auth + BFF admin | Control de acceso completo. |
| quotes/reservations/workflow | Núcleo comercial e historiales. |
| departures/reservationService | Dinero operativo y cupos concurrentes. |
| upload/Cloudinary | Persistencia externa y limpieza. |
| migraciones RLS | Aislamiento de datos en Supabase. |

## Operaciones que debe poder realizar

- instalar y arrancar ambos servicios;
- migrar una BD nueva y crear admin inicial;
- diagnosticar health frente a ready;
- rotar secretos y entender efecto sobre sesiones;
- desplegar/sincronizar Blueprint en Render;
- verificar folios, estados y cupos;
- revisar logs y restaurar un despliegue;
- ejecutar auditoría de RLS;
- ampliar proxy admin sin abrir rutas arbitrarias.

## Errores que debe evitar

- usar URL directa IPv6 de Supabase desde Render sin soporte;
- exponer `DATABASE_URL`, JWT o tokens en `NEXT_PUBLIC_*`;
- escribir uploads locales esperando persistencia en Render;
- cambiar enums/modelos sin migración;
- saltarse `assertTransition` o ajustar cupos fuera del lock;
- hacer público el proxy administrativo;
- confiar en settings demostrativos;
- repetir seed sin revisar datos;
- revertir migraciones automáticamente durante rollback.

## Primeras tareas recomendadas

1. Actualización de seguridad de Next.js.
2. Configurar y verificar las credenciales reales de Cloudinary con el adaptador unificado de `media`.
3. CI con PostgreSQL efímero y E2E críticos.
4. Documentar/ensayar backup y restore.
5. Acordar privacidad/retención y alcance de módulos sin UI.

## Pendientes de validación con negocio/operaciones

- proveedor y política real de backups;
- dominio/URLs definitivos y propietario de cuentas externas;
- vigencia de Meta Graph API y plantillas;
- reglas de prioridad de precios;
- si reservación pública directa debe permanecer habilitada;
- política de datos personales y consentimiento;
- módulos API que requieren UI o deben retirarse;
- flujo operativo para convertir cotización a reservación.

## Checklist de aceptación del handover

- [ ] Puede explicar el diagrama y fronteras de confianza.
- [ ] Arranca API/web desde cero.
- [ ] Configura una BD no productiva y ejecuta migraciones.
- [ ] Crea admin sin conservar password temporal.
- [ ] Ejecuta y comprende las pruebas.
- [ ] Ubica cada módulo y sus permisos.
- [ ] Traza una cotización de UI a BD.
- [ ] Traza confirmación/cancelación y cupos.
- [ ] Diagnostica 401, CORS, 503 BD y fallos de imagen.
- [ ] Despliega sin exponer secretos.
- [ ] Conoce los 15 hallazgos de auditoría.
- [ ] Tiene acceso a Render, Supabase, Cloudinary y Meta, si aplican.
- [ ] Conoce responsables, backups y protocolo de incidentes.

