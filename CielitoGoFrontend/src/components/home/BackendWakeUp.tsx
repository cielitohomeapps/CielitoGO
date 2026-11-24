"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandJourneyIcon } from "@/components/ui/BrandJourneyIcon";

type WakeState = "waking" | "ready" | "error";

type BackendWakeUpProps = {
  visible: boolean;
};

export function BackendWakeUp({ visible }: BackendWakeUpProps) {
  const router = useRouter();
  const visibleRef = useRef(visible);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<WakeState>("waking");

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 80_000);

    async function wakeBackend() {
      setState("waking");
      try {
        const result = await fetch("/api/backend-status", {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!result.ok) throw new Error("Backend not ready");

        setState("ready");
        if (visibleRef.current) router.refresh();
      } catch {
        if (!controller.signal.aborted) setState("error");
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void wakeBackend();
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, router]);

  if (!visible) return null;

  return (
    <div className="backend-wakeup" role="status" aria-live="polite">
      <BrandJourneyIcon name="discover" />
      <div>
        <h3>
          {state === "error"
            ? "El servicio está tardando más de lo esperado"
            : state === "ready"
              ? "El catálogo está listo"
              : "Estamos preparando el catálogo"}
        </h3>
        <p>
          {state === "error"
            ? "No pudimos iniciar el servicio automáticamente. Puedes intentarlo otra vez."
            : state === "ready"
              ? "Actualizando los viajes disponibles…"
              : "El servidor gratuito puede tardar cerca de un minuto en iniciar. Esta página se actualizará sola."}
        </p>
      </div>
      {state === "error" ? (
        <button
          className="button button--outline"
          type="button"
          onClick={() => setAttempt((current) => current + 1)}
        >
          Reintentar
        </button>
      ) : (
        <span className="backend-wakeup__spinner" aria-hidden="true" />
      )}
    </div>
  );
}
