export type AdminIconName =
  | "dashboard"
  | "tours"
  | "promotions"
  | "quotes"
  | "reservations"
  | "users"
  | "menu"
  | "close"
  | "logout"
  | "plus"
  | "arrow";

export function AdminIcon({ name, size = 20 }: { name: AdminIconName; size?: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };

  const paths: Record<AdminIconName, React.ReactNode> = {
    dashboard: <><path d="M4 4h6v6H4zM14 4h6v10h-6zM4 14h6v6H4zM14 18h6v2h-6z" {...common} /></>,
    tours: <><circle cx="12" cy="12" r="8.5" {...common} /><path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9Z" {...common} /></>,
    promotions: <><path d="M4 6h10l6 6-8 8-8-8V6Z" {...common} /><circle cx="9" cy="10" r="1.2" {...common} /></>,
    quotes: <><path d="M5 4h14v13H9l-4 3V4Z" {...common} /><path d="M8 8h8M8 12h5" {...common} /></>,
    reservations: <><path d="M5 5h14v15H5zM8 3v4M16 3v4M5 9h14" {...common} /><path d="m9 14 2 2 4-4" {...common} /></>,
    users: <><circle cx="9" cy="8" r="3" {...common} /><path d="M3.5 19c.6-4 2.5-6 5.5-6s4.9 2 5.5 6" {...common} /><path d="M16 8.5a2.5 2.5 0 1 1 0 5M16.5 14c2.3.5 3.6 2.2 4 5" {...common} /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" {...common} />,
    close: <path d="m6 6 12 12M18 6 6 18" {...common} />,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" {...common} /></>,
    plus: <path d="M12 5v14M5 12h14" {...common} />,
    arrow: <path d="m9 5 7 7-7 7" {...common} />,
  };

  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
}
