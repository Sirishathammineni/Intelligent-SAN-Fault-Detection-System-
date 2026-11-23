import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CircleHelp,
  Database,
  LayoutDashboard,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Storage Nodes", path: "/nodes", icon: Server },
  { label: "Monitoring", path: "/monitoring", icon: Activity },
  { label: "Fault Detection", path: "/faults", icon: AlertTriangle },
  { label: "Predictions", path: "/predictions", icon: BrainCircuit },
  { label: "Recovery", path: "/recovery", icon: RefreshCw },
];

function Sidebar() {
  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-[#0f1f36] text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
          <Database size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold">SAN Guardian</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Storage Intelligence
          </p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-5">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Main Menu
        </p>
        <nav className="mt-4 space-y-2">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-4 border-t border-white/10 px-4 py-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold">Protection Enabled</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            SAN infrastructure monitoring is active and continuously evaluating node
            health.
          </p>
        </div>

        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Settings size={17} />
            Settings
          </NavLink>
          <NavLink
            to="/help"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <CircleHelp size={17} />
            Help & Support
          </NavLink>
        </div>

        <div className="border-t border-white/10 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
          SAN Guardian
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
