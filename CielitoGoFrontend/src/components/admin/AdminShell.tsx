"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminUser } from "@/lib/admin/session";
import { AdminIcon, type AdminIconName } from "./AdminIcon";

const navigation: Array<{ href: string; label: string; icon: AdminIconName; adminOnly?: boolean }> = [
  { href: "/admin/dashboard", label: "Resumen", icon: "dashboard" },
  { href: "/admin/tours", label: "Tours", icon: "tours" },
  { href: "/admin/promotions", label: "Promociones", icon: "promotions" },
  { href: "/admin/quotes", label: "Cotizaciones", icon: "quotes" },
  { href: "/admin/reservations", label: "Reservaciones", icon: "reservations" },
  { href: "/admin/customers", label: "Clientes", icon: "customers" },
  { href: "/admin/pricing", label: "Tarifas", icon: "pricing" },
  { href: "/admin/departures", label: "Salidas", icon: "departures" },
  { href: "/admin/content", label: "Contenido", icon: "content" },
  { href: "/admin/media", label: "Media", icon: "media" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { href: "/admin/users", label: "Equipo", icon: "users", adminOnly: true },
];

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-root">
      <button
        className="admin-mobile-menu"
        type="button"
        aria-label={open ? "Cerrar navegación" : "Abrir navegación"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <AdminIcon name={open ? "close" : "menu"} size={24} />
      </button>
      {open ? <button className="admin-backdrop" aria-label="Cerrar navegación" onClick={() => setOpen(false)} /> : null}

      <aside className={`admin-sidebar${open ? " admin-sidebar--open" : ""}`}>
        <Link className="admin-brand" href="/admin/dashboard" onClick={() => setOpen(false)}>
          <Image src="/brand/cielito-go-logo.png" alt="Cielito Go" width={116} height={90} priority />
          <span>Panel administrativo</span>
        </Link>

        <nav className="admin-nav" aria-label="Navegación administrativa">
          <p className="admin-nav__label">Operación</p>
          {navigation
            .filter((item) => !item.adminOnly || user.role === "admin")
            .map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  className={`admin-nav__link${active ? " admin-nav__link--active" : ""}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <AdminIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-user">
            <span className="admin-user__avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            <span><strong>{user.name}</strong><small>{user.role === "admin" ? "Administrador" : "Editor"}</small></span>
          </div>
          <button className="admin-logout" type="button" onClick={logout} disabled={loggingOut}>
            <AdminIcon name="logout" />
            {loggingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar__eyebrow">Cielito Go</span>
            <strong>Gestión de experiencias</strong>
          </div>
          <Link href="/" target="_blank" className="admin-site-link">Ver sitio público <AdminIcon name="arrow" size={16} /></Link>
        </header>
        <main className="admin-main" id="admin-main">{children}</main>
      </div>
    </div>
  );
}
