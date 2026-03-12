interface Window {
  gtag: (
    command: "config" | "event" | "js",
    targetId: string | Date,
    config?: Record<string, unknown>
  ) => void;
  dataLayer: Record<string, unknown>[];
  fbq: (
    command: "track" | "init" | "trackCustom",
    event: string,
    params?: Record<string, unknown>
  ) => void;
}
