import Link from "next/link";

import { AdminIcon } from "./AdminIcon";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <Link href={action.href} className="admin-primary-button"><AdminIcon name="plus" />{action.label}</Link> : null}
    </div>
  );
}
