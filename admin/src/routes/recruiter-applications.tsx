import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminStore, RecruiterApplication } from "@/lib/admin-store";
import {
  Inbox, Search, CheckCircle2, XCircle, Building2, Mail, Phone, Globe, MapPin, Hash, BedDouble, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/recruiter-applications")({
  component: RecruiterApplicationsPage,
});

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;
type Filter = (typeof STATUS_FILTERS)[number];

function RecruiterApplicationsPage() {
  const { recruiterApplications, approveRecruiterApplication, rejectRecruiterApplication } = useAdminStore();
  const [filter, setFilter] = useState<Filter>("Pending");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = recruiterApplications.filter((a) => {
    if (filter !== "All" && a.status !== filter) return false;
    if (search && !`${a.hospitalName} ${a.city} ${a.email}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0];

  const counts = {
    Pending: recruiterApplications.filter((a) => a.status === "Pending").length,
    Approved: recruiterApplications.filter((a) => a.status === "Approved").length,
    Rejected: recruiterApplications.filter((a) => a.status === "Rejected").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recruiter Applications</h1>
        <p className="text-sm text-muted-foreground">Review hospital sign-up requests and approve verified recruiters.</p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={recruiterApplications.length} icon={Inbox} />
        <StatCard label="Pending" value={counts.Pending} icon={Sparkles} tone="warning" />
        <StatCard label="Approved" value={counts.Approved} icon={CheckCircle2} tone="success" />
        <StatCard label="Rejected" value={counts.Rejected} icon={XCircle} tone="destructive" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedId(null); }}
              className={`h-9 px-3 rounded-lg text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted border-border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospital, city, email…"
            className="h-9 w-full sm:w-80 rounded-lg border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {recruiterApplications.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card/50 py-16 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium">No applications yet</p>
          <p className="text-xs text-muted-foreground">Submissions from the Join Us form will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">
          {/* List */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="divide-y">
              {filtered.length === 0 && (
                <p className="p-8 text-center text-sm text-muted-foreground">No applications match the filter.</p>
              )}
              {filtered.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                    selected?.id === a.id ? "bg-muted/60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{a.hospitalName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.hospitalType} • {a.city}, {a.state} • {a.beds} beds
                      </p>
                    </div>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{a.email}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{a.phone}</span>
                    <PlanBadge plan={a.plan} />
                    <span>Submitted {a.submitted}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <aside className="rounded-xl border bg-card p-5 h-fit xl:sticky xl:top-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{selected.hospitalName}</h3>
                  <p className="text-xs text-muted-foreground">{selected.hospitalType}</p>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <Row icon={Hash} label="Registration">{selected.registrationNumber}</Row>
                <Row icon={BedDouble} label="Beds">{selected.beds}</Row>
                <Row icon={MapPin} label="Location">{selected.city}, {selected.state}</Row>
                <Row icon={Building2} label="Address">{selected.address}</Row>
                <Row icon={Globe} label="Website">{selected.website || "—"}</Row>
                <Row icon={Phone} label="Phone">{selected.phone}</Row>
                <Row icon={Mail} label="Email">{selected.email}</Row>
                <Row icon={Sparkles} label="Plan"><PlanBadge plan={selected.plan} /></Row>
              </div>

              {selected.status === "Pending" && (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => approveRecruiterApplication(selected.id)}
                    className="h-10 rounded-lg bg-success text-success-foreground text-sm font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button
                    onClick={() => rejectRecruiterApplication(selected.id)}
                    className="h-10 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 inline-flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
              {selected.status === "Approved" && (
                <p className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
                  Approved — hospital added with verified badge. All recruiters under this hospital are auto-verified.
                </p>
              )}
              {selected.status === "Rejected" && (
                <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  Application rejected.
                </p>
              )}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: React.ElementType; tone?: "success" | "warning" | "destructive" }) {
  const toneCls =
    tone === "success" ? "text-success bg-success/10"
    : tone === "warning" ? "text-warning bg-warning/15"
    : tone === "destructive" ? "text-destructive bg-destructive/10"
    : "text-primary bg-primary/10";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${toneCls}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: RecruiterApplication["status"] }) {
  const cls =
    status === "Approved" ? "bg-success/15 text-success border-success/30"
    : status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/30"
    : "bg-warning/15 text-warning-foreground border-warning/40";
  return (
    <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const cls =
    plan === "Premium" ? "bg-primary text-primary-foreground"
    : plan === "Pro" ? "bg-info/15 text-info"
    : "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>{plan}</span>;
}

function Row({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="text-sm break-words">{children}</div>
      </div>
    </div>
  );
}
