function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure operational preferences for SAN Guardian.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-900">Monitoring Configuration</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Auto refresh interval</span>
              <span className="font-semibold text-slate-900">10 seconds</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Metric retention</span>
              <span className="font-semibold text-slate-900">90 days</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Alert threshold</span>
              <span className="font-semibold text-slate-900">Warning / Critical</span>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-900">System Administration</h2>
          <div className="mt-4 space-y-4 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Backend API</span>
              <span className="font-semibold text-slate-900">http://127.0.0.1:5000</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Data source</span>
              <span className="font-semibold text-slate-900">SQLite</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span>Mode</span>
              <span className="font-semibold text-slate-900">Academic demo</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
