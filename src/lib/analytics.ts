/* Google Analytics 4 + Meta Pixel event helpers */

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function trackEvent({ action, category, label, value }: GTagEvent) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// Meta Pixel helper
function fbTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

// Pre-defined conversion events
export const analytics = {
  signUp: () => {
    trackEvent({ action: "sign_up", category: "auth" });
    fbTrack("CompleteRegistration");
  },

  login: () =>
    trackEvent({ action: "login", category: "auth" }),

  startTrial: () => {
    trackEvent({ action: "start_trial", category: "subscription" });
    fbTrack("StartTrial");
  },

  calculateImpact: (totalKg: number) => {
    trackEvent({
      action: "calculate_impact",
      category: "calculator",
      value: totalKg,
    });
    fbTrack("ViewContent", { content_name: "Calculadora CO2", content_category: "calculator", value: totalKg });
  },

  calculatorLead: (totalCo2: number) => {
    trackEvent({ action: "calculator_lead", category: "conversion", value: totalCo2 });
    fbTrack("Lead", { content_name: "Calculadora Lead", value: totalCo2, currency: "CLP" });
  },

  downloadCertificate: () =>
    trackEvent({ action: "download_certificate", category: "certificate" }),

  blogView: (slug: string) => {
    trackEvent({ action: "blog_view", category: "content", label: slug });
    fbTrack("ViewContent", { content_name: slug, content_category: "blog" });
  },

  viewPricing: () => {
    trackEvent({ action: "view_pricing", category: "conversion" });
    fbTrack("ViewContent", { content_name: "Precios", content_category: "pricing" });
  },

  ctaClick: (label: string) =>
    trackEvent({ action: "cta_click", category: "conversion", label }),

  // Google Ads conversion (usar cuando tengas el Conversion Label)
  adsConversion: (conversionLabel: string) => {
    if (typeof window === "undefined" || !window.gtag) return;
    const gadsId = process.env.NEXT_PUBLIC_GADS_ID;
    if (!gadsId) return;
    window.gtag("event", "conversion", {
      send_to: `${gadsId}/${conversionLabel}`,
    });
  },
};
