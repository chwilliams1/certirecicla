# SEO Content Audit
## https://certirecicla.cl
### Fecha: 12 de marzo de 2026

---

## SEO Health Score: 72/100

**Desglose:**
| Categoría | Puntaje | Máximo |
|---|---|---|
| On-Page SEO | 18 | 25 |
| Contenido y E-E-A-T | 16 | 20 |
| SEO Técnico | 15 | 20 |
| Schema/Datos Estructurados | 13 | 15 |
| Estrategia de Contenido | 10 | 20 |
| **Total** | **72** | **100** |

---

## On-Page SEO Checklist

### Title Tag

| Criterio | Estado | Detalle |
|---|---|---|
| Existe | Pass | Todas las páginas tienen title tag |
| Largo | Needs Work | Homepage OK, pero `/calculadora` tiene 82 caracteres (ideal: 50-60) |
| Keyword primario | Pass | Keywords relevantes presentes |
| Brand name | **Fail** | **Brand duplicado**: "... \| CertiRecicla \| CertiRecicla" en múltiples páginas |
| Unicidad | Pass | Cada página tiene título diferente |
| Compelling | Pass | Títulos claros y orientados al beneficio |

**Títulos actuales con problemas:**

| Página | Título Actual | Problema |
|---|---|---|
| `/calculadora` | "Calculadora de CO₂ Evitado por Reciclaje — Gratis, por Material \| CertiRecicla \| CertiRecicla" | Brand duplicado + demasiado largo (82 chars) |
| `/blog` | "Blog de Reciclaje y Gestión de Residuos en Chile — CertiRecicla \| CertiRecicla" | Brand duplicado |
| `/materiales` | "Materiales Reciclables en Chile — Guia Completa \| CertiRecicla \| CertiRecicla" | Brand duplicado + falta tilde en "Guía" |
| `/precios` | "Planes y Precios — CertiRecicla \| Certificados de Reciclaje \| CertiRecicla" | Brand duplicado |

**Títulos recomendados:**

| Página | Título Recomendado |
|---|---|
| Home | "CertiRecicla — Certificados de Reciclaje Automatizados para Gestoras" |
| `/calculadora` | "Calculadora CO₂ Evitado por Reciclaje — Gratis \| CertiRecicla" |
| `/blog` | "Blog de Reciclaje y Gestión de Residuos en Chile \| CertiRecicla" |
| `/materiales` | "Guía de Materiales Reciclables en Chile \| CertiRecicla" |
| `/precios` | "Planes y Precios — Certificados de Reciclaje \| CertiRecicla" |

---

### Meta Description

| Criterio | Estado | Detalle |
|---|---|---|
| Existe | Pass | Todas las páginas clave tienen meta description |
| Largo | Needs Work | `/calculadora` tiene ~250 chars (ideal: 150-160) |
| Keyword primario | Pass | Keywords incluidas naturalmente |
| Call to action | Needs Work | Solo `/precios` tiene CTA claro ("Prueba gratis 14 días") |
| Compelling | Pass | Descripciones informativas y relevantes |

**Recomendaciones específicas:**

- **Homepage**: Verificar que el meta description esté explícitamente definido (no se detectó en el HTML)
- **`/calculadora`**: Acortar de ~250 a 155 chars:
  > "Calcula gratis cuánto CO₂ evitas al reciclar. Factores EPA WARM + DEFRA por material. Ideal para gestoras, Ley REP y reportes NCG 519 en Chile."
- **Blog posts**: Agregar CTA al final de cada meta description (ej. "Lee la guía completa →")

---

### Jerarquía de Headings (H1-H6)

| Criterio | Estado | Detalle |
|---|---|---|
| H1 existe | Pass | Todas las páginas tienen exactamente un H1 |
| H1 contiene keyword | Pass | Keywords primarios en todos los H1 |
| H1 diferente del title | Pass | H1 y title son complementarios |
| Jerarquía lógica | Pass | H2 bajo H1, H3 bajo H2 correctamente |
| Subheadings descriptivos | Pass | H2s y H3s describen secciones claramente |
| Keywords en subheadings | Pass | Keywords secundarios distribuidos naturalmente |

**Evaluación por página:**
- **Homepage**: Excelente estructura con H1 persuasivo + H2s que cubren pain points, features, comparación, pricing y CTA
- **`/calculadora`**: Muy buena estructura con 14+ H2s incluyendo FAQs optimizadas para featured snippets
- **`/blog`**: Estructura correcta (H1 + H2s para cada artículo)
- **`/materiales`**: Buena taxonomía H2 (categorías) → H3 (materiales específicos)

---

### Optimización de Imágenes

| Criterio | Estado | Detalle |
|---|---|---|
| Alt text | **Fail** | Dashboard mockup y certificate demo SIN alt text |
| Alt text calidad | Needs Work | Logo tiene alt="CertiRecicla" (correcto), pero faltan alts descriptivos |
| File names | Needs Work | Nombres genéricos detectados (logo.png) |
| Lazy loading | Pass | Next.js maneja esto automáticamente |
| Responsive images | Pass | Next.js Image component con srcset |

**Imágenes sin alt text (prioridad alta):**
1. Dashboard screenshot/mockup — Sugerencia: `alt="Panel de control CertiRecicla mostrando métricas de reciclaje y CO₂ evitado"`
2. Certificate demo — Sugerencia: `alt="Ejemplo de certificado de reciclaje generado por CertiRecicla"`
3. Meta Pixel noscript img — Usar `alt=""` (decorativa)

---

### Internal Linking

| Criterio | Estado | Detalle |
|---|---|---|
| Links internos presentes | Pass | Navegación consistente en todas las páginas |
| Anchor text | Pass | Descriptivo y relevante |
| Deep linking | Needs Work | Blog posts no enlazan suficiente entre sí |
| Contexto relevante | Pass | Links contextuales a `/register` y `/calculadora` |
| Cantidad razonable | Pass | 10-15 links internos por página |
| Links rotos | Pass | No se detectaron 404s |

**Oportunidades de mejora:**
- Blog posts deberían cross-linkear más agresivamente entre artículos relacionados
- `/materiales` debería enlazar a blog posts relevantes para cada material
- Agregar links desde blog posts hacia `/materiales/[material]` específicos

---

### Estructura de URLs

| Criterio | Estado | Detalle |
|---|---|---|
| Legible | Pass | URLs limpias y descriptivas |
| Keywords | Pass | Keywords en URLs de blog y materiales |
| Largo | Pass | Todas bajo 75 caracteres |
| Guiones | Pass | Separados por guiones |
| Minúsculas | Pass | Todo en minúsculas |
| Sin parámetros | Pass | URLs limpias sin query strings |

**Estructura actual (excelente):**
```
certirecicla.cl/
├── calculadora
├── materiales/
│   └── [material-slug]
├── blog/
│   └── [post-slug]
├── precios
├── login
└── register
```

---

## Calidad de Contenido (E-E-A-T)

| Dimensión | Score | Evidencia |
|---|---|---|
| **Experience** | Weak | No hay casos de estudio reales, testimonios de clientes, o ejemplos de gestoras usando la plataforma. El contenido es informativo pero no demuestra experiencia de primera mano. |
| **Expertise** | Present | Contenido técnico sólido con referencias a GHG Protocol, ISO 14064, EPA WARM, DEFRA. Metodología detallada en calculadora. Pero falta autoría individual (no hay autores con nombre). |
| **Authoritativeness** | Weak | No hay author bylines con personas reales. Solo "CertiRecicla" como autor organizacional. No se detectaron backlinks, menciones en medios, o reconocimientos. |
| **Trustworthiness** | Present | HTTPS activo. Schema de Organization presente. Contacto por email (hola@certirecicla.cl). Pero falta: dirección física, política de privacidad visible, testimonios verificables. |

**Recomendaciones E-E-A-T (impacto alto):**

1. **Agregar author bylines reales** en blog posts con bio, foto, y credenciales (ej. "Ingeniero ambiental con 10 años en gestión de residuos")
2. **Publicar casos de estudio** de gestoras reales usando CertiRecicla (con datos, resultados, métricas)
3. **Agregar testimonios** con nombre, empresa, y foto del cliente
4. **Crear página About** con equipo, historia, y misión
5. **Agregar dirección física** en footer y schema Organization
6. **Política de privacidad y términos** visibles en footer

---

## Keyword Analysis

### Homepage

| Elemento | Evaluación |
|---|---|
| Keyword primario | "certificados de reciclaje" / "gestora de reciclaje" |
| Search intent | Comercial (comparar soluciones) |
| Keyword en title | Needs Work — H1 es persuasivo pero el title no se detectó claramente |
| Keyword en H1 | Parcial — "certificados" está en H2, no H1 |
| Keyword en first 100 words | Pass — Contexto claro desde el inicio |
| Keyword density | Adecuada (~1.5%) |

### Calculadora

| Elemento | Evaluación |
|---|---|
| Keyword primario | "calculadora CO₂ reciclaje" |
| Search intent | Informacional / Herramienta |
| Alineación de intent | Pass — Es una herramienta gratuita que responde a la búsqueda |
| Keyword placement | Excelente — En title, H1, meta, URL |

### Keywords Secundarios Recomendados

| Keyword | Presente | Página Ideal |
|---|---|---|
| certificado de valorización | Sí | Homepage, Blog |
| ley REP chile | Sí | Blog, Homepage |
| SINADER declaración | Sí | Blog |
| huella de carbono reciclaje | Parcial | Calculadora |
| gestora de residuos chile | Débil | Homepage |
| software gestión residuos | **No** | Homepage |
| plataforma reciclaje empresas | **No** | Homepage |
| certificado ambiental empresa | **No** | Blog |
| economía circular chile empresa | Sí | Blog |
| cumplimiento ambiental chile | Sí | Blog |

**Keywords faltantes de alto valor:**
- "software gestión residuos" — Agregar en homepage y meta
- "plataforma reciclaje empresas" — Incluir en homepage
- "sistema certificados reciclaje" — Variación a incluir

---

## SEO Técnico

### robots.txt
- [x] Existe y es accesible
- [x] Bloquea correctamente `/dashboard/`, `/api/`, `/portal/`
- [x] Apunta a sitemap.xml
- [x] No bloquea CSS/JS

**Status: Pass**

### XML Sitemap
- [x] Existe en `/sitemap.xml`
- [x] Contiene 20 URLs
- [x] URLs correctas y funcionales
- [ ] **Falta**: Las 19 páginas de `/materiales/[material]` no están en el sitemap
- [x] Fechas de modificación actualizadas

**Status: Needs Work** — El sitemap tiene 20 URLs pero falta incluir las ~19 páginas individuales de materiales. Esto deja ~19 páginas huérfanas del sitemap.

### Canonical Tags
- [x] Present en todas las páginas auditadas
- [x] Self-referencing correctamente
- [x] Consistentes con sitemap

**Status: Pass**

### Page Speed (evaluación basada en stack)
- **Framework**: Next.js (SSR/SSG) — Positivo para LCP y FCP
- **Hosting**: Vercel (CDN global) — Positivo para TTFB
- **Imágenes**: Next.js Image component — Optimización automática
- **JS Bundles**: 15+ chunks (code splitting activo) — Positivo para FID
- **Preocupaciones**: Meta Pixel puede impactar FID/INP

**Recomendación**: Ejecutar Lighthouse o PageSpeed Insights para métricas reales de Core Web Vitals.

### Mobile-Friendliness
- [x] Viewport meta tag (implícito por Next.js)
- [x] Framework responsive (Tailwind CSS probable)
- [ ] Verificar tap targets en mobile (no auditable remotamente)

**Status: Probable Pass** (requiere verificación manual)

---

## Content Gap Analysis

### Temas Faltantes de Alto Valor

| Tema Faltante | Volumen Estimado | Competencia | Tipo de Contenido | Prioridad |
|---|---|---|---|---|
| "Cómo obtener certificación ISO 14001 en Chile" | Alto | Media | Guía / Blog | 1 |
| "Software gestión de residuos comparativa" | Medio | Baja | Comparativa / Landing | 1 |
| "Qué es la NCG 519 y cómo cumplirla" | Medio | Baja | Guía / Blog | 2 |
| "Ejemplo reporte sustentabilidad Chile" | Medio | Media | Template / Blog | 2 |
| "Gestora de reciclaje: cómo empezar un negocio" | Medio | Baja | Guía / Blog | 3 |
| "RETC Chile: guía de declaración" | Medio | Baja | Guía / Blog | 3 |
| "Huella de carbono corporativa Chile" | Alto | Alta | Guía / Blog | 3 |
| "Diferencia entre reciclaje y valorización" | Bajo | Baja | Blog | 4 |
| "Residuos peligrosos DS 148 obligaciones" | Medio | Media | Guía / Blog | 4 |
| "Certificado SINADER vs certificado gestora" | Bajo | Baja | Blog | 5 |

### Temas Cubiertos (bien posicionados)
- Ley REP guía completa
- Declaración SINADER
- Economía circular Chile
- CO₂ evitado por material
- Certificados de reciclaje
- Trazabilidad digital de residuos
- Multas Ley REP

---

## Featured Snippet Opportunities

La página `/calculadora` ya está bien optimizada para featured snippets con su formato FAQ. Oportunidades adicionales:

| Query Target | Tipo de Snippet | Página | Acción |
|---|---|---|---|
| "cuánto CO₂ se ahorra reciclando" | Tabla | `/calculadora` | Ya tiene tabla — verificar formato |
| "qué es un certificado de reciclaje" | Párrafo | Blog post | Agregar respuesta concisa de 40-60 palabras inmediatamente después del H2 |
| "pasos para declarar en SINADER" | Lista ordenada | Blog post | Ya tiene formato de pasos — verificar `<ol>` |
| "materiales reciclables en Chile lista" | Lista | `/materiales` | Agregar lista resumen al inicio de la página |
| "multas ley REP montos" | Tabla | Blog post | Verificar que la tabla de multas sea HTML `<table>` |

---

## Schema Markup Audit

| Schema Type | Aplicable A | Estado | Calidad |
|---|---|---|---|
| Organization | Homepage | Present | Bueno — tiene name, url, description, foundingDate, areaServed |
| SoftwareApplication | Homepage | Present | Bueno — con offers y pricing |
| FAQPage | Homepage, Calculadora, Precios | Present | Excelente — múltiples Q&As |
| BlogPosting | Blog posts | Present | Bueno — datePublished, dateModified, wordCount |
| BreadcrumbList | Todas las páginas | Present | Bueno |
| ItemList | `/materiales` | Present | Bueno — 19 materiales listados |
| WebApplication | `/calculadora` | Present | Bueno — con features list |
| LocalBusiness | N/A | Missing | **Agregar si hay oficina física** |
| HowTo | Blog tutoriales | **Missing** | Agregar en posts tipo "cómo hacer X" |
| Product | `/precios` | Present | Bueno — 3 planes con precios |
| Review/AggregateRating | Precios/Home | **Missing** | Agregar cuando haya reviews reales |

**La implementación de Schema es una fortaleza del sitio.** Cobertura superior al promedio.

---

## Internal Linking Opportunities

### Estructura Actual
```
Homepage (hub principal)
├── /calculadora (herramienta — lead magnet)
├── /materiales (hub de contenido)
│   └── /materiales/[19 materiales] ← Sin cross-links al blog
├── /blog (hub de contenido)
│   └── /blog/[16 posts] ← Links limitados entre posts
├── /precios (conversión)
├── /login
└── /register
```

### Mejoras Recomendadas

1. **Blog → Materiales**: Cada post que mencione un material debería enlazar a `/materiales/[material]`
2. **Materiales → Blog**: Cada página de material debería enlazar a blog posts relacionados
3. **Blog → Blog (cross-linking)**: Crear clusters temáticos:
   - Cluster "Ley REP": ley-rep + multas + cumplimiento + certirecicla-automatiza
   - Cluster "Residuos": clasificación + plan-gestión + trazabilidad
   - Cluster "Industrias": minería + retail + alimentaria
4. **Calculadora → Blog**: Agregar links contextuales a posts relevantes debajo de la calculadora
5. **Blog → Calculadora**: Posts sobre CO₂ deberían enlazar directamente a la calculadora
6. **Footer links**: Agregar links a páginas clave de contenido en el footer

---

## Core Web Vitals — Evaluación de Impacto

### Stack Técnico (favorable)
- **Next.js + Vercel**: SSR/SSG + CDN global = TTFB y LCP optimizados
- **Image optimization**: Next.js Image component = LCP mejorado
- **Code splitting**: 15+ chunks = FID/INP reducido
- **Meta Pixel**: Único script de terceros detectado = impacto mínimo

### Impacto en Negocio (estimado)
- Si LCP < 2.5s: ~24% menos abandonos de página
- Si CLS < 0.1: ~15% menos bounce rate
- **Recomendación**: Ejecutar PageSpeed Insights y compartir resultados para métricas exactas

---

## Content Strategy Recommendations

### Cadencia de Publicación
- **Actual**: 16 blog posts (publicación aparentemente reciente/en lote)
- **Recomendada**: 2-3 posts/semana durante los primeros 3 meses, luego 1-2/semana
- **Priorizar**: Posts long-tail con baja competencia y alto business value

### Tipos de Contenido Prioritarios
1. **Casos de estudio** — Gestoras reales usando CertiRecicla (E-E-A-T boost)
2. **Comparativas** — CertiRecicla vs Excel vs otras soluciones
3. **Templates/herramientas** — Plantillas descargables de reportes
4. **Video tutoriales** — Demos de la plataforma (para Schema VideoObject)
5. **Guías regulatorias** — NCG 519, ISO 14001, RETC

### Content Update Strategy
- Actualizar posts existentes cada 3-6 meses con datos nuevos
- Agregar fecha de "última actualización" visible en cada post
- Mantener keywords con año actualizado (ej. "2026" → "2027")

---

## Recomendaciones Priorizadas

### Crítico (Corregir Inmediatamente)

1. **Eliminar brand name duplicado en title tags** — "| CertiRecicla | CertiRecicla" aparece en al menos 4 páginas. Impacto: cada impresión en Google se ve poco profesional y desperdicia caracteres valiosos del título. **Esfuerzo: 15 minutos.**

2. **Agregar alt text a TODAS las imágenes** — Dashboard mockup y certificate demo no tienen alt text. Impacta accesibilidad y SEO de imágenes. **Esfuerzo: 30 minutos.**

3. **Agregar páginas de `/materiales/[material]` al sitemap.xml** — ~19 páginas indexables que Google podría no encontrar eficientemente. **Esfuerzo: 15 minutos.**

### Alta Prioridad (Este Mes)

4. **Agregar author bylines reales** en blog posts con nombre, foto, bio, y credenciales. Impacto directo en E-E-A-T y confianza de Google. **Esfuerzo: 2-3 horas.**

5. **Acortar meta descriptions** que excedan 160 caracteres (especialmente `/calculadora`). Los meta truncados en SERPs reducen CTR. **Esfuerzo: 30 minutos.**

6. **Implementar cross-linking entre blog posts** — Crear clusters temáticos con 3-5 links internos por post. Mejora distribución de PageRank y tiempo en sitio. **Esfuerzo: 2-3 horas.**

7. **Agregar página "Nosotros" (About)** con equipo, misión, dirección. Señal E-E-A-T crítica. **Esfuerzo: 2-3 horas.**

8. **Agregar links de materiales ↔ blog** — Cada material enlace a posts relevantes y viceversa. **Esfuerzo: 2 horas.**

### Prioridad Media (Este Trimestre)

9. **Publicar 3-5 casos de estudio** de gestoras reales — Señal de Experience más fuerte para E-E-A-T. **Esfuerzo: 1 semana.**

10. **Crear contenido para keywords faltantes** — "software gestión residuos", "NCG 519 guía", "ISO 14001 Chile". **Esfuerzo: 1-2 semanas.**

11. **Agregar Schema HowTo** en posts tutoriales — Oportunidad de rich results en Google. **Esfuerzo: 1-2 horas.**

12. **Agregar política de privacidad y términos de uso** — Señal de Trustworthiness. **Esfuerzo: 2-3 horas.**

13. **Verificar Google Search Console** — Asegurar que el sitio esté registrado y el sitemap enviado. **Esfuerzo: 30 minutos.**

14. **Implementar Google Analytics 4** — Solo se detectó Meta Pixel. Sin GA4 no hay datos de comportamiento orgánico. **Esfuerzo: 30 minutos.**

### Prioridad Baja (Cuando Haya Recursos)

15. **Agregar testimonios/reviews con Schema AggregateRating** — Rich stars en SERPs aumentan CTR. **Esfuerzo: variable.**

16. **Crear perfiles sociales** (LinkedIn empresa, Twitter/X) y enlazar desde el sitio — Señal de legitimidad. **Esfuerzo: 2-3 horas.**

17. **Implementar hreflang** si se planea expansión a otros países. **Esfuerzo: 1 hora.**

18. **Agregar video tutoriales** con Schema VideoObject — Oportunidad de aparecer en Video results. **Esfuerzo: variable.**

---

## Resumen Ejecutivo

**CertiRecicla tiene una base SEO sólida**, especialmente en:
- Estructura de URLs limpia y lógica
- Schema markup comprensivo (superior al promedio de la industria)
- Contenido técnico de calidad con buena jerarquía de headings
- robots.txt y sitemap correctamente configurados
- Stack técnico favorable (Next.js + Vercel)

**Las mayores oportunidades de mejora** están en:
- **Title tags duplicados** (fix rápido, alto impacto visual en SERPs)
- **E-E-A-T débil** (sin autores reales, sin casos de estudio, sin testimonios)
- **Internal linking insuficiente** entre clusters de contenido
- **Content gaps** en keywords de alto valor comercial
- **Tracking incompleto** (falta GA4, solo Meta Pixel)

**ROI estimado de las correcciones críticas:**
- Corregir titles duplicados → +10-15% CTR en SERPs
- Agregar alt text → Mejor indexación de imágenes + accesibilidad
- Completar sitemap → ~19 páginas más descubiertas por Google
- Mejorar E-E-A-T → Impacto acumulativo en rankings a 3-6 meses
