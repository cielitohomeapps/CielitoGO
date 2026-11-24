# Política operativa de privacidad y retención

## Alcance

Aplica a `Customer`, `Quote`, `Reservation`, `ReservationTraveler` y `WhatsAppMessage`, así como a respaldos que los contengan. La versión de aviso pública inicial es `2026-11-24`.

## Evidencia de consentimiento

Las solicitudes públicas deben incluir `consentAccepted=true` y `privacyNoticeVersion`. La API registra `consentAcceptedAt` en servidor y la versión declarada. Los registros existentes se migran como `legacy-import` con su fecha de creación.

## Retención adoptada

- Cotizaciones `rejected/cancelled`: anonimizar tras 730 días sin actualización.
- Reservaciones `completed/cancelled`: anonimizar tras 730 días sin actualización.
- Viajeros de esas reservaciones: anonimizar junto con la reservación.
- Clientes sin cotizaciones ni reservaciones activas: anonimizar tras 730 días sin actualización.
- Mensajes WhatsApp: anonimizar tras 730 días.
- Registros activos o no terminales: conservar mientras siga el proceso comercial.
- Backups: según ventana contratada del proveedor; al expirar se eliminan por rotación del proveedor.

La anonimización reemplaza identidad/contacto de clientes, cotizaciones, reservaciones y viajeros, y elimina textos libres, fechas de nacimiento, presupuesto y metadatos sensibles. Conserva folios, estados, fechas operativas y métricas agregables.

## Ejecución

```bash
# Simulación: no modifica datos
npm run retention

# Ejecución explícita
npm run retention -- --execute
```

Render declara `cielitogo-data-retention` el día 1 de cada mes a las 04:00 UTC. Antes de sincronizar ese Cron Job, el responsable legal debe confirmar 730 días y completar razón social, domicilio y canal formal.

## Solicitudes de titulares

1. Registrar solicitud y verificar identidad.
2. Localizar por email/teléfono en clientes, cotizaciones, reservaciones y mensajes.
3. Determinar obligaciones de conservación.
4. Corregir, exportar o anonimizar según corresponda.
5. Registrar quién ejecutó la acción, alcance y fecha fuera de los datos anonimizados.

No existe aún una pantalla automática para estas solicitudes; el procedimiento es administrativo y requiere autorización `admin`.

## Responsabilidades pendientes de completar

- razón social y domicilio del responsable;
- correo o portal formal para derechos de titulares;
- fundamento y plazos fiscales/comerciales aplicables;
- contratos y regiones de Render, Supabase, Cloudinary y Meta;
- responsable interno de privacidad y respuesta a incidentes.

