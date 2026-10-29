# Inventario y procedencia de activos

Fecha de auditoría: 29 de octubre de 2026.

## Política de uso

Los recursos se conservan localmente para evitar dependencias de URLs temporales. Que un archivo esté presente en Figma, Teams o SharePoint demuestra procedencia técnica, pero **no acredita por sí solo derechos de explotación, autoría o ausencia de requisitos de atribución**. La publicación pública queda condicionada a confirmación del propietario de la marca.

No se modifican proporciones del logotipo ni trazos de los SVG. `next/image` puede generar variantes optimizadas de fotografías sin alterar su composición editorial.

## Logotipo

| Ruta | Dimensiones | Peso | Procedencia | Estado y uso |
| --- | ---: | ---: | --- | --- |
| `public/brand/cielito-go-logo.png` | 3300 × 2551 | 183,475 B | `media/CG3.png`, recurso local de Cielito Go | PNG RGBA transparente. Recurso de runtime preferido. Mantener proporción, área de protección y mínimo digital de 60 px. |
| Logo del nodo Figma `42:308` | 3300 × 2551 | No duplicado en `public` | Es binariamente idéntico a `cielito-go-logo.png`; el duplicado se excluyó del bundle y su correspondencia queda registrada aquí. |
| `public/CielitoGo.png` | 2440 × 1146 | 39,066 B | Entregado por el usuario | Recurso activo de runtime. Mantener proporción y solicitar versión vectorial/variantes oficiales antes de publicación. |

Ambos archivos tienen el mismo SHA-256. No debe reconstruirse el logotipo con texto ni extraerse otro desde el PDF rasterizado.

## Fotografías y texturas de Figma

| Ruta | Dimensiones | Peso | Slot original | Uso previsto | Licencia |
| --- | ---: | ---: | --- | --- | --- |
| `public/images/figma/hero.png` | 512 × 279 | 51,885 B | Hero, nodo `1:4` | Imagen principal; precarga y `sizes` responsive | Pendiente de confirmación |
| `public/images/figma/bali.png` | 512 × 279 | 73,124 B | Tarjeta Bali, nodo `1:55` | Tarjeta editorial/dinámica; no confirma oferta del destino | Pendiente de confirmación |
| `public/images/figma/amalfi.png` | 512 × 279 | 71,593 B | Tarjeta Costa Amalfitana, nodo `1:66` | Tarjeta editorial/dinámica; no confirma oferta del destino | Pendiente de confirmación |
| `public/images/figma/patagonia.png` | 512 × 318 | 74,556 B | Tarjeta Patagonia, nodo `1:76` | Tarjeta editorial/dinámica; no confirma oferta del destino | Pendiente de confirmación |
| `public/images/figma/editorial-portrait.png` | 512 × 279 | 37,565 B | Sección Nosotros, nodo `1:120` | Imagen editorial de apoyo; no atribuir identidad, cargo o testimonio | Pendiente de confirmación |
| `public/images/figma/map-texture.png` | 512 × 512 | 126,658 B | Fondo de contacto/conversión, nodo `1:238` | Textura decorativa; no presenta una dirección real | Pendiente de confirmación |

Las fotografías se descargaron mediante el MCP oficial de Figma desde el archivo proporcionado. Las URLs de origen eran temporales y no forman parte del código de runtime.

## Fotografía original para la primera versión

Las siguientes fotografías se generaron con la herramienta integrada de generación de imágenes el 29 de octubre de 2026. Se usan como inspiración editorial y no representan destinos, hoteles o servicios confirmados.

| Archivo | Uso | Tratamiento |
| --- | --- | --- |
| `public/images/travel/hero-lagoon.png` | Hero y Open Graph | `next/image`, carga prioritaria, AVIF/WebP en runtime |
| `public/images/travel/tropical-retreat.png` | Tarjeta editorial y experiencias | `next/image`, carga diferida fuera del viewport |
| `public/images/travel/coastal-evening.png` | Tarjeta editorial y sección de planeación | `next/image`, carga diferida fuera del viewport |
| `public/images/travel/alpine-lake.png` | Tarjeta editorial y experiencias | `next/image`, carga diferida fuera del viewport |

## Iconografía de Figma

| Ruta | Viewport original | Función | Tratamiento accesible | Licencia |
| --- | ---: | --- | --- | --- |
| `public/images/figma/arrow-right.svg` | 16 × 16 | Indicador de enlace | Decorativo si el enlace ya tiene texto | Pendiente de confirmación |
| `public/images/figma/chevron-down.svg` | 24 × 24 | Indicador de selector | Decorativo; el control conserva nombre accesible | Pendiente de confirmación |
| `public/images/figma/service-flight.svg` | 31.0191 × 27.225 | Servicio/vuelo | Alternativa vacía si acompaña título | Pendiente de confirmación |
| `public/images/figma/service-hotel.svg` | 33 × 22.5 | Servicio/hospedaje | Alternativa vacía si acompaña título | Pendiente de confirmación |
| `public/images/figma/service-experience.svg` | 30 × 30 | Servicio/experiencia | Alternativa vacía si acompaña título | Pendiente de confirmación |
| `public/images/figma/quote-mark.svg` | 186.25 × 133.5 | Ornamento de testimonios | Oculto a tecnología asistiva | Pendiente de confirmación |
| `public/images/figma/decorative.svg` | 20 × 19 | Ornamento/estrella | No usar como calificación sin datos reales | Pendiente de confirmación |
| `public/images/figma/star.svg` | 20 × 19 | Calificación visual | No usar hasta contar con calificación auténtica | Pendiente de confirmación |
| `public/images/figma/location.svg` | 32 × 40 | Ubicación | No asociar a una dirección no confirmada | Pendiente de confirmación |
| `public/images/figma/social-instagram.svg` | 20 × 20 | Instagram | El enlace requiere nombre accesible y URL confirmada | Pendiente de confirmación |
| `public/images/figma/social-facebook.svg` | 20 × 20 | Facebook | El enlace requiere nombre accesible y URL confirmada | Pendiente de confirmación |
| `public/images/figma/social-mail.svg` | 20 × 16 | Correo | El enlace requiere nombre accesible y correo confirmado | Pendiente de confirmación |

Los SVG se mantienen como archivos externos. Sus atributos raíz de ancho, alto y `viewBox` no deben reescribirse; el tamaño interactivo mínimo se resuelve desde el contenedor, acorde con el mínimo digital de 24 × 24 px del manual.

## Recursos locales excluidos del nuevo bundle

| Recurso original | Motivo de exclusión |
| --- | --- |
| `media/cielitogo.gif` | Duplicado visual del logo, un solo fotograma, fondo blanco y mayor peso que el PNG transparente. |
| `media/Contenido 2.mp4` | 3840 × 2160, ~302 MB; no coincide con el slot estático de Figma y no es apto para web sin transcodificación, poster y validación editorial. |
| `media/Contenido 3.mp4` | No coincide con el fondo verde sólido de testimonios; requiere confirmar licencia y finalidad antes de optimizar. |
| `media/Contenido1.mp4` | No tiene uso documentado ni aprobación editorial. |
| Imágenes remotas de Unsplash del frontend anterior | No se reutiliza la arquitectura anterior; falta confirmar correspondencia exacta, autoría y trazabilidad de cada URL. |

## Activos no disponibles

- Variantes vectoriales oficiales del logotipo: principal, clara y monocromática.
- Fuentes locales o archivos de licencia incorporados para Cormorant Garamond y Montserrat.
- Fotografías de testimonios auténticos y autorizados.
- Imágenes oficiales de tours/promociones que no provengan de la API.
- Favicon, icono de aplicación y arte Open Graph aprobados.
- Documento de licencias/créditos de las fotografías e iconos de Figma.

## Checklist previo a publicación

- [ ] Confirmar autor, licencia, territorio y plazo de uso de cada fotografía.
- [ ] Confirmar derechos de uso de iconos y logotipo.
- [ ] Sustituir cualquier imagen editorial provisional por activos aprobados cuando corresponda.
- [ ] Añadir créditos visibles o metadata si la licencia lo exige.
- [ ] Validar que las imágenes de la API pertenezcan al tour/promoción mostrado.
- [ ] Revisar textos alternativos en contexto; no derivarlos sólo del nombre del archivo.
- [ ] Verificar que ninguna URL temporal de Figma esté presente en el build.
- [ ] Mantener fuera del bundle los videos no optimizados.

