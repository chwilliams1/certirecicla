import Link from "next/link";
import Image from "next/image";
import { Check, X, ArrowRight } from "lucide-react";
import PublicHeader from "@/components/public-header";
import { PLANS, type PlanType } from "@/lib/plans";
import { TrackPricingView } from "@/components/track-page-view";

const planOrder: PlanType[] = ["starter", "profesional", "business"];

const featureRows: {
  label: string;
  getValue: (plan: (typeof PLANS)[PlanType]) => string | boolean;
}[] = [
  {
    label: "Clientes",
    getValue: (p) => `Hasta ${p.maxClients}`,
  },
  {
    label: "Certificados / mes",
    getValue: (p) =>
      p.maxCertificatesPerMonth === -1
        ? "Ilimitados"
        : `${p.maxCertificatesPerMonth}`,
  },
  {
    label: "Usuarios",
    getValue: (p) =>
      p.maxUsers === -1 ? "Ilimitados" : `${p.maxUsers}`,
  },
  { label: "Sub-clientes (sucursales)", getValue: (p) => p.subClients },
  { label: "Portal de clientes", getValue: (p) => p.clientPortal },
  {
    label: "Reportes avanzados",
    getValue: (p) => p.fullReports,
  },
  { label: "Exportación SINADER", getValue: (p) => p.sinaderExport },
  {
    label: "Branding en certificados",
    getValue: (p) => p.customBranding,
  },
];

const faqs = [
  {
    q: "¿Puedo probar CertiRecicla gratis?",
    a: "Sí. Todos los planes incluyen una prueba gratuita de 14 días con acceso completo al plan Profesional. No necesitas tarjeta de crédito para empezar.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí. No hay permanencia mínima ni cláusulas de salida. Puedes cancelar tu suscripción cuando quieras desde la sección de facturación en tu dashboard.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de Reveniu, procesador de pagos certificado en Chile.",
  },
  {
    q: "¿Puedo cambiar de plan después?",
    a: "Sí. Puedes subir o bajar de plan en cualquier momento. El cambio se aplica de inmediato y se ajusta el cobro proporcionalmente.",
  },
  {
    q: "¿Los precios incluyen IVA?",
    a: "Los precios mostrados no incluyen IVA. El impuesto se agrega al momento del pago según la normativa vigente.",
  },
  {
    q: "¿Qué pasa con mis datos si cancelo?",
    a: "Tus datos se mantienen disponibles durante 30 días después de la cancelación. Puedes exportar toda tu información en cualquier momento antes de que se eliminen.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    ...planOrder.map((key) => {
      const plan = PLANS[key];
      return {
        "@type": "Product",
        name: `CertiRecicla ${plan.displayName}`,
        description: plan.description,
        brand: { "@type": "Brand", name: "CertiRecicla" },
        offers: {
          "@type": "Offer",
          price: plan.priceClp.toString(),
          priceCurrency: "CLP",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
          url: "https://certirecicla.cl/register",
          seller: {
            "@type": "Organization",
            name: "CertiRecicla",
            url: "https://certirecicla.cl",
          },
        },
      };
    }),
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
          name: "Precios",
          item: "https://certirecicla.cl/precios",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    },
  ],
};

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-sand-50">
      <TrackPricingView />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader activePage="Precios" />

      <main className="container mx-auto px-6 py-10 md:py-14 max-w-6xl">
        {/* Breadcrumb + Hero */}
        <div className="text-center mb-12">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-muted-foreground mb-4"
          >
            <Link
              href="/"
              className="hover:text-sage-600 transition-colors"
            >
              Inicio
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-sage-700">Precios</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-sage-800 mb-3">
            Planes y precios
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Prueba gratis durante 14 días con acceso completo al plan
            Profesional.{" "}
            <strong className="text-sage-700">
              Sin tarjeta de crédito.
            </strong>
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {planOrder.map((planKey) => {
            const plan = PLANS[planKey];
            const isPopular = planKey === "profesional";

            return (
              <div
                key={planKey}
                className={`relative bg-white rounded-[12px] border-2 p-6 flex flex-col ${
                  isPopular
                    ? "border-sage-500 shadow-lg"
                    : "border-border/50"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
                    Más popular
                  </div>
                )}

                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-sage-800">
                    {plan.displayName}
                  </h2>
                  <p className="text-xs text-sage-800/40 mt-0.5">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-sage-800">
                    ${plan.priceClp.toLocaleString("es-CL")}
                  </span>
                  <span className="text-sm text-sage-800/40">/mes</span>
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  {/* Capacidad */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-800/30 mb-1.5">
                      Capacidad
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-sm text-sage-800/70">
                        <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                        Hasta {plan.maxClients} clientes
                      </li>
                      <li className="flex items-start gap-2 text-sm text-sage-800/70">
                        <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                        {plan.maxCertificatesPerMonth === -1
                          ? "Certificados ilimitados"
                          : `${plan.maxCertificatesPerMonth} certificados/mes`}
                      </li>
                      <li className="flex items-start gap-2 text-sm text-sage-800/70">
                        <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                        {plan.maxUsers === -1
                          ? "Usuarios ilimitados"
                          : `${plan.maxUsers} usuario${plan.maxUsers > 1 ? "s" : ""}`}
                      </li>
                    </ul>
                  </div>

                  {/* Gestión */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-800/30 mb-1.5">
                      Gestión
                    </p>
                    <ul className="space-y-1.5">
                      <FeatureItem
                        enabled={plan.subClients}
                        label="Sub-clientes (sucursales)"
                      />
                      <FeatureItem
                        enabled={plan.clientPortal}
                        label="Portal de clientes"
                      />
                    </ul>
                  </div>

                  {/* Reportes */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-800/30 mb-1.5">
                      Reportes
                    </p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2 text-sm text-sage-800/70">
                        <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                        {plan.fullReports
                          ? "Reportes avanzados"
                          : "Dashboard básico"}
                      </li>
                    </ul>
                  </div>

                  {/* Compliance */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-sage-800/30 mb-1.5">
                      Compliance
                    </p>
                    <ul className="space-y-1.5">
                      <FeatureItem
                        enabled={plan.sinaderExport}
                        label="Exportación SINADER"
                      />
                      <FeatureItem
                        enabled={plan.customBranding}
                        label="Branding en certificados"
                      />
                    </ul>
                  </div>
                </div>

                <Link
                  href="/register"
                  className={`w-full py-2.5 text-center text-sm font-medium rounded-[8px] transition-colors block ${
                    isPopular
                      ? "bg-sage-500 text-white hover:bg-sage-600"
                      : "bg-sage-50 text-sage-700 hover:bg-sage-100"
                  }`}
                >
                  Comenzar gratis
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-sage-800 text-center mb-8">
            Comparación de planes
          </h2>
          <div className="bg-white rounded-[12px] border border-border/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-4 px-6 text-sage-800/50 font-medium">
                      Característica
                    </th>
                    {planOrder.map((key) => (
                      <th
                        key={key}
                        className={`text-center py-4 px-4 font-semibold ${
                          key === "profesional"
                            ? "text-sage-700 bg-sage-50/50"
                            : "text-sage-800"
                        }`}
                      >
                        {PLANS[key].displayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {featureRows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={
                        i < featureRows.length - 1
                          ? "border-b border-border/30"
                          : ""
                      }
                    >
                      <td className="py-3 px-6 text-sage-800/70">
                        {row.label}
                      </td>
                      {planOrder.map((key) => {
                        const value = row.getValue(PLANS[key]);
                        return (
                          <td
                            key={key}
                            className={`text-center py-3 px-4 ${
                              key === "profesional" ? "bg-sage-50/50" : ""
                            }`}
                          >
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check className="h-4 w-4 text-sage-500 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-sage-800/20 mx-auto" />
                              )
                            ) : (
                              <span className="text-sage-800/70 text-sm">
                                {value}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Price row */}
                  <tr className="border-t border-border/50 bg-sand-50/50">
                    <td className="py-4 px-6 font-medium text-sage-800">
                      Precio mensual
                    </td>
                    {planOrder.map((key) => (
                      <td
                        key={key}
                        className={`text-center py-4 px-4 ${
                          key === "profesional" ? "bg-sage-50/50" : ""
                        }`}
                      >
                        <span className="font-bold text-sage-800">
                          ${PLANS[key].priceClp.toLocaleString("es-CL")}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-white rounded-[12px] border border-border/50 p-8 md:p-12 text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-serif text-sage-800 mb-3">
            Empieza hoy, gratis por 14 días
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Acceso completo al plan Profesional durante el trial. Sin
            tarjeta de crédito, sin compromisos.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-sage-500 text-white px-6 py-3 rounded-lg hover:bg-sage-600 transition-colors text-sm font-medium"
          >
            Comenzar prueba gratuita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-sage-800 text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-[12px] border border-border/50 px-6 py-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-sage-800 flex items-center justify-between list-none">
                  {faq.q}
                  <span className="ml-4 text-sage-800/30 group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-sand-50 py-10 md:py-14">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Image
                  src="/logo.png"
                  alt="CertiRecicla"
                  width={28}
                  height={28}
                />
                <span className="font-serif text-sage-800 font-bold">
                  CertiRecicla
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Plataforma para gestoras de reciclaje en Chile. Certificados
                de valorización con cálculo de CO&#x2082; verificable bajo
                metodología GHG Protocol + ISO 14064.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-sage-800 uppercase tracking-wider mb-3">
                Producto
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/precios"
                    className="hover:text-sage-600 transition-colors"
                  >
                    Planes y precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculadora"
                    className="hover:text-sage-600 transition-colors"
                  >
                    Calculadora CO&#x2082;
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-sage-600 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-sage-800 uppercase tracking-wider mb-3">
                Empezar
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/register"
                    className="hover:text-sage-600 transition-colors"
                  >
                    Prueba gratis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-sage-600 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:hola@certirecicla.cl"
                    className="hover:text-sage-600 transition-colors"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CertiRecicla. Todos los
              derechos reservados.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a
                href="mailto:hola@certirecicla.cl"
                className="hover:text-sage-600 transition-colors"
              >
                hola@certirecicla.cl
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  enabled,
  label,
}: {
  enabled: boolean;
  label: string;
}) {
  return (
    <li
      className={`flex items-start gap-2 text-sm ${
        enabled ? "text-sage-800/70" : "text-sage-800/30"
      }`}
    >
      {enabled ? (
        <Check className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-sage-800/20 mt-0.5 flex-shrink-0" />
      )}
      {label}
    </li>
  );
}
