import Link from "next/link";

import { AdminError } from "@/components/admin/AdminError";
import { ButtonAction } from "@/components/admin/InlineAction";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { booleanValue, dateValue, getCollection, moneyValue, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function PromotionsPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try {
    rows = getCollection(await adminApiRequest("/api/promotions?page=1&limit=50"), "promotions");
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "No fue posible consultar las promociones.";
  }

  return (
    <>
      <AdminPageHeader eyebrow="Campañas" title="Promociones" description="Organiza ofertas vigentes y promociones destacadas sin perder claridad comercial." action={{ label: "Nueva promoción", href: "/admin/promotions/new" }} />
      {error ? <AdminError message={error} /> : <section className="admin-panel admin-panel--table"><AdminTable rows={rows} emptyTitle="Aún no hay promociones" columns={[
        { key: "title", label: "Promoción", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "title")}</strong><small>{textValue(row, "destination")}</small></div> },
        { key: "price", label: "Precio", render: (row) => moneyValue(row, "promotionalPrice") },
        { key: "dates", label: "Vigencia", render: (row) => <span>{dateValue(row, "startDate")}<br />{dateValue(row, "endDate")}</span> },
        { key: "featured", label: "Tipo", render: (row) => booleanValue(row, "isFeatured") ? "Destacada" : "Regular" },
        { key: "status", label: "Estado", render: (row) => <StatusBadge status={booleanValue(row, "isActive") ? "active" : "inactive"} /> },
        { key: "actions", label: "Acciones", render: (row) => <div className="admin-row-actions"><Link href={`/admin/promotions/${textValue(row, "id")}`}>Editar</Link>{booleanValue(row, "isActive") ? <ButtonAction endpoint={`/api/admin/backend/promotions/${textValue(row, "id")}`} method="DELETE" label="Desactivar" confirmMessage={`¿Quieres desactivar ${textValue(row, "title")}?`} /> : null}</div> },
      ]} /></section>}
    </>
  );
}
