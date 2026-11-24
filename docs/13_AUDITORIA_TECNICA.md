# Auditoría técnica y mantenibilidad

## Estado de remediación al 24-11-2026

| Hallazgo | Estado verificable |
| --- | --- |
| AUD-001 Next.js | **Corregido:** 16.4.5; check/build y auditoría productiva aprobados. |
| AUD-002 media/Cloudinary | **Corregido:** buffer y archivo local unificados, `publicId`, carga múltiple, borrado y transformación probados. |
| AUD-003 almacenamiento efímero | **Mitigado:** producción devuelve 503 sin Cloudinary; queda configurar credenciales reales. |
| AUD-004 integración/concurrencia | **Corregido en CI:** PostgreSQL 16, migraciones y carrera de cupos. |
| AUD-005 cobertura administrativa | **Corregido:** vistas para clientes, precios, salidas, contenido, media y WhatsApp. |
| AUD-009 CI/rollback | **Corregido en repositorio:** workflow y runbook protegido de backup/restore; falta simulacro con proveedor real. |
| AUD-012 WhatsApp | **Corregido en contrato:** salida persistida, estados e idempotencia probados; falta verificación de credenciales Meta reales. |
| AUD-013 privacidad/retención | **Mitigado técnicamente:** consentimiento versionado, aviso y job; falta aprobación jurídica y completar datos legales. |

Los hallazgos restantes se mantienen como backlog de mantenibilidad. “Corregido en CI” significa que el control está versionado; el repositorio remoto debe exigir el workflow como protección de rama.

## Hallazgos

### AUD-001 — Next.js con vulnerabilidad conocida

- **Estado:** corregido con Next.js 16.4.5.

- **Prioridad:** crítica.
- **Ubicación original:** `CielitoGoFrontend/package.json` / versión resuelta antes de corregir: 16.4.3; actual: 16.4.5.
- **Evidencia:** `next build` emitió `SecurityFatalError` y recomendó actualización.
- **Impacto:** exposición potencial según advisory; el alcance exacto debe evaluarse contra rutas usadas.
- **Recomendación:** ejecutar actualización de seguridad oficial en rama aislada, revisar diff y repetir `npm run check`.

### AUD-002 — `media` incompatible con Cloudinary habilitado

- **Estado:** corregido mediante `storeImage/getStoredImage`, persistencia de `publicId` y pruebas de carga múltiple.

- **Prioridad:** alta.
- **Ubicación:** `middleware/upload.js`, `modules/media/mediaRoutes.js`, `mediaController.js`.
- **Evidencia:** Cloudinary activa `memoryStorage`; rutas media no ejecutan `storeImage`; controlador llama `sharp(file.path)` y persiste `file.path/file.filename`, inexistentes en memoria.
- **Impacto:** uploads de biblioteca fallan precisamente en producción con Cloudinary.
- **Recomendación:** unificar con `getStoredImage/storeImage`, persistir metadatos compatibles o separar adaptadores; agregar pruebas.

### AUD-003 — Persistencia local no durable en Render

- **Estado:** mitigado; carga productiva rechazada si falta almacenamiento persistente.

- **Prioridad:** alta.
- **Ubicación:** `UPLOAD_DIR`, rutas estáticas, `render.yaml` sin disco.
- **Evidencia:** fallback escribe `public/uploads`; Web Service estándar usa filesystem efímero.
- **Impacto:** pérdida de imágenes tras deploy/reinicio.
- **Recomendación:** exigir Cloudinary para producción y deshabilitar media incompatible hasta corregirla, o aprovisionar disco/objeto persistente.

### AUD-004 — Cobertura de integración insuficiente

- **Estado:** corregido para migraciones y confirmación concurrente de cupos en PostgreSQL 16 dentro de CI.

- **Prioridad:** alta.
- **Ubicación:** `CielitoGoBackend/test`.
- **Evidencia:** no hay CRUD real con BD, migraciones ni pruebas de locks/transacciones.
- **Impacto:** regresiones en reglas críticas pueden pasar con tests verdes.
- **Recomendación:** PostgreSQL efímero en CI, fixtures y casos concurrentes.

### AUD-005 — Panel no cubre capacidades del backend

- **Estado:** corregido para los seis módulos identificados mediante rutas administrativas dedicadas.

- **Prioridad:** media.
- **Ubicación:** backend modules frente a `Frontend/src/app/admin` y proxy `ALLOWED`.
- **Evidencia original:** clientes, precios, salidas, contenido, media y WhatsApp no tenían pantalla. Ahora existen vistas operativas; algunas operaciones avanzadas de cotización/reserva permanecen en sus vistas/API actuales.
- **Impacto:** operación requiere API manual y aumenta riesgo humano.
- **Recomendación:** priorizar UI según negocio o declarar endpoints fuera de alcance.

### AUD-006 — Contratos de error inconsistentes

- **Prioridad:** media.
- **Ubicación:** varios controladores devuelven `{error}`; `errorHandler` usa `{success,code,message}`.
- **Evidencia:** frontend implementa normalización explícita del formato heredado.
- **Impacto:** complejidad y clientes inconsistentes.
- **Recomendación:** migración gradual a contrato único y pruebas contractuales.

### AUD-007 — Duplicidad de endpoint de contenido

- **Prioridad:** baja.
- **Ubicación:** `GET /api/content/:page` en `routes/index.js` y `GET /api/pages/content/:page`.
- **Impacto:** documentación/consumo ambiguos.
- **Recomendación:** declarar ruta canónica y deprecar la otra con compatibilidad temporal.

### AUD-008 — Seed no idempotente y con valores demostrativos

- **Prioridad:** media.
- **Ubicación:** `src/database/seeds/20240101000001-seed-data.js`.
- **Evidencia:** inserts directos con keys/email únicos y datos de ejemplo.
- **Impacto:** repetición falla; activar confianza en settings puede publicar datos no oficiales.
- **Recomendación:** runbook de una ejecución, validación posterior y eventual seed idempotente versionado.

### AUD-009 — Sin CI ni política de migración/rollback automatizada

- **Estado:** corregido en repositorio mediante workflow, backup/restauración verificados y runbook; el simulacro productivo sigue siendo responsabilidad operativa.

- **Prioridad:** alta.
- **Ubicación:** ausencia de workflows; `render.yaml` migra en predeploy.
- **Impacto:** un commit puede desplegar sin gates; rollback de código puede quedar incompatible con esquema.
- **Recomendación:** CI con check, PostgreSQL temporal y revisión de migraciones; estrategia expand/contract.

### AUD-010 — Rate limiting local por proceso

- **Prioridad:** media.
- **Ubicación:** `middleware/rateLimit.js` sin store externo.
- **Impacto:** límites se reinician y multiplican con instancias.
- **Recomendación:** store compartido si se escala horizontalmente.

### AUD-011 — Folios aleatorios sin reintento de colisión

- **Prioridad:** baja.
- **Ubicación:** `utils/quoteCode.js`, `reservationService.js`.
- **Evidencia:** constraint único; no hay loop/retry.
- **Impacto:** probabilidad baja de 409 interno al crear.
- **Recomendación:** retry acotado ante unique constraint o secuencia robusta.

### AUD-012 — WhatsApp parcialmente persistido

- **Estado:** corregido en código y pruebas contractuales; validación de cuenta real pendiente.

- **Prioridad:** media.
- **Ubicación:** `whatsappService.js`, `whatsappController.js`.
- **Evidencia:** imágenes salientes no se guardan y webhooks de status no se procesan.
- **Impacto:** conversación/auditoría incompletas.
- **Recomendación:** modelar estados/eventos e idempotencia de webhook.

### AUD-013 — Privacidad y retención no definidas

- **Estado:** mitigado con consentimiento versionado, aviso público, política y job mensual; aprobación jurídica pendiente.

- **Prioridad:** alta.
- **Ubicación:** entidades comerciales, mensajes y formulario.
- **Evidencia:** PII persistida; consentimiento sólo UI; sin jobs/política de eliminación.
- **Impacto:** riesgo legal y operativo.
- **Recomendación:** definir base legal, evidencia, retención, exportación y borrado.

### AUD-014 — Observabilidad limitada

- **Prioridad:** media.
- **Ubicación:** logging con `console`, sin request ID/APM.
- **Impacto:** diagnóstico difícil entre frontend, API, BD y proveedores.
- **Recomendación:** logs estructurados, correlación, métricas y alertas.

### AUD-015 — Selección de precio activo no explicita prioridad comercial

- **Prioridad:** media.
- **Ubicación:** `pricingController.getActivePrice` ordena por enum `season ASC`.
- **Evidencia:** puede haber varias tarifas vigentes y se toma una por orden de enum, no por prioridad/fecha.
- **Impacto:** precio público potencialmente inesperado.
- **Recomendación:** definir regla de precedencia y constraint/índice coherente.

## Aspectos positivos

- Reglas de estados centralizadas y probadas.
- Bloqueo transaccional de cupos.
- Defensa en profundidad para uploads y webhook.
- BFF evita exponer JWT a JavaScript y limita el proxy.
- RLS/revocaciones explícitas en Supabase.
- Falla cerrada de configuración JWT.

## Prioridad residual sugerida

1. Configurar Cloudinary y ejecutar las verificaciones de staging de Meta, backup y restauración.
2. Completar y aprobar jurídicamente el aviso de privacidad y sus plazos.
3. Resolver observabilidad, rate limiting distribuido y contratos de error.
4. Homogeneizar reglas secundarias y ampliar E2E/roles.

