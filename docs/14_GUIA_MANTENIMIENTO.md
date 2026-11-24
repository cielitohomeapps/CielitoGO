# Guía de mantenimiento

## Antes de cambiar código

1. Identificar frontend, BFF, endpoint, controlador, modelo y migración afectados.
2. Leer permisos y validadores de la ruta.
3. Revisar asociaciones y reglas en servicios/utilidades.
4. Localizar pruebas y contrato Zod.
5. Definir compatibilidad con datos/despliegues existentes.

## Agregar una funcionalidad

### Endpoint backend

1. Crear/usar módulo bajo `src/modules/<dominio>`.
2. Definir validación de params/query/body y `validate`.
3. Aplicar `authenticate` y `authorize` explícitamente.
4. Mantener controlador delgado; mover reglas/transacciones a servicio si crecen.
5. Usar `createHttpError` y contrato común.
6. Montar ruta en `src/routes/index.js`.
7. Añadir pruebas de éxito, validación, permiso y error.

### Consumo frontend

1. Para público server-side: schema Zod + query en `lib/api`.
2. Para navegador público: Route Handler BFF, no exponer `API_BASE_URL`.
3. Para admin: ampliar `ALLOWED` con regex mínima y método exacto.
4. Usar `adminApiRequest` en Server Components o proxy same-origin en Client Components.
5. Revalidar rutas públicas tras mutaciones que afecten landing.

## Modificar el modelo de datos

1. Crear migración nueva con `up` y `down` evaluado.
2. Actualizar modelo Sequelize y asociaciones.
3. Actualizar validadores, pick lists y serialización.
4. Actualizar Zod/UI si el campo cruza frontera.
5. Probar base vacía y base con datos.
6. Preferir expand/contract para cambios incompatibles.

Nunca usar `sequelize.sync({alter:true})` ni editar migraciones aplicadas.

## Estados y cupos

Cualquier estado nuevo exige cambios coordinados en:

- enum de migración/modelo;
- `utils/workflow.js`;
- ruta/validación;
- servicio transaccional;
- selects/labels UI;
- pruebas de estados terminales y concurrencia.

No modificar disponibilidad fuera de las transacciones con bloqueo de `reservationService`/`departureController`.

## Imágenes

Mantener la abstracción `{imageUrl, publicId}`. Todo flujo debe:

- validar contenido antes de almacenar;
- compensar archivo remoto/local si falla BD;
- borrar recurso anterior sólo después de persistir el nuevo;
- aceptar únicamente orígenes permitidos en frontend;
- no depender de filesystem efímero en producción.

## Convenciones de validación

- Valide en borde (Express/Zod) y dominio (servicio); no confiar sólo en HTML.
- Limitar longitudes, arrays y paginación.
- Normalizar email y moneda.
- Convertir strings multipart de forma explícita.
- Mantener códigos de error estables aunque cambie el texto.

## Dependencias

1. Revisar advisories y changelog.
2. Actualizar en rama separada.
3. No usar `npm audit fix --force` sin revisión.
4. Ejecutar check completo y pruebas de rutas críticas.
5. Confirmar Node/Render y lockfiles.

## Checklist de revisión

- [ ] Sin secretos ni PII de producción.
- [ ] Permisos mínimos.
- [ ] Validación y errores coherentes.
- [ ] Transacción donde hay más de una escritura relacionada.
- [ ] Migración reversible o plan de recuperación.
- [ ] Pruebas nuevas.
- [ ] Documentación y variables actualizadas.
- [ ] `npm test` backend.
- [ ] `npm run check` frontend.
- [ ] Impacto Render/Supabase/Cloudinary/WhatsApp revisado.

