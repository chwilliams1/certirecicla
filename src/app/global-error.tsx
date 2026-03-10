"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</p>
          <h2 style={{ fontSize: "1.25rem", color: "#333", marginBottom: "0.5rem" }}>Algo salió mal</h2>
          <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "1.5rem" }}>
            Ocurrió un error inesperado.
          </p>
          <button
            onClick={reset}
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: "#4a6b4e",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.625rem 1rem",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
