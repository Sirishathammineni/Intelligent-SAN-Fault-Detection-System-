import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Activity, RefreshCw } from "lucide-react";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";

function FaultDetection() {
  const [faults, setFaults] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [faultResponse, summaryResponse] = await Promise.all([
        api.get("/faults/"),
        api.get("/faults/summary"),
      ]);

      setFaults(faultResponse.data.faults || []);
      setSummary(summaryResponse.data || {});
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load fault data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runDetection = async () => {
    try {
      setRunning(true);
      await api.post("/faults/detect");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Fault detection could not be completed.");
    } finally {
      setRunning(false);
    }
  };

  const totalFaults = useMemo(() => faults.length, [faults]);

  if (loading) return <Loading label="Loading fault data..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fault Detection</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor real-time SAN anomalies and active fault conditions.</p>
        </div>

        <button
          type="button"
          onClick={runDetection}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          <RefreshCw size={16} className={running ? "animate-spin" : ""} />
          {running ? "Scanning..." : "Run Fault Detection"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Total Faults</p>
            <Activity className="text-blue-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{totalFaults}</p>
          <p className="mt-2 text-sm text-slate-500">Recorded fault incidents.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Critical</p>
            <AlertTriangle className="text-rose-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{summary.critical_faults ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Immediate action required.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Warning</p>
            <AlertTriangle className="text-amber-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{summary.warning_faults ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Elevated risk conditions.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Open Faults</p>
            <AlertTriangle className="text-slate-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{summary.total_open_faults ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Pending issue review.</p>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 text-lg font-semibold text-slate-900">Fault History</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Fault ID</th>
                <th className="px-5 py-3">Storage Node</th>
                <th className="px-5 py-3">Fault Type</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Severity</th>
                <th className="px-5 py-3">Detected Value</th>
                <th className="px-5 py-3">Threshold</th>
                <th className="px-5 py-3">Detected</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {faults.map((fault) => (
                <tr key={fault.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">#{fault.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">Node {fault.node_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{fault.fault_type}</td>
                  <td className="px-5 py-4 text-sm text-slate-700 max-w-xs">{fault.description}</td>
                  <td className="px-5 py-4"><StatusBadge status={fault.severity} /></td>
                  <td className="px-5 py-4 text-sm text-slate-700">{fault.detected_value != null ? `${fault.detected_value}` : "-"}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{fault.threshold_value != null ? `${fault.threshold_value}` : "-"}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{fault.detected_at ? new Date(fault.detected_at).toLocaleString() : "-"}</td>
                  <td className="px-5 py-4"><StatusBadge status={fault.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {faults.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-slate-500">No fault records have been detected yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

export default FaultDetection;
