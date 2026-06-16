import { Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  Users,
  CheckCircle2,
  Activity,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Route } from "@/routes/_app.index";
import { VerifiedBadge } from "@/components/brand/VerifiedBadge";

const HiringChart = lazy(() => import("./HiringChart"));

const KPI_ICONS = [Briefcase, Activity, Users, CheckCircle2];

export function DashboardPage() {
  const { candidates: CANDIDATES, jobs: JOBS, stats, hospital } = Route.useLoaderData();
  const hospitalLabel = hospital?.shortName || hospital?.name || "Your hospital";
  const KPI = stats.kpis.map((k, i) => ({ ...k, icon: KPI_ICONS[i] ?? Briefcase }));
  const suggested = stats.suggested.length ? stats.suggested : CANDIDATES.slice(0, 5);
  const recentApplicants = CANDIDATES.slice(0, 5);
  const recentJobs = JOBS.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
            {hospitalLabel}
          </div>
          <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight md:text-[32px]">
            Hiring overview
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {hospital?.name
              ? `Recruitment snapshot for ${hospital.name}.`
              : "Snapshot of your recruitment activity."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <VerifiedBadge label="Verified Hospital" size="md" />
          <Button asChild className="h-10">
            <Link to="/jobs/new">
              Post opportunity <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((k) => (
          <Card key={k.label} className="border-border bg-card shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/5 text-primary">
                  <k.icon className="h-4 w-4" />
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                  <ArrowUpRight className="h-3 w-3" /> {k.delta}
                </span>
              </div>
              <div className="mt-4 font-display text-[28px] font-semibold tracking-tight">
                {k.value}
              </div>
              <div className="text-[12px] text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Recent jobs */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border-border bg-card shadow-soft lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-[16px]">Hiring activity</CardTitle>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Last 8 weeks · applications trend and jobs posted
              </p>
            </div>
          </CardHeader>
          <CardContent className="pl-2 pr-4">
            <Suspense fallback={<Skeleton className="h-[260px] w-full" />}>
              <HiringChart data={stats.chart} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-[16px]">Recent job posts</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-7 text-[12px]">
              <Link to="/jobs">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJobs.map((j: any) => (
              <Link
                to="/applicants"
                key={j.id}
                className="block rounded-lg border border-border bg-background px-3 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium text-foreground">{j.role}</div>
                    <div className="text-[12px] text-muted-foreground">
                      {j.specialty} · {j.location}
                    </div>
                  </div>
                  <Badge variant="outline" className="border-border text-[10px]">
                    {j.type}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{j.applicants} applicants</span>
                  <span>{j.postedOn}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent applicants */}
      <Card className="border-border bg-card shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-display text-[16px]">Recent applicants</CardTitle>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Latest candidates across all open positions
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 text-[12px]">
            <Link to="/applicants">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2 text-left font-medium">Candidate</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Experience</th>
                  <th className="px-4 py-2 text-left font-medium">Location</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-t border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/5 text-[11px] font-semibold text-primary">
                          {c.initials}
                        </span>
                        <div>
                          <div className="font-medium text-foreground">{c.name}</div>
                          <div className="text-[11px] text-muted-foreground">{c.specialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.experienceYears} yrs</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.location}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.appliedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Suggested candidates */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-[18px] font-semibold tracking-tight">
              Suggested candidates
            </h2>
            <p className="text-[12px] text-muted-foreground">
              Matched against your active openings
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 text-[12px]">
            <Link to="/applicants">Browse all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {suggested.map((s: { id: string; name: string; initials: string; specialty: string; experienceYears: number; location: string; matchPercent: number }) => (
            <Card key={s.id} className="border-border bg-card shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-[12px] font-semibold">
                    {s.initials}
                  </div>
                  <MatchRing percent={s.matchPercent} />
                </div>
                <div className="mt-3">
                  <div className="text-[13px] font-medium leading-tight">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.specialty}</div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{s.experienceYears} yrs</span>
                  <span>{s.location}</span>
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="mt-3 h-8 w-full text-[12px]"
                >
                  <Link to="/applicants">View profile</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    New: "bg-accent/10 text-accent",
    Shortlisted: "bg-success/10 text-success",
    Rejected: "bg-destructive/10 text-destructive",
    Contacted: "bg-warning/15 text-warning-foreground",
  };
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
        (map[status] ?? "bg-muted text-muted-foreground")
      }
    >
      {status}
    </span>
  );
}

function MatchRing({ percent }: { percent: number }) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="relative h-9 w-9">
      <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-[10px] font-semibold text-foreground">
        {percent}
      </span>
    </div>
  );
}
