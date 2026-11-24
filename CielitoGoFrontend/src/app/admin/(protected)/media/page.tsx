import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getCollection, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function MediaPage() {
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try { rows = getCollection(await adminApiRequest("/api/media?page=1&limit=100"), "media"); }
  catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible cargar media."; }
  return <>
    <AdminPageHeader eyebrow="Biblioteca" title="Media" description="Carga imágenes persistentes y consulta sus metadatos." />
    {error ? <p className="admin-form-error">{error}</p> : <AdminTable rows={rows} columns={[
      { key: "name", label: "Archivo", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "originalName")}</strong><small>{textValue(row, "category")}</small></div> },
      { key: "dimensions", label: "Dimensiones", render: (row) => `${textValue(row, "width")} × ${textValue(row, "height")}` },
      { key: "alt", label: "Texto alternativo", render: (row) => textValue(row, "alt") },
    ]} />}
    <AdminCreateForm title="Subir imagen" endpoint="/api/admin/backend/media" multipart fields={[
      { name: "file", label: "Imagen", type: "file", required: true }, { name: "alt", label: "Texto alternativo" }, { name: "category", label: "Categoría" },
    ]} />
  </>;
}
