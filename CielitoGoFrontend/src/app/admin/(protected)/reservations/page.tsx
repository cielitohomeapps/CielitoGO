import { AdminError } from "@/components/admin/AdminError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { InlineSelectAction } from "@/components/admin/InlineAction";
import { dateValue, getCollection, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

const statusOptions = [
  { value: "request", label: "Solicitud" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

export default async function ReservationsPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try { rows = getCollection(await adminApiRequest("/api/reservations?page=1&limit=50"), "reservations"); }
  catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible consultar las reservaciones."; }

  return (
    <>
      <AdminPageHeader eyebrow="Operación" title="Reservaciones" description="Controla el estado de los viajes confirmados y las solicitudes en proceso." />
      {error ? <AdminError message={error} /> : <section className="admin-panel admin-panel--table"><AdminTable rows={rows} emptyTitle="Aún no hay reservaciones" columns={[
        { key: "code", label: "Reserva", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "code")}</strong><small>{textValue(row, "customerName")}</small></div> },
        { key: "dates", label: "Fechas", render: (row) => <span>{dateValue(row, "startDate")}<br />{dateValue(row, "endDate")}</span> },
        { key: "travelers", label: "Viajeros", render: (row) => textValue(row, "travelers") },
        { key: "email", label: "Contacto", render: (row) => textValue(row, "email") },
        { key: "status", label: "Estado", render: (row) => <InlineSelectAction endpoint={`/api/admin/backend/reservations/${textValue(row, "id")}/status`} field="status" value={textValue(row, "status", "request")} options={statusOptions} label={`Estado de la reservación ${textValue(row, "code")}`} /> },
      ]} /></section>}
    </>
  );
}
