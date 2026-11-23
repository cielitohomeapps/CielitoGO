import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminProfile, type AdminUser } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let user: AdminUser;
  try {
    user = await getAdminProfile();
  } catch {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
