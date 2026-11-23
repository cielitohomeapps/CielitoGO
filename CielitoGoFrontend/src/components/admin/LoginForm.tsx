"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const body = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(body.message ?? "No fue posible iniciar sesión.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el panel. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <label>
        <span>Correo electrónico</span>
        <input type="email" name="email" autoComplete="username" required placeholder="admin@cielitogo.com" />
      </label>
      <label>
        <span>Contraseña</span>
        <input type="password" name="password" autoComplete="current-password" required placeholder="Tu contraseña" />
      </label>
      {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
      <button type="submit" disabled={loading}>{loading ? "Ingresando…" : "Ingresar al panel"}</button>
    </form>
  );
}
