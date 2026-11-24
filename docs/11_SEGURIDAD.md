# Seguridad

## Controles implementados

- Helmet, `x-powered-by` deshabilitado y headers adicionales de Next.js.
- CORS limitado a `FRONTEND_URL` con credenciales.
- JWT HS256 con secret obligatorio, issuer, audience y expiración.
- bcrypt costo 12; passwords nunca se devuelven en JSON público.
- Roles `admin/editor` y protección del último admin activo.
- Cookie admin `HttpOnly`, `SameSite=Lax`, `Secure` en producción.
- Proxy administrativo con lista blanca y validación de mismo origen en mutaciones.
- Rate limit general, auth, webhook y formularios públicos.
- Validación sintáctica, reglas de dominio, Zod y constraints de BD.
- Upload limitado y verificado por MIME, contenido, dimensiones y píxeles.
- Firma HMAC de WhatsApp comparada con `timingSafeEqual`.
- RLS y revocación de roles Supabase cliente.
- Assets remotos limitados a backend y Cloudinary.

## Límites del modelo

- JWT sin refresh/revocación. Desactivar usuario sí bloquea la siguiente solicitud por consulta a BD.
- Rate limit en memoria: no comparte estado entre instancias ni persiste reinicios.
- No se observa MFA, política explícita de complejidad, recuperación de contraseña ni bloqueo progresivo por cuenta.
- El consentimiento se exige tanto en UI como en API y se persiste con fecha y versión del aviso; falta la aprobación jurídica del texto definitivo.
- No hay CSP explícita; Helmet aplica su CSP predeterminada en backend, pero la superficie principal es Next.js.
- La API guarda datos personales y dispone de política/runbook de retención y anonimización; su calendario y base legal deben ser aprobados por el responsable de privacidad.
- Los logs evitan secretos de forma razonable, pero no existe pipeline de redacción centralizado.

## Gestión de secretos

- Nunca versionar `.env`, URLs de BD, JWT, Cloudinary o Meta.
- Rotar cualquier credencial expuesta en chat/log/código.
- Usar secretos administrados por Render.
- Cambiar `JWT_SECRET` invalida todas las sesiones.
- Eliminar `INITIAL_ADMIN_PASSWORD` al terminar seed.

## Datos y privacidad

Entidades sensibles: `User`, `Customer`, `Quote`, `Reservation`, `ReservationTraveler`, `WhatsAppMessage`. Acceso directo vía Supabase Data API está bloqueado; toda lectura administrativa requiere JWT. El aviso público, la evidencia versionada y el job de retención están implementados y documentados en `17_PRIVACIDAD_RETENCION.md`. Identidad legal, domicilio, contacto ARCO, base legal y plazos definitivos requieren aprobación jurídica antes de producción.

## Vulnerabilidades y dependencias

Next.js fue actualizado de 16.4.3 a 16.4.5. El 24 de noviembre de 2026 se ejecutaron `npm run check` y build productivo correctamente. `npm audit --omit=dev` reporta cero vulnerabilidades en frontend y backend.

La auditoría completa del backend conserva avisos moderados en herramientas de desarrollo transitivas de `sequelize-cli`/`nodemon`; no forman parte de las dependencias instaladas para producción. Se mantienen bajo seguimiento hasta que sus paquetes superiores publiquen versiones compatibles.

## Checklist previo a producción

- [x] Next.js actualizado a versión corregida y build validado.
- [ ] Secretos generados, rotados y no presentes en Git.
- [ ] Session pooler/SSL configurados.
- [ ] Credenciales Cloudinary reales configuradas; sin ellas las cargas productivas quedan deshabilitadas automáticamente.
- [ ] WhatsApp HMAC y challenge probados.
- [ ] RLS/grants auditados.
- [ ] CORS y URLs canónicas exactas.
- [ ] Backups y restauración ensayados.
- [ ] Política de datos personales aprobada.
- [ ] Alertas de 5xx, reinicios y disponibilidad.

