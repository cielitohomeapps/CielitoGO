import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { asRecord, textValue } from "@/lib/admin/data";
import { AdminApiError, adminApiRequest } from "@/lib/admin/session";

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let tour: Record<string, unknown>;
  try {
    tour = asRecord(asRecord(await adminApiRequest(`/api/tours/${encodeURIComponent(id)}`)).tour);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    throw error;
  }
  return <><AdminPageHeader eyebrow="Catálogo" title={`Editar ${textValue(tour, "name", "tour")}`} description="Actualiza los datos comerciales y la imagen principal de esta experiencia." /><ResourceForm kind="tour" initial={tour} /></>;
}
