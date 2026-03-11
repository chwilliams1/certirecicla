import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Droplets, Factory } from "lucide-react";
import {
  MATERIALS,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  type MaterialCategory,
} from "@/lib/materials-data";

export default function MaterialesPage() {
  const grouped = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      const items = MATERIALS.filter((m) => m.category === cat);
      if (items.length > 0) acc.push({ category: cat, items });
      return acc;
    },
    [] as { category: MaterialCategory; items: typeof MATERIALS }[]
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: "Materiales Reciclables en Chile",
        description:
          "Guia completa de materiales reciclables: como reciclarlos, impacto ambiental y tips practicos.",
        numberOfItems: MATERIALS.length,
        itemListElement: MATERIALS.map((m, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: m.name,
          url: `https://certirecicla.cl/materiales/${m.slug}`,
        })),
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
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="CertiRecicla"
              width={36}
              height={36}
              className="animate-breathe"
            />
            <span className="font-serif text-sage-800 font-bold">CertiRecicla</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/calculadora"
              className="text-sm text-muted-foreground hover:text-sage-600 transition-colors"
            >
              Calculadora
            </Link>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-sage-600 transition-colors"
            >
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

      <main className="container mx-auto px-6 py-10 md:py-14 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-sage-800 leading-tight mb-4">
            Guia de Materiales Reciclables
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conoce el impacto ambiental de reciclar cada material: CO&#x2082; evitado,
            agua ahorrada, proceso de reciclaje y tips practicos para empresas y hogares
            en Chile.
          </p>
        </div>

        {/* Categories */}
        {grouped.map(({ category, items }) => (
          <section key={category} className="mb-12">
            <h2 className="text-xl font-serif text-sage-800 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-sage-500 rounded-full" />
              {CATEGORY_LABELS[category]}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((material) => (
                <Link
                  key={material.slug}
                  href={`/materiales/${material.slug}`}
                  className="group block"
                >
                  <div className="bg-white border border-border/50 rounded-xl p-5 hover:border-sage-300 hover:shadow-sm transition-all h-full flex flex-col">
                    <h3 className="font-serif text-sage-800 group-hover:text-sage-600 transition-colors mb-2">
                      {material.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {material.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Factory className="h-3.5 w-3.5 text-sage-500" />
                        {material.co2Factor} kg CO&#x2082;/kg
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                        {material.waterFactor} L/kg
                      </span>
                    </div>

                    <span className="text-xs text-sage-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver guia completa
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* CTA Calculadora */}
        <div className="bg-sage-500 rounded-xl p-8 text-center text-white">
          <Leaf className="h-8 w-8 mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-serif mb-2">
            Calcula tu impacto ambiental
          </h2>
          <p className="text-sage-100 text-sm mb-5 max-w-lg mx-auto">
            Usa nuestra calculadora gratuita para conocer el CO&#x2082; evitado,
            agua ahorrada y ecoequivalencias de tu reciclaje.
          </p>
          <Link
            href="/calculadora"
            className="inline-block bg-white text-sage-700 font-medium px-6 py-2.5 rounded-lg hover:bg-sage-50 transition-colors text-sm"
          >
            Ir a la calculadora
          </Link>
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
