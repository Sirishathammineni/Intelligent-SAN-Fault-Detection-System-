import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Server, Pencil, Trash2, Eye, Wifi, ShieldAlert, HardDrive, RefreshCw } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyForm = {
  node_name: "",
  ip_address: "",
  total_capacity_gb: "",
  used_capacity_gb: "",
  health_status: "Healthy",
  connection_status: "Online",
};

function StorageNodes() {
  const [nodes, setNodes] = useState([]);
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState("All");
  const [connectionFilter, setConnectionFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteNode, setDeleteNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNodes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/nodes/");
      setNodes(response.data.nodes || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load storage nodes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const filteredNodes = useMemo(() => {
    const query = search.toLowerCase();

    return nodes.filter((node) => {
      const matchesSearch =
        !query ||
        node.node_name.toLowerCase().includes(query) ||
        node.ip_address.toLowerCase().includes(query);
      const matchesHealth = healthFilter === "All" || node.health_status === healthFilter;
      const matchesConnection =
        connectionFilter === "All" || node.connection_status === connectionFilter;

      return matchesSearch && matchesHealth && matchesConnection;
    });
  }, [nodes, search, healthFilter, connectionFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        node_name: form.node_name.trim(),
        ip_address: form.ip_address.trim(),
        total_capacity_gb: Number(form.total_capacity_gb),
        used_capacity_gb: form.used_capacity_gb === "" ? 0 : Number(form.used_capacity_gb),
        health_status: form.health_status,
        connection_status: form.connection_status,
      };

      if (!payload.node_name || !payload.ip_address || !payload.total_capacity_gb) {
        throw new Error("Node name, IP address, and total capacity are required.");
      }

      if (editingId) {
        await api.put(`/nodes/${editingId}`, payload);
      } else {
        await api.post("/nodes/", payload);
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchNodes();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to save node.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (node) => {
    setEditingId(node.id);
    setForm({
      node_name: node.node_name,
      ip_address: node.ip_address,
      total_capacity_gb: node.total_capacity_gb,
      used_capacity_gb: node.used_capacity_gb,
      health_status: node.health_status,
      connection_status: node.connection_status,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteNode) return;

    try {
      await api.delete(`/nodes/${deleteNode.id}`);
      setDeleteNode(null);
      await fetchNodes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete node.");
    }
  };

  const openNodeDetails = (node) => setSelectedNode(node);

  if (loading) {
    return <Loading label="Loading storage nodes..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Storage Nodes</h1>
          <p className="mt-1 text-sm text-slate-500">Register, manage and monitor SAN storage resources.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <Plus size={16} />
          Add Storage Node
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="panel p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by node name or IP"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
            />
          </label>

          <select
            value={healthFilter}
            onChange={(event) => setHealthFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400"
          >
            <option value="All">All Health Status</option>
            <option value="Healthy">Healthy</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={connectionFilter}
            onChange={(event) => setConnectionFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400"
          >
            <option value="All">All Connection Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Server size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold">Registered Nodes</h2>
          </div>
          <button
            type="button"
            onClick={fetchNodes}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3">Node</th>
                <th className="px-5 py-3">IP Address</th>
                <th className="px-5 py-3">Capacity</th>
                <th className="px-5 py-3">CPU</th>
                <th className="px-5 py-3">Memory</th>
                <th className="px-5 py-3">Latency</th>
                <th className="px-5 py-3">Health</th>
                <th className="px-5 py-3">Connection</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map((node) => (
                <tr key={node.id} className="border-t border-slate-200 bg-white hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">{node.node_name}</p>
                      <p className="text-xs text-slate-500">Node ID: {node.id}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{node.ip_address}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {Number(node.used_capacity_gb || 0).toFixed(1)} / {Number(node.total_capacity_gb || 0).toFixed(1)} GB
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{Number(node.cpu_usage || 0).toFixed(1)}%</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{Number(node.memory_usage || 0).toFixed(1)}%</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{Number(node.latency_ms || 0).toFixed(1)} ms</td>
                  <td className="px-5 py-4"><StatusBadge status={node.health_status} /></td>
                  <td className="px-5 py-4"><StatusBadge status={node.connection_status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openNodeDetails(node)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100" aria-label="View node details">
                        <Eye size={15} />
                      </button>
                      <button type="button" onClick={() => handleEdit(node)} className="rounded-lg border border-slate-200 p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit node">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => setDeleteNode(node)} className="rounded-lg border border-slate-200 p-2 text-rose-600 hover:bg-rose-50" aria-label="Delete node">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNodes.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-slate-500">No storage nodes match the current filters.</div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{editingId ? "Update" : "Create"}</p>
                <h3 className="text-2xl font-bold text-slate-900">{editingId ? "Edit Storage Node" : "Add Storage Node"}</h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-100">Close</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Node Name</span>
                  <input
                    value={form.node_name}
                    onChange={(event) => setForm((prev) => ({ ...prev, node_name: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="e.g. SAN-NODE-05"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>IP Address</span>
                  <input
                    value={form.ip_address}
                    onChange={(event) => setForm((prev) => ({ ...prev, ip_address: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                    placeholder="192.168.1.105"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Total Capacity (GB)</span>
                  <input
                    type="number"
                    value={form.total_capacity_gb}
                    min="1"
                    onChange={(event) => setForm((prev) => ({ ...prev, total_capacity_gb: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Used Capacity (GB)</span>
                  <input
                    type="number"
                    value={form.used_capacity_gb}
                    min="0"
                    onChange={(event) => setForm((prev) => ({ ...prev, used_capacity_gb: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Health Status</span>
                  <select
                    value={form.health_status}
                    onChange={(event) => setForm((prev) => ({ ...prev, health_status: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Connection Status</span>
                  <select
                    value={form.connection_status}
                    onChange={(event) => setForm((prev) => ({ ...prev, connection_status: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : editingId ? "Update Node" : "Create Node"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Node details</p>
                <h3 className="text-2xl font-bold text-slate-900">{selectedNode.node_name}</h3>
              </div>
              <button type="button" onClick={() => setSelectedNode(null)} className="rounded-lg border border-slate-200 px-2 py-1 text-slate-500 hover:bg-slate-100">Close</button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">IP Address</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{selectedNode.ip_address}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Connection</p>
                <div className="mt-2"><StatusBadge status={selectedNode.connection_status} /></div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Data Capacity</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{Number(selectedNode.total_capacity_gb || 0).toFixed(1)} GB</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Used Capacity</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{Number(selectedNode.used_capacity_gb || 0).toFixed(1)} GB</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">CPU Usage</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{Number(selectedNode.cpu_usage || 0).toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Memory Usage</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{Number(selectedNode.memory_usage || 0).toFixed(1)}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Latency</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">{Number(selectedNode.latency_ms || 0).toFixed(1)} ms</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Health</p>
                <div className="mt-2"><StatusBadge status={selectedNode.health_status} /></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteNode)}
        title="Delete storage node"
        description={`Are you sure you want to remove ${deleteNode?.node_name || "this node"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteNode(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default StorageNodes;
