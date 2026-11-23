"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function UserForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/backend/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        role: data.get("role"),
      }),
    });
    const body = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!response.ok) {
      setError(body.message ?? body.error ?? "No fue posible crear el usuario.");
      setLoading(false);
      return;
    }
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form className="admin-resource-form" onSubmit={submit}>
      <section className="admin-form-section">
        <div><p className="admin-eyebrow">Acceso seguro</p><h2>Datos del usuario</h2></div>
        <div className="admin-form-grid">
          <label className="admin-field admin-field--wide"><span>Nombre completo</span><input name="name" minLength={2} maxLength={100} required /></label>
          <label className="admin-field admin-field--wide"><span>Correo electrónico</span><input name="email" type="email" required /></label>
          <label className="admin-field"><span>Contraseña temporal</span><input name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /><small>Mínimo 12 caracteres.</small></label>
          <label className="admin-field"><span>Rol</span><select name="role" defaultValue="editor"><option value="editor">Editor</option><option value="admin">Administrador</option></select></label>
        </div>
      </section>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <div className="admin-form-actions"><button type="button" onClick={() => router.back()}>Cancelar</button><button className="admin-primary-button" type="submit" disabled={loading}>{loading ? "Creando…" : "Crear usuario"}</button></div>
    </form>
  );
}
