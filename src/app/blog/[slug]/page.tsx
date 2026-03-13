import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, RefreshCw, List, Download } from "lucide-react";
import { blogArticles, getArticleBySlug } from "@/lib/blog/articles";
import { getArticleContent } from "@/lib/blog/content";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return {};

  const url = `https://certirecicla.cl/blog/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updatedDate ?? article.date,
      authors: ["CertiRecicla"],
      tags: article.keywords,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

// ---------------------------------------------------------------------------
// TOC helpers
// ---------------------------------------------------------------------------
function extractHeadings(html: string): { id: string; text: string }[] {
  const headings: { id: string; text: string }[] = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, "").trim();
    const id = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    headings.push({ id, text });
  }
  return headings;
}

function injectHeadingIds(html: string, headings: { id: string; text: string }[]): string {
  let idx = 0;
  return html.replace(/<h2([^>]*)>/gi, (full, attrs) => {
    const heading = headings[idx++];
    if (!heading) return full;
    return `<h2${attrs} id="${heading.id}">`;
  });
}

// ---------------------------------------------------------------------------
// Contextual lead magnet
// ---------------------------------------------------------------------------
type LeadMagnet = {
  title: string;
  description: string;
  type: string; // matches /api/lead-magnets/[type]
};

function getLeadMagnet(_slug: string, category: string): LeadMagnet {
  switch (category) {
    case "Regulación":
      return {
        title: "Checklist: 10 pasos para cumplir la Ley REP",
        description:
          "Descarga la guía práctica con los 10 pasos esenciales, plazos 2026, checklist de documentos y errores que cuestan multas.",
        type: "checklist-ley-rep",
      };
    case "Industria":
      return {
        title: "Guía: Clasificación de residuos industriales en Chile",
        description:
          "Tabla de categorías, características DS 148, árbol de decisión y requisitos de almacenamiento para clasificar correctamente tus residuos.",
        type: "guia-clasificacion-residuos",
      };
    case "Sustentabilidad":
      return {
        title: "Checklist: Preparar una auditoría ambiental ISO 14001",
        description:
          "Los 12 puntos que el auditor revisará, documentos que pedirá y los 5 errores más comunes que debes evitar.",
        type: "checklist-auditoria-ambiental",
      };
    case "Gestión":
      return {
        title: "Guía: 7 estrategias para reducir costos en residuos",
        description:
          "Estrategias con ROI estimado, costos comparativos por material y quick wins que ahorran desde el día 1.",
        type: "guia-reducir-costos-residuos",
      };
    // Huella de carbono, Tecnología, Certificados, Producto, and default
    default:
      return {
        title: "Tabla completa: Factores de CO₂ por material reciclado",
        description:
          "Factores EPA WARM, DEFRA y CertiRecicla para 13 materiales, eco-equivalencias y guía de uso en reportes de sustentabilidad.",
        type: "tabla-factores-co2",
      };
  }
}

// ---------------------------------------------------------------------------
// Contextual CTA
// ---------------------------------------------------------------------------
function getContextualCta(slug: string, category: string): {
  title: string;
  description: string;
  href: string;
  buttonText: string;
} {
  // SINADER / Ley REP
  if (slug.includes("sinader") || slug.includes("ley-rep")) {
    return {
      title: "Exporta a SINADER automáticamente",
      description: "CertiRecicla exporta tus datos a SINADER con un clic. Sin planillas, sin errores.",
      href: "/register",
      buttonText: "Prueba gratis 14 días",
    };
  }
  // Certificados
  if (slug.includes("certificado") && !slug.includes("cumplimiento")) {
    return {
      title: "Genera certificados profesionales en minutos",
      description: "Certificados PDF con CO\u2082 verificable, listos para auditorías y clientes.",
      href: "/register",
      buttonText: "Prueba gratis 14 días",
    };
  }
  // CO2 / impacto
  if (slug.includes("co2") || slug.includes("impacto") || category === "Huella de carbono") {
    return {
      title: "Calcula tu impacto con datos verificados",
      description: "Usa nuestra calculadora gratuita con factores EPA WARM y DEFRA actualizados.",
      href: "/calculadora",
      buttonText: "Ir a la calculadora",
    };
  }
  // Gestión residuos / clasificación
  if (slug.includes("gestion-residuos") || slug.includes("clasificacion") || slug.includes("proveedor-reciclaje") || category === "Gestión") {
    return {
      title: "Digitaliza tu gestión de residuos",
      description: "Gestiona clientes, retiros y certificados desde una sola plataforma.",
      href: "/register",
      buttonText: "Prueba gratis 14 días",
    };
  }
  // Trazabilidad
  if (slug.includes("trazabilidad")) {
    return {
      title: "Trazabilidad digital de extremo a extremo",
      description: "Registra cada retiro, genera certificados y demuestra cumplimiento con trazabilidad completa.",
      href: "/register",
      buttonText: "Prueba gratis 14 días",
    };
  }
  // Industria / vertical
  if (slug.includes("minera") || slug.includes("retail") || slug.includes("alimentaria")) {
    return {
      title: "Certificados de reciclaje para tu industria",
      description: "CertiRecicla genera certificados con CO\u2082 verificable adaptados a los requisitos de tu sector.",
      href: "/register",
      buttonText: "Prueba gratis 14 días",
    };
  }
  // BOFU / producto
  if (slug.includes("certirecicla") || slug.includes("automatiza")) {
    return {
      title: "Empieza gratis hoy",
      description: "14 días de prueba sin tarjeta de crédito. Configura tu cuenta en 5 minutos.",
      href: "/register",
      buttonText: "Crear cuenta gratis",
    };
  }
  // Default
  return {
    title: "Digitaliza tus certificados de reciclaje",
    description: "CertiRecicla genera certificados con CO\u2082 verificable, gestiona clientes y exporta a SINADER.",
    href: "/register",
    buttonText: "Prueba gratis 14 días",
  };
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const rawContent = getArticleContent(params.slug);
  if (!rawContent) notFound();

  const headings = extractHeadings(rawContent);
  const content = injectHeadingIds(rawContent, headings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        dateModified: article.updatedDate ?? article.date,
        author: {
          "@type": "Organization",
          name: "CertiRecicla",
          url: "https://certirecicla.cl",
          logo: {
            "@type": "ImageObject",
            url: "https://certirecicla.cl/logo.png",
          },
        },
        publisher: {
          "@type": "Organization",
          name: "CertiRecicla",
          url: "https://certirecicla.cl",
          logo: {
            "@type": "ImageObject",
            url: "https://certirecicla.cl/logo.png",
            width: 200,
            height: 200,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://certirecicla.cl/blog/${article.slug}`,
        },
        image: {
          "@type": "ImageObject",
          url: "https://certirecicla.cl/og-image.png",
          width: 1200,
          height: 630,
        },
        keywords: article.keywords.join(", "),
        inLanguage: "es",
        articleSection: article.category,
        wordCount: article.readingTime * 200,
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: "https://certirecicla.cl" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://certirecicla.cl/blog" },
          { "@type": "ListItem", position: 3, name: article.title, item: `https://certirecicla.cl/blog/${article.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CertiRecicla" width={36} height={36} className="animate-breathe" />
            <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/calculadora" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors hidden sm:inline">Calculadora</Link>
            <Link href="/materiales" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors hidden sm:inline">Materiales</Link>
            <Link href="/blog" className="text-sm text-sage-700 font-medium hidden sm:inline">Blog</Link>
            <Link href="/precios" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors hidden sm:inline">Precios</Link>
            <Link href="/register" className="text-sm bg-sage-500 text-white px-4 py-2 rounded-lg hover:bg-sage-600 transition-colors">Prueba gratis</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 md:py-14 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-sage-600 transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al blog
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mb-4">
              <span className="bg-sage-50 text-sage-700 px-2.5 py-0.5 rounded-full font-medium">
                {article.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">{new Date(article.date).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span className="sm:hidden">{new Date(article.date).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}</span>
              </span>
              {article.updatedDate && article.updatedDate !== article.date && (
                <span className="flex items-center gap-1 text-sage-600">
                  <RefreshCw className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    Actualizado {new Date(article.updatedDate).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span className="sm:hidden">
                    Act. {new Date(article.updatedDate).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-sage-800 leading-tight">
              {article.title}
            </h1>
          </header>

          {/* Table of Contents */}
          {headings.length >= 3 && (
            <nav className="bg-white border border-border/50 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-2 text-sm font-medium text-sage-800 mb-3">
                <List className="h-4 w-4" />
                Contenido del artículo
              </div>
              <ol className="space-y-1.5">
                {headings.map((h, i) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="text-sm text-muted-foreground hover:text-sage-600 transition-colors flex items-baseline gap-2"
                    >
                      <span className="text-sage-400 text-xs font-mono w-4 shrink-0">{i + 1}.</span>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div
            className="prose prose-sage max-w-none prose-headings:font-serif prose-headings:text-sage-800 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-sage-800 prose-a:text-sage-600 prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-th:bg-sage-50 prose-th:text-sage-800 prose-td:border-border/50 prose-headings:scroll-mt-20"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>

        {/* Lead Magnet */}
        {(() => {
          const lm = getLeadMagnet(article.slug, article.category);
          return (
            <div className="mt-10 bg-gradient-to-br from-sage-50 to-sand-100 border border-sage-200 rounded-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-sage-500 rounded-lg p-3 shrink-0">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif text-sage-800 mb-1">
                    {lm.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lm.description}
                  </p>
                </div>
                <a
                  href={`/api/lead-magnets/${lm.type}`}
                  download
                  className="inline-flex items-center gap-2 bg-sage-500 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-sage-600 transition-colors text-sm shrink-0"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </a>
              </div>
            </div>
          );
        })()}

        {/* CTA */}
        {(() => {
          const cta = getContextualCta(article.slug, article.category);
          return (
            <div className="mt-8 bg-sage-500 rounded-xl p-6 sm:p-8 text-center text-white">
              <h2 className="text-xl font-serif mb-2">{cta.title}</h2>
              <p className="text-sage-100 text-sm mb-5">{cta.description}</p>
              <Link
                href={cta.href}
                className="inline-block bg-white text-sage-700 font-medium px-6 py-2.5 rounded-lg hover:bg-sage-50 transition-colors text-sm"
              >
                {cta.buttonText}
              </Link>
            </div>
          );
        })()}

        {/* Related articles */}
        <div className="mt-12">
          <h3 className="text-lg font-serif text-sage-800 mb-4">Artículos relacionados</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {blogArticles
              .filter((a) => a.slug !== article.slug && a.category === article.category)
              .slice(0, 2)
              .concat(
                blogArticles
                  .filter((a) => a.slug !== article.slug && a.category !== article.category)
                  .slice(0, 2 - blogArticles.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 2).length)
              )
              .slice(0, 2)
              .map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="block group">
                  <div className="bg-white border border-border/50 rounded-lg p-4 hover:border-sage-300 transition-all">
                    <span className="text-xs text-sage-600 font-medium">{related.category}</span>
                    <h4 className="text-sm font-serif text-sage-800 group-hover:text-sage-600 transition-colors mt-1 line-clamp-2">
                      {related.title}
                    </h4>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CertiRecicla. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
