"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="status-page">
      <p className="eyebrow">Algo no salió como esperábamos</p>
      <h1>No pudimos mostrar esta parte del viaje.</h1>
      <p>Puedes intentarlo de nuevo. Si el problema continúa, vuelve más tarde.</p>
      <button className="button button--primary" type="button" onClick={reset}>Intentar de nuevo</button>
    </main>
  );
}
