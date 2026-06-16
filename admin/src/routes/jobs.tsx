import { createFileRoute } from "@tanstack/react-router";
import { StatusBadge } from "@/components/StatusBadge";
import { Eye, Trash2, Flag } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export const Route = createFileRoute("/jobs")({
  component: JobsPage,
});

function JobsPage() {
  const store = useAdminStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Global view of all jobs across the platform</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Job Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hospital</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recruiter</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applicants</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Posted</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {store.jobs.map((j) => {
                const hospital = store.hospitals.find((h) => h.id === j.hospitalId);
                const recruiter = store.recruiters.find((r) => r.id === j.recruiterId);
                const applicants = store.applications.filter((a) => a.jobId === j.id).length;
                return (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{j.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{hospital?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{recruiter?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{j.location}</td>
                    <td className="px-4 py-3">{applicants}</td>
                    <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{j.posted}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded p-1.5 hover:bg-accent" title="View"><Eye className="h-3.5 w-3.5" /></button>
                        <button className="rounded p-1.5 hover:bg-accent" title="Flag"><Flag className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={() => { if (confirm(`Delete job "${j.title}"?`)) store.deleteJob(j.id); }}
                          className="rounded p-1.5 hover:bg-accent text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {store.jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4"><Flag className="h-5 w-5 text-muted-foreground" /></div>
          <p className="text-sm font-medium">No jobs found</p>
          <p className="text-xs text-muted-foreground mt-1">Jobs will appear here once recruiters start posting.</p>
        </div>
      )}
    </div>
  );
}
