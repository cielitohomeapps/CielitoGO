import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { getCollection, textValue, booleanValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function CustomersPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try { rows = getCollection(await adminApiRequest("/api/customers?page=1&limit=100"), "customers"); }
  catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible cargar clientes."; }
  return <>
    <AdminPageHeader eyebrow="Relaciones" title="Clientes" description="Consulta y registra las personas vinculadas con cotizaciones y reservaciones." />
    {error ? <p className="admin-form-error">{error}</p> : <AdminTable rows={rows} columns={[
      { key: "name", label: "Cliente", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "firstName")} {textValue(row, "lastName", "")}</strong><small>{textValue(row, "email")}</small></div> },
      { key: "phone", label: "Teléfono", render: (row) => textValue(row, "phone") },
      { key: "status", label: "Estado", render: (row) => <StatusBadge status={booleanValue(row, "isActive") ? "active" : "inactive"} /> },
    ]} />}
    <AdminCreateForm title="Registrar cliente" endpoint="/api/admin/backend/customers" fields={[
      { name: "firstName", label: "Nombre", required: true }, { name: "lastName", label: "Apellidos" },
      { name: "email", label: "Correo", type: "email" }, { name: "phone", label: "Teléfono", type: "tel", required: true },
    ]} />
  </>;
}
