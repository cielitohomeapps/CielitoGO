import { AdminError } from "@/components/admin/AdminError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { ButtonAction, InlineSelectAction } from "@/components/admin/InlineAction";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { asRecord, asRecords, booleanValue, dateValue, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function UsersPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try { rows = asRecords(asRecord(await adminApiRequest("/api/auth/users")).users); }
  catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible consultar el equipo."; }

  return (
    <>
      <AdminPageHeader eyebrow="Accesos" title="Equipo" description="Administra quién puede operar el panel y con qué nivel de acceso." action={{ label: "Nuevo usuario", href: "/admin/users/new" }} />
      {error ? <AdminError message={error} /> : <section className="admin-panel admin-panel--table"><AdminTable rows={rows} emptyTitle="No hay usuarios disponibles" columns={[
        { key: "name", label: "Usuario", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "name")}</strong><small>{textValue(row, "email")}</small></div> },
        { key: "role", label: "Rol", render: (row) => <InlineSelectAction endpoint={`/api/admin/backend/auth/users/${textValue(row, "id")}/role`} method="PUT" field="role" value={textValue(row, "role", "editor")} options={[{ value: "admin", label: "Administrador" }, { value: "editor", label: "Editor" }]} label={`Rol de ${textValue(row, "name")}`} /> },
        { key: "lastLogin", label: "Último acceso", render: (row) => dateValue(row, "lastLogin") },
        { key: "status", label: "Estado", render: (row) => <StatusBadge status={booleanValue(row, "isActive") ? "active" : "inactive"} /> },
        { key: "action", label: "Acción", render: (row) => <ButtonAction endpoint={`/api/admin/backend/auth/users/${textValue(row, "id")}/toggle`} label={booleanValue(row, "isActive") ? "Desactivar" : "Activar"} confirmMessage={`¿Quieres ${booleanValue(row, "isActive") ? "desactivar" : "activar"} a ${textValue(row, "name")}?`} /> },
      ]} /></section>}
    </>
  );
}
