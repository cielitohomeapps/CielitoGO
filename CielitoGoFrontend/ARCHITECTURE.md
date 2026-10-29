# Arquitectura del frontend

## Objetivo

El frontend es una aplicación nueva e independiente construida con Next.js,
React y TypeScript. No reutiliza la arquitectura del frontend anterior y no
modifica el backend existente.

La primera versión prioriza una landing comercial rápida, accesible y
renderizada en servidor, pero deja límites claros para crecer hacia catálogo,
detalles de tours, CMS, internacionalización y flujos de cotización.

## Decisiones principales

### Next.js App Router

Se seleccionó Next.js App Router por:

- Renderizado en servidor y generación de metadata para SEO.
- Optimización de imágenes y fuentes.
- Route Handlers para mantener `API_BASE_URL` y lógica sensible en servidor.
- Cache y revalidación para lecturas públicas.
- División de código por ruta y una base natural para futuros detalles.

La versión objetivo es Next.js 16 LTS. El proyecto requiere Node.js 20.9 o
superior.

### TypeScript estricto y Zod

TypeScript utiliza modo `strict`. Los contratos remotos también se validan en
tiempo de ejecución con Zod: el tipado estático no se considera evidencia de
que una respuesta externa sea válida.

### CSS propio y tokens

La landing usa CSS global organizado sobre custom properties. No se incorpora
Tailwind: para el alcance actual, CSS nativo evita una dependencia adicional y
permite expresar la composición editorial del mockup con claridad.

Los tokens centralizan:

- Colores de referencia tomados de Figma.
- Tipografías Cormorant Garamond y Montserrat.
- Escala tipográfica fluida.
- Espaciado, contenedores, radios, sombras y transiciones.
- Estados de foco y movimiento reducido.

El manual de marca no ofrece códigos numéricos oficiales. Por ello, los valores
de Figma son tokens de implementación, no una declaración de color
institucional definitivo.

### Contenido desacoplado

El contenido local en español se mantiene en un módulo central, no repartido
entre componentes. Cada bloque diferencia:

- Copy editorial aprobado por el manual.
- Datos dinámicos obtenidos del backend.
- Contenido provisional identificado.
- Textos funcionales de la interfaz.

Esta separación facilita un futuro CMS y una estructura `es`/`en` sin duplicar
componentes.

## Estructura prevista

```text
CielitoGoFrontend/
├── public/
│   ├── brand/                 # Logotipo autorizado disponible
│   └── images/                # Recursos locales y activos de Figma
├── src/
│   ├── app/
│   │   ├── api/quotes/        # Proxy validado hacia POST /api/quotes
│   │   ├── globals.css        # Tokens, base y estilos de la landing
│   │   ├── layout.tsx         # Metadata, fuentes y estructura raíz
│   │   ├── page.tsx           # Composición de la portada
│   │   ├── robots.ts          # Política de indexación
│   │   └── sitemap.ts         # Sitemap base
│   ├── components/
│   │   ├── layout/            # Header, navegación y footer
│   │   ├── sections/          # Secciones comerciales de la portada
│   │   └── ui/                # Botones, campos, estados y primitivas usadas
│   ├── content/
│   │   └── es.ts              # Copy y datos editoriales centralizados
│   ├── features/
│   │   ├── catalog/           # Adaptación de tours/promociones a UI
│   │   └── quote/             # Formulario y estados de cotización
│   ├── lib/
│   │   ├── api/               # Cliente, schemas, recursos y errores
│   │   └── utils/             # Funciones puras compartidas
│   └── test/                  # Configuración de pruebas
├── .env.example
├── API_INTEGRATION.md
├── ARCHITECTURE.md
├── DESIGN_DECISIONS.md
├── PENDING.md
└── README.md
```

Sólo se crean abstracciones que ya tienen un consumidor o una previsión
inmediata. No se implementan componentes genéricos sin uso.

## Flujo de datos

### Lectura pública

```text
Navegador
  → Server Component de Next.js
    → helper de src/lib/api
      → API_BASE_URL/api/...
        → Zod valida la respuesta
          → adaptador de presentación
            → HTML accesible renderizado en servidor
```

Si una lectura falla, la sección muestra un estado vacío/error útil. El copy
local aprobado puede conservar la narrativa, pero nunca se usa para inventar
precio, disponibilidad, promoción o servicio.

### Cotización

```text
Formulario cliente
  → validación inmediata de UX
    → POST /api/quotes (Route Handler de Next.js)
      → validación Zod en servidor
        → POST API_BASE_URL/api/quotes
          → respuesta real normalizada
            → confirmación accesible o error recuperable
```

El formulario impide un segundo submit mientras existe una solicitud en curso.
No se muestra éxito hasta recibir `201` y validar el identificador devuelto.

## Responsabilidades

### `app`

Define rutas, metadata, límites server/client y composición de páginas. No
contiene contratos del backend ni copy comercial disperso.

### `components`

Contiene presentación reutilizable. Los componentes de servidor son la opción
por defecto; sólo el menú móvil, revelados progresivos y formularios usan
`"use client"` cuando necesitan estado o APIs del navegador.

### `features`

Agrupa comportamiento de dominio que combina UI, adaptación de datos y estado.
Evita convertir `components/ui` en un contenedor de reglas de negocio.

### `lib/api`

Es la única puerta de entrada al backend. Centraliza configuración, timeout,
serialización, validación y errores. Ningún componente construye URLs remotas a
mano.

### `content`

Centraliza textos estáticos por idioma y marca su procedencia. Las respuestas
del backend no se mezclan silenciosamente con afirmaciones provisionales.

## Renderizado y cache

- La portada se renderiza en servidor.
- Contenido, settings, tours y promociones pueden usar revalidación temporal.
- Cotizaciones son mutaciones sin cache.
- Un error del backend no impide renderizar navegación, narrativa editorial y
  acciones que no dependan de datos remotos.
- Las futuras páginas de detalle deben resolver primero la falta de endpoint
  público por slug; no se diseñan URLs indexables basadas en UUID como solución
  definitiva.

## Accesibilidad

El objetivo es WCAG 2.2 AA:

- HTML semántico y jerarquía de headings.
- Enlace para saltar al contenido.
- Navegación y diálogo operables con teclado.
- Foco visible y cierre del menú con Escape.
- Labels persistentes, errores asociados y estado de envío anunciado.
- Objetivos táctiles de al menos 44 × 44 px.
- Texto alternativo según función de cada imagen.
- Contraste verificado para texto y controles.
- Animación desactivable con `prefers-reduced-motion`.

## Rendimiento

- Server Components por defecto y JavaScript cliente acotado.
- `next/image` con dimensiones/proporciones definidas, `sizes`, AVIF/WebP y
  prioridad sólo para el hero.
- Lazy loading de medios fuera del primer viewport.
- Fuentes limitadas a pesos autorizados y con `display: swap`.
- Animaciones CSS discretas, sin una librería de motion.
- Sin video de hero de 302 MB del proyecto anterior.
- Reservas de espacio para evitar CLS.
- Carga paginada; no se solicitan indiscriminadamente todos los tours.

## SEO

- Metadata de título, descripción, Open Graph y canonical centralizada.
- `robots.ts` y `sitemap.ts` derivados de `NEXT_PUBLIC_SITE_URL`.
- Un único `h1` y headings en orden lógico.
- JSON-LD limitado a hechos confirmados; no se publican ratings, precios,
  dirección o perfiles sociales provisionales.
- Futuras rutas de detalle dependen de slugs públicos y metadata confirmada.

## Seguridad

- Secretos y URL interna permanecen en variables de servidor.
- Payloads externos se validan en el Route Handler y nuevamente en el backend.
- No se renderiza HTML remoto sin sanitización.
- No se desactivan Helmet, CORS, rate limiting ni validaciones del backend.
- Cabeceras defensivas del frontend eliminan `X-Powered-By`, restringen
  capacidades innecesarias y evitan sniffing.
- No se registran payloads de cotización ni datos personales en el navegador.

## Pruebas y validación

La entrega debe ejecutar:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Las pruebas cubren como mínimo validación de contratos, reglas del formulario,
estados visibles y comportamiento de navegación. La revisión visual se realiza
en viewport de escritorio y móvil, con verificación de overflow y movimiento
reducido.

## Evolución prevista

1. Confirmar paleta oficial, contactos, logotipo y derechos de activos.
2. Exponer slugs, filtros y categorías públicas desde el backend.
3. Crear catálogo y detalles indexables sin duplicar la capa API.
4. Introducir estructura de locales cuando exista copy aprobado en inglés.
5. Diseñar una sesión administrativa segura sólo si el alcance incluye CMS.
