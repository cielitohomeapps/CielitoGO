import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserForm } from "@/components/admin/UserForm";

export default function NewUserPage() {
  return <><AdminPageHeader eyebrow="Accesos" title="Crear usuario" description="Agrega a una persona al equipo y define si tendrá permisos de editor o administrador." /><UserForm /></>;
}
