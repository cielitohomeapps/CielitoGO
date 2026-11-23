import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminProfile } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  try {
    await getAdminProfile();
    redirect("/admin/dashboard");
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
  }

  return (
    <main className="admin-login">
      <section className="admin-login__visual" aria-label="Cielito Go, destinos memorables">
        <Image src="/images/figma/hero.png" alt="Paisaje de montaña junto a un lago" fill priority sizes="(max-width: 900px) 100vw, 55vw" />
        <div className="admin-login__overlay" />
        <div className="admin-login__message">
          <p>Administración Cielito Go</p>
          <h1>Todo viaje memorable comienza con una buena gestión.</h1>
          <span>Organiza experiencias, acompaña solicitudes y mantén tu operación al día.</span>
        </div>
      </section>
      <section className="admin-login__panel">
        <div className="admin-login__card">
          <Image src="/brand/cielito-go-logo.png" alt="Cielito Go" width={148} height={114} priority />
          <p className="admin-eyebrow">Acceso privado</p>
          <h2>Bienvenido de nuevo</h2>
          <p className="admin-login__intro">Ingresa con la cuenta administrativa creada al configurar el backend.</p>
          <LoginForm />
          <p className="admin-login__help">¿No puedes entrar? Confirma que el backend esté ejecutándose en <code>localhost:3000</code>.</p>
        </div>
      </section>
    </main>
  );
}
