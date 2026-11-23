import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ResourceForm } from "@/components/admin/ResourceForm";
import { asRecord, textValue } from "@/lib/admin/data";
import { AdminApiError, adminApiRequest } from "@/lib/admin/session";

export default async function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let promotion: Record<string, unknown>;
  try {
    promotion = asRecord(asRecord(await adminApiRequest(`/api/promotions/${encodeURIComponent(id)}`)).promotion);
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 404) notFound();
    throw error;
  }
  return <><AdminPageHeader eyebrow="Campañas" title={`Editar ${textValue(promotion, "title", "promoción")}`} description="Actualiza la oferta, sus fechas de vigencia y su presentación." /><ResourceForm kind="promotion" initial={promotion} /></>;
}
