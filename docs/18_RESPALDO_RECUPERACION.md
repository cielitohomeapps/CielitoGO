# Respaldo, restauración y reversión

## Objetivos operativos iniciales

- RPO objetivo: 24 horas con backup diario; menor si se contrata PITR.
- RTO objetivo inicial: 4 horas para incidentes de datos.
- Conservación: confirmar el plan real de Supabase. Pro ofrece respaldos diarios con ventana limitada; PITR es opcional.

Estos objetivos deben ser aprobados por negocio según volumen y tolerancia a pérdida.

## Respaldo lógico

Requiere `pg_dump` en PATH y `DATABASE_URL`.

```bash
npm run backup
npm run backup -- /ruta/segura/cielito-go.dump
```

El archivo usa formato custom, sin propietarios ni privilegios. No debe almacenarse en Git ni en el filesystem efímero de Render; moverlo a almacenamiento cifrado y con acceso restringido.

## Restauración

Restaurar primero en una base nueva siempre que sea posible:

```bash
ALLOW_DATABASE_RESTORE=true npm run restore -- /ruta/cielito-go.dump --confirm-restore
```

El comando usa `--clean --if-exists --exit-on-error`; es destructivo para el destino. La doble confirmación evita ejecuciones accidentales.

## Ensayo

CI crea una BD PostgreSQL aislada, aplica migraciones, genera backup, lo restaura y vuelve a auditar RLS. Además, trimestralmente:

1. restaurar el backup más reciente en un proyecto/base temporal;
2. verificar migraciones, conteos, login, cotización y una reservación;
3. registrar duración, errores y tamaño;
4. destruir el entorno temporal de forma controlada;
5. corregir desviaciones de RPO/RTO.

## Incidente y rollback

1. Detener escrituras si continuar amplifica daño.
2. Identificar último punto sano y preservar evidencia/logs.
3. Preferir restaurar en proyecto nuevo y comparar.
4. Reapuntar servicios sólo después de smoke tests.
5. Para rollback de código, usar un deploy estable de Render.
6. No ejecutar `migrate:undo` salvo que se haya revisado pérdida de datos y compatibilidad.
7. Rotar credenciales si el incidente implica exposición.
8. Documentar causa, impacto, recuperación y acciones preventivas.

## Supabase

Los backups administrados no incluyen necesariamente objetos externos de Cloudinary. La BD conserva URLs/IDs, pero la recuperación de imágenes depende de las políticas de Cloudinary. Deben existir retención y recuperación coordinadas para ambos proveedores.

