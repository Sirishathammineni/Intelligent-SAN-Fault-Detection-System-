import { ArrowUpRight } from "lucide-react";

function MetricCard({ title, value, subtitle, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: { badge: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
    green: { badge: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
    amber: { badge: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
    red: { badge: "bg-rose-50 text-rose-600", dot: "bg-rose-500" },
    slate: { badge: "bg-slate-100 text-slate-600", dot: "bg-slate-500" },
  };

  const classes = toneClasses[tone] || toneClasses.blue;

  return (
    <div className="panel p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${classes.badge}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>
        </div>
        <div className={`flex h-6 w-6 items-center justify-center rounded-full ${classes.dot} text-white`}>
          <ArrowUpRight size={12} />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default MetricCard;
