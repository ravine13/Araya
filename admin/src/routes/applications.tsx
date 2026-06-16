import { createFileRoute } from "@tanstack/react-router";
import { applications } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, Flag, RefreshCw } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/applications")({
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const statuses = ["All", "Under Review", "Shortlisted", "Accepted", "Rejected"];
  const filtered = statusFilter === "All" ? applications : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and manage all job applications</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "border bg-card hover:bg-accent"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Candidate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Job</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hospital</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applied</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{a.candidate}</td>
                  <td className="px-4 py-3">{a.job}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.hospital}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{a.applied}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="rounded p-1.5 hover:bg-accent" title="View"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1.5 hover:bg-accent" title="Override Status"><RefreshCw className="h-3.5 w-3.5" /></button>
                      <button className="rounded p-1.5 hover:bg-accent" title="Flag"><Flag className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <p className="text-sm font-medium">No applications found</p>
          <p className="text-xs text-muted-foreground mt-1">No applications match the current filter.</p>
        </div>
      )}
    </div>
  );
}
