"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="font-serif text-xl text-sage-800 mb-2">Algo salió mal</h2>
        <p className="text-sm text-sage-800/50 mb-6">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="text-sm font-medium text-white bg-sage-500 hover:bg-sage-600 rounded-lg px-4 py-2.5 transition-colors"
          >
            Reintentar
          </button>
          <a
            href="/dashboard"
            className="text-sm font-medium text-sage-500 border border-sand-300 rounded-lg px-4 py-2.5 hover:bg-sand-100 transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
