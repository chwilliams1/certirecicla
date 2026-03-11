import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, ArrowLeft } from "lucide-react";
import { blogArticles } from "@/lib/blog/articles";

const blogJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      name: "Blog de Reciclaje y Gestión de Residuos — CertiRecicla",
      description:
        "Artículos y guías sobre reciclaje, Ley REP, SINADER, huella de carbono, economía circular y sustentabilidad empresarial en Chile.",
      url: "https://certirecicla.cl/blog",
      inLanguage: "es",
      publisher: {
        "@type": "Organization",
        name: "CertiRecicla",
        url: "https://certirecicla.cl",
        logo: { "@type": "ImageObject", url: "https://certirecicla.cl/logo.png" },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: "https://certirecicla.cl" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://certirecicla.cl/blog" },
      ],
    },
  ],
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />

      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="CertiRecicla" width={36} height={36} className="animate-breathe" />
            <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-sage-600 transition-colors">
              Inicio
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

      <main className="container mx-auto px-6 py-12 md:py-16 max-w-4xl">
        <div className="mb-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-sage-600 transition-colors">Inicio</Link>
            <span className="mx-1.5">/</span>
            <span className="text-sage-700">Blog</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-sage-800 mb-3">
            Blog de Reciclaje y Gestión de Residuos en Chile
          </h1>
          <p className="text-muted-foreground text-lg">
            Guías prácticas sobre reciclaje, Ley REP, SINADER, economía circular, huella de carbono y sustentabilidad empresarial.
          </p>
        </div>

        <div className="space-y-6">
          {blogArticles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="block group">
              <article className="bg-white border border-border/50 rounded-xl p-6 hover:border-sage-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="bg-sage-50 text-sage-700 px-2.5 py-0.5 rounded-full font-medium">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readingTime} min lectura
                  </span>
                  <span>{new Date(article.date).toLocaleDateString("es-CL", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <h2 className="text-xl font-serif text-sage-800 group-hover:text-sage-600 transition-colors mb-2">
                  {article.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {article.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-sage-600 font-medium">
                  Leer artículo <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </article>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
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
