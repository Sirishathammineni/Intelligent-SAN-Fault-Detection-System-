import { Activity, Server } from "lucide-react";
import { useLocation } from "react-router-dom";

const titleMap = {
  "/": "Infrastructure Overview",
  "/nodes": "Storage Nodes",
  "/monitoring": "Monitoring",
  "/faults": "Fault Detection",
  "/predictions": "Predictions",
  "/recovery": "Recovery",
  "/settings": "Settings",
  "/help": "Help & Support",
};

function Header() {
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] || "SAN Guardian";

  return (
    <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            <span>SAN Guardian</span>
            <span className="text-slate-300">/</span>
            <span>{pageTitle}</span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {pageTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Backend Connected
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Monitoring status"
          >
            <Activity size={17} />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Server size={17} />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800">Administrator</p>
              <p className="text-[10px] text-slate-500">System Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
