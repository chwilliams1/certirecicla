import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
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

  const content = getArticleContent(params.slug);
  if (!content) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        datePublished: article.date,
        dateModified: article.date,
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
            <Link href="/precios" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors hidden sm:inline">
              Precios
            </Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors">
              Blog
            </Link>
            <Link
              href="/register"
              className="text-sm bg-sage-500 text-white px-4 py-2 rounded-lg hover:bg-sage-600 transition-colors"
            >
              Prueba gratis
            </Link>
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="bg-sage-50 text-sage-700 px-2.5 py-0.5 rounded-full font-medium">
                {article.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min lectura
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.date).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-sage-800 leading-tight">
              {article.title}
            </h1>
          </header>

          <div
            className="prose prose-sage max-w-none prose-headings:font-serif prose-headings:text-sage-800 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-sage-800 prose-a:text-sage-600 prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-th:bg-sage-50 prose-th:text-sage-800 prose-td:border-border/50"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>

        {/* CTA */}
        {(() => {
          const cta = getContextualCta(article.slug, article.category);
          return (
            <div className="mt-12 bg-sage-500 rounded-xl p-8 text-center text-white">
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
