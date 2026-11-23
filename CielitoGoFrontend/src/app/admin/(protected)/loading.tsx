function AdminLine({ className = "" }: { className?: string }) {
  return <span className={`admin-skeleton__line ${className}`} aria-hidden="true" />;
}

export default function AdminLoading() {
  return <div className="admin-loading" role="status" aria-live="polite" aria-label="Cargando panel administrativo"><span className="sr-only">Cargando panel administrativo…</span><div className="admin-loading__header"><AdminLine className="admin-skeleton__line--eyebrow" /><AdminLine className="admin-skeleton__line--title" /><AdminLine className="admin-skeleton__line--description" /></div><div className="admin-loading__metrics">{Array.from({ length: 4 }, (_, index) => <div className="admin-skeleton-card" key={index}><AdminLine className="admin-skeleton__line--metric" /><AdminLine /><AdminLine className="admin-skeleton__line--short" /></div>)}</div><div className="admin-loading__panels">{Array.from({ length: 2 }, (_, index) => <section className="admin-skeleton-panel" key={index}><AdminLine className="admin-skeleton__line--panel-title" /><AdminLine /><AdminLine /><AdminLine className="admin-skeleton__line--short" /></section>)}</div></div>;
}
