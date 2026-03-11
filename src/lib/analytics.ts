/* Google Analytics 4 event helpers */

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

// Pre-defined conversion events
export const analytics = {
  signUp: () =>
    trackEvent({ action: "sign_up", category: "auth" }),

  login: () =>
    trackEvent({ action: "login", category: "auth" }),

  startTrial: () =>
    trackEvent({ action: "start_trial", category: "subscription" }),

  calculateImpact: (totalKg: number) =>
    trackEvent({
      action: "calculate_impact",
      category: "calculator",
      value: totalKg,
    }),

  downloadCertificate: () =>
    trackEvent({ action: "download_certificate", category: "certificate" }),

  blogView: (slug: string) =>
    trackEvent({ action: "blog_view", category: "content", label: slug }),

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
