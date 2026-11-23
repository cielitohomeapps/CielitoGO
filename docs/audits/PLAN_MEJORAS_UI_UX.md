# Plan de mejoras UI/UX — Cielito Go

Los esfuerzos son relativos: **Bajo** (horas), **Medio** (1–3 días), **Alto** (varios días o dependencia de backend/contenido). El plan no implica autorización de implementación.

## Quick Wins

| ID | Mejora | Problema que resuelve | Impacto | Esfuerzo estimado | Prioridad | Archivos involucrados |
|---|---|---|---|---|---|---|
| QW-01 | Aplicar eyebrow claro en Historias | A11Y-001, contraste 1.62:1 | Accesibilidad | Bajo | Alta | `HomePage.tsx`, `SectionHeading.tsx`, `globals.css` |
| QW-02 | Alinear texto visible y nombre accesible de “Cotizar paquete” | A11Y-002 | Accesibilidad/voz | Bajo | Alta | `PackageCard.tsx`, prueba de componente |
| QW-03 | Aumentar área táctil de enlaces secundarios | A11Y-003 | Usabilidad móvil | Bajo | Alta | `globals.css` |
| QW-04 | Añadir favicon e iconos aprobados | SEO-001 | Confianza/buenas prácticas | Bajo + activo | Media | `app/layout.tsx`, `app/icon.*`, `public/` |
| QW-05 | Sustituir “Catálogo confirmado por la API” | COPY-001 | Tono de marca | Bajo | Media | `HomePage.tsx`, `content/es.ts` |
| QW-06 | Corregir fecha local mínima | FORM-003 | Exactitud del formulario | Bajo | Media | `QuoteForm.tsx`, pruebas |
| QW-07 | Clarificar moneda del presupuesto | FORM-001 | Calidad de solicitudes | Bajo | Media | `QuoteForm.tsx`, schemas/contrato si se añade selector |
| QW-08 | Ocultar/reducir visual del login en móvil | NAV-001 | Acceso operativo | Bajo | Media | `admin.css` |
| QW-09 | Retirar `localhost:3000` del copy de producción | ADMIN-004 | Profesionalismo | Bajo | Media | `admin/login/page.tsx` |
| QW-10 | Validar `NEXT_PUBLIC_SITE_URL` en producción | SEO-002 | Indexación correcta | Bajo | Alta | `layout.tsx`, `robots.ts`, `sitemap.ts`, configuración CI |

## Mejoras de alta prioridad

| ID | Mejora | Problema que resuelve | Impacto | Esfuerzo estimado | Prioridad | Archivos involucrados |
|---|---|---|---|---|---|---|
| HP-01 | Publicar y enlazar aviso de privacidad | LEGAL-001, NAV-002 | Legal/confianza/conversión | Medio + aprobación legal | Crítica | `QuoteForm.tsx`, `Footer.tsx`, nueva ruta/documento aprobado |
| HP-02 | Conservar selección de paquete/promoción en el formulario | UX-002 | Conversión/calidad de datos | Medio | Alta | `PackageCard.tsx`, `PromotionFeature.tsx`, `HomePage.tsx`, `QuoteForm.tsx`, pruebas |
| HP-03 | Alinear WhatsApp al flujo folio → mensaje | UX-001 | Trazabilidad | Bajo | Alta | `HomePage.tsx`, `QuoteForm.tsx` |
| HP-04 | Enfocar/resumir errores de formulario | FORM-002 | Recuperación de errores/accesibilidad | Medio | Alta | `QuoteForm.tsx`, pruebas |
| HP-05 | Mostrar sólo transiciones de estado válidas | ADMIN-001 | Operación sin errores | Medio | Alta | páginas de quotes/reservations, helper compartido, pruebas contra workflow |
| HP-06 | Gestión accesible del sidebar admin móvil | A11Y-004 | Teclado/lector de pantalla | Medio | Alta | `AdminShell.tsx`, `admin.css`, pruebas |
| HP-07 | Paginación y filtros administrativos | ADMIN-002 | Escalabilidad operativa | Medio | Alta | páginas de listados, `lib/admin`, API existente/ajustes autorizados |
| HP-08 | Detalle de cotización y reservación | ADMIN-003 | Operación completa | Medio-Alto | Alta | nuevas rutas protegidas, componentes admin, endpoints existentes |

## Mejoras estructurales

| ID | Mejora | Problema que resuelve | Impacto | Esfuerzo estimado | Prioridad | Archivos involucrados |
|---|---|---|---|---|---|---|
| ST-01 | Fusionar inventario duplicado Paquetes/Experiencias | IA-001 | Claridad/longitud de página | Medio | Alta | `HomePage.tsx`, `content/es.ts`, CSS de cards |
| ST-02 | Replantear Destinos como inspiración explícita o filtros reales | IA-003 | Expectativa/navegación | Medio-Alto | Media | `HomePage.tsx`, `content/es.ts`, futura API de catálogo |
| ST-03 | Ocultar testimonios hasta contar con contenido verificado | IA-002 | Confianza/continuidad | Bajo | Media | `HomePage.tsx`, `content/es.ts` |
| ST-04 | Convertir Servicios + beneficios en “Cómo funciona” | Redundancia narrativa | Comprensión del servicio | Medio | Media | `HomePage.tsx`, `content/es.ts`, `globals.css` |
| ST-05 | Dividir `HomePage`, `QuoteForm` y CSS por dominio | CODE-001 | Mantenibilidad | Medio | Media | componentes `home/sections`, estilos/tokens |
| ST-06 | Unificar mutaciones admin | CODE-002 | Consistencia de error/loading | Medio | Media | `lib/admin`, formularios y acciones |
| ST-07 | Gobernar logo y tokens público/admin | UI-001 | Consistencia visual | Medio + marca | Media | assets, layout components, `globals.css`, `admin.css` |
| ST-08 | Añadir contexto de imagen en edición | ADMIN-005 | Seguridad editorial/a11y | Medio | Media | `ResourceForm.tsx`, endpoints de medios autorizados |

## Optimizaciones futuras

| ID | Mejora | Problema que resuelve | Impacto | Esfuerzo estimado | Prioridad | Archivos involucrados |
|---|---|---|---|---|---|---|
| FU-01 | Catálogo público paginado `/viajes` | IA-004 | Descubrimiento/SEO | Alto + backend | Alta cuando haya slugs | nuevas rutas, queries/schemas, backend autorizado |
| FU-02 | Detalle `/viajes/[slug]` | IA-004 | Decisión/SEO/conversión | Alto + backend/contenido | Alta cuando haya contrato | nuevas rutas y metadata |
| FU-03 | Suspense por sección | STATE-001 | Rendimiento percibido | Medio | Media | `app/page.tsx`, secciones server, loading parcial |
| FU-04 | Optimización medida del hero | PERF-001 | LCP móvil | Medio | Media | activo hero, `next/image`, CDN/cache |
| FU-05 | Reducir JS de `Reveal` y masters de imagen | PERF-002 | Transferencia/CPU | Medio | Media | `Reveal.tsx`, activos `travel/*` |
| FU-06 | Auditoría WCAG manual | Limitaciones actuales | Conformidad | Medio | Alta antes de producción | QA: teclado, NVDA, zoom, reflow |
| FU-07 | Métricas Web Vitals de campo | Falta INP/p75 real | Rendimiento real | Medio | Media | observabilidad sin PII |
| FU-08 | Definir expectativa post-cotización | Confianza tras envío | Conversión/soporte | Bajo + negocio | Media | copy de éxito y documentación operativa |

## Orden recomendado

1. **Bloqueo de lanzamiento:** HP-01, QW-01, QW-02, QW-10.
2. **Conversión:** HP-02, HP-03, HP-04, QW-06 y QW-07.
3. **Operación:** HP-05, HP-06, HP-07 y HP-08.
4. **Simplificación de portada:** ST-01 a ST-04.
5. **Mantenibilidad y marca:** ST-05 a ST-08.
6. **Evolución:** catálogo/detalle, performance de campo y auditoría accesible final.

## Criterios globales de cierre

- `npm run check` continúa pasando.
- Lighthouse no presenta los fallos `color-contrast`, `label-content-name-mismatch` ni `errors-in-console` identificados.
- Teclado, Escape, foco y reflow se validan manualmente.
- El flujo medido es selección → formulario contextual → `201` + folio → WhatsApp prellenado.
- Ninguna recomendación publica datos, servicios, SLA, promociones o testimonios no aprobados.
