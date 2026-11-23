function StatusBadge({ status, compact = false }) {
  const normalized = String(status || "Unknown").trim();

  const palette = {
    Healthy: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Warning: "bg-amber-50 text-amber-700 border border-amber-200",
    Critical: "bg-rose-50 text-rose-700 border border-rose-200",
    Offline: "bg-slate-100 text-slate-600 border border-slate-200",
    Online: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Failed: "bg-rose-50 text-rose-700 border border-rose-200",
    High: "bg-rose-50 text-rose-700 border border-rose-200",
    Medium: "bg-amber-50 text-amber-700 border border-amber-200",
    Low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Open: "bg-amber-50 text-amber-700 border border-amber-200",
    Closed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Unknown: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  const className = palette[normalized] || palette.Unknown;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${className} ${compact ? "text-[10px]" : ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {normalized}
    </span>
  );
}

export default StatusBadge;
