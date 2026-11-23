import { useState } from "react";
import { BrowserRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Activity,
  BrainCircuit,
  Database,
  HelpCircle,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import StorageNodes from "./pages/StorageNodes";
import Monitoring from "./pages/Monitoring";
import FaultDetection from "./pages/FaultDetection";
import Predictions from "./pages/Predictions";
import Recovery from "./pages/Recovery";
import SettingsPage from "./pages/Settings";

const menuItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Storage Nodes", path: "/nodes", icon: Server },
  { label: "Monitoring", path: "/monitoring", icon: Activity },
  { label: "Fault Detection", path: "/faults", icon: AlertTriangle },
  { label: "Predictions", path: "/predictions", icon: BrainCircuit },
  { label: "Recovery", path: "/recovery", icon: RefreshCw },
];

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
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
                <NavLink key={label} to={path} className={navLinkClass} end={path === "/"}>
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
                SAN infrastructure monitoring is active and continuously evaluating node health.
              </p>
            </div>

            <div className="space-y-1">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
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
                    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <HelpCircle size={17} />
                Help & Support
              </NavLink>
            </div>

            <div className="border-t border-white/10 pt-3 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
              SAN Guardian
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          {mobileOpen && (
            <div className="border-b border-slate-200 bg-[#0f1f36] p-4 lg:hidden">
              <nav className="space-y-2">
                {menuItems.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={label}
                    to={path}
                    end={path === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                        isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>
                ))}
                <NavLink
                  to="/settings"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Settings size={17} />
                  Settings
                </NavLink>
                <NavLink
                  to="/help"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <HelpCircle size={17} />
                  Help & Support
                </NavLink>
              </nav>
            </div>
          )}

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1600px]">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/nodes" element={<StorageNodes />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/faults" element={<FaultDetection />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/recovery" element={<Recovery />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<SettingsPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Header({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
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

  const pageTitle = titleMap[location.pathname] || "SAN Guardian";

  return (
    <header className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <span>SAN Guardian</span>
              <span className="text-slate-300">/</span>
              <span>{pageTitle}</span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{pageTitle}</h2>
          </div>
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

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
