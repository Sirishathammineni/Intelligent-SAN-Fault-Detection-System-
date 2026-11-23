import { useEffect, useState } from "react";
import { BrainCircuit, TrendingUp, ShieldAlert, RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";
import Loading from "../components/Loading";
import StatusBadge from "../components/StatusBadge";

function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [predictionResponse, summaryResponse] = await Promise.all([
        api.get("/predictions/"),
        api.get("/predictions/summary"),
      ]);

      setPredictions(predictionResponse.data.predictions || []);
      setSummary(summaryResponse.data || {});
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load predictions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const runPrediction = async () => {
    try {
      setRunning(true);
      await api.post("/predictions/run");
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Prediction analysis could not be completed.");
    } finally {
      setRunning(false);
    }
  };

  const chartData = predictions.map((prediction) => ({
    name: `Node ${prediction.node_id}`,
    value: Number(prediction.risk_score || 0),
    risk: prediction.risk_level,
  }));

  if (loading) return <Loading label="Loading prediction analytics..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Predictions</h1>
          <p className="mt-1 text-sm text-slate-500">Heuristic SAN risk analysis to prioritize attention and remediation planning.</p>
        </div>

        <button
          type="button"
          onClick={runPrediction}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          <RefreshCw size={16} className={running ? "animate-spin" : ""} />
          {running ? "Running..." : "Run Prediction"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Risk Score</p>
            <TrendingUp className="text-blue-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{predictions[0]?.risk_score != null ? `${Number(predictions[0].risk_score).toFixed(1)}` : "0.0"}</p>
          <p className="mt-2 text-sm text-slate-500">Latest node risk score.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Risk Level</p>
            <ShieldAlert className="text-amber-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{predictions[0]?.risk_level || "Low"}</p>
          <p className="mt-2 text-sm text-slate-500">Current operational risk category.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Predicted Fault</p>
            <BrainCircuit className="text-violet-600" size={18} />
          </div>
          <p className="mt-5 text-xl font-bold text-slate-900">{predictions[0]?.predicted_fault || "No significant risk detected"}</p>
          <p className="mt-2 text-sm text-slate-500">Most recent predicted issue.</p>
        </div>
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Nodes Analyzed</p>
            <BrainCircuit className="text-emerald-600" size={18} />
          </div>
          <p className="mt-5 text-3xl font-bold text-slate-900">{summary.nodes_analyzed ?? predictions.length}</p>
          <p className="mt-2 text-sm text-slate-500">Latest node risk review set.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-900">Node Risk Distribution</h2>
          <div className="mt-5 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Risk score"]} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <aside className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-900">Risk Overview</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">High Risk</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary.high_risk ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Medium Risk</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary.medium_risk ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Low Risk</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary.low_risk ?? 0}</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 text-lg font-semibold text-slate-900">Prediction Timeline</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Node</th>
                <th className="px-5 py-3">Risk Score</th>
                <th className="px-5 py-3">Risk Level</th>
                <th className="px-5 py-3">Predicted Fault</th>
                <th className="px-5 py-3">Affected Node</th>
                <th className="px-5 py-3">Explanation</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction) => (
                <tr key={prediction.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                  <td className="px-5 py-4 text-sm font-medium text-slate-800">Node {prediction.node_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{Number(prediction.risk_score || 0).toFixed(2)}</td>
                  <td className="px-5 py-4"><StatusBadge status={prediction.risk_level} /></td>
                  <td className="px-5 py-4 text-sm text-slate-700">{prediction.predicted_fault}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">Node {prediction.node_id}</td>
                  <td className="px-5 py-4 text-sm text-slate-700 max-w-md">{prediction.explanation}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{prediction.predicted_at ? new Date(prediction.predicted_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Predictions;
