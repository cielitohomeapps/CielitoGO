function Line({ className = "" }: { className?: string }) {
  return <span className={`skeleton__line ${className}`} aria-hidden="true" />;
}

function Card() {
  return <article className="skeleton-card" aria-hidden="true"><div className="skeleton__media" /><div className="skeleton-card__content"><Line className="skeleton__line--eyebrow" /><Line className="skeleton__line--title" /><Line /><Line className="skeleton__line--short" /><div className="skeleton-card__footer"><Line className="skeleton__line--price" /><Line className="skeleton__line--link" /></div></div></article>;
}

export default function Loading() {
  return <div className="page-loading" role="status" aria-live="polite" aria-label="Cargando contenido de Cielito Go"><span className="sr-only">Cargando contenido de Cielito Go…</span><header className="site-header" aria-hidden="true"><div className="site-header__inner shell"><span className="skeleton__logo" /><span className="skeleton__nav" /></div></header><main><section className="skeleton-hero"><div className="shell skeleton-hero__content"><Line className="skeleton__line--eyebrow" /><Line className="skeleton__line--hero" /><Line className="skeleton__line--hero skeleton__line--hero-short" /><Line className="skeleton__line--body" /><div className="skeleton__actions"><span /><span /></div></div></section><section className="section section--ivory"><div className="shell"><Line className="skeleton__line--eyebrow" /><Line className="skeleton__line--section-title" /><Line className="skeleton__line--body" /><div className="skeleton-package-grid">{Array.from({ length: 3 }, (_, index) => <Card key={index} />)}</div></div></section></main></div>;
}
