import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public-header";
import {
  ArrowRight,
  ChevronRight,
  Factory,
  Droplets,
  Lightbulb,
  Recycle,
  CheckCircle2,
  Leaf,
  BookOpen,
} from "lucide-react";
import {
  MATERIALS,
  getMaterialBySlug,
  getRelatedMaterials,
  type MaterialCategory,
} from "@/lib/materials-data";
import { calculateEquivalencies } from "@/lib/co2-calculator";
import { blogArticles } from "@/lib/blog/articles";

interface Props {
  params: { material: string };
}

export function generateStaticParams() {
  return MATERIALS.map((m) => ({ material: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const material = getMaterialBySlug(params.material);
  if (!material) return {};

  const url = `https://certirecicla.cl/materiales/${material.slug}`;
  const title = `Reciclaje de ${material.name} en Chile — Guía Completa`;
  const description = `${material.description} Evita ${material.co2Factor} kg de CO2 y ahorra ${material.waterFactor} litros de agua por cada kg reciclado.`;

  return {
    title,
    description,
    keywords: material.keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `Reciclaje de ${material.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function ImpactTable({
  name,
  co2Factor,
  waterFactor,
}: {
  name: string;
  co2Factor: number;
  waterFactor: number;
}) {
  const quantities = [100, 500, 1000];
  const refCo2 = 1000 * co2Factor;
  const eq = calculateEquivalencies(refCo2);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
        <div className="bg-sage-50 px-5 py-3 border-b border-border/50">
          <h3 className="font-serif text-sage-800 text-sm">
            Impacto al reciclar {name}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Cantidad (kg)</th>
                <th className="px-5 py-2.5 font-medium">
                  CO&#x2082; evitado (kg)
                </th>
                <th className="px-5 py-2.5 font-medium">Agua ahorrada (L)</th>
              </tr>
            </thead>
            <tbody>
              {quantities.map((qty) => (
                <tr
                  key={qty}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-5 py-2.5 font-medium text-sage-800">
                    {qty.toLocaleString("es-CL")} kg
                  </td>
                  <td className="px-5 py-2.5 text-sage-600">
                    {(qty * co2Factor).toLocaleString("es-CL", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    kg
                  </td>
                  <td className="px-5 py-2.5 text-blue-600">
                    {(qty * waterFactor).toLocaleString("es-CL", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    L
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ecoequivalencias */}
      <div className="bg-white border border-border/50 rounded-xl p-5">
        <h3 className="font-serif text-sage-800 text-sm mb-3">
          Ecoequivalencias al reciclar 1 tonelada de {name}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-700">{eq.trees.toLocaleString("es-CL")}</p>
            <p className="text-xs text-green-600">árboles equivalentes</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-blue-700">{eq.kmNotDriven.toLocaleString("es-CL")}</p>
            <p className="text-xs text-blue-600">km no recorridos en auto</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-purple-700">{eq.smartphonesCharged.toLocaleString("es-CL")}</p>
            <p className="text-xs text-purple-600">smartphones cargados</p>
          </div>
          <div className="bg-cyan-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-cyan-700">{(1000 * waterFactor).toLocaleString("es-CL")}</p>
            <p className="text-xs text-cyan-600">litros de agua ahorrados</p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Fuentes: EPA GHG Equivalencies Calculator (nov 2024), DEFRA 2025.
        </p>
      </div>
    </div>
  );
}

const CATEGORY_BLOG_SLUGS: Record<MaterialCategory, string[]> = {
  Plastico: [
    "co2-evitado-reciclaje-tabla-materiales",
    "que-es-certificado-de-reciclaje",
    "reciclaje-retail-supermercados-chile",
    "ley-rep-chile-guia-completa",
  ],
  "Papel y Carton": [
    "co2-evitado-reciclaje-tabla-materiales",
    "reciclaje-retail-supermercados-chile",
    "que-es-certificado-de-reciclaje",
    "economia-circular-chile-impacto-empresas",
  ],
  Vidrio: [
    "co2-evitado-reciclaje-tabla-materiales",
    "reciclaje-retail-supermercados-chile",
    "que-es-certificado-de-reciclaje",
    "ley-rep-chile-guia-completa",
  ],
  Metal: [
    "co2-evitado-reciclaje-tabla-materiales",
    "reciclaje-industria-minera-chile",
    "que-es-certificado-de-reciclaje",
    "clasificacion-residuos-industriales-chile",
  ],
  Organico: [
    "reciclaje-industria-alimentaria-chile",
    "economia-circular-chile-impacto-empresas",
    "co2-evitado-reciclaje-tabla-materiales",
    "plan-gestion-residuos-empresa",
  ],
  Especial: [
    "clasificacion-residuos-industriales-chile",
    "reciclaje-industria-minera-chile",
    "trazabilidad-residuos-digital-chile",
    "ley-rep-chile-guia-completa",
  ],
};

function getRelatedBlogPosts(category: MaterialCategory) {
  const slugs = CATEGORY_BLOG_SLUGS[category] ?? [];
  return slugs
    .map((slug) => blogArticles.find((a) => a.slug === slug))
    .filter(Boolean)
    .slice(0, 3);
}

export default function MaterialPage({ params }: Props) {
  const material = getMaterialBySlug(params.material);
  if (!material) notFound();

  const related = getRelatedMaterials(material.slug, 3);
  const relatedPosts = getRelatedBlogPosts(material.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `Reciclaje de ${material.name} en Chile`,
        description: material.description,
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
          "@id": `https://certirecicla.cl/materiales/${material.slug}`,
        },
        image: {
          "@type": "ImageObject",
          url: "https://certirecicla.cl/og-image.png",
          width: 1200,
          height: 630,
        },
        keywords: material.keywords.join(", "),
        inLanguage: "es",
        about: {
          "@type": "Thing",
          name: material.name,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: "https://certirecicla.cl",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Materiales",
            item: "https://certirecicla.cl/materiales",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: material.name,
            item: `https://certirecicla.cl/materiales/${material.slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: material.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader activePage="Materiales" />

      <main className="container mx-auto px-6 py-10 md:py-14 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-8">
          <Link
            href="/"
            className="hover:text-sage-600 transition-colors"
          >
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href="/materiales"
            className="hover:text-sage-600 transition-colors"
          >
            Materiales
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-sage-800 font-medium">{material.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* Main content */}
          <div>
            {/* Category badge */}
            <span className="inline-block bg-sage-50 text-sage-700 px-2.5 py-0.5 rounded-full font-medium text-xs mb-4">
              {material.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-serif text-sage-800 leading-tight mb-6">
              Reciclaje de {material.name} en Chile
            </h1>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {material.description}
            </p>

            {/* Impact card */}
            <div className="bg-white border border-border/50 rounded-xl p-5 mb-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center">
                  <Factory className="h-5 w-5 text-sage-600" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-sage-800">
                    {material.co2Factor}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    kg CO&#x2082; evitado/kg
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-serif text-sage-800">
                    {material.waterFactor}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    litros agua ahorrada/kg
                  </p>
                </div>
              </div>
            </div>

            {/* Recycling process */}
            <section className="mb-8">
              <h2 className="text-xl font-serif text-sage-800 mb-3 flex items-center gap-2">
                <Recycle className="h-5 w-5 text-sage-500" />
                ¿Cómo se recicla el {material.name.toLowerCase()}?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {material.recyclingProcess}
              </p>
            </section>

            {/* Tips */}
            <section className="mb-8">
              <h2 className="text-xl font-serif text-sage-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-sage-500" />
                Tips para reciclar {material.name.toLowerCase()}
              </h2>
              <ul className="space-y-2">
                {material.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-muted-foreground text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>

            {/* Fun fact */}
            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-5 mb-8">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-serif text-sage-800 text-sm font-medium mb-1">
                    Dato curioso
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {material.funFact}
                  </p>
                </div>
              </div>
            </div>

            {/* Impact table (mini calculator) */}
            <section className="mb-8">
              <h2 className="text-xl font-serif text-sage-800 mb-3">
                Calcula el impacto de reciclar {material.name.toLowerCase()}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Así se traduce el reciclaje de {material.name.toLowerCase()} en
                impacto ambiental concreto:
              </p>
              <ImpactTable
                name={material.name.toLowerCase()}
                co2Factor={material.co2Factor}
                waterFactor={material.waterFactor}
              />
            </section>

            {/* FAQs */}
            {material.faqs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-serif text-sage-800 mb-4">
                  Preguntas frecuentes
                </h2>
                <div className="space-y-4">
                  {material.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="bg-white border border-border/50 rounded-xl p-5"
                    >
                      <h3 className="font-serif text-sage-800 text-sm mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related blog posts */}
            {relatedPosts.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-serif text-sage-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-sage-500" />
                  Artículos relacionados
                </h2>
                <div className="space-y-3">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post!.slug}
                      href={`/blog/${post!.slug}`}
                      className="group block bg-white border border-border/50 rounded-xl p-4 hover:border-sage-300 transition-all"
                    >
                      <span className="text-xs text-sage-600 font-medium">
                        {post!.category} · {post!.readingTime} min lectura
                      </span>
                      <h3 className="text-sm font-serif text-sage-800 group-hover:text-sage-600 transition-colors mt-1">
                        {post!.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                href={`/calculadora`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-sage-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-sage-600 transition-colors text-sm"
              >
                <Factory className="h-4 w-4" />
                Calcular mi impacto con {material.name}
              </Link>
              <Link
                href="/register"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-sage-300 text-sage-700 font-medium px-6 py-3 rounded-lg hover:bg-sage-50 transition-colors text-sm"
              >
                <Leaf className="h-4 w-4" />
                Certificar mi reciclaje
              </Link>
            </div>
          </div>

          {/* Sidebar — Related materials */}
          <aside className="lg:mt-0 mt-8">
            <div className="lg:sticky lg:top-24">
              <h3 className="text-sm font-serif text-sage-800 mb-3">
                Materiales relacionados
              </h3>
              <div className="space-y-3">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/materiales/${rel.slug}`}
                    className="group block"
                  >
                    <div className="bg-white border border-border/50 rounded-xl p-4 hover:border-sage-300 transition-all">
                      <span className="text-xs text-sage-600 font-medium">
                        {rel.category}
                      </span>
                      <h4 className="text-sm font-serif text-sage-800 group-hover:text-sage-600 transition-colors mt-1">
                        {rel.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{rel.co2Factor} kg CO&#x2082;/kg</span>
                        <span>{rel.waterFactor} L/kg</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Sidebar CTA */}
              <div className="mt-6 bg-sage-500 rounded-xl p-5 text-white text-center">
                <p className="font-serif text-sm mb-2">
                  Gestiona tu reciclaje
                </p>
                <p className="text-xs text-sage-100 mb-3">
                  Certificados digitales con cálculo de CO&#x2082; verificable.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 bg-white text-sage-700 font-medium px-4 py-2 rounded-lg hover:bg-sage-50 transition-colors text-xs"
                >
                  Prueba gratis 14 días
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CertiRecicla. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
