import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Database, ArrowRightLeft, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";
import ConfirmDialog from "../components/ConfirmDialog";

function Recovery() {
  const [nodes, setNodes] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nodeResponse, recoveryResponse] = await Promise.all([
        api.get("/nodes/"),
        api.get("/recovery/history"),
      ]);

      const fetchedNodes = nodeResponse.data.nodes || [];
      setNodes(fetchedNodes);
      setHistory(recoveryResponse.data.recoveries || []);
      setError("");

      if (!selectedNodeId && fetchedNodes.length > 0) {
        setSelectedNodeId(String(fetchedNodes[0].id));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recovery information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedNode = useMemo(
    () => nodes.find((node) => String(node.id) === String(selectedNodeId)) || null,
    [nodes, selectedNodeId]
  );

  const canRecover = !!selectedNode && selectedNode.connection_status === "Online";

  const executeRecovery = async () => {
    if (!selectedNode) return;

    try {
      setRunning(true);
      const response = await api.post(`/recovery/execute/${selectedNode.id}`);
      setSuccess(response.data.message || "Recovery completed successfully.");
      setError("");
      await fetchData();
    } catch (err) {
      const message = err.response?.data?.message || "Recovery could not be executed.";
      setError(message);
      setSuccess("");
    } finally {
      setRunning(false);
      setConfirmOpen(false);
    }
  };

  if (loading) return <Loading label="Loading recovery data..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recovery</h1>
          <p className="mt-1 text-sm text-slate-500">Simulated failover and workload redistribution for compromised storage nodes.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedNodeId}
            onChange={(event) => setSelectedNodeId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            {nodes.map((node) => (
              <option key={node.id} value={String(node.id)}>{node.node_name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={!selectedNode || !canRecover || running}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRightLeft size={16} />
            {running ? "Executing..." : "Start Recovery"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Source Node</p>
            <Database className="text-blue-600" size={18} />
          </div>
          <p className="mt-5 text-xl font-bold text-slate-900">{selectedNode ? selectedNode.node_name : "-"}</p>
          <p className="mt-2 text-sm text-slate-500">Primary node under recover.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Target Node</p>
            <Activity className="text-emerald-600" size={18} />
          </div>
          <p className="mt-5 text-xl font-bold text-slate-900">{selectedNode ? "Healthy candidate" : "-"}</p>
          <p className="mt-2 text-sm text-slate-500">Eligible destination based on capacity.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Recovery Type</p>
            <RefreshCw className="text-violet-600" size={18} />
          </div>
          <p className="mt-5 text-xl font-bold text-slate-900">Simulated Failover</p>
          <p className="mt-2 text-sm text-slate-500">Database-level workload redistribution.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Status</p>
            <CheckCircle2 className="text-emerald-600" size={18} />
          </div>
          <p className="mt-5 text-xl font-bold text-slate-900">{selectedNode ? selectedNode.connection_status : "-"}</p>
          <p className="mt-2 text-sm text-slate-500">Current node network state.</p>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 text-lg font-semibold text-slate-900">Recovery History</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Source Node</th>
                <th className="px-5 py-3">Target Node</th>
                <th className="px-5 py-3">Recovery Type</th>
                <th className="px-5 py-3">Workload</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Start</th>
                <th className="px-5 py-3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {history.map((recovery) => (
                <tr key={recovery.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">#{recovery.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{recovery.source_node_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{recovery.target_node_id ?? "-"}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{recovery.recovery_type}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{Number(recovery.workload_transferred_gb || 0).toFixed(1)} GB</td>
                  <td className="px-5 py-4"><StatusBadge status={recovery.status} /></td>
                  <td className="px-5 py-4 text-sm text-slate-700">{recovery.started_at ? new Date(recovery.started_at).toLocaleString() : "-"}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{recovery.completed_at ? new Date(recovery.completed_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {history.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-500">No recovery operations have been executed yet.</div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Execute simulated recovery"
        description={
          canRecover
            ? `This will trigger a simulated failover for ${selectedNode?.node_name || "the selected node"}. The backend identifies a healthy target and redistributes workload. Continue?`
            : "Recovery is unavailable because the selected node is offline or unavailable."
        }
        confirmLabel="Run Recovery"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={canRecover ? executeRecovery : () => setConfirmOpen(false)}
      />
    </div>
  );
}

export default Recovery;
