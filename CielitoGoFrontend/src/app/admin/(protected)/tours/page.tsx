import Link from "next/link";

import { AdminError } from "@/components/admin/AdminError";
import { ButtonAction } from "@/components/admin/InlineAction";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getCollection, moneyValue, textValue, booleanValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function ToursPage() {
  let tours: Record<string, unknown>[] = [];
  let error = "";
  try {
    tours = getCollection(await adminApiRequest("/api/tours?page=1&limit=50"), "tours");
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "No fue posible consultar los tours.";
  }

  return (
    <>
      <AdminPageHeader eyebrow="Catálogo" title="Tours y experiencias" description="Administra las experiencias que Cielito Go puede presentar y cotizar." action={{ label: "Nuevo tour", href: "/admin/tours/new" }} />
      {error ? <AdminError message={error} /> : (
        <section className="admin-panel admin-panel--table">
          <AdminTable rows={tours} emptyTitle="Aún no hay tours" emptyBody="Crea la primera experiencia para comenzar a construir el catálogo." columns={[
            { key: "name", label: "Tour", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "name")}</strong><small>{textValue(row, "location")}</small></div> },
            { key: "duration", label: "Duración", render: (row) => textValue(row, "duration") },
            { key: "price", label: "Precio", render: (row) => moneyValue(row, "price") },
            { key: "capacity", label: "Capacidad", render: (row) => `${textValue(row, "capacity", "0")} viajeros` },
            { key: "status", label: "Estado", render: (row) => <StatusBadge status={booleanValue(row, "isActive") ? "active" : "inactive"} /> },
            { key: "actions", label: "Acciones", render: (row) => <div className="admin-row-actions"><Link href={`/admin/tours/${textValue(row, "id")}`}>Editar</Link>{booleanValue(row, "isActive") ? <ButtonAction endpoint={`/api/admin/backend/tours/${textValue(row, "id")}`} method="DELETE" label="Desactivar" confirmMessage={`¿Quieres desactivar ${textValue(row, "name")}?`} /> : null}</div> },
          ]} />
        </section>
      )}
    </>
  );
}
