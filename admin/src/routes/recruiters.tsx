import { createFileRoute } from "@tanstack/react-router";
import { StatusBadge, VerifiedBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Eye, Ban, CheckCircle, Edit, X } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export const Route = createFileRoute("/recruiters")({
  component: RecruitersPage,
});

function RecruitersPage() {
  const store = useAdminStore();
  const [selected, setSelected] = useState<string | null>(null);
  const detail = store.hospitals.find((r) => r.id === selected);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recruiter Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage all registered hospitals and clinics</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 rounded-xl border bg-card shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hospital Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jobs Posted</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verification</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.hospitals.map((r) => {
                  const jobsPosted = store.jobs.filter((j) => j.hospitalId === r.id).length;
                  return (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.location}</td>
                      <td className="px-4 py-3">{jobsPosted}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3"><VerifiedBadge verified={r.verified} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.joined}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelected(r.id)} className="rounded p-1.5 hover:bg-accent" title="View"><Eye className="h-3.5 w-3.5" /></button>
                          <button
                            onClick={() => store.toggleHospitalBlock(r.id)}
                            className={`rounded p-1.5 hover:bg-accent ${r.status === "Active" ? "text-destructive" : ""}`}
                            title={r.status === "Active" ? "Block" : "Unblock"}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => (r.verified ? store.unverifyHospital(r.id) : store.verifyHospital(r.id))}
                            className="rounded p-1.5 hover:bg-accent"
                            title={r.verified ? "Revoke verification" : "Verify"}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                          <button className="rounded p-1.5 hover:bg-accent" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {detail && (
          <div className="w-full xl:w-[360px] shrink-0 rounded-xl border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Hospital Details</h3>
              <button onClick={() => setSelected(null)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-50 text-primary font-bold text-lg">{detail.name[0]}</div>
              <div><p className="text-xs text-muted-foreground">Hospital</p><p className="text-sm font-medium">{detail.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Location</p><p className="text-sm">{detail.location}</p></div>
              <div><p className="text-xs text-muted-foreground">Recruiters under hospital</p><p className="text-sm">{store.recruiters.filter((x) => x.hospitalId === detail.id).length}</p></div>
              <div><p className="text-xs text-muted-foreground">Jobs Posted</p><p className="text-sm">{store.jobs.filter((j) => j.hospitalId === detail.id).length}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detail.status} /></div>
              <div><p className="text-xs text-muted-foreground">Verification</p><VerifiedBadge verified={detail.verified} /></div>
              <div><p className="text-xs text-muted-foreground">Joined</p><p className="text-sm">{detail.joined}</p></div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => store.toggleHospitalBlock(detail.id)}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {detail.status === "Active" ? "Block Hospital" : "Unblock Hospital"}
              </button>
              <button
                onClick={() => (detail.verified ? store.unverifyHospital(detail.id) : store.verifyHospital(detail.id))}
                className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent"
              >
                {detail.verified ? "Revoke Verification" : "Verify Hospital"}
              </button>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Verifying a hospital automatically grants verification badges to all recruiters working under it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
