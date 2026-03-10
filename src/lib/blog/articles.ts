export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string; // ISO date
  readingTime: number; // minutes
  category: string;
  image?: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "que-es-certificado-de-reciclaje",
    title: "Qué es un certificado de reciclaje y por qué tu empresa lo necesita",
    description: "Descubre qué es un certificado de reciclaje, qué información debe contener, para qué sirve en auditorías ambientales y cómo obtenerlo de forma digital en Chile.",
    keywords: ["certificado de reciclaje", "certificado de valorización", "certificado de disposición de residuos", "certificado ambiental empresa Chile"],
    date: "2026-03-01",
    readingTime: 8,
    category: "Certificados",
  },
  {
    slug: "ley-rep-chile-guia-completa",
    title: "Guía completa de la Ley REP en Chile: qué exige a tu empresa en 2026",
    description: "Todo sobre la Ley REP (20.920) en Chile: plazos, metas de reciclaje, productos prioritarios, multas y cómo cumplir si eres gestora o generador de residuos.",
    keywords: ["ley REP Chile", "ley 20920", "ley de reciclaje Chile", "responsabilidad extendida del productor", "metas reciclaje Chile 2026"],
    date: "2026-02-25",
    readingTime: 12,
    category: "Regulación",
  },
  {
    slug: "plan-gestion-residuos-empresa",
    title: "5 pasos para implementar un plan de gestión de residuos en tu empresa",
    description: "Aprende a crear un plan de gestión de residuos empresarial paso a paso: diagnóstico, clasificación, proveedores, trazabilidad y mejora continua.",
    keywords: ["gestión de residuos empresas Chile", "plan de manejo de residuos", "gestión integral de residuos", "manejo de residuos industriales"],
    date: "2026-02-18",
    readingTime: 10,
    category: "Gestión",
  },
  {
    slug: "como-declarar-residuos-sinader",
    title: "Cómo declarar residuos en SINADER: guía paso a paso 2026",
    description: "Tutorial completo para declarar residuos en el SINADER (Sistema Nacional de Declaración de Residuos) de Chile: requisitos, plazos, errores comunes y tips.",
    keywords: ["SINADER Chile", "declaración de residuos SINADER", "RETC Chile", "ventanilla única RETC", "cómo declarar residuos"],
    date: "2026-02-10",
    readingTime: 9,
    category: "Regulación",
  },
  {
    slug: "economia-circular-chile-impacto-empresas",
    title: "Economía circular en Chile: cómo medir el impacto real de tu empresa",
    description: "Qué es la economía circular, cómo se aplica en Chile, indicadores para medir circularidad empresarial y herramientas para demostrar impacto ambiental concreto.",
    keywords: ["economía circular Chile", "economía circular empresas", "indicadores circularidad", "hoja de ruta economía circular Chile 2040"],
    date: "2026-02-03",
    readingTime: 10,
    category: "Sustentabilidad",
  },
  {
    slug: "co2-evitado-reciclaje-tabla-materiales",
    title: "Cuánto CO₂ evitas al reciclar: tabla por tipo de material",
    description: "Tabla completa de factores de emisión de CO₂ evitado por material reciclado (cartón, plástico, vidrio, metal, papel) según GHG Protocol e IPCC.",
    keywords: ["CO2 evitado reciclaje", "huella de carbono reciclaje", "factor emisión reciclaje", "calcular CO2 evitado", "GHG Protocol reciclaje"],
    date: "2026-01-28",
    readingTime: 7,
    category: "Huella de carbono",
  },
  {
    slug: "como-elegir-proveedor-reciclaje-chile",
    title: "Cómo elegir un proveedor de reciclaje para tu empresa en Chile",
    description: "Criterios clave para elegir una gestora de reciclaje confiable en Chile: certificaciones, trazabilidad, cobertura, precios y qué preguntar antes de contratar.",
    keywords: ["reciclaje empresas Chile", "proveedor reciclaje Santiago", "gestora de reciclaje Chile", "servicio reciclaje empresas", "retiro reciclaje empresas"],
    date: "2026-01-20",
    readingTime: 8,
    category: "Gestión",
  },
  {
    slug: "trazabilidad-residuos-digital-chile",
    title: "Trazabilidad digital de residuos: qué es y por qué será obligatoria en Chile",
    description: "Todo sobre trazabilidad de residuos en Chile: qué exige la normativa, beneficios de digitalizar el proceso y cómo implementar un sistema de seguimiento efectivo.",
    keywords: ["trazabilidad de residuos Chile", "trazabilidad residuos ley REP", "sistema gestión residuos software", "seguimiento residuos digital"],
    date: "2026-01-13",
    readingTime: 9,
    category: "Tecnología",
  },
  {
    slug: "clasificacion-residuos-industriales-chile",
    title: "Clasificación de residuos industriales en Chile: guía práctica",
    description: "Guía para clasificar residuos industriales en Chile: peligrosos (RESPEL), no peligrosos, asimilables, inertes. Normativa vigente y obligaciones legales.",
    keywords: ["residuos industriales Chile", "clasificación residuos Chile", "RESPEL Chile", "residuos peligrosos empresas", "residuos no peligrosos"],
    date: "2026-01-06",
    readingTime: 11,
    category: "Regulación",
  },
  {
    slug: "cumplimiento-ambiental-certificados-reciclaje",
    title: "Cómo demostrar cumplimiento ambiental con certificados de reciclaje",
    description: "Aprende a usar certificados de reciclaje como evidencia en auditorías ISO 14001, reportes de sustentabilidad, fiscalizaciones y acuerdos de producción limpia.",
    keywords: ["cumplimiento ambiental Chile", "ISO 14001 reciclaje", "auditoría ambiental empresas", "sustentabilidad empresarial Chile", "reporte sostenibilidad"],
    date: "2025-12-30",
    readingTime: 9,
    category: "Sustentabilidad",
  },
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}
