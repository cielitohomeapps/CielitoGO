import { AdminError } from "@/components/admin/AdminError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { InlineSelectAction } from "@/components/admin/InlineAction";
import { dateValue, getCollection, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

const statusOptions = [
  { value: "new", label: "Nueva" },
  { value: "reviewing", label: "En revisión" },
  { value: "contacted", label: "Contactada" },
  { value: "sent", label: "Enviada" },
  { value: "accepted", label: "Aceptada" },
  { value: "rejected", label: "Rechazada" },
  { value: "cancelled", label: "Cancelada" },
];

export default async function QuotesPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try { rows = getCollection(await adminApiRequest("/api/quotes?page=1&limit=50"), "quotes"); }
  catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible consultar las cotizaciones."; }

  return (
    <>
      <AdminPageHeader eyebrow="Seguimiento comercial" title="Cotizaciones" description="Da seguimiento a cada solicitud desde el primer contacto hasta la decisión del viajero." />
      {error ? <AdminError message={error} /> : <section className="admin-panel admin-panel--table"><AdminTable rows={rows} emptyTitle="Aún no hay cotizaciones" columns={[
        { key: "code", label: "Folio", render: (row) => <strong>{textValue(row, "code", "—")}</strong> },
        { key: "customer", label: "Viajero", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "customerName")}</strong><small>{textValue(row, "email")}</small></div> },
        { key: "destination", label: "Destino", render: (row) => textValue(row, "destination") },
        { key: "travelers", label: "Viajeros", render: (row) => textValue(row, "travelers") },
        { key: "created", label: "Recibida", render: (row) => dateValue(row, "createdAt") },
        { key: "status", label: "Seguimiento", render: (row) => <InlineSelectAction endpoint={`/api/admin/backend/quotes/${textValue(row, "id")}/status`} field="status" value={textValue(row, "status", "new")} options={statusOptions} label={`Estado de la cotización de ${textValue(row, "customerName")}`} /> },
      ]} /></section>}
    </>
  );
}
