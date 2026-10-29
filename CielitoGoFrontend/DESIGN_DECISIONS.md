# Decisiones de diseño

## 1. Fuentes y orden de precedencia

La interfaz se definió a partir de tres fuentes, con la siguiente prioridad:

1. `manual CH para diseño y reproduccion.pdf`: sistema visual de la marca matriz.
2. `MANUAL DE COPY GO.pdf`: narrativa comercial y restricciones editoriales de Cielito Go.
3. Archivo de Figma `RqZxTN6FtJgBEgWwAPouuy`: composición, medidas y recursos visuales de referencia.

Cuando existe una discrepancia, se mantiene la intención compositiva de Figma, pero prevalecen la normativa tipográfica y el contenido responsable de los manuales. El manual gráfico es de **Cielito Home**, no un manual numérico exclusivo de Cielito Go; sus principios se aplican sin convertir ejemplos de la marca matriz en afirmaciones comerciales de Cielito Go.

## 2. Dirección visual

La propuesta conserva el carácter editorial, premium y sereno del mockup:

- Fotografía amplia como elemento narrativo principal.
- Tipografía serif para mensajes aspiracionales y sans serif para interacción.
- Mucho espacio negativo, retícula clara y composición modular.
- Fondos marfil y verde oscuro, con acentos dorados discretos.
- Bordes finos, sombras naturales y microinteracciones contenidas.
- Iconos geométricos de línea continua, sin efectos tridimensionales.

No se añaden degradados decorativos ni ornamentos que compitan con la fotografía. Los degradados sobre imágenes se limitan a mejorar la legibilidad del texto.

## 3. Sistema tipográfico

Se sustituyen `Playfair Display` e `Inter`, observadas en el mockup de Figma, por las familias prescritas en el manual gráfico:

| Rol | Familia | Pesos | Tratamiento |
| --- | --- | --- | --- |
| Titulares y mensajes editoriales | Cormorant Garamond | 400, 500, 600 | Interlineado de 90–105%; tracking entre −1% y +1% |
| Texto funcional y corrido | Montserrat | 400, 500, 600 | Interlineado de 130–150%; tracking entre 0 y +2% |
| Categorías y `eyebrows` | Montserrat | 500 | Versales y espaciado amplio equivalente a la recomendación editorial de +180 a +280 |
| CTA | Montserrat | 500 o 600 | Breve, legible y con una acción principal por sección |

La escala es fluida con `clamp()` para evitar saltos abruptos. El `h1` toma como máximo los 64 px del frame de Figma; los `h2` toman como máximo 48 px. En móvil se reduce la escala, no la jerarquía.

## 4. Tokens cromáticos

El manual gráfico muestra verde, marfil/beige y dorado, pero **no contiene valores HEX, RGB, CMYK o Pantone**. Los siguientes valores se obtuvieron de las capas de Figma y son tokens de implementación, no deben presentarse como códigos institucionales oficiales:

| Token semántico | Valor de referencia | Uso |
| --- | --- | --- |
| `brand-green` | `#004842` | Fondos principales, CTA y foco de marca |
| `brand-gold` | `#6F5C30` | Acentos, líneas y categorías |
| `brand-gold-soft` | `#F8DDA5` | Etiquetas editoriales puntuales |
| `surface-ivory` | `#FAF9F7` | Fondo general |
| `surface-muted` | `#F4F4F1` | Campos y bloques secundarios |
| `surface-map` | `#E8E8E6` | Fondo cartográfico/decorativo |
| `border-subtle` | `#BFC9C6` | Bordes y separadores |
| `text-primary` | `#1A1C1B` | Texto principal |
| `text-secondary` | `#3F4947` | Texto secundario |
| `text-muted` | `#6B7280` | Ayudas y placeholders |
| `white` | `#FFFFFF` | Texto y superficies sobre verde |

Los tokens se usan por función y no directamente por componente. La paleta numérica oficial permanece pendiente de entrega por la marca. Antes de producción deberá reemplazarse cada token si se recibe una especificación institucional distinta.

## 5. Retícula y espaciado

Figma utiliza un lienzo de 1280 px, un contenido máximo de 1184 px, márgenes laterales de 48 px, header de 80 px y separaciones frecuentes de 8, 16, 24, 32, 40, 48 y 80 px. Esos valores forman la base de la retícula web.

El manual recomienda una zona segura de 6–8% del ancho. Para conciliar ambos documentos:

- Los gutters son fluidos y crecen con el viewport.
- El contenido conserva `max-width: 1184px` para mantener las proporciones del mockup.
- Los bloques editoriales añaden espacio interno cuando el margen del frame es menor al 6%.
- En móvil se usan 20–24 px de margen y nunca menos de 16 px.

La separación título/subtítulo, subtítulo/cuerpo e icono/texto sigue las proporciones del manual. El espacio negativo se considera parte del diseño y no se rellena con contenido repetitivo.

## 6. Arquitectura narrativa

La página sigue la progresión del manual de copy:

`Inspirar → Despertar deseo → Presentar experiencias → Resolver dudas → Generar confianza → Convertir`

Las siete áreas editoriales son:

1. Hero.
2. Destinos.
3. Experiencias.
4. Servicios.
5. Testimonios.
6. Conversión.
7. Footer.

El bloque “Nosotros” del mockup puede integrarse como apoyo editorial dentro de servicios o conversión, sin inventar historia corporativa, años de experiencia ni cifras no confirmadas.

## 7. Divergencias justificadas respecto de Figma

### Buscador del hero

El manual de copy indica expresamente que el buscador sólo debe mostrarse si funciona. Se reemplaza por el CTA aprobado **“Descubrir destinos”** hasta disponer de filtros y búsqueda compatibles con el backend. Esto evita una interacción decorativa sin resultado real.

### Copy del hero y secciones

Se usa el copy del manual de Cielito Go en lugar de los textos de muestra de Figma. Se conserva la jerarquía visual del mockup, no sus afirmaciones no verificadas.

### Destinos y experiencias

Los nombres, duración, precio, disponibilidad e inclusiones sólo se muestran cuando llegan del backend. Las tarjetas editoriales locales se identifican como inspiración o contenido provisional; no se presentan como inventario comercial confirmado.

### Testimonios

Las citas, nombres, fotografías y calificaciones de Figma no se publican como testimonios reales. La sección mantiene su espacio visual y el texto editorial aprobado, pero usa un estado honesto hasta recibir testimonios auténticos y autorizados desde una fuente verificable.

### Formulario de conversión

El formulario corto de Figma no cumple el contrato de `POST /api/quotes`. La implementación utiliza el formulario completo requerido por el backend: nombre, teléfono, email, destino, viajeros, adultos y menores, con fechas, presupuesto y comentarios opcionales. No se simulan envíos exitosos.

### Datos de contacto y redes

Teléfono, dirección, correo y perfiles sociales sólo se renderizan si proceden de configuración pública válida o de variables confirmadas. Los valores demostrativos del mockup no se consideran información oficial.

### Logotipo

No se reconstruye el wordmark con una fuente. Se utiliza `public/brand/cielito-go-logo.png`, el recurso PNG transparente proporcionado localmente y coincidente con el nodo de logo de Figma. Se conserva su relación de aspecto, un tamaño digital no menor a 60 px y un área libre equivalente, como mínimo, a la altura visual de su “C”.

## 8. Diseño responsive

Los breakpoints son decisiones técnicas web, ya que los manuales y el archivo de Figma no incluyen frames móviles completos:

- Móvil: composición de una columna, navegación en menú, CTA a ancho útil y tarjetas apiladas.
- Tablet: retícula de dos columnas cuando la lectura y las imágenes lo permiten.
- Laptop/escritorio: retícula de 12 columnas inspirada en Figma.
- Monitores amplios: contenido limitado por `max-width`; la fotografía puede extenderse sin alargar las líneas de texto.

Adaptaciones principales:

- Navegación horizontal convertida en menú accesible.
- Bento de destinos convertido en lista o grid de una columna en móvil.
- Formularios de dos columnas convertidos en una columna.
- Imágenes con proporciones reservadas para evitar `layout shift`.
- Tipografía fluida y límites de longitud de línea.
- CTA y controles con área táctil mínima de 44 × 44 px.

## 9. Accesibilidad

El objetivo es WCAG 2.2 AA:

- HTML semántico, orden lógico de encabezados y regiones con nombre.
- Navegación completa por teclado y foco visible de alto contraste.
- Enlace “Saltar al contenido”.
- Menú móvil con estado accesible y devolución de foco.
- Formularios con `label`, ayuda asociada y errores anunciados.
- No usar color como único indicador de estado.
- Textos alternativos contextuales; iconos decorativos ocultos al lector de pantalla.
- Respeto de `prefers-reduced-motion` y animaciones no esenciales.
- Contraste evaluado sobre las combinaciones efectivas, especialmente texto sobre fotografía.

## 10. Movimiento y estados

Las apariciones al desplazarse, `hover` y transiciones usan opacidad y transformaciones cortas. No se anima la geometría de página de forma que genere CLS. Con movimiento reducido, el contenido aparece inmediatamente.

Los componentes contemplan estados de carga, vacío, error, deshabilitado, envío y confirmación. Los mensajes describen el resultado real de la API; una indisponibilidad nunca se representa como éxito.

## 11. Fotografía y medios

- El hero prioriza su imagen para mejorar LCP; las imágenes posteriores usan carga diferida.
- `next/image` genera formatos modernos y `srcset` según el dispositivo.
- Cada slot reserva dimensiones o proporción.
- No se usa el video local de 302 MB: es inadecuado para producción sin transcodificación y no coincide con el recurso de Figma.
- Los recursos de Figma se descargaron localmente; ninguna URL temporal se usa en tiempo de ejecución.
- La licencia y autoría de cada fotografía debe confirmarse antes del lanzamiento público.

## 12. Pendientes de marca

Antes de publicar se requieren:

- Paleta institucional numérica oficial de Cielito Go.
- Archivo maestro/vectorial y variantes autorizadas del logotipo.
- Confirmación de licencia y crédito de fotografías e iconos.
- Información comercial, legal, de contacto y redes aprobada.
- Testimonios auténticos con autorización de uso.
- Revisión final de copy por negocio y legal.

