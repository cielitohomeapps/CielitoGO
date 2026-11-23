# Redundancias y secciones — Cielito Go

Las acciones propuestas no autorizan cambios automáticos. “Eliminar” significa retirar de la arquitectura visible sólo después de validación de negocio/contenido.

| Página | Sección | Problema | Acción recomendada | Justificación | Prioridad |
|---|---|---|---|---|---|
| `/` | Header: Inicio | En una landing, el logo y “Inicio” llevan al mismo punto. | **Simplificar** | En escritorio libera espacio; conservar logo como retorno al inicio y evaluar si “Inicio” aporta orientación real. | Baja |
| `/` | Hero | Dos CTA son válidos, pero “Descubrir destinos” lleva a inspiración estática y “Cotizar” al objetivo principal. | **Mantener** con destino más claro | Corresponden a intención exploratoria y transaccional; el primero debe llevar a inventario real o indicar inspiración. | Media |
| `/` | Destinos | Tarjetas locales no son destinos verificables, no son interactivas y anteceden al catálogo. | **Reorganizar** | Convertir en inspiración explícita/filtros reales o integrar como cabecera visual del catálogo. | Media |
| `/` | Paquetes | Es el inventario comercial principal y contiene precio/duración/CTA. | **Mantener** | Tiene función transaccional clara y datos del backend. | Crítica |
| `/` | Paquetes + Experiencias | Los mismos tours se muestran dos veces con estructuras y copy distintos. | **Fusionar** | Reduce longitud y evita que “experiencia” y “paquete” parezcan inventarios diferentes cuando comparten fuente. | Alta |
| `/` | Experiencias fallback | Categorías editoriales sólo aparecen cuando no hay tours; el significado de la sección cambia según la API. | **Reorganizar** | Una sección no debería alternar entre inventario y estilos de viaje sin señalización explícita. | Alta |
| `/` | Servicios + Descubre/Define/Cotiza | El bloque editorial y los beneficios explican esencialmente cómo funciona la planeación. | **Fusionar** | Puede convertirse en “Cómo funciona” con tres pasos y un apoyo visual, evitando dos mensajes consecutivos parecidos. | Media |
| `/` | Historias | Sección completa comunica que los testimonios están pendientes. | **Eliminar** temporalmente | La honestidad debe conservarse, pero no requiere una sección dominante hasta existir contenido auténtico. | Media |
| `/` | Conversión: Hablar con un asesor | Abre WhatsApp antes del registro, duplicando y contradiciendo la acción post-éxito. | **Eliminar** del flujo transaccional previo | Preserva trazabilidad y el folio; puede mantenerse como ayuda secundaria si negocio define otro propósito. | Alta |
| `/` | Cotizar | Título, introducción y formulario tienen propósito claro. | **Mantener** y contextualizar | Debe recibir la selección de paquete/promoción y explicar el siguiente paso. | Crítica |
| `/` | Footer Explora | Duplica navegación, pero cumple patrón esperado de orientación al final. | **Mantener** | La repetición aporta valor contextual; no es redundancia perjudicial. | Baja |
| `/` | Footer Información | Muestra pendientes legales como texto sin acción. | **Reorganizar** | Sustituir por enlaces reales cuando estén aprobados; mientras tanto, evitar presentarlo como navegación funcional. | Alta |
| `/` | Claims “historia/memorable” | El mismo recurso verbal aparece en hero, paquetes, historias, conversión y footer. | **Simplificar** | Reservar el claim para momentos de marca y usar copy funcional para catálogo/formulario. | Baja |
| `/` | CTA de cotización | Aparece en header, hero, tarjetas, estado vacío, servicios y conversión. | **Mantener** con jerarquía | Son oportunidades en momentos distintos; deben compartir comportamiento contextual, no eliminarse por repetición. | Media |
| Admin | Dashboard + tablas | Dashboard resume actividad y enlaza a listados; no duplica gestión. | **Mantener** | La repetición es una vista resumida con propósito operativo diferente. | Baja |
| Admin | Selectores de estado | Cada listado muestra todas las opciones aunque no todas son válidas. | **Simplificar** | Mostrar sólo siguientes estados permitidos reduce errores y carga cognitiva. | Alta |
| Admin | Formularios Tour/Promoción | Una implementación parametrizada evita duplicación, pero mezcla ramas extensas. | **Mantener** y refactorizar internamente | Reutilización válida; separar subformularios mejoraría claridad sin duplicar lógica de envío. | Media |
| Admin | Dos recursos de logo | Público usa `CielitoGo.png`; admin usa `brand/cielito-go-logo.png`. | **Fusionar** en sistema de marca aprobado | Evita variantes visuales no gobernadas y duplicación de activos/componentes. | Media |

## Mapa de decisión

- **Mantener:** Hero, inventario comercial, formulario, footer de navegación, dashboard y skeletons.
- **Fusionar:** Paquetes/Experiencias cuando usan los mismos tours; Servicios/pasos de planeación; sistema de logos.
- **Reorganizar:** Destinos editoriales, fallback de experiencias, legales del footer y opciones de estado admin.
- **Simplificar:** navegación “Inicio”, repetición de claim y copy técnico.
- **Eliminar temporalmente:** sección de testimonios sin contenido y acceso transaccional a WhatsApp antes del folio.
