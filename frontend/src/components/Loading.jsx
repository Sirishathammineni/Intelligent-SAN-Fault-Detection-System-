import { RefreshCw } from "lucide-react";

function Loading({ label = "Loading data..." }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-medium text-slate-500">
      <RefreshCw size={16} className="animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export default Loading;
