import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewTourPage() {
  return <><AdminPageHeader eyebrow="Catálogo" title="Crear nuevo tour" description="Registra la información esencial. Podrás ampliar itinerario y medios desde el backend conforme evolucione el panel." /><ResourceForm kind="tour" /></>;
}
