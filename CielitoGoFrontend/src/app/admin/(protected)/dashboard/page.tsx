import Link from "next/link";

import { AdminError } from "@/components/admin/AdminError";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcon";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApiRequest } from "@/lib/admin/session";
import { asRecord, asRecords, dateValue, numberValue, textValue } from "@/lib/admin/data";

const metrics: Array<{ key: string; label: string; hint: string; icon: AdminIconName; href: string }> = [
  { key: "quotes", label: "Cotizaciones", hint: "Solicitudes recibidas", icon: "quotes", href: "/admin/quotes" },
  { key: "reservations", label: "Reservaciones", hint: "Viajes en operación", icon: "reservations", href: "/admin/reservations" },
  { key: "tours", label: "Tours", hint: "Experiencias registradas", icon: "tours", href: "/admin/tours" },
  { key: "promotions", label: "Promociones", hint: "Campañas creadas", icon: "promotions", href: "/admin/promotions" },
];

export default async function DashboardPage() {
  let payload: unknown;
  try {
    payload = await adminApiRequest("/api/dashboard/stats");
  } catch (error) {
    return <><AdminPageHeader eyebrow="Centro de control" title="Resumen de operación" description="Una vista clara de la actividad reciente de Cielito Go." /><AdminError message={error instanceof Error ? error.message : "Error desconocido"} /></>;
  }

  const root = asRecord(payload);
  const stats = asRecord(root.stats);
  const recentQuotes = asRecords(root.recentQuotes);
  const recentReservations = asRecords(root.recentReservations);

  return (
    <>
      <AdminPageHeader eyebrow="Centro de control" title="Resumen de operación" description="Una vista clara de la actividad reciente de Cielito Go." />
      <section className="admin-metrics" aria-label="Indicadores principales">
        {metrics.map((metric) => (
          <Link className="admin-metric" href={metric.href} key={metric.key}>
            <span className="admin-metric__icon"><AdminIcon name={metric.icon} size={24} /></span>
            <span className="admin-metric__value">{numberValue(stats, metric.key)}</span>
            <strong>{metric.label}</strong>
            <small>{metric.hint}</small>
            <AdminIcon name="arrow" size={17} />
          </Link>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel__header"><div><p className="admin-eyebrow">Seguimiento comercial</p><h2>Cotizaciones recientes</h2></div><Link href="/admin/quotes">Ver todas</Link></div>
          <div className="admin-activity-list">
            {recentQuotes.length ? recentQuotes.map((quote) => (
              <article key={textValue(quote, "id")}>
                <span className="admin-activity-list__mark" aria-hidden="true" />
                <div><strong>{textValue(quote, "customerName")}</strong><p>{textValue(quote, "destination")}</p></div>
                <div><StatusBadge status={textValue(quote, "status", "new")} /><small>{dateValue(quote, "createdAt")}</small></div>
              </article>
            )) : <p className="admin-panel__empty">Aún no hay cotizaciones.</p>}
          </div>
        </section>
        <section className="admin-panel">
          <div className="admin-panel__header"><div><p className="admin-eyebrow">Próximos viajes</p><h2>Reservaciones recientes</h2></div><Link href="/admin/reservations">Ver todas</Link></div>
          <div className="admin-activity-list">
            {recentReservations.length ? recentReservations.map((reservation) => (
              <article key={textValue(reservation, "id")}>
                <span className="admin-activity-list__mark admin-activity-list__mark--gold" aria-hidden="true" />
                <div><strong>{textValue(reservation, "customerName")}</strong><p>{textValue(reservation, "code")}</p></div>
                <div><StatusBadge status={textValue(reservation, "status", "request")} /><small>{dateValue(reservation, "createdAt")}</small></div>
              </article>
            )) : <p className="admin-panel__empty">Aún no hay reservaciones.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
