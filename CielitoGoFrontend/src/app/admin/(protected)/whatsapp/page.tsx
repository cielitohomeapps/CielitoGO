import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { dateValue, getCollection, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function WhatsAppPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try { rows = getCollection(await adminApiRequest("/api/whatsapp/messages?page=1&limit=100"), "messages"); }
  catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible cargar mensajes."; }
  return <>
    <AdminPageHeader eyebrow="Conversaciones" title="WhatsApp" description="Consulta mensajes registrados y envía respuestas de texto." />
    {error ? <p className="admin-form-error">{error}</p> : <AdminTable rows={rows} columns={[
      { key: "contact", label: "Contacto", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "contactName")}</strong><small>{textValue(row, "direction") === "incoming" ? textValue(row, "from") : textValue(row, "to")}</small></div> },
      { key: "body", label: "Mensaje", render: (row) => textValue(row, "body") },
      { key: "status", label: "Estado", render: (row) => textValue(row, "status") },
      { key: "date", label: "Fecha", render: (row) => dateValue(row, "createdAt") },
    ]} />}
    <AdminCreateForm title="Enviar mensaje" endpoint="/api/admin/backend/whatsapp/send" fields={[
      { name: "to", label: "Teléfono", type: "tel", required: true }, { name: "message", label: "Mensaje", type: "textarea", required: true },
    ]} />
  </>;
}
