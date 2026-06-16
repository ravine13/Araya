import { createFileRoute } from "@tanstack/react-router";
import { systemLogs } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";

export const Route = createFileRoute("/system-logs")({
  component: SystemLogsPage,
});

function SystemLogsPage() {
  const [actionFilter, setActionFilter] = useState("All");
  const actionTypes = ["All", ...new Set(systemLogs.map((l) => l.action))];
  const filtered = actionFilter === "All" ? systemLogs : systemLogs.filter((l) => l.action === actionFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Detailed audit trail of all platform operations</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {actionTypes.map((a) => (
          <button key={a} onClick={() => setActionFilter(a)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${actionFilter === a ? "bg-primary text-primary-foreground" : "border bg-card hover:bg-accent"}`}>
            {a}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.user}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{l.timestamp}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
