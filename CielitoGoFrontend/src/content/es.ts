export const siteContent = {
  navigation: [
    { label: "Inicio", href: "#inicio" },
    { label: "Destinos", href: "#destinos" },
    { label: "Experiencias", href: "#experiencias" },
    { label: "Servicios", href: "#servicios" },
    { label: "Historias", href: "#historias" },
    { label: "Contacto", href: "#cotizar" },
  ],
  hero: {
    eyebrow: "Viajes que se vuelven historias",
    title: "El mundo te espera. Hazlo memorable.",
    body: "Descubre destinos extraordinarios, vive nuevas experiencias y encuentra tu próxima historia con Cielito Go.",
    primaryCta: "Descubrir destinos",
    secondaryCta: "Cotizar mi viaje",
  },
  destinations: {
    eyebrow: "Inspiración para tu próxima historia",
    title: "Hay lugares que se visitan. Otros que se quedan contigo.",
    body: "Desde playas para desconectarte hasta ciudades llenas de cultura, encuentra el destino que conecta con tu manera de viajar.",
    cta: "Explorar destinos",
    provisionalLabel: "Inspiración editorial · disponibilidad por confirmar",
  },
  experiences: {
    eyebrow: "Tu manera de viajar",
    title: "No todos viajamos igual.",
    body: "Escapadas para desconectarte, aventuras para descubrir y experiencias culturales para ampliar tus horizontes. Elige cómo vivir tu próxima historia.",
    cta: "Conocer experiencias",
  },
  services: {
    eyebrow: "Planear con claridad",
    title: "Tú imagina el viaje. Nosotros te ayudamos a hacerlo realidad.",
    body: "Planear una aventura no tiene que ser complicado. Explora opciones de destinos, hospedaje y experiencias desde un mismo lugar.",
    cta: "Comenzar a planear",
  },
  stories: {
    eyebrow: "Historias reales, siempre",
    title: "Cada viajero regresa con una historia diferente.",
    body: "Las experiencias memorables se convierten en historias que compartimos, fotografías que conservamos y momentos que queremos repetir.",
    pendingTitle: "Historias en preparación",
    pendingBody:
      "Este espacio se publicará únicamente con testimonios auténticos y autorizados. No mostramos reseñas de demostración como experiencias reales.",
  },
  conversion: {
    eyebrow: "Tu viaje comienza aquí",
    title: "Tu próxima gran historia comienza con un destino.",
    body: "Ese lugar que llevas tiempo imaginando puede convertirse en tu siguiente aventura. Cuéntanos a dónde quieres ir y comencemos a planearlo.",
    primaryCta: "Cotizar mi viaje",
    secondaryCta: "Hablar con un asesor",
  },
  footer: {
    claim: "Cielito Go. Destinos Memorables.",
    body: "Porque cada destino es una oportunidad para descubrir algo nuevo.",
  },
} as const;

export const editorialDestinations = [
  {
    id: "editorial-retreat",
    name: "Refugios entre naturaleza",
    country: "Inspiración de viaje",
    image: "/images/travel/tropical-retreat.png",
    alt: "Alberca de piedra frente a un paisaje tropical al atardecer",
    layout: "featured",
  },
  {
    id: "editorial-coast",
    name: "Costas que guardan historias",
    country: "Inspiración de viaje",
    image: "/images/travel/coastal-evening.png",
    alt: "Poblado costero iluminado al caer la noche",
    layout: "portrait",
  },
  {
    id: "editorial-mountain",
    name: "Horizontes de montaña",
    country: "Inspiración de viaje",
    image: "/images/travel/alpine-lake.png",
    alt: "Lago rodeado de montañas y nubes bajas",
    layout: "wide",
  },
] as const;

export const experienceCategories = [
  {
    title: "Escapadas para desconectarte",
    body: "Pausas frente al mar, la naturaleza o un paisaje que invite a respirar distinto.",
    image: "/images/travel/tropical-retreat.png",
    alt: "Refugio tropical usado como inspiración editorial",
  },
  {
    title: "Aventuras para descubrir",
    body: "Rutas que abren nuevas perspectivas y dejan espacio para la sorpresa.",
    image: "/images/travel/alpine-lake.png",
    alt: "Paisaje de montaña usado como inspiración editorial",
  },
  {
    title: "Cultura para ampliar horizontes",
    body: "Ciudades, sabores y encuentros que conectan cada destino con su historia.",
    image: "/images/travel/coastal-evening.png",
    alt: "Poblado costero usado como inspiración editorial",
  },
] as const;

export const planningBenefits = [
  {
    title: "Descubre",
    body: "Explora opciones publicadas por Cielito Go y encuentra ideas para comenzar.",
    icon: "/images/figma/service-experience.svg",
  },
  {
    title: "Define",
    body: "Comparte destino, fechas y necesidades mediante una solicitud completa.",
    icon: "/images/figma/service-hotel.svg",
  },
  {
    title: "Cotiza",
    body: "Envía tus datos de viaje al canal real de cotizaciones, sin confirmaciones simuladas.",
    icon: "/images/figma/service-flight.svg",
  },
] as const;

export const functionalCopy = {
  menuOpen: "Abrir menú principal",
  menuClose: "Cerrar menú principal",
  skipToContent: "Saltar al contenido",
  loading: "Cargando opciones disponibles…",
  unavailable: "No pudimos consultar las opciones disponibles en este momento.",
  provisional: "Contenido editorial provisional",
} as const;
