export function AdminError({ message }: { message: string }) {
  return (
    <div className="admin-error" role="alert">
      <strong>No pudimos cargar esta sección</strong>
      <p>{message}</p>
      <p>Confirma que el backend esté ejecutándose en el puerto 3000 y vuelve a cargar la página.</p>
    </div>
  );
}
