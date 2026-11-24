"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminFormField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select" | "file";
  required?: boolean;
  pathParam?: boolean;
  options?: Array<{ value: string; label: string }>;
};

export function AdminCreateForm({
  title,
  endpoint,
  fields,
  method = "POST",
  multipart = false,
}: {
  title: string;
  endpoint: string;
  fields: AdminFormField[];
  method?: "POST" | "PUT";
  multipart?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const form = event.currentTarget;
    const data = new FormData(form);
    let target = endpoint;
    for (const field of fields.filter((item) => item.pathParam)) {
      const value = String(data.get(field.name) ?? "");
      target = target.replace(`:${field.name}`, encodeURIComponent(value));
      data.delete(field.name);
    }

    let body: BodyInit;
    const headers: HeadersInit = {};
    if (multipart) {
      body = data;
    } else {
      const payload: Record<string, unknown> = {};
      for (const field of fields.filter((item) => !item.pathParam)) {
        const value = String(data.get(field.name) ?? "");
        if (value === "") continue;
        payload[field.name] = field.type === "number" ? Number(value) : value;
      }
      body = JSON.stringify(payload);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(target, { method, headers, body });
    const result = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) setError(result.message ?? result.error ?? "No fue posible guardar el registro.");
    else {
      setSuccess("Registro guardado correctamente.");
      form.reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form className="admin-quick-form" onSubmit={submit}>
      <h2>{title}</h2>
      <div className="admin-quick-form__grid">
        {fields.map((field) => (
          <label className={field.type === "textarea" ? "admin-field admin-field--wide" : "admin-field"} key={field.name}>
            <span>{field.label}</span>
            {field.type === "textarea" ? <textarea name={field.name} required={field.required} rows={3} />
              : field.type === "select" ? <select name={field.name} required={field.required}><option value="">Selecciona</option>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select>
                : <input name={field.name} type={field.type || "text"} required={field.required} />}
          </label>
        ))}
      </div>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      {success ? <p className="admin-form-success" role="status">{success}</p> : null}
      <button className="admin-primary-button" type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar"}</button>
    </form>
  );
}
