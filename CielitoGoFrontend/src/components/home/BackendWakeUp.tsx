"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { BrandJourneyIcon } from "@/components/ui/BrandJourneyIcon";

type WakeState = "waking" | "ready" | "error";
const WAKE_WINDOW_MS = 90_000;
const RETRY_DELAY_MS = 3_000;

type BackendWakeUpProps = {
  visible: boolean;
};

export function BackendWakeUp({ visible }: BackendWakeUpProps) {
  const router = useRouter();
  const visibleRef = useRef(visible);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<WakeState>("waking");
  const [refreshing, startTransition] = useTransition();

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const controller = new AbortController();
    async function wakeBackend() {
      setState("waking");
      const deadline = Date.now() + WAKE_WINDOW_MS;
      while (!controller.signal.aborted && Date.now() < deadline) {
        try {
          const endpoint = visibleRef.current ? "/api/backend-status?refresh=1" : "/api/backend-status";
          const result = await fetch(endpoint, {
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(Math.min(12_000, deadline - Date.now() || 1)),
            ]),
          });
          const status = await result.json();
          if (controller.signal.aborted) return;
          if (result.ok && status?.ready === true) {
            setState("ready");
            if (visibleRef.current) startTransition(() => router.refresh());
            return;
          }
          if (["API_NOT_CONFIGURED", "INVALID_API_CONFIGURATION"].includes(status?.code)) break;
        } catch {
          // Render can return HTML or close a request while the API starts.
        }
        if (controller.signal.aborted) return;
        const remaining = deadline - Date.now();
        if (remaining > 0) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, Math.min(RETRY_DELAY_MS, remaining)));
        }
      }
      if (!controller.signal.aborted) setState("error");
    }

    void wakeBackend();
    return () => {
      controller.abort();
    };
  }, [attempt, router]);

  if (!visible) return null;
  const canRetry = state === "error" || (state === "ready" && !refreshing);

  return (
    <div className="backend-wakeup" role="status" aria-live="polite">
      <BrandJourneyIcon name="discover" />
      <div>
        <h3>
          {canRetry
            ? "El servicio está tardando más de lo esperado"
            : state === "ready"
              ? "El catálogo está listo"
              : "Estamos preparando el catálogo"}
        </h3>
        <p>
          {canRetry
            ? "Todavía no pudimos cargar los viajes. Puedes intentarlo otra vez."
            : state === "ready"
              ? "Actualizando los viajes disponibles…"
              : "El servidor gratuito puede tardar cerca de un minuto en iniciar. Esta página se actualizará sola."}
        </p>
      </div>
      {canRetry ? (
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
