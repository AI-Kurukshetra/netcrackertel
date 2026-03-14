export function DataTable({
  title,
  subtitle,
  rows
}: {
  title: string;
  subtitle: string;
  rows: Array<object>;
}) {
  const firstRow = (rows[0] ?? {}) as Record<string, unknown>;
  const headers = Object.keys(firstRow).slice(0, 5);

  return (
    <div className="card-surface overflow-hidden rounded-[2rem]">
      <div className="border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
        <p className="text-sm text-muted">{subtitle}</p>
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100/70 dark:bg-white/5">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-5 py-3 font-medium capitalize text-muted">
                  {header.replace(/([A-Z])/g, " $1")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 8).map((row, index) => (
              <tr key={index} className="border-t border-slate-200/60 dark:border-white/5">
                {headers.map((header) => (
                  <td key={header} className="px-5 py-3">
                    {String((row as Record<string, unknown>)[header] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
