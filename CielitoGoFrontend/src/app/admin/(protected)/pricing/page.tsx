import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { getCollection, moneyValue, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function PricingPage() {
  let rows: Record<string, unknown>[] = [];
  let tours: Record<string, unknown>[] = [];
  let error = "";
  try {
    const [pricingPayload, tourPayload] = await Promise.all([adminApiRequest("/api/pricing"), adminApiRequest("/api/tours?page=1&limit=100")]);
    rows = getCollection(pricingPayload, "pricings");
    tours = getCollection(tourPayload, "tours");
  } catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible cargar tarifas."; }
  const tourOptions = tours.map((tour) => ({ value: textValue(tour, "id", ""), label: textValue(tour, "name") }));
  return <>
    <AdminPageHeader eyebrow="Catálogo" title="Tarifas" description="Administra precios estacionales y periodos de vigencia por tour." />
    {error ? <p className="admin-form-error">{error}</p> : <AdminTable rows={rows} columns={[
      { key: "name", label: "Tarifa", render: (row) => <div className="admin-primary-cell"><strong>{textValue(row, "name")}</strong><small>{textValue(row, "season")}</small></div> },
      { key: "price", label: "Precio", render: (row) => moneyValue(row, "price") },
      { key: "validity", label: "Vigencia", render: (row) => `${textValue(row, "validFrom")} — ${textValue(row, "validTo")}` },
    ]} />}
    <AdminCreateForm title="Crear tarifa" endpoint="/api/admin/backend/pricing" fields={[
      { name: "tourId", label: "Tour", type: "select", required: true, options: tourOptions },
      { name: "name", label: "Nombre", required: true },
      { name: "season", label: "Temporada", type: "select", options: ["low", "mid", "high", "peak", "custom"].map((value) => ({ value, label: value })) },
      { name: "price", label: "Precio", type: "number", required: true }, { name: "discountPrice", label: "Precio con descuento", type: "number" },
      { name: "currency", label: "Moneda", type: "select", options: ["MXN", "USD", "EUR"].map((value) => ({ value, label: value })) },
      { name: "validFrom", label: "Válida desde", type: "date" }, { name: "validTo", label: "Válida hasta", type: "date" },
    ]} />
  </>;
}
