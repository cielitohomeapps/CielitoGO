import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getCollection, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function ContentPage() {
  let contents: Record<string, unknown>[] = [];
  let settings: Record<string, unknown>[] = [];
  let error = "";
  try {
    const [contentPayload, settingsPayload] = await Promise.all([adminApiRequest("/api/pages/content"), adminApiRequest("/api/pages/settings")]);
    contents = getCollection(contentPayload, "contents");
    settings = getCollection(settingsPayload, "settings");
  } catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible cargar contenido."; }
  return <>
    <AdminPageHeader eyebrow="Publicación" title="Contenido y ajustes" description="Administra claves editoriales y configuración pública controlada." />
    {error ? <p className="admin-form-error">{error}</p> : <>
      <AdminTable rows={contents} columns={[
        { key: "path", label: "Ruta", render: (row) => `${textValue(row, "page")}/${textValue(row, "section")}/${textValue(row, "key")}` },
        { key: "value", label: "Valor", render: (row) => textValue(row, "value") }, { key: "type", label: "Tipo", render: (row) => textValue(row, "type") },
      ]} />
      <AdminTable rows={settings} emptyTitle="Sin ajustes" columns={[
        { key: "key", label: "Ajuste", render: (row) => textValue(row, "key") }, { key: "value", label: "Valor", render: (row) => textValue(row, "value") },
        { key: "group", label: "Grupo", render: (row) => textValue(row, "group") },
      ]} />
    </>}
    <AdminCreateForm title="Guardar contenido" method="PUT" endpoint="/api/admin/backend/pages/content/:page/:section/:key" fields={[
      { name: "page", label: "Página", required: true, pathParam: true }, { name: "section", label: "Sección", required: true, pathParam: true },
      { name: "key", label: "Clave", required: true, pathParam: true }, { name: "value", label: "Valor", type: "textarea", required: true },
      { name: "type", label: "Tipo", type: "select", options: ["text", "image", "link", "number", "boolean"].map((value) => ({ value, label: value })) },
    ]} />
    <AdminCreateForm title="Guardar ajuste" method="PUT" endpoint="/api/admin/backend/pages/settings/:key" fields={[
      { name: "key", label: "Clave", required: true, pathParam: true }, { name: "value", label: "Valor", required: true },
      { name: "group", label: "Grupo" }, { name: "type", label: "Tipo", type: "select", options: ["text", "image", "number", "boolean"].map((value) => ({ value, label: value })) },
    ]} />
  </>;
}
