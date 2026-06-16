import { useMemo, useState } from "react";
import { Search, Sparkles, Lock, Crown, GraduationCap, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { type Candidate } from "@/lib/mock";
import { VerifiedBadge } from "@/components/brand/VerifiedBadge";
import { CandidatePanel } from "@/features/applicants/CandidatePanel";
import { CvDialog } from "@/features/applicants/CvDialog";
import { usePlan, PLAN_QUOTA, type PlanTier } from "./PlanContext";
import { Route } from "@/routes/_app.search";

// Allowed premium doctor degrees
const PREMIUM_DEGREES = ["MBBS", "MD", "DM", "DNB", "MS", "MCh", "DrNB"] as const;
type PremiumDegree = (typeof PREMIUM_DEGREES)[number];

const DEGREE_GROUPS = [
  { label: "Medicine", degrees: ["MBBS", "MD", "DM", "DNB"] as PremiumDegree[] },
  { label: "Surgery", degrees: ["MS", "MCh", "DrNB"] as PremiumDegree[] },
];

function candidateHasDegree(c: Candidate, deg: PremiumDegree) {
  return c.education.some((e) => {
    const d = e.degree.toUpperCase();
    // word-boundary-ish match, e.g. "MD (Internal Medicine)" matches MD, not MBBS
    return new RegExp(`(^|[^A-Z])${deg}([^A-Z]|$)`).test(d);
  });
}

function isDoctor(c: Candidate) {
  return PREMIUM_DEGREES.some((d) => candidateHasDegree(c, d));
}

export function SearchCandidatesPage() {
  const { candidates: CANDIDATES } = Route.useLoaderData();
  const [tab, setTab] = useState<"basic" | "premium">("basic");
  const [openId, setOpenId] = useState<string | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);

  const openCandidate = CANDIDATES.find((c) => c.id === openId) ?? null;
  const cvCandidate = CANDIDATES.find((c) => c.id === cvId) ?? null;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[28px] font-semibold tracking-tight">
          Search Candidates
        </h1>
        <p className="text-[14px] text-muted-foreground">
          Find healthcare talent across India. Choose Basic for support &amp; allied roles, or
          Premium for verified physicians and surgeons.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "basic" | "premium")}>
        <TabsList className="grid w-full grid-cols-2 sm:w-[420px]">
          <TabsTrigger value="basic" className="gap-2">
            <Search className="h-3.5 w-3.5" /> Basic Search
          </TabsTrigger>
          <TabsTrigger value="premium" className="gap-2">
            <Crown className="h-3.5 w-3.5" /> Premium Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-5">
          <BasicSearch candidates={CANDIDATES} onOpen={setOpenId} onCv={setCvId} />
        </TabsContent>
        <TabsContent value="premium" className="mt-5">
          <PremiumSearch candidates={CANDIDATES} onOpen={setOpenId} onCv={setCvId} />
        </TabsContent>
      </Tabs>

      <CandidatePanel
        candidate={openCandidate}
        onClose={() => setOpenId(null)}
        onViewCv={(id) => setCvId(id)}
      />
      <CvDialog candidate={cvCandidate} onClose={() => setCvId(null)} />
    </div>
  );
}

/* ----------------------------- BASIC SEARCH ----------------------------- */

function BasicSearch({
  candidates,
  onOpen,
  onCv,
}: {
  candidates: Candidate[];
  onOpen: (id: string) => void;
  onCv: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>("All");

  const nonDoctors = useMemo(() => candidates.filter((c) => !isDoctor(c)), [candidates]);
  const roles = useMemo(
    () => ["All", ...Array.from(new Set(nonDoctors.map((c) => c.role)))],
    [nonDoctors],
  );

  const results = useMemo(
    () =>
      nonDoctors.filter(
        (c) =>
          (role === "All" || c.role === role) &&
          (query.trim() === "" ||
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.specialty.toLowerCase().includes(query.toLowerCase()) ||
            c.skills.some((s: string) => s.toLowerCase().includes(query.toLowerCase()))),
      ),
    [nonDoctors, query, role],
  );

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card shadow-soft">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-2 rounded-md border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-[12.5px] text-amber-900">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Basic search covers nurses, technicians, pharmacists and allied roles. Doctor
              (MBBS / MD / MS / DM / MCh / DNB / DrNB) profiles are gated to{" "}
              <span className="font-medium">Premium Search</span>.
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialty or skill…"
                className="h-10 pl-9"
              />
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-10 sm:w-56">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r: string) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-[12px] text-muted-foreground">
            Unlimited searches · {results.length} candidate{results.length === 1 ? "" : "s"} found
          </div>
        </CardContent>
      </Card>

      <ResultsGrid results={results} onOpen={onOpen} onCv={onCv} />
    </div>
  );
}

/* --------------------------- PREMIUM SEARCH ----------------------------- */

function PremiumSearch({
  candidates,
  onOpen,
  onCv,
}: {
  candidates: Candidate[];
  onOpen: (id: string) => void;
  onCv: (id: string) => void;
}) {
  const { plan, used, quota, remaining, consume } = usePlan();
  const [query, setQuery] = useState("");
  const [selectedDegrees, setSelectedDegrees] = useState<PremiumDegree[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Candidate[]>([]);

  const toggleDegree = (d: PremiumDegree) =>
    setSelectedDegrees((arr) =>
      arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d],
    );

  const runSearch = () => {
    if (remaining <= 0) {
      toast.error(`You've reached your ${plan} plan limit of ${quota} premium searches.`);
      return;
    }
    if (!consume()) return;

    const degrees = selectedDegrees.length > 0 ? selectedDegrees : [...PREMIUM_DEGREES];
    const r = candidates.filter(
      (c) =>
        isDoctor(c) &&
        degrees.some((d) => candidateHasDegree(c, d)) &&
        (query.trim() === "" ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.specialty.toLowerCase().includes(query.toLowerCase()) ||
          c.procedures.some((p: string) => p.toLowerCase().includes(query.toLowerCase()))),
    );
    setResults(r);
    setHasSearched(true);
    toast.success(`Premium search · ${r.length} physician${r.length === 1 ? "" : "s"} found`);
  };

  const pct = Math.min(100, Math.round((used / quota) * 100));

  return (
    <div className="space-y-4">
      {/* Premium hero panel */}
      <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.72_0.12_85_/_0.35)] bg-gradient-to-br from-[oklch(0.16_0.05_265)] via-[oklch(0.20_0.06_260)] to-[oklch(0.12_0.04_265)] p-[1.5px] shadow-pop">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.82_0.14_85)] to-transparent opacity-60" />
        <div className="rounded-[15px] bg-gradient-to-br from-[oklch(0.17_0.05_265)] to-[oklch(0.11_0.04_265)] p-6 text-[oklch(0.96_0.01_85)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[oklch(0.72_0.14_85_/_0.4)] bg-[oklch(0.72_0.14_85_/_0.08)] px-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[oklch(0.85_0.14_85)]">
                  <Crown className="h-3 w-3" /> Premium
                </span>
                <span className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Verified Physician Network
                </span>
              </div>
              <h2 className="mt-3 font-display text-[22px] font-semibold tracking-tight">
                Search India's verified doctors
              </h2>
              <p className="mt-1 max-w-xl text-[13px] text-white/65">
                Licence-verified MBBS, MD, MS, DM, MCh, DNB &amp; DrNB profiles — sourced from
                leading institutes and cross-checked against State / NMC registers.
              </p>
            </div>
            <div className="min-w-[200px] rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/55">
                <span>{plan} plan</span>
                <span>{remaining} left</span>
              </div>
              <div className="mt-2 font-display text-[20px] text-white">
                {used}<span className="text-white/40"> / {quota}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.14_85)] to-[oklch(0.88_0.12_85)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, specialty, procedure…"
                className="h-11 border-white/15 bg-white/[0.07] pl-9 text-white placeholder:text-white/40 focus-visible:bg-white/[0.1] focus-visible:ring-[oklch(0.78_0.14_85)]"
              />
            </div>
            <Button
              onClick={runSearch}
              className="h-11 gap-2 bg-gradient-to-r from-[oklch(0.78_0.14_85)] to-[oklch(0.86_0.13_85)] text-[oklch(0.18_0.04_265)] hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" /> Premium search
            </Button>
          </div>

          {/* Degree chips */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/55">
              <GraduationCap className="h-3.5 w-3.5" /> Filter by qualification
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {DEGREE_GROUPS.map((g) => (
                <div key={g.label}>
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/45">
                    {g.label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.degrees.map((d) => {
                      const active = selectedDegrees.includes(d);
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDegree(d)}
                          className={
                            "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium transition-colors " +
                            (active
                              ? "border-[oklch(0.78_0.14_85)] bg-[oklch(0.78_0.14_85)] text-[oklch(0.18_0.04_265)]"
                              : "border-white/15 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]")
                          }
                        >
                          {d}
                          {active && <X className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-white/50">
              Only the qualifications listed above are searchable in the premium pool. All other
              healthcare professionals are available via Basic Search.
            </p>
          </div>
        </div>
      </div>

      {/* Quota progress card */}
      <Card className="border-border bg-card shadow-soft">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <div className="text-[13px]">
              <span className="font-medium text-foreground">{plan} plan</span>
              <span className="text-muted-foreground">
                {" "}· {used} of {quota} premium searches used this cycle
              </span>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <Progress value={pct} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched ? (
        results.length > 0 ? (
          <ResultsGrid results={results} onOpen={onOpen} onCv={onCv} premium />
        ) : (
          <Card className="border-dashed border-border bg-card">
            <CardContent className="p-10 text-center text-[13px] text-muted-foreground">
              No verified doctors matched your filters. Try widening qualifications.
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="p-10 text-center text-[13px] text-muted-foreground">
            Select qualifications and run a premium search to see verified physician profiles.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------ RESULTS --------------------------------- */

function ResultsGrid({
  results,
  onOpen,
  onCv,
  premium = false,
}: {
  results: Candidate[];
  onOpen: (id: string) => void;
  onCv: (id: string) => void;
  premium?: boolean;
}) {
  if (results.length === 0) {
    return (
      <Card className="border-dashed border-border bg-card">
        <CardContent className="p-10 text-center text-[13px] text-muted-foreground">
          No candidates match your filters.
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {results.map((c) => (
        <Card
          key={c.id}
          className={
            "group cursor-pointer border-border bg-card shadow-soft transition-shadow hover:shadow-pop " +
            (premium ? "ring-1 ring-[oklch(0.78_0.14_85_/_0.18)]" : "")
          }
          onClick={() => onOpen(c.id)}
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
              {premium && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[oklch(0.78_0.14_85_/_0.4)] bg-[oklch(0.78_0.14_85_/_0.1)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[oklch(0.55_0.12_75)]">
                  <Crown className="h-2.5 w-2.5" /> Verified
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-[12.5px] text-muted-foreground">{c.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {c.education.slice(0, 2).map((e, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {e.degree}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span>
                {c.experienceYears} yrs · {c.location}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-[11px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onCv(c.id);
                }}
              >
                View CV
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { PLAN_QUOTA };
export type { PlanTier };
