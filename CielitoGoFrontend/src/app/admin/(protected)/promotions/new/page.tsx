import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewPromotionPage() {
  return <><AdminPageHeader eyebrow="Campañas" title="Crear promoción" description="Define una oferta clara, su destino y periodo de vigencia." /><ResourceForm kind="promotion" /></>;
}
