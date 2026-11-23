# Propuesta de estructura web — Cielito Go

## Principio rector

La portada debe responder, en este orden, cinco preguntas:

1. ¿Qué ofrece Cielito Go?
2. ¿Qué viajes están realmente disponibles?
3. ¿Cómo funciona la planeación/cotización?
4. ¿Por qué confiar?
5. ¿Qué debo hacer ahora?

La propuesta reduce redundancias sin retirar información necesaria y mantiene un único objetivo principal: **registrar una solicitud de cotización y continuar a WhatsApp con folio**.

## Menú propuesto

| Opción | Destino | Justificación |
|---|---|---|
| Viajes | `#viajes` o futura `/viajes` | Reúne destinos/paquetes reales bajo una etiqueta comprensible. |
| Cómo funciona | `#como-funciona` | Explica Descubre → Define → Cotiza en un bloque. |
| Cotizar | `#cotizar` | Ancla principal; se mantiene también como CTA destacado. |

El logo conserva la función de volver al inicio. “Experiencias”, “Servicios” y “Contacto” no necesitan competir como tres entradas si su contenido se integra en Cómo funciona y Cotizar. Si negocio demuestra que “Experiencias” es una taxonomía real con filtros/datos propios, puede volver al menú.

## Orden recomendado de secciones

### 1. Header

- **Propósito:** orientación y acceso constante al siguiente paso.
- **Contenido:** logo aprobado, menú breve, CTA “Cotizar mi viaje”.
- **CTA:** Cotizar.
- **Relación con el flujo:** lleva a un formulario vacío o conserva una selección previa.

### 2. Hero

- **Propósito:** comunicar propuesta de valor en pocos segundos.
- **Contenido:** claim de marca, una explicación funcional breve y dos acciones con jerarquía.
- **CTA principal:** “Cotizar mi viaje”.
- **CTA secundario:** “Ver viajes disponibles”.
- **Nota:** reservar “memorable/historia” aquí; usar copy más funcional después.

### 3. Viajes disponibles

- **Propósito:** presentar inventario real y apoyar comparación.
- **Contenido:** promoción vigente, tours con imagen, destino, duración, precio y capacidad cuando estén confirmados.
- **CTA de tarjeta:** “Cotizar paquete: [nombre]”.
- **Relación con el flujo:** cada CTA preselecciona el viaje en el formulario.
- **Estado vacío:** invitación a describir un destino deseado, claramente diferenciada de un error de conectividad.
- **Inspiración:** las fotografías/editoriales actuales pueden ser una franja secundaria rotulada “Ideas para inspirarte”, no otro catálogo.

### 4. Cómo funciona

- **Propósito:** explicar el servicio y reducir incertidumbre.
- **Contenido recomendado:**
  1. Descubre opciones reales o comparte una idea.
  2. Define destino, fechas y viajeros.
  3. Registra la solicitud, recibe folio y continúa con un asesor por WhatsApp.
- **CTA:** “Comenzar mi cotización”.
- **Origen:** fusiona la historia de servicios y las tarjetas Descubre/Define/Cotiza.

### 5. Confianza

- **Propósito:** resolver dudas antes de entregar datos.
- **Contenido actual permitido:** claridad sobre el proceso, contacto verificado, privacidad y tratamiento de datos.
- **Contenido futuro:** testimonios auténticos y autorizados únicamente cuando existan.
- **Regla:** si no hay testimonios, no mostrar una sección vacía; no inventar cifras, certificaciones o garantías.

### 6. Cotizar

- **Propósito:** completar la acción principal.
- **Contenido:** resumen de selección, campos indispensables, opcionales agrupados, consentimiento con aviso y explicación del siguiente paso.
- **CTA:** “Registrar solicitud”.
- **Éxito:** folio `CG-AÑO-XXXXX`, confirmación y “Continuar a WhatsApp”.
- **Regla de WhatsApp:** el CTA transaccional aparece después del `201`; el mensaje incluye folio y datos ya capturados.

### 7. Footer

- **Propósito:** navegación secundaria, contacto y cumplimiento.
- **Contenido:** marca, enlaces de sección, aviso de privacidad, términos y canales confirmados.
- **CTA:** no competir con el CTA principal; contacto como apoyo.

## Flujo de cotización propuesto

```text
Hero / tarjeta de viaje
        ↓
Selección visible y editable
        ↓
Datos de contacto
        ↓
Viajeros y fechas opcionales/estimadas
        ↓
Presupuesto con moneda + comentarios
        ↓
Consentimiento con aviso de privacidad
        ↓
POST /api/quotes
        ↓
Confirmación + folio CG-AÑO-XXXXX
        ↓
WhatsApp con mensaje prellenado
```

### Información que debe conservarse

- Nombre, teléfono, email, destino, total/adultos/menores: requeridos por contrato.
- Fechas, presupuesto y comentarios: opcionales.
- Selección de tour/promoción: añadir sólo mediante un contrato autorizado; mientras tanto puede completar el destino visible sin inventar identificadores.

### Simplificaciones seguras

- Agrupar adultos/menores en una sola sección “Viajeros”.
- Mostrar el total calculado sin solicitarlo manualmente.
- Etiquetar presupuesto con moneda.
- Mantener labels; no sustituirlas por placeholders.
- Colapsar opcionales sólo si permanecen descubribles y accesibles.

## Arquitectura futura de rutas

Sólo cuando el backend soporte slugs y datos públicos suficientes:

```text
/
/viajes
/viajes/[slug]
/privacidad
/terminos
/admin/*  (privado, no indexable)
```

No se recomienda crear rutas de detalle públicas basadas en UUID ni duplicar contenido estático para simular catálogo.

## Relación entre portada y admin

- El admin administra inventario y operación; no debe compartir la navegación pública.
- Tours/promociones activos alimentan “Viajes disponibles”.
- Cotizaciones y reservaciones necesitan detalle e historial protegidos.
- Las transiciones ofrecidas por el admin deben reflejar exactamente las reglas del backend.
- Identidad visual puede compartir tokens y logo aprobados, pero la densidad operativa puede diferir de la landing.

## Resultado esperado

La portada pasa de nueve bloques parcialmente superpuestos a seis/seis más footer: Hero → Viajes → Cómo funciona → Confianza condicional → Cotizar → Footer. Se mantiene inspiración y marca, pero cada sección tiene un propósito único y conduce de forma natural al registro con folio y WhatsApp.
