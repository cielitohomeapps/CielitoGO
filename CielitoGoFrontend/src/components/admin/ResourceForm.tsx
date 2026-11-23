"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ResourceKind = "tour" | "promotion";

function initialText(initial: Record<string, unknown> | undefined, key: string) {
  const value = initial?.[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function ResourceForm({
  kind,
  initial,
}: {
  kind: ResourceKind;
  initial?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isTour = kind === "tour";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    if (!isTour && !data.has("isFeatured")) data.set("isFeatured", "false");
    const resource = isTour ? "tours" : "promotions";
    const id = typeof initial?.id === "string" ? initial.id : "";
    const endpoint = `/api/admin/backend/${resource}${id ? `/${id}` : ""}`;
    const response = await fetch(endpoint, { method: id ? "PUT" : "POST", body: data });
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) {
      setError(body.message ?? body.error ?? "No fue posible guardar el registro.");
      setLoading(false);
      return;
    }
    router.push(isTour ? "/admin/tours" : "/admin/promotions");
    router.refresh();
  }

  return (
    <form className="admin-resource-form" onSubmit={submit}>
      <section className="admin-form-section">
        <div><p className="admin-eyebrow">Información principal</p><h2>{isTour ? "Detalles del tour" : "Detalles de la promoción"}</h2></div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field--wide"><span>{isTour ? "Nombre del tour" : "Título de la promoción"}</span><input name={isTour ? "name" : "title"} required maxLength={200} defaultValue={initialText(initial, isTour ? "name" : "title")} /></label>
          {isTour ? (
            <>
              <label className="admin-field"><span>Duración</span><input name="duration" required placeholder="7 días / 6 noches" defaultValue={initialText(initial, "duration")} /></label>
              <label className="admin-field"><span>Ubicación</span><input name="location" placeholder="Oaxaca, México" defaultValue={initialText(initial, "location")} /></label>
              <label className="admin-field"><span>Precio</span><input name="price" required type="number" min="0" step="0.01" defaultValue={initialText(initial, "price")} /></label>
              <label className="admin-field"><span>Moneda</span><select name="currency" defaultValue={initialText(initial, "currency") || "MXN"}><option>MXN</option><option>USD</option><option>EUR</option></select></label>
              <label className="admin-field"><span>Capacidad</span><input name="capacity" type="number" min="1" defaultValue={initialText(initial, "capacity") || "20"} /></label>
              <label className="admin-field"><span>Dificultad</span><select name="difficulty" defaultValue={initialText(initial, "difficulty") || "easy"}><option value="easy">Fácil</option><option value="moderate">Moderada</option><option value="hard">Difícil</option><option value="extreme">Extrema</option></select></label>
              <label className="admin-field admin-field--wide"><span>Descripción breve</span><input name="shortDescription" maxLength={500} defaultValue={initialText(initial, "shortDescription")} /></label>
            </>
          ) : (
            <>
              <label className="admin-field"><span>Destino</span><input name="destination" defaultValue={initialText(initial, "destination")} /></label>
              <label className="admin-field"><span>Precio promocional</span><input name="promotionalPrice" type="number" min="0" step="0.01" defaultValue={initialText(initial, "promotionalPrice")} /></label>
              <label className="admin-field"><span>Moneda</span><select name="currency" defaultValue={initialText(initial, "currency") || "MXN"}><option>MXN</option><option>USD</option><option>EUR</option></select></label>
              <label className="admin-field"><span>Fecha de inicio</span><input name="startDate" type="date" defaultValue={initialText(initial, "startDate")} /></label>
              <label className="admin-field"><span>Fecha de término</span><input name="endDate" type="date" defaultValue={initialText(initial, "endDate")} /></label>
              <label className="admin-check"><input name="isFeatured" type="checkbox" value="true" defaultChecked={initial?.isFeatured === true} /><span>Mostrar como destacada</span></label>
            </>
          )}
          <label className="admin-field admin-field--wide"><span>Descripción</span><textarea name="description" required rows={6} defaultValue={initialText(initial, "description")} /></label>
          <label className="admin-field admin-field--wide"><span>Imagen principal</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG o WebP. Máximo configurado por el backend: 10 MB.</small></label>
        </div>
      </section>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="admin-form-actions"><button type="button" onClick={() => router.back()}>Cancelar</button><button className="admin-primary-button" type="submit" disabled={loading}>{loading ? "Guardando…" : initial ? "Guardar cambios" : isTour ? "Crear tour" : "Crear promoción"}</button></div>
    </form>
  );
}
