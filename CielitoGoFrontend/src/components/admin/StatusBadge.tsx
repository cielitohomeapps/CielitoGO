const translations: Record<string, string> = {
  new: "Nueva",
  reviewing: "En revisión",
  contacted: "Contactada",
  sent: "Enviada",
  accepted: "Aceptada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  request: "Solicitud",
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  active: "Activo",
  inactive: "Inactivo",
  admin: "Administrador",
  editor: "Editor",
};

export function StatusBadge({ status }: { status: string }) {
  const safeStatus = status.toLowerCase();
  return <span className={`admin-status admin-status--${safeStatus}`}>{translations[safeStatus] ?? status}</span>;
}
