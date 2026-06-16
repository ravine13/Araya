import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Briefcase,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ApplicantStatus } from "@/lib/mock";
import { statusPillClass } from "@/lib/applicationStatus";
import { VerifiedBadge } from "@/components/brand/VerifiedBadge";
import { CandidatePanel } from "./CandidatePanel";
import { CvDialog } from "./CvDialog";
import { Route } from "@/routes/_app.applicants";

export function ApplicantsPage() {
  const { candidates: CANDIDATES, jobs: JOBS } = Route.useLoaderData();
  const { jobId: jobIdFromUrl, q: searchQFromUrl } = Route.useSearch();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobIdFromUrl ?? null);
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | "All">("All");
  const [view, setView] = useState<"table" | "cards">("table");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);

  useEffect(() => {
    if (jobIdFromUrl) setSelectedJobId(jobIdFromUrl);
  }, [jobIdFromUrl]);

  useEffect(() => {
    if (searchQFromUrl) setQuery(searchQFromUrl);
  }, [searchQFromUrl]);

  const postedJobs = useMemo(
    () =>
      (JOBS as { id: string; status: string }[]).filter(
        (j) => j.status === "Active" || j.status === "Closed",
      ),
    [JOBS],
  );

  const applicantCountByJob = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of CANDIDATES as { appliedTo: string }[]) {
      map[c.appliedTo] = (map[c.appliedTo] || 0) + 1;
    }
    return map;
  }, [CANDIDATES]);

  const selectedJob = postedJobs.find((j: { id: string }) => j.id === selectedJobId);

  const list = useMemo(() => {
    if (!selectedJobId) return [];
    return CANDIDATES.filter(
      (c: {
        appliedTo: string;
        status: string;
        name: string;
        specialty: string;
      }) =>
        c.appliedTo === selectedJobId &&
        (statusFilter === "All" || c.status === statusFilter) &&
        (query.trim() === "" ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.specialty.toLowerCase().includes(query.toLowerCase())),
    );
  }, [selectedJobId, statusFilter, query, CANDIDATES]);

  const allChecked = selected.length > 0 && selected.length === list.length;
  const toggleAll = () => setSelected(allChecked ? [] : list.map((c: { id: string }) => c.id));
  const toggleOne = (id: string) =>
    setSelected((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const openCandidate = CANDIDATES.find((c: { id: string }) => c.id === openId) ?? null;
  const cvCandidate = CANDIDATES.find((c: { id: string }) => c.id === cvId) ?? null;

  if (!selectedJobId) {
    return (
      <div className="mx-auto w-full max-w-[1400px] space-y-6">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-tight">Applicants</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Select a job post to review candidates who applied for that role.
          </p>
        </div>

        {postedJobs.length === 0 ? (
          <Card className="border-border bg-card shadow-soft">
            <CardContent className="py-16 text-center text-muted-foreground">
              No job posts yet. Post a job to start receiving applications.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {postedJobs.map((j: {
              id: string;
              role: string;
              specialty: string;
              location: string;
              type: string;
              status: string;
              applicants?: number;
            }) => {
              const count = applicantCountByJob[j.id] ?? j.applicants ?? 0;
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => {
                    setSelectedJobId(j.id);
                    setSelected([]);
                    setQuery("");
                    setStatusFilter("All");
                  }}
                  className="group rounded-xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-pop"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      {j.status === "Closed" && (
                        <Badge variant="outline" className="text-[10px]">
                          Closed
                        </Badge>
                      )}
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground">
                        {count} applicant{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <h2 className="mt-4 font-display text-[17px] font-semibold leading-snug text-foreground group-hover:text-primary">
                    {j.role}
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">{j.specialty}</p>
                  <p className="mt-2 flex items-center gap-1 text-[12px] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" /> {j.location}
                  </p>
                  <p className="mt-3 text-[11px] font-medium text-primary">View applicants →</p>
                </button>
              );
            })}
          </div>
        )}

        <CandidatePanel
          candidate={openCandidate}
          onClose={() => setOpenId(null)}
          onViewCv={(id) => setCvId(id)}
        />
        <CvDialog candidate={cvCandidate} onClose={() => setCvId(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 h-8 text-[13px] text-muted-foreground"
            onClick={() => {
              setSelectedJobId(null);
              setOpenId(null);
              setCvId(null);
            }}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> All job posts
          </Button>
          <h1 className="font-display text-[28px] font-semibold tracking-tight">
            {selectedJob?.role}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-muted-foreground">
            <span>
              {selectedJob?.specialty} · {selectedJob?.location} · {list.length} applicant
              {list.length !== 1 ? "s" : ""}
            </span>
            {selectedJob?.status === "Closed" && (
              <Badge variant="outline">Job closed</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
          <Users className="h-4 w-4" />
          Reviewing applications for this post only
        </div>
      </div>

      <Card className="border-border bg-card shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full pl-8 text-[13px]"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ApplicantStatus | "All")}
          >
            <SelectTrigger className="h-9 w-36 text-[13px]">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                ["All", "Applied", "Reviewed", "Shortlisted", "Contacted", "Rejected", "Job closed"] as const
              ).map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
            <button
              onClick={() => setView("table")}
              className={
                "grid h-8 w-8 place-items-center rounded " +
                (view === "table" ? "bg-card shadow-soft" : "text-muted-foreground")
              }
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("cards")}
              className={
                "grid h-8 w-8 place-items-center rounded " +
                (view === "cards" ? "bg-card shadow-soft" : "text-muted-foreground")
              }
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>

      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/[0.06] px-4 py-2.5">
          <div className="text-[13px] text-foreground">
            <span className="font-medium">{selected.length}</span> selected
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={() => {
                toast.success(`${selected.length} shortlisted`);
                setSelected([]);
              }}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Shortlist
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/5"
              onClick={() => {
                toast("Candidates rejected");
                setSelected([]);
              }}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </div>
      )}

      {view === "table" ? (
        <ApplicantsTable
          list={list}
          selected={selected}
          allChecked={allChecked}
          toggleAll={toggleAll}
          toggleOne={toggleOne}
          setOpenId={setOpenId}
          setCvId={setCvId}
        />
      ) : (
        <ApplicantsCards list={list} setOpenId={setOpenId} />
      )}

      <CandidatePanel
        candidate={openCandidate}
        onClose={() => setOpenId(null)}
        onViewCv={(id) => setCvId(id)}
      />
      <CvDialog candidate={cvCandidate} onClose={() => setCvId(null)} />
    </div>
  );
}

function ApplicantsTable({
  list,
  selected,
  allChecked,
  toggleAll,
  toggleOne,
  setOpenId,
  setCvId,
}: {
  list: unknown[];
  selected: string[];
  allChecked: boolean;
  toggleAll: () => void;
  toggleOne: (id: string) => void;
  setOpenId: (id: string) => void;
  setCvId: (id: string) => void;
}) {
  return (
    <Card className="border-border bg-card shadow-soft">
      <CardContent className="px-2 py-2">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="w-10 px-3 py-2">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Select all" />
                </th>
                <th className="px-3 py-2 text-left font-medium">Candidate</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Exp</th>
                <th className="px-3 py-2 text-left font-medium">Location</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(list as { id: string; initials: string; name: string; specialty: string; verified: boolean; role: string; experienceYears: number; location: string; status: string }[]).map(
                (c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onCheckedChange={() => toggleOne(c.id)}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setOpenId(c.id)}
                        className="flex items-center gap-2.5 text-left"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground text-[11px] font-semibold">
                          {c.initials}
                        </span>
                        <span>
                          <span className="flex items-center gap-1.5 font-medium">
                            {c.name}
                            {c.verified && <VerifiedBadge />}
                          </span>
                          <span className="text-[11px] text-muted-foreground">{c.specialty}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{c.role}</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.experienceYears} yrs</td>
                    <td className="px-3 py-3 text-muted-foreground">{c.location}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => setCvId(c.id)}>
                        View CV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-1 h-8"
                        onClick={() => setOpenId(c.id)}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ),
              )}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-muted-foreground">
                    No applicants for this job yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicantsCards({
  list,
  setOpenId,
}: {
  list: unknown[];
  setOpenId: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {(list as { id: string; initials: string; name: string; specialty: string; verified: boolean; role: string; experienceYears: number; location: string; status: string; summary: string; appliedOn: string }[]).map(
        (c) => (
          <Card
            key={c.id}
            className="cursor-pointer border-border bg-card shadow-soft hover:shadow-pop"
            onClick={() => setOpenId(c.id)}
          >
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-[13px] font-semibold">
                  {c.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">{c.name}</span>
                    {c.verified && <VerifiedBadge />}
                  </div>
                  <div className="text-[12px] text-muted-foreground">
                    {c.role} · {c.specialty}
                  </div>
                </div>
                <StatusPill status={c.status} />
              </div>
              <p className="line-clamp-2 text-[12.5px] text-muted-foreground">{c.summary}</p>
              <div className="flex justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                <span>
                  {c.experienceYears} yrs · {c.location}
                </span>
                <span>{c.appliedOn}</span>
              </div>
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
        statusPillClass(status)
      }
    >
      {status}
    </span>
  );
}
