import { createFileRoute } from "@tanstack/react-router";
import { StatusBadge, VerifiedBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Eye, Ban, ShieldCheck, Edit, X } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";

export const Route = createFileRoute("/candidates")({
  component: CandidatesPage,
});

function CandidatesPage() {
  const store = useAdminStore();
  const [selected, setSelected] = useState<string | null>(null);
  const detail = store.candidates.find((c) => c.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidate Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all registered healthcare professionals</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 rounded-xl border bg-card shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Specialty</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Experience</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verified</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {store.candidates.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.role}</td>
                    <td className="px-4 py-3">{c.specialty}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.experience}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3"><VerifiedBadge verified={c.verified} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(c.id)} className="rounded p-1.5 hover:bg-accent" title="View"><Eye className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={() => store.toggleCandidateBlock(c.id)}
                          className={`rounded p-1.5 hover:bg-accent ${c.status === "Active" ? "text-destructive" : ""}`}
                          title={c.status === "Active" ? "Block account" : "Unblock account"}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => store.verifyCandidate(c.id)}
                          className="rounded p-1.5 hover:bg-accent"
                          title="Verify candidate"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </button>
                        <button className="rounded p-1.5 hover:bg-accent" title="Edit"><Edit className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detail && (
          <div className="w-full xl:w-[360px] shrink-0 rounded-xl border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Candidate Profile</h3>
              <button onClick={() => setSelected(null)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-primary font-bold text-lg">{detail.name.split(" ").map(w => w[0]).join("").slice(0,2)}</div>
              <div><p className="text-xs text-muted-foreground">Name</p><p className="text-sm font-medium">{detail.name}</p></div>
              <div><p className="text-xs text-muted-foreground">Role</p><p className="text-sm">{detail.role}</p></div>
              <div><p className="text-xs text-muted-foreground">Specialty</p><p className="text-sm">{detail.specialty}</p></div>
              <div><p className="text-xs text-muted-foreground">Experience</p><p className="text-sm">{detail.experience}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><StatusBadge status={detail.status} /></div>
              <div><p className="text-xs text-muted-foreground">Verification</p><VerifiedBadge verified={detail.verified} /></div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">CV Preview</p>
              <div className="h-32 rounded bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">CV document preview placeholder</div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => store.toggleCandidateBlock(detail.id)}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                {detail.status === "Active" ? "Block Account" : "Unblock Account"}
              </button>
              <button
                onClick={() => store.verifyCandidate(detail.id)}
                className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent"
                disabled={detail.verified}
              >
                {detail.verified ? "Already Verified" : "Verify Candidate"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
