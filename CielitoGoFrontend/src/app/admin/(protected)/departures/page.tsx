import { AdminCreateForm } from "@/components/admin/AdminCreateForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { asRecord, asRecords, getCollection, textValue } from "@/lib/admin/data";
import { adminApiRequest } from "@/lib/admin/session";

export default async function DeparturesPage() {
  let tours: Record<string, unknown>[] = [];
  let rows: Record<string, unknown>[] = [];
  let error = "";
  try {
    tours = getCollection(await adminApiRequest("/api/tours?page=1&limit=100"), "tours");
    const payloads = await Promise.all(tours.map((tour) => adminApiRequest(`/api/tours/${textValue(tour, "id", "")}/departures`)));
    rows = payloads.flatMap((payload) => {
      const record = asRecord(payload);
      const tour = asRecord(record.tour);
      return asRecords(record.departures).map((departure) => ({ ...departure, tourName: tour.name }));
    });
  } catch (cause) { error = cause instanceof Error ? cause.message : "No fue posible cargar salidas."; }
  const tourOptions = tours.map((tour) => ({ value: textValue(tour, "id", ""), label: textValue(tour, "name") }));
  return <>
    <AdminPageHeader eyebrow="Operación" title="Salidas y cupos" description="Programa fechas y disponibilidad concreta para cada tour." />
    {error ? <p className="admin-form-error">{error}</p> : <AdminTable rows={rows} columns={[
      { key: "tour", label: "Tour", render: (row) => textValue(row, "tourName") },
      { key: "dates", label: "Fechas", render: (row) => `${textValue(row, "startDate")} — ${textValue(row, "endDate")}` },
      { key: "spots", label: "Disponibles", render: (row) => `${textValue(row, "availableSpots")} / ${textValue(row, "capacity")}` },
      { key: "status", label: "Estado", render: (row) => textValue(row, "status") },
    ]} />}
    <AdminCreateForm title="Programar salida" endpoint="/api/admin/backend/tours/:tourId/departures" fields={[
      { name: "tourId", label: "Tour", type: "select", required: true, pathParam: true, options: tourOptions },
      { name: "startDate", label: "Inicio", type: "date", required: true }, { name: "endDate", label: "Fin", type: "date", required: true },
      { name: "capacity", label: "Capacidad", type: "number", required: true }, { name: "availableSpots", label: "Lugares disponibles", type: "number" },
      { name: "currency", label: "Moneda", type: "select", options: ["MXN", "USD", "EUR"].map((value) => ({ value, label: value })) },
    ]} />
  </>;
}
