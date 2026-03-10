"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "¿Funciona con mi Excel actual?",
    a: "Sí. CertiRecicla detecta automáticamente las columnas de tu planilla (cliente, material, kg, fecha) y las importa sin que tengas que reformatear nada. Si algo no calza, te muestra un preview para que ajustes antes de importar.",
  },
  {
    q: "¿Puedo personalizar los certificados con mi logo?",
    a: "Sí. En el plan Profesional y Business puedes subir tu logo, elegir colores, agregar un logo secundario, firma digital del representante, y texto de cierre personalizado. Tus certificados salen con tu marca, no con la nuestra.",
  },
  {
    q: "¿Qué pasa cuando termina el trial de 14 días?",
    a: "Eliges un plan y sigues usando la plataforma. Si decides no continuar, tus datos quedan guardados por 30 días por si cambias de opinión. No se cobra nada automáticamente — sin tarjeta de crédito.",
  },
  {
    q: "¿Es compatible con SINADER?",
    a: "Sí. CertiRecicla exporta tus datos en el formato que necesita SINADER. En vez de copiar fila por fila, exportas todo con un clic. Disponible en los planes Profesional y Business.",
  },
  {
    q: "¿Cómo calculan el CO₂ evitado?",
    a: "Usamos factores de emisión de EPA WARM v16, FEVE y DEFRA, siguiendo la metodología GHG Protocol. Cada material tiene un factor específico (ej: 1 kg de PET reciclado = 1.7 kg CO₂ evitado). Puedes ver y personalizar los factores en la configuración.",
  },
  {
    q: "¿Mis clientes pueden verificar los certificados?",
    a: "Sí. Cada certificado tiene un código único y una página pública de verificación. Tu cliente puede compartir ese link con sus stakeholders, auditores o para reportes ESG.",
  },
  {
    q: "¿Cuántos usuarios puedo tener?",
    a: "En Starter y Profesional tienes un usuario administrador. En Business puedes agregar múltiples usuarios con roles diferenciados (admin, operador, solo lectura).",
  },
  {
    q: "¿Puedo migrar mis datos históricos?",
    a: "Sí. Puedes importar tu Excel con datos históricos — no solo del mes actual. La plataforma crea los registros con las fechas originales para que tengas trazabilidad completa desde el inicio.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-sage-800 hover:text-sage-600 transition-colors"
      >
        {q}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground flex-shrink-0 ml-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FaqSection() {
  return (
    <section id="faq" className="container mx-auto px-6 py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-sage-900 mb-4">
            Preguntas frecuentes
          </h2>
        </div>
        <div className="rounded-xl border bg-card p-6">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
