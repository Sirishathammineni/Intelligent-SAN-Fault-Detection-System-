function DataTable({ headers, rows, emptyMessage = "No records available." }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {headers.map((header) => (
              <th key={header.key || header.label} className="border-b border-slate-200 px-4 py-3 text-left">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="border-b border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50/80">
              {headers.map((header) => (
                <td key={`${row.id || rowIndex}-${header.key || header.label}`} className="border-b border-slate-200 px-4 py-3 align-top">
                  {typeof header.render === "function" ? header.render(row) : row[header.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
