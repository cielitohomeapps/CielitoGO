export type AdminColumn = {
  key: string;
  label: string;
  render: (row: Record<string, unknown>) => React.ReactNode;
};

export function AdminTable({
  columns,
  rows,
  emptyTitle = "Todavía no hay registros",
  emptyBody = "Cuando se agregue información aparecerá en esta tabla.",
}: {
  columns: AdminColumn[];
  rows: Record<string, unknown>[];
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (!rows.length) {
    return <div className="admin-empty"><span aria-hidden="true">✦</span><h2>{emptyTitle}</h2><p>{emptyBody}</p></div>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={typeof row.id === "string" ? row.id : index}>
              {columns.map((column) => <td key={column.key} data-label={column.label}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
