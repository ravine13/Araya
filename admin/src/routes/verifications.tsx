import { createFileRoute } from "@tanstack/react-router";
import { verifications } from "@/lib/mock-data";
import { CheckCircle, XCircle, FileText } from "lucide-react";

export const Route = createFileRoute("/verifications")({
  component: VerificationsPage,
});

function VerificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Verification Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve pending verifications</p>
      </div>

      {/* Pending Hospitals */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold">Pending Hospital Verifications</h3>
        {verifications.pendingHospitals.map((h) => (
          <div key={h.id} className="flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.location} · Submitted {h.submitted}</p>
              </div>
              <div className="flex gap-2">
                {h.documents.map((doc) => (
                  <span key={doc} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs">
                    <FileText className="h-3 w-3" />{doc}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:bg-success/90">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Candidates */}
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold">Pending Candidate Verifications</h3>
        {verifications.pendingCandidates.map((c) => (
          <div key={c.id} className="flex items-start justify-between rounded-lg border p-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.role} · Submitted {c.submitted}</p>
              </div>
              <div className="flex gap-2">
                {c.documents.map((doc) => (
                  <span key={doc} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs">
                    <FileText className="h-3 w-3" />{doc}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-foreground hover:bg-success/90">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
              <button className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
