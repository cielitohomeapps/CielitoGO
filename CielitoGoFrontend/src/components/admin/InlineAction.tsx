"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function InlineSelectAction({
  endpoint,
  method = "PATCH",
  field,
  value,
  options,
  label,
}: {
  endpoint: string;
  method?: "PATCH" | "PUT";
  field: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  label: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const nextValue = String(form.get(field) ?? "");
    if (nextValue === value) {
      setLoading(false);
      return;
    }

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: nextValue }),
    });
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) {
      setError(body.message ?? body.error ?? "No se pudo actualizar.");
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form className="admin-inline-action" onSubmit={submit}>
      <label className="sr-only">{label}</label>
      <select name={field} defaultValue={value} disabled={loading} aria-label={label}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button type="submit" disabled={loading}>{loading ? "…" : "Guardar"}</button>
      {error ? <small role="alert">{error}</small> : null}
    </form>
  );
}

export function ButtonAction({
  endpoint,
  method = "PUT",
  label,
  confirmMessage,
}: {
  endpoint: string;
  method?: "PUT" | "DELETE" | "POST";
  label: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    setError("");
    const response = await fetch(endpoint, { method });
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) setError(body.message ?? body.error ?? "No se pudo completar la acción.");
    else router.refresh();
    setLoading(false);
  }

  return <span className="admin-button-action"><button type="button" onClick={run} disabled={loading}>{loading ? "Procesando…" : label}</button>{error ? <small role="alert">{error}</small> : null}</span>;
}
