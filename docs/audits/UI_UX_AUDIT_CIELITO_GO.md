# Auditoría integral UI/UX — Cielito Go

**Fecha:** 12 de noviembre de 2026  
**Alcance:** frontend público y panel administrativo de `CielitoGoFrontend`  
**Referencia:** WCAG 2.2 AA, implementación actual, documentación de diseño y contratos existentes  
**Naturaleza del trabajo:** auditoría; no se modificó código funcional

## Resumen ejecutivo

Cielito Go ya posee una base visual coherente, un flujo de cotización real, estados de carga, navegación móvil razonablemente accesible y una implementación técnica saludable. El build de producción, el lint, TypeScript y las 21 pruebas automatizadas pasan. Lighthouse local obtuvo **93/96/96/100 en móvil** y **100/96/96/100 en escritorio** para rendimiento, accesibilidad, buenas prácticas y SEO.

Los problemas de mayor impacto no justifican una reescritura. Se concentran en cinco frentes:

1. **Privacidad y confianza:** el formulario exige consentimiento, pero no existe un aviso de privacidad publicado o enlazado.
2. **Continuidad de conversión:** los CTA de paquetes no conservan la selección y el enlace directo “Hablar con un asesor” permite saltarse el registro requerido antes de WhatsApp.
3. **Redundancia:** los mismos tours aparecen como paquetes y nuevamente como experiencias; la sección de testimonios ocupa un bloque completo para comunicar que aún no hay testimonios.
4. **Accesibilidad confirmada:** contraste insuficiente en el eyebrow de Historias, nombre accesible que no coincide con el texto visible de los enlaces de paquete y objetivos táctiles pequeños.
5. **Operación administrativa:** el selector ofrece transiciones de estado que el backend rechaza; faltan detalle, filtros y paginación para cotizaciones/reservaciones.

La recomendación es conservar la dirección editorial actual y ejecutar mejoras específicas, empezando por privacidad, selección contextual de cotización, accesibilidad y coherencia del flujo WhatsApp.

## Alcance y metodología

### Fuentes revisadas

- Todas las rutas, páginas y componentes TSX del frontend.
- `globals.css`, `admin.css`, contenido en español y capa API.
- `DESIGN_DECISIONS.md`, `ARCHITECTURE.md`, `PENDING.md`, inventario de activos y README.
- Reglas de transición del backend, sólo para contrastar la UX administrativa; no se modificó el backend.

### Validación ejecutada

- `npm run check`: lint, TypeScript, 21 pruebas y build completados correctamente.
- Build de Next.js: 19 rutas de aplicación detectadas, además de robots y sitemap.
- Revisión visual local con Edge en 320, 375, 430, 768, 1024, 1440 y 1920 px.
- Lighthouse sobre build local de producción:

| Perfil | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Móvil | 93 | 96 | 96 | 100 | 1.3 s | 3.2 s | 60 ms | 0 |
| Escritorio | 100 | 96 | 96 | 100 | 0.2 s | 0.6 s | 0 ms | 0 |

Estas son mediciones de laboratorio local, no datos de campo. No equivalen a CrUX ni permiten afirmar un INP real. TBT sólo se usa como indicador aproximado de bloqueo.

### Limitaciones

- Edge headless aplica un ancho mínimo interno y recortó las capturas de 320–430 px; esos tamaños se revisaron estáticamente, pero requieren validación final en dispositivo/emulación real. No se registra el recorte de la herramienta como defecto del sitio.
- No se ejecutó lector de pantalla NVDA/VoiceOver ni prueba manual al 200% de zoom.
- El panel protegido no se recorrió con datos editables por no usar credenciales administrativas durante la auditoría.
- No se enviaron cotizaciones reales; el flujo está cubierto por pruebas automatizadas.
- La paleta institucional y licencias finales siguen pendientes según la documentación del proyecto.

## Inventario

### Rutas públicas

| Ruta | Tipo | Propósito |
|---|---|---|
| `/` | Estática con revalidación | Landing, catálogo resumido y cotización |
| `/_not-found` | Estática | Estado 404 |
| `/api/quotes` | Route Handler | Proxy validado para crear cotización |
| `/robots.txt` | Estática | Reglas de rastreo |
| `/sitemap.xml` | Estática | Sitemap de la portada |

No existen rutas públicas de catálogo, detalle de tour, promoción o consulta de cotización.

### Rutas administrativas

`/admin/login`, `/admin/dashboard`, `/admin/tours`, `/admin/tours/new`, `/admin/tours/[id]`, `/admin/promotions`, `/admin/promotions/new`, `/admin/promotions/[id]`, `/admin/quotes`, `/admin/reservations`, `/admin/users`, `/admin/users/new` y los BFF `/api/admin/session` y `/api/admin/backend/[...path]`.

### Secciones de la portada

1. Header y navegación.
2. Hero.
3. Destinos editoriales.
4. Promoción y paquetes dinámicos.
5. Experiencias, que reutilizan tours o muestran categorías editoriales.
6. Servicios y pasos Descubre/Define/Cotiza.
7. Historias/testimonios pendientes.
8. Conversión y formulario.
9. Footer.

### Componentes reutilizables principales

- Público: `Header`, `Footer`, `SectionHeading`, `Reveal`, `BrandJourneyIcon`, `PackageCard`, `PromotionFeature`, `QuoteForm`.
- Admin: `AdminShell`, `AdminPageHeader`, `AdminTable`, `StatusBadge`, `InlineSelectAction`, `ButtonAction`, `ResourceForm`, `UserForm`, `LoginForm`.
- Estados: `loading.tsx`, error global, 404 y loading protegido del admin.

## Matriz responsive revisada

| Ancho | Evidencia | Resultado |
|---:|---|---|
| 320 px | Captura headless + revisión CSS | La captura quedó recortada por el ancho mínimo interno de Edge; pendiente confirmar reflow en emulación/dispositivo real. El CSS cambia a una columna y gutter de 16 px. |
| 375 px | Captura headless + revisión CSS | Misma limitación de herramienta. En admin, el visual de login desplaza los campos fuera del primer viewport. |
| 430 px | Captura headless + revisión CSS | Misma limitación de herramienta; pendiente validar teclado virtual y formulario completo. |
| 768 px | Captura válida | Hero, CTA y menú hamburguesa se componen sin recorte visible. |
| 1024 px | Captura válida | Navegación compacta y hero conservan jerarquía; no se observó overflow en primer viewport. |
| 1440 px | Captura válida | Retícula centrada, header y hero balanceados. |
| 1920 px | Captura válida | El contenido mantiene ancho máximo y la imagen escala sin alargar líneas de texto. |

No se afirma “sin overflow” para toda la longitud de 320–430 px hasta completar la validación manual indicada.

## Integridad de navegación observada

- Todos los hashes del header y footer (`#inicio`, `#destinos`, `#paquetes`, `#experiencias`, `#servicios`, `#cotizar`) tienen destino en la portada.
- Los CTA visibles tienen `href` o handler; no se detectaron botones decorativos sin acción.
- `/admin` redirige a dashboard y las rutas protegidas redirigen a login cuando no hay sesión.
- El único recurso roto detectado automáticamente fue `/favicon.ico` (404).
- Aviso de privacidad y términos no son enlaces rotos: actualmente son texto pendiente, lo cual constituye el hallazgo LEGAL-001/NAV-002.

## Fortalezas confirmadas

- Un solo `h1` en la portada y jerarquía semántica consistente.
- Skip link, foco visible, bloqueo de fondo, Escape y trampa de foco en el menú público.
- Objetivos principales de botón superiores a 44 px.
- `next/image`, AVIF/WebP, tamaños reservados y CLS medido en 0.
- Hero prioritario y contenido secundario diferido.
- Formulario con labels persistentes, autocomplete, tipos de teclado, estado de envío, bloqueo de submit duplicado y conservación de datos ante error.
- Éxito sólo después de `201`; WhatsApp se ofrece después del registro e incluye el folio.
- Estados vacío/error diferenciados para tours.
- Respeto global de `prefers-reduced-motion`.
- Admin con cookie HttpOnly, rutas protegidas y tablas que se transforman en tarjetas en móvil.
- No se publican testimonios, ratings ni contactos ficticios como hechos reales.

## Hallazgos detallados

> **Clasificación:** “Confirmado” tiene evidencia directa en código, prueba o herramienta; “Potencial” necesita validación adicional; “Oportunidad” mejora una solución que ya funciona.

### LEGAL-001 — Consentimiento sin aviso de privacidad

- **Tipo / prioridad / esfuerzo:** Confirmado / Crítica / Medio.
- **Página y sección:** `/`, formulario y footer.
- **Archivos:** `QuoteForm.tsx:280-284`, `Footer.tsx:47-51`.
- **Evidencia:** se exige `dataConsent`, pero el footer muestra “Aviso de privacidad pendiente de publicación” como texto no enlazado. El consentimiento tampoco se envía ni versiona.
- **Impacto:** el usuario no puede conocer tratamiento, finalidad, retención o derechos antes de compartir datos personales; reduce confianza y expone riesgo legal.
- **Solución:** publicar el aviso aprobado, enlazarlo desde el checkbox y footer, registrar versión/fecha del consentimiento si legal lo requiere.
- **Criterio de aceptación:** el texto de consentimiento contiene un enlace operable por teclado al aviso vigente; legal aprueba el copy; la ruta no devuelve 404.

### UX-001 — WhatsApp directo compite con el flujo registrado

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Bajo.
- **Página y sección:** `/`, introducción de Cotizar.
- **Archivo:** `HomePage.tsx:279-283`.
- **Evidencia:** “Hablar con un asesor” abre WhatsApp antes de `POST /api/quotes`, mientras el flujo definido exige registro y después WhatsApp.
- **Impacto:** conversaciones sin folio, pérdida de trazabilidad y dos recorridos incompatibles.
- **Solución:** retirar ese acceso del bloque previo o convertirlo en ayuda no transaccional; mantener WhatsApp principal sólo en el éxito registrado.
- **Criterio de aceptación:** ninguna acción etiquetada como cotización abre WhatsApp antes de recibir un folio; el mensaje posterior contiene el mismo folio del backend.

### UX-002 — La selección del viaje no llega al formulario

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio.
- **Página y sección:** tarjetas de paquete, promoción y experiencias.
- **Archivos:** `PackageCard.tsx:72`, `PromotionFeature.tsx:44`, `HomePage.tsx:189`.
- **Evidencia:** todos los CTA navegan a `#cotizar`; ninguno comunica tour/promoción seleccionada ni prellena el destino.
- **Impacto:** el visitante debe recordar y volver a escribir lo elegido; aumenta error y abandono.
- **Solución:** propagar un identificador/valor de presentación seguro al formulario, reflejar la selección y permitir cambiarla.
- **Criterio de aceptación:** al pulsar un CTA, el formulario muestra y envía la selección correcta; existe prueba automatizada para paquete y promoción.

### IA-001 — Tours duplicados como paquetes y experiencias

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio.
- **Página y sección:** Paquetes y Experiencias.
- **Archivo:** `HomePage.tsx:134-143` y `169-193`.
- **Evidencia:** los mismos `tours` se renderizan en `PackageCard` y los primeros tres vuelven a mostrarse como `experience-card`.
- **Impacto:** alarga la página, diluye diferencias conceptuales y da sensación de catálogo repetido.
- **Solución:** mostrar inventario real una sola vez; usar “Experiencias” sólo para categorías distintas o fusionarla con servicios/estilos de viaje.
- **Criterio de aceptación:** un mismo tour no aparece dos veces en la portada salvo justificación editorial explícita y contenido diferente.

### IA-002 — Sección completa para testimonios inexistentes

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Bajo.
- **Página y sección:** Historias.
- **Archivos:** `HomePage.tsx:249-267`, `es.ts`.
- **Evidencia:** el bloque ocupa una sección de alto contraste únicamente para explicar que aún no hay testimonios.
- **Impacto:** interrumpe la progresión justo antes de la conversión y comunica incompletitud.
- **Solución:** ocultar la sección hasta disponer de testimonios autorizados o reducirla a una nota de confianza no dominante.
- **Criterio de aceptación:** si no hay testimonios válidos, no existe una sección vacía de primer nivel; si existen, procedencia y autorización están documentadas.

### IA-003 — Destinos editoriales parecen inventario, pero no son accionables

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Medio.
- **Página y sección:** Destinos.
- **Archivos:** `HomePage.tsx:82-119`, `es.ts:56-83`.
- **Evidencia:** tres tarjetas fotográficas locales se anuncian como “Destinos para viajar”, no enlazan a contenido y sus nombres son categorías aspiracionales, no destinos verificables.
- **Impacto:** expectativa de explorar opciones sin acción ni relación clara con el catálogo.
- **Solución:** etiquetar el bloque como inspiración y conectarlo con filtros válidos, o reemplazarlo por destinos reales cuando el backend los soporte.
- **Criterio de aceptación:** cada tarjeta comunica si es inspiración o inventario y conduce a una acción coherente; no aparenta disponibilidad no confirmada.

### IA-004 — No existe catálogo completo ni detalle público

- **Tipo / prioridad / esfuerzo:** Oportunidad / Alta / Alto.
- **Página y sección:** navegación pública.
- **Evidencia:** el build sólo contiene `/`; se consultan seis tours y una promoción visible sin rutas de detalle.
- **Impacto:** comparación limitada, ausencia de itinerario/inclusiones/condiciones y menor capacidad SEO.
- **Solución:** cuando existan slugs y contratos públicos, crear `/viajes` y `/viajes/[slug]`; no usar UUID como URL pública.
- **Criterio de aceptación:** catálogo paginado y detalle indexable con datos reales, estados vacío/error y CTA contextual.

### FORM-001 — Presupuesto sin moneda

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Bajo.
- **Página y sección:** Cotizar.
- **Archivo:** `QuoteForm.tsx:270-273`.
- **Evidencia:** “Presupuesto estimado” acepta un número sin MXN/USD/EUR.
- **Impacto:** cotizaciones ambiguas y trabajo manual de aclaración.
- **Solución:** confirmar moneda de negocio; indicar MXN en label o añadir selector si el contrato lo admite.
- **Criterio de aceptación:** el usuario y el backend interpretan la misma moneda; el mensaje de WhatsApp también la muestra.

### FORM-002 — Errores remotos no conducen al campo

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio.
- **Página y sección:** Cotizar.
- **Archivo:** `QuoteForm.tsx:97-123`.
- **Evidencia:** se pintan errores por campo, pero no hay resumen, foco al primer error ni scroll; el mensaje general puede quedar bajo el viewport.
- **Impacto:** usuarios de teclado/lector de pantalla y móvil pueden no encontrar qué corregir.
- **Solución:** enfocar el primer campo inválido, añadir resumen enlazado y mantener `aria-describedby`.
- **Criterio de aceptación:** una respuesta 4xx mueve el foco de forma predecible al resumen/primer error y cada enlace lleva al campo.

### FORM-003 — Fecha mínima calculada en UTC

- **Tipo / prioridad / esfuerzo:** Confirmado en código / Media / Bajo.
- **Página y sección:** Cotizar.
- **Archivo:** `QuoteForm.tsx:53`.
- **Evidencia:** `new Date().toISOString().slice(0, 10)` usa UTC; por la tarde/noche en México puede producir el día siguiente.
- **Impacto:** bloquea seleccionar la fecha local actual en ciertas horas.
- **Solución:** calcular la fecha calendario en zona local o una zona de negocio explícita.
- **Criterio de aceptación:** prueba con reloj simulado antes y después del cambio UTC confirma el mismo día local.

### FORM-004 — Controles numéricos fuerzan valores al borrar

- **Tipo / prioridad / esfuerzo:** Confirmado / Baja / Bajo.
- **Página y sección:** adultos y menores.
- **Archivo:** `QuoteForm.tsx:221-252`.
- **Evidencia:** un valor vacío se convierte inmediatamente en 1 o 0 durante `onChange`.
- **Impacto:** edición incómoda con teclado móvil o selección completa.
- **Solución:** permitir estado temporal vacío y normalizar en blur/submit.
- **Criterio de aceptación:** el usuario puede borrar y reemplazar el valor sin que el control inserte otro dígito inesperadamente.

### A11Y-001 — Contraste insuficiente en Historias

- **Tipo / prioridad / esfuerzo:** Confirmado por Lighthouse / Alta / Bajo.
- **Página y sección:** Historias.
- **Archivos:** `SectionHeading.tsx`, `globals.css` (`.eyebrow`, `.stories`).
- **Evidencia:** Lighthouse reporta **1.62:1** para `#6f5c30` sobre `#004842`, por debajo de 4.5:1.
- **Impacto:** texto difícil de leer para baja visión y fallo WCAG 1.4.3.
- **Solución:** aplicar `eyebrow--light` o token con contraste AA en fondo verde.
- **Criterio de aceptación:** contraste automatizado ≥4.5:1 para texto normal y auditoría Lighthouse sin este fallo.

### A11Y-002 — Nombre accesible no coincide con etiqueta visible

- **Tipo / prioridad / esfuerzo:** Confirmado por Lighthouse / Media / Bajo.
- **Página y sección:** enlaces “Cotizar paquete”.
- **Archivo:** `PackageCard.tsx:72`.
- **Evidencia:** visible “Cotizar paquete”, `aria-label="Cotizar el paquete [nombre]"`; Lighthouse falla label-content-name-mismatch.
- **Impacto:** usuarios de control por voz no pueden activar el elemento por su texto visible.
- **Solución:** conservar literalmente “Cotizar paquete” dentro del nombre accesible, por ejemplo “Cotizar paquete: [nombre]”.
- **Criterio de aceptación:** Lighthouse y axe no reportan mismatch; el nombre sigue distinguiendo cada tarjeta.

### A11Y-003 — Objetivos táctiles secundarios pequeños

- **Tipo / prioridad / esfuerzo:** Confirmado por CSS / Alta / Bajo.
- **Página y sección:** footer de tarjetas y enlaces del footer.
- **Archivos:** `globals.css` (`.package-card__footer a`, `.site-footer__links`).
- **Evidencia:** enlaces de paquete miden aproximadamente 111×18 px en Lighthouse; no tienen `min-height` ni padding.
- **Impacto:** activación difícil en móvil; riesgo WCAG 2.5.8.
- **Solución:** reservar al menos 24×24 px según WCAG 2.2, preferiblemente 44×44 px para la interfaz móvil.
- **Criterio de aceptación:** medición de todos los CTA secundarios ≥24×24 px y sin solapamiento.

### A11Y-004 — Menú administrativo móvil sin gestión modal

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio.
- **Página y sección:** panel protegido.
- **Archivo:** `AdminShell.tsx:35-82`.
- **Evidencia:** abre un sidebar y backdrop, pero no bloquea scroll/fondo, no mueve/retiene foco y no cierra con Escape.
- **Impacto:** navegación confusa para teclado y lector de pantalla.
- **Solución:** reutilizar el patrón accesible ya implementado en `Header`.
- **Criterio de aceptación:** foco entra al menú, queda contenido, Escape cierra y devuelve foco; fondo es inerte mientras está abierto.

### NAV-001 — Acceso administrativo móvil queda debajo de un hero largo

- **Tipo / prioridad / esfuerzo:** Confirmado por CSS/captura / Media / Bajo.
- **Página:** `/admin/login` ≤900 px.
- **Archivos:** `admin.css:458-498`, `admin/login/page.tsx`.
- **Evidencia:** el bloque visual conserva 32rem en móvil antes del panel; en 375×812 los campos no aparecen en el primer viewport.
- **Impacto:** el objetivo primario exige scroll innecesario para usuarios operativos.
- **Solución:** reducir/ocultar el visual o colocar el login primero en móvil.
- **Criterio de aceptación:** email, contraseña y CTA principal aparecen en el primer viewport de 375×812 sin comprometer identidad.

### NAV-002 — Footer legal no contiene enlaces reales

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Dependencia legal.
- **Página y sección:** Footer.
- **Archivo:** `Footer.tsx:46-52`.
- **Evidencia:** Aviso y términos son `<span>` con estado pendiente.
- **Impacto:** bloquea confianza, cumplimiento y navegación esperada.
- **Solución:** publicar rutas/documentos aprobados y convertirlos en enlaces descriptivos.
- **Criterio de aceptación:** ambos enlaces responden 200, son accesibles y coinciden con documentos aprobados.

### ADMIN-001 — El UI ofrece transiciones de estado inválidas

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio.
- **Páginas:** `/admin/quotes`, `/admin/reservations`.
- **Archivos:** páginas de quotes/reservations y `CielitoGoBackend/src/utils/workflow.js`.
- **Evidencia:** el select contiene todos los estados; el backend sólo permite transiciones específicas y terminales.
- **Impacto:** errores 409 evitables, incertidumbre y riesgo operativo.
- **Solución:** derivar opciones permitidas del estado actual y explicar estados terminales.
- **Criterio de aceptación:** el UI nunca ofrece una transición rechazada por `assertTransition`; pruebas cubren cada estado.

### ADMIN-002 — Listados limitados a 50 sin paginación, búsqueda ni filtros

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio.
- **Páginas:** tours, promociones, cotizaciones y reservaciones.
- **Evidencia:** llamadas fijas `page=1&limit=50`; no hay controles.
- **Impacto:** registros posteriores al 50 se vuelven inaccesibles desde el panel.
- **Solución:** paginación server-driven, búsqueda y filtros por estado/fecha cuando el endpoint los soporte.
- **Criterio de aceptación:** se puede llegar a cualquier registro y el URL conserva página/filtros.

### ADMIN-003 — Falta vista de detalle para solicitudes

- **Tipo / prioridad / esfuerzo:** Confirmado / Alta / Medio-Alto.
- **Páginas:** cotizaciones y reservaciones.
- **Evidencia:** sólo existen tablas; no hay rutas `[id]`, aunque el backend expone detalle/historial.
- **Impacto:** comentarios, teléfonos, desglose e historial no están disponibles para operar casos completos.
- **Solución:** añadir detalle protegido con datos necesarios, historial y acciones válidas.
- **Criterio de aceptación:** desde cada fila se abre el registro completo y se puede regresar conservando filtros.

### ADMIN-004 — Ayuda de login expone una instrucción local

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Bajo.
- **Página:** `/admin/login`.
- **Archivo:** `admin/login/page.tsx:35`.
- **Evidencia:** muestra `localhost:3000` al usuario final.
- **Impacto:** instrucción inútil o confusa en producción y exposición de detalle técnico.
- **Solución:** mensaje neutral de soporte/configuración condicionado al entorno.
- **Criterio de aceptación:** producción no muestra hosts locales; desarrollo conserva diagnóstico útil sólo si corresponde.

### ADMIN-005 — Formularios de medios sin contexto del archivo actual

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Medio.
- **Páginas:** editar tour/promoción.
- **Archivo:** `ResourceForm.tsx`.
- **Evidencia:** el input de imagen no muestra preview existente, alt, reemplazo explícito ni estado de carga por archivo.
- **Impacto:** editores pueden reemplazar una imagen sin saber cuál está activa ni su accesibilidad.
- **Solución:** preview, nombre/estado actual, alt requerido y progreso/error específico.
- **Criterio de aceptación:** edición distingue conservar/reemplazar/eliminar y valida tipo, peso y alt.

### UI-001 — Dos logotipos producen identidad inconsistente

- **Tipo / prioridad / esfuerzo:** Confirmado visualmente / Media / Dependencia de marca.
- **Páginas:** sitio público y admin.
- **Archivos:** `Header.tsx` usa `/CielitoGo.png`; `AdminShell`/login usan `/brand/cielito-go-logo.png`.
- **Evidencia:** forma y proporción visual difieren; el header público además se percibe pequeño dentro de un área amplia.
- **Impacto:** menor consistencia y reconocimiento.
- **Solución:** confirmar maestro y variantes autorizadas; unificar componente/slots sin deformar.
- **Criterio de aceptación:** marca aprueba un único set y todas las ubicaciones cumplen área mínima y contraste.

### UI-002 — Texto funcional demasiado pequeño

- **Tipo / prioridad / esfuerzo:** Confirmado por CSS / Media / Bajo.
- **Páginas:** admin y footer público.
- **Archivos:** `admin.css`, `globals.css`.
- **Evidencia:** múltiples reglas entre `0.58rem` y `0.69rem` (~9–11 px).
- **Impacto:** legibilidad reducida, especialmente en móvil/zoom.
- **Solución:** piso funcional de 0.75–0.8125rem y revisar densidad mediante espaciado, no miniaturización.
- **Criterio de aceptación:** ningún texto informativo esencial queda por debajo de 12 px; validación a 200% sin pérdida.

### COPY-001 — Copy técnico visible al viajero

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Bajo.
- **Página y sección:** Experiencias.
- **Archivo:** `HomePage.tsx:182`.
- **Evidencia:** eyebrow “Catálogo confirmado por la API”.
- **Impacto:** rompe tono editorial y expone implementación interna.
- **Solución:** reemplazar por una categoría útil y verificable, por ejemplo “Viaje disponible”, previa aprobación editorial.
- **Criterio de aceptación:** ningún copy público menciona API, backend, seed o configuración.

### COPY-002 — Repetición excesiva de “historia/memorable”

- **Tipo / prioridad / esfuerzo:** Oportunidad / Baja / Bajo.
- **Página:** portada completa.
- **Archivo:** `es.ts`.
- **Evidencia:** hero, paquetes, historias, conversión y footer reiteran el mismo campo semántico.
- **Impacto:** disminuye fuerza de la frase de marca y diferenciación entre secciones.
- **Solución:** reservar claim principal y variar copy funcional en catálogo/conversión.
- **Criterio de aceptación:** cada sección comunica una función distinta sin abandonar el tono de marca.

### PERF-001 — LCP móvil por encima del objetivo

- **Tipo / prioridad / esfuerzo:** Confirmado en laboratorio / Media / Medio.
- **Página:** `/`.
- **Evidencia:** Lighthouse móvil LCP 3.2 s; objetivo “bueno” ≤2.5 s. Desktop 0.6 s, CLS 0.
- **Impacto:** percepción lenta en móvil bajo throttling.
- **Solución:** revisar variante y calidad del hero, preload efectivo, cache/CDN y tamaño entregado; medir desplegado antes de decidir.
- **Criterio de aceptación:** Lighthouse móvil repetido y p75 de campo, cuando exista, LCP ≤2.5 s sin degradar legibilidad.

### PERF-002 — JavaScript e imágenes con margen de optimización

- **Tipo / prioridad / esfuerzo:** Oportunidad / Media / Medio.
- **Evidencia:** Lighthouse estima 53 KiB de JS sin uso y 16–20 KiB de ahorro de imagen; originales locales pesan 2.3–3.0 MB cada uno, aunque Next reduce el total transferido a ~449 KiB.
- **Archivos:** `Reveal.tsx`, imágenes `public/images/travel/*`.
- **Impacto:** coste en móviles modestos y cache/origen.
- **Solución:** compartir un observador o usar CSS progresivo, revisar límites de calidad y generar masters razonables sin perder resolución necesaria.
- **Criterio de aceptación:** menor JS/bytes en Lighthouse y misma calidad visual; no presentar pesos originales como peso transferido.

### STATE-001 — Carga global sustituye contenido estático y fallos silenciosos

- **Tipo / prioridad / esfuerzo:** Oportunidad / Media / Medio.
- **Páginas:** portada.
- **Archivos:** `app/loading.tsx`, `app/page.tsx`.
- **Evidencia:** el límite de ruta cubre todo mientras esperan tres consultas; promociones/settings rechazados desaparecen silenciosamente.
- **Impacto:** el hero conocido puede tardar en aparecer y el usuario no distingue ausencia de promoción/contacto de un fallo.
- **Solución:** límites Suspense por catálogo/promoción y política explícita para settings; mantener skeletons estructurales.
- **Criterio de aceptación:** el contenido estático aparece sin esperar la API; cada dependencia crítica tiene estado definido.

### SEO-001 — Favicon inexistente

- **Tipo / prioridad / esfuerzo:** Confirmado por Lighthouse / Media / Bajo.
- **Página:** global.
- **Evidencia:** `/favicon.ico` devuelve 404 y genera el único error de consola de Lighthouse.
- **Impacto:** presentación incompleta en pestaña/favoritos y penalización de buenas prácticas.
- **Solución:** añadir iconos aprobados mediante metadata de Next.
- **Criterio de aceptación:** favicon y apple icon responden 200, usan activo aprobado y Lighthouse no registra el 404.

### SEO-002 — Canonical puede apuntar a localhost

- **Tipo / prioridad / esfuerzo:** Potencial / Alta / Bajo.
- **Archivos:** `layout.tsx`, `robots.ts`, `sitemap.ts`.
- **Evidencia:** fallback `http://localhost:3001` si falta `NEXT_PUBLIC_SITE_URL`.
- **Impacto:** canonical/sitemap incorrectos en producción si la variable no se configura.
- **Solución:** fallar build de producción o validar una URL HTTPS no local.
- **Criterio de aceptación:** CI rechaza configuración ausente/localhost y el HTML desplegado contiene canonical final.

### TRUST-001 — Número provisional codificado como fallback

- **Tipo / prioridad / esfuerzo:** Confirmado / Media / Bajo.
- **Archivo:** `app/page.tsx:81`.
- **Evidencia:** el WhatsApp provisional se utiliza aunque la variable esté vacía.
- **Impacto:** puede sobrevivir a producción y contradecir la política de contactos verificados.
- **Solución:** exigir configuración por entorno antes de lanzamiento y retirar fallback al finalizar la etapa provisional.
- **Criterio de aceptación:** producción no compila/despliega sin canal aprobado; existe propietario de la configuración.

### CODE-001 — Componentes y hojas de estilo demasiado extensos

- **Tipo / prioridad / esfuerzo:** Oportunidad / Media / Medio.
- **Archivos:** `HomePage.tsx` 297 líneas, `QuoteForm.tsx` 294, `globals.css` 1585, `admin.css` 505.
- **Evidencia:** secciones, adaptación y estados conviven; CSS contiene reglas obsoletas como `.verified-strip` y `.quote-form__whatsapp`.
- **Impacto:** mayor riesgo de regresión y dificultad para mantener el sistema visual.
- **Solución:** extraer secciones por dominio y dividir estilos por capa/ruta conservando tokens comunes; eliminar sólo reglas comprobadas sin uso.
- **Criterio de aceptación:** cada módulo tiene responsabilidad clara, no cambia el DOM/UX y las pruebas visuales pasan.

### CODE-002 — Manejo de mutaciones administrativas repetido

- **Tipo / prioridad / esfuerzo:** Oportunidad / Media / Medio.
- **Archivos:** `ResourceForm`, `UserForm`, `InlineAction`, `LoginForm`.
- **Evidencia:** cada componente repite loading, parseo de error, fetch y refresh con diferencias de manejo de red.
- **Impacto:** inconsistencias; algunas mutaciones no capturan excepciones y pueden quedar en loading.
- **Solución:** helper/hook pequeño para mutaciones del BFF, no una reescritura ni estado global.
- **Criterio de aceptación:** todas las mutaciones manejan red, error y estado deshabilitado con el mismo contrato y pruebas.

## Evaluación por dimensión

### Arquitectura de información

La progresión narrativa general funciona, pero tiene nueve secciones para una única página y tres capas que se solapan: inspiración de destinos, catálogo real y reutilización del catálogo como experiencias. La simplificación recomendada está en `PROPUESTA_ESTRUCTURA_WEB.md`.

### Consistencia visual

La paleta, tipografías, contenedores, bordes y botones son mayormente consistentes. Las divergencias relevantes son los dos logotipos, texto funcional demasiado pequeño y un patrón de CSS admin más denso que el público. No se recomienda sustituir el sistema visual.

### Formulario y WhatsApp

El registro técnico y la continuidad post-éxito están implementados correctamente. La prioridad es conservar la selección, resolver privacidad, clarificar moneda y mejorar recuperación de errores. No conviene acortar eliminando nombre, teléfono, email, destino o viajeros porque pertenecen al contrato actual. Fechas, presupuesto y comentarios ya son opcionales.

### Navegación y responsive

El header público y sus estados activos funcionan con anclas; el menú móvil incluye foco/Escape/inert. Entre 768 y 1920 px no se observó ruptura del primer viewport. Los 320–430 px requieren una sesión posterior con emulación real por la limitación descrita. El login administrativo sí debe priorizar el formulario en móvil.

### Accesibilidad

Lighthouse da 96, pero hay dos fallos confirmados y problemas manuales adicionales. No debe interpretarse 96 como conformidad WCAG completa. Faltan teclado real, lector de pantalla, zoom 200% y reflow 320 CSS px.

### Rendimiento percibido

CLS es excelente y el peso transferido local es moderado. La principal oportunidad es LCP móvil. Las imágenes fuente grandes no equivalen automáticamente a bytes transferidos porque Next optimiza; deben ajustarse sólo con medición.

### SEO y confianza

Metadata, Open Graph, robots y sitemap existen. Faltan favicon y rutas públicas de detalle. La deuda principal de confianza es legal/contacto, no metadata.

## Conclusión

La implementación es funcional y técnicamente estable, con una dirección visual defendible. El mayor retorno no está en rediseñar, sino en **cerrar privacidad**, **hacer contextual la cotización**, **eliminar redundancias**, **alinear WhatsApp con el folio**, **corregir accesibilidad medida** y **hacer operable el admin a escala**. El plan priorizado y la arquitectura propuesta se documentan en los entregables complementarios.
