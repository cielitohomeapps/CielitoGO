# Pendientes y siguientes fases

Este documento distingue trabajo técnico pendiente de decisiones de negocio o
materiales que todavía no están confirmados. La primera versión no debe ocultar
estas limitaciones mediante contenido ficticio.

## Identidad y material gráfico

- [ ] Obtener los códigos oficiales HEX/RGB/CMYK/Pantone. El manual sólo
  muestra verde oscuro, marfil/beige y dorado de forma visual; los tokens
  actuales proceden de Figma y son referencias de implementación.
- [ ] Confirmar que `CG3.png` es el maestro aprobado del logotipo de Cielito Go
  y solicitar una versión vectorial oficial.
- [ ] Obtener variantes oficiales clara, oscura y monocromática. No deben
  generarse por filtros CSS ni reconstruirse tipográficamente.
- [ ] Confirmar autoría, licencia y permiso de explotación de las fotografías
  y SVG entregados en Figma.
- [x] Mantener un inventario técnico inicial en `docs/ASSET_INVENTORY.md`.
  Licencia, autor y fecha de aprobación continúan pendientes de confirmación.
- [ ] No utilizar directamente el video de hero de aproximadamente 302 MB. Si
  se aprueba video, producir MP4/WebM comprimidos, poster y política para ahorro
  de datos/movimiento reducido.

## Contenido por confirmar

- [ ] Destinos ofrecidos realmente por Cielito Go.
- [ ] Tours/experiencias, duración, inclusiones, exclusiones y disponibilidad.
- [ ] Precios, monedas, promociones, vigencias y condiciones comerciales.
- [ ] Testimonios auténticos, autorizados y con consentimiento de imagen.
- [ ] Contacto oficial: teléfono, correo, WhatsApp y dirección.
- [ ] Perfiles oficiales de redes sociales.
- [ ] Aviso de privacidad y términos legales publicados.
- [ ] Texto de consentimiento que debe acompañar una cotización.
- [ ] Canonical y dominio de producción.
- [ ] Copy y revisión legal para versión en inglés.

Hasta su confirmación, la interfaz debe omitir estos datos o identificarlos como
contenido editorial/provisional. No se deben mostrar estrellas, cifras de
clientes, descuentos, cupos ni urgencia sin evidencia.

## Backend requerido

- [ ] Endpoint genérico de contacto compatible con el formulario corto del
  mockup, si ese flujo se conserva.
- [ ] Endpoint público de testimonios verificados.
- [ ] Recursos formales para destinos y categorías.
- [ ] Definir si “experiencias” es una entidad distinta de `tours`.
- [ ] Obtener tours y promociones por slug público.
- [ ] Filtros por ubicación, dificultad, duración, fechas y precio.
- [ ] Ordenamiento público configurable.
- [ ] Búsqueda consolidada.
- [ ] Localización de contenido por idioma.
- [ ] Consentimiento de privacidad versionado en las solicitudes.
- [ ] Claves de idempotencia para evitar cotizaciones duplicadas.
- [ ] Protección antispam adicional; actualmente sólo existe rate limiting.
- [ ] Variantes responsivas/AVIF o integración con CDN para medios.
- [ ] Contrato OpenAPI o JSON Schema versionado.
- [ ] Paginación de historiales y consistencia de metadata entre recursos.
- [ ] Unificar los errores heredados `{ "error": "..." }` con el formato
  moderno `{ success, code, message, details }`.

No se debe modificar el backend para resolver estos puntos sin autorización
explícita.

## Integración y operación

- [ ] Configurar `API_BASE_URL` para cada entorno.
- [ ] Configurar `FRONTEND_URL` en el backend con el origen exacto del frontend.
- [ ] Confirmar datos reales de la instancia, no sólo valores de seeds.
- [ ] Probar cotizaciones contra un entorno no productivo antes de habilitarlas
  para público.
- [ ] Verificar límites y mensajes de `429` en el entorno de despliegue.
- [ ] Definir observabilidad sin registrar nombre, teléfono, email, presupuesto
  ni comentarios personales.
- [ ] Determinar la plataforma de despliegue y sus políticas de cache.

## Catálogo y navegación futura

- [ ] Página de listado completo de tours con paginación real.
- [ ] Páginas de detalle una vez disponible el lookup por slug.
- [ ] Filtros y orden sólo después de que el backend los soporte.
- [ ] Galería accesible para imágenes de tour.
- [ ] Calendario de salidas con estados reales.
- [ ] Flujo de reservación únicamente desde un tour y salida válidos.
- [ ] Estados vacíos diferenciados de errores de conectividad.

## Accesibilidad y QA

- [ ] Auditoría manual completa con teclado en navegador de producción.
- [ ] Revisión con lector de pantalla en Windows y, cuando sea posible, macOS.
- [ ] Medición automatizada WCAG 2.2 AA en CI.
- [ ] Pruebas E2E del menú móvil y cotización contra un entorno de pruebas.
- [ ] Verificar contraste cuando se confirme la paleta institucional.
- [ ] Probar zoom al 200%, reflow a 320 CSS px y preferencias de movimiento.
- [ ] Revisar textos alternativos con el material final aprobado.
- [ ] Validar formularios en teclado móvil y gestores de autocompletado.

## Rendimiento y SEO

- [ ] Lighthouse móvil y escritorio sobre una compilación desplegada.
- [ ] Medir LCP/INP/CLS con imágenes y dominio finales.
- [ ] Presupuesto de peso por página y control en CI.
- [ ] Verificar cache de imágenes del backend y estrategia de CDN.
- [ ] Datos estructurados de `TravelAgency` sólo cuando domicilio, teléfono y
  perfiles estén confirmados.
- [ ] Sitemap de tours/experiencias cuando existan URLs públicas por slug.
- [ ] Open Graph por página cuando existan detalles indexables.

## Seguridad y privacidad

- [ ] Revisión legal del tratamiento de datos de cotización.
- [ ] Política de retención y eliminación de solicitudes.
- [ ] Idempotencia y controles antispam reforzados.
- [ ] Revisión periódica de dependencias.
- [ ] Política CSP ajustada al hosting y a los orígenes de imágenes finales.
- [ ] Si se crea un panel administrativo, diseñar sesión segura; no persistir
  JWT sensibles automáticamente en `localStorage`.

## Decisiones explícitamente pospuestas

- Aplicación móvil nativa: no existe y no debe anunciarse.
- Panel administrativo: fuera del alcance de la landing pública.
- Newsletter: no existe endpoint.
- Cuenta de usuario final: no existe contrato de autenticación pública.
- Reservación directa genérica: no puede funcionar sin tour UUID, fechas y
  disponibilidad reales.

## Recomendación de orden

1. Confirmar marca, activos, datos de contacto y contenido legal.
2. Probar la integración pública existente en un entorno no productivo.
3. Añadir slugs, destinos/categorías y filtros al backend con autorización.
4. Construir catálogo y páginas de detalle indexables.
5. Incorporar testimonios verificados y materiales finales.
6. Ejecutar auditorías de accesibilidad, seguridad y rendimiento sobre el
   despliegue candidato a producción.
