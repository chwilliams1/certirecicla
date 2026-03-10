interface Window {
  gtag: (
    command: "config" | "event" | "js",
    targetId: string | Date,
    config?: Record<string, unknown>
  ) => void;
  dataLayer: Record<string, unknown>[];
}
