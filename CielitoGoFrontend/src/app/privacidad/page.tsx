import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Tratamiento de datos personales en solicitudes de Cielito Go.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <main className="legal-page shell">
      <p className="eyebrow">Versión 2026-11-24</p>
      <h1>Aviso de privacidad</h1>
      <p>Cielito Go utiliza los datos que compartes para responder solicitudes de cotización, preparar opciones de viaje, administrar reservaciones y dar seguimiento por los medios de contacto proporcionados.</p>
      <h2>Datos y finalidad</h2>
      <p>Podemos tratar nombre, correo, teléfono, destino, fechas, número de viajeros, presupuesto, comentarios y, cuando existe una reservación, información de los viajeros. No solicitamos datos financieros mediante este formulario.</p>
      <h2>Conservación</h2>
      <p>Las solicitudes rechazadas o canceladas, las reservaciones terminadas o canceladas y los mensajes asociados se anonimizan después de 730 días, salvo que una obligación legal o una relación activa requiera conservarlos por más tiempo.</p>
      <h2>Proveedores</h2>
      <p>La operación puede utilizar servicios de alojamiento, base de datos, almacenamiento de imágenes y mensajería. Sólo se comparten los datos necesarios para prestar el servicio y operar la plataforma.</p>
      <h2>Derechos y contacto</h2>
      <p>Puedes solicitar acceso, corrección o eliminación mediante los canales de contacto publicados en este sitio. Antes de atender la solicitud se verificará la identidad y si existe una obligación de conservación aplicable.</p>
      <p>Este aviso debe complementarse con la razón social, domicilio y canal formal del responsable antes de una campaña pública. Esos datos organizacionales aún requieren confirmación.</p>
      <Link className="button button--secondary" href="/">Volver al inicio</Link>
    </main>
  );
}
