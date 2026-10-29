import Link from "next/link";

export default function NotFound() {
  return (
    <main className="status-page">
      <p className="eyebrow">Página no encontrada</p>
      <h1>Este camino aún no forma parte del viaje.</h1>
      <p>Regresa al inicio para seguir explorando Cielito Go.</p>
      <Link className="button button--primary" href="/">Volver al inicio</Link>
    </main>
  );
}
