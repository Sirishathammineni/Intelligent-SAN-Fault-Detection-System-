import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  Gauge,
  HardDrive,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";

function Monitoring() {
  const [nodes, setNodes] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("all");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nodeResponse, metricsResponse, statusResponse] = await Promise.all([
        api.get("/nodes/"),
        api.get("/monitoring/metrics"),
        api.get("/monitoring/status"),
      ]);

      const fetchedNodes = nodeResponse.data.nodes || [];
      setNodes(fetchedNodes);
      setMetrics(metricsResponse.data.metrics || []);
      setStatus(statusResponse.data || {});
      setError("");

      if (selectedNodeId === "all" && fetchedNodes.length > 0) {
        setSelectedNodeId(String(fetchedNodes[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const nodeOptions = useMemo(() => {
    const available = nodes.filter((node) => node.connection_status === "Online");
    return available.length ? available : nodes;
  }, [nodes]);

  const selectedNode = useMemo(() => {
    if (selectedNodeId === "all") return null;
    return nodes.find((node) => String(node.id) === String(selectedNodeId)) || null;
  }, [selectedNodeId, nodes]);

  const filteredMetrics = useMemo(() => {
    if (selectedNodeId === "all") {
      return metrics.slice(0, 12).reverse();
    }

    return metrics
      .filter((metric) => String(metric.node_id) === String(selectedNodeId))
      .slice(0, 12)
      .reverse();
  }, [metrics, selectedNodeId]);

  const chartData = filteredMetrics.map((metric, index) => ({
    index: index + 1,
    cpu: Number(metric.cpu_usage || 0),
    memory: Number(metric.memory_usage || 0),
    disk: Number(metric.disk_utilization || 0),
    latency: Number(metric.latency_ms || 0),
    throughput: Number(metric.throughput_mbps || 0),
  }));

  const collectMetrics = async () => {
    try {
      setRunning(true);
      await api.post("/monitoring/collect");
      setError("");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to collect monitoring metrics.");
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <Loading label="Loading monitoring data..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Monitoring</h1>
          <p className="mt-1 text-sm text-slate-500">Live SAN metrics and infrastructure health tracking.</p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedNodeId}
            onChange={(event) => setSelectedNodeId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">All Nodes</option>
            {nodeOptions.map((node) => (
              <option key={node.id} value={String(node.id)}>
                {node.node_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={collectMetrics}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            <RefreshCw size={16} className={running ? "animate-spin" : ""} />
            {running ? "Collecting..." : "Collect Metrics"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">CPU</p>
            <Gauge className="text-blue-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">
            {selectedNode
              ? `${Number(selectedNode.cpu_usage || 0).toFixed(1)}%`
              : `${status && status.total_nodes ? Math.round((status.healthy_nodes / status.total_nodes) * 100) : 0}%`}
          </p>
          <p className="mt-2 text-sm text-slate-500">Average node CPU demand.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Memory</p>
            <Database className="text-emerald-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">
            {selectedNode ? `${Number(selectedNode.memory_usage || 0).toFixed(1)}%` : `${status ? status.warning_nodes + status.critical_nodes : 0} Active alerts`}
          </p>
          <p className="mt-2 text-sm text-slate-500">Current memory utilization.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Disk</p>
            <HardDrive className="text-violet-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">
            {selectedNode ? `${Number(selectedNode.used_capacity_gb || 0).toFixed(1)} GB` : `${status?.total_nodes ?? 0} Nodes`}
          </p>
          <p className="mt-2 text-sm text-slate-500">Live SAN storage footprint.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Node Health</p>
            <Activity className="text-amber-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{status?.healthy_nodes ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Healthy nodes in current portfolio.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_0.8fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Performance Trend</h2>
              <p className="text-sm text-slate-500">Recent CPU, memory and latency observations.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" /> CPU
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /> Memory
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="index" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  formatter={(value, name) => [`${value}%`, name]}
                  labelFormatter={(label) => `Sample ${label}`}
                  contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }}
                />
                <Line type="monotone" dataKey="cpu" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-900">Monitoring Status</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Collection Status</span>
                <StatusBadge status="Healthy" />
              </div>
              <p className="mt-2 text-sm text-slate-500">Live metrics collection is active for SAN nodes.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last Collection</span>
                <Zap size={16} className="text-blue-600" />
              </div>
              <p className="mt-2 text-sm text-slate-800">
                {metrics[0]?.recorded_at ? new Date(metrics[0].recorded_at).toLocaleString() : "No metrics recorded yet"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Selected Node</span>
                <Server size={16} className="text-slate-500" />
              </div>
              <p className="mt-2 text-sm text-slate-800">{selectedNode ? selectedNode.node_name : "All SAN nodes"}</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 text-lg font-semibold text-slate-900">
          Current Metrics Snapshot
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Node</th>
                <th className="px-5 py-3">CPU</th>
                <th className="px-5 py-3">Memory</th>
                <th className="px-5 py-3">Disk</th>
                <th className="px-5 py-3">Read IOPS</th>
                <th className="px-5 py-3">Write IOPS</th>
                <th className="px-5 py-3">Latency</th>
                <th className="px-5 py-3">Throughput</th>
                <th className="px-5 py-3">Health</th>
              </tr>
            </thead>
            <tbody>
              {(selectedNodeId === "all" ? nodes : nodes.filter((node) => String(node.id) === String(selectedNodeId))).map((node) => {
                const metric = metrics.find((item) => String(item.node_id) === String(node.id));
                return (
                  <tr key={node.id} className="border-t border-slate-200 bg-white">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">{node.node_name}</p>
                        <p className="text-xs text-slate-500">{node.ip_address}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.cpu_usage || node.cpu_usage || 0).toFixed(1)}%</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.memory_usage || node.memory_usage || 0).toFixed(1)}%</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.disk_utilization || 0).toFixed(1)}%</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.read_iops || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.write_iops || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.latency_ms || node.latency_ms || 0).toFixed(1)} ms</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{Number(metric?.throughput_mbps || 0).toFixed(1)} Mbps</td>
                    <td className="px-5 py-4"><StatusBadge status={metric?.health_status || node.health_status || "Unknown"} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Monitoring;
