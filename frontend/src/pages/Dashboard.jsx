
import { useCallback, useEffect, useState } from "react";
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HardDrive,
  RefreshCw,
  Cpu,
  MemoryStick,
  Activity,
  ArrowUpRight,
  Wifi,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import api from "../services/api";

function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();

  const className =
    normalized === "healthy"
      ? "status-healthy"
      : normalized === "warning"
      ? "status-warning"
      : normalized === "critical"
      ? "status-critical"
      : "status-offline";

  return (
    <span className={`status-pill ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, accent }) {
  return (
    <div className="panel p-5 relative overflow-hidden group hover:border-slate-600 transition-all">
      <div className={`absolute -right-5 -top-5 w-24 h-24 rounded-full blur-2xl opacity-10 ${accent}`} />

      <div className="flex items-center justify-between relative">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} bg-opacity-10`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <h3 className="text-3xl font-bold tracking-tight text-white">
          {value ?? 0}
        </h3>
      </div>
      <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
    </div>
  );
}

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const [statusResponse, nodesResponse] = await Promise.all([
        api.get("/monitoring/status"),
        api.get("/nodes/"),
      ]);

      setStatus(statusResponse.data);
      setNodes(nodesResponse.data.nodes || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to connect to SAN Guardian backend."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(), 10000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const totalCapacity = nodes.reduce(
    (sum, node) => sum + (Number(node.total_capacity_gb) || 0), 0
  );

  const usedCapacity = nodes.reduce(
    (sum, node) => sum + (Number(node.used_capacity_gb) || 0), 0
  );

  const utilization =
    totalCapacity > 0
      ? ((usedCapacity / totalCapacity) * 100).toFixed(1)
      : "0.0";

  const chartData = nodes.map((node) => ({
    name: node.node_name.replace("SAN-NODE-", "Node "),
    CPU: Number(node.cpu_usage) || 0,
    Memory: Number(node.memory_usage) || 0,
  }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <RefreshCw className="animate-spin mr-3" />
        Loading infrastructure data...
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            SAN Infrastructure Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor, analyze and manage your storage infrastructure.
          </p>
        </div>

        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 shadow-lg shadow-blue-950/40 transition"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 p-4 text-sm">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Storage Nodes"
          value={status?.total_nodes}
          subtitle="Registered in the SAN environment"
          icon={Server}
          accent="text-blue-400 bg-blue-500"
        />
        <MetricCard
          title="Healthy Nodes"
          value={status?.healthy_nodes}
          subtitle="Operating within safe limits"
          icon={CheckCircle2}
          accent="text-emerald-400 bg-emerald-500"
        />
        <MetricCard
          title="Warning Nodes"
          value={status?.warning_nodes}
          subtitle="Performance needs attention"
          icon={AlertTriangle}
          accent="text-amber-400 bg-amber-500"
        />
        <MetricCard
          title="Critical Nodes"
          value={status?.critical_nodes}
          subtitle="Require immediate investigation"
          icon={XCircle}
          accent="text-rose-400 bg-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="panel p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white">Node Performance</h2>
              <p className="text-xs text-slate-500 mt-1">
                CPU and memory usage across storage nodes
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Activity size={19} />
            </div>
          </div>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid stroke="#23334a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#8293ad" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#8293ad" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    background: "#101d30",
                    border: "1px solid #2a3b53",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) => `${value.toFixed(1)}%`}
                />
                <Legend />
                <Bar dataKey="CPU" fill="#3b82f6" radius={[5, 5, 0, 0]} />
                <Bar dataKey="Memory" fill="#2dd4bf" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white">Storage Utilization</h2>
              <p className="text-xs text-slate-500 mt-1">
                Combined node capacity
              </p>
            </div>
            <HardDrive size={19} className="text-violet-400" />
          </div>

          <div className="py-5">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">{utilization}%</span>
              <span className="text-xs text-slate-500 mb-2">used</span>
            </div>

            <div className="h-3 bg-slate-800 rounded-full overflow-hidden mt-5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-violet-400 rounded-full transition-all"
                style={{ width: `${Math.min(Number(utilization), 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-7">
              <div>
                <p className="text-xs text-slate-500">Used Capacity</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {usedCapacity.toLocaleString()} GB
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Capacity</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {totalCapacity.toLocaleString()} GB
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-6 pt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Available capacity</span>
              <span className="text-emerald-400 font-semibold">
                {(totalCapacity - usedCapacity).toLocaleString()} GB
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Node table */}
      <section className="panel overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-semibold text-white">Storage Node Inventory</h2>
            <p className="text-xs text-slate-500 mt-1">
              Health, connectivity and resource utilization
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Wifi size={15} className="text-emerald-400" />
            {nodes.length} registered nodes
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-[#0b1627] text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Storage Node</th>
                <th className="px-4 py-4">IP Address</th>
                <th className="px-4 py-4">Capacity</th>
                <th className="px-4 py-4">CPU</th>
                <th className="px-4 py-4">Latency</th>
                <th className="px-4 py-4">Health</th>
                <th className="px-4 py-4">Connection</th>
              </tr>
            </thead>

            <tbody>
              {nodes.map((node) => (
                <tr key={node.id} className="border-t border-slate-800/80 hover:bg-blue-500/[0.04] transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Server size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{node.node_name}</p>
                        <p className="text-[11px] text-slate-500">Node ID: {node.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">{node.ip_address}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-white">{node.used_capacity_gb} / {node.total_capacity_gb} GB</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {node.available_capacity_gb} GB available
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {Number(node.cpu_usage || 0).toFixed(1)}%
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-300">
                    {Number(node.latency_ms || 0).toFixed(1)} ms
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={node.health_status} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={node.connection_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nodes.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500">
            No storage nodes are registered.
          </p>
        )}
      </section>

      <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-600 pb-2">
        <span>SAN Guardian • Intelligent Storage Monitoring</span>
        <span>Dashboard refreshes every 10 seconds</span>
      </div>
    </div>
  );
}

export default Dashboard;
