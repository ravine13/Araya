import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, MapPin, Sparkles } from "lucide-react";
import { MatchRing } from "@/components/common/MatchRing";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { formatLPA } from "@/lib/format";
import { computeJobMatches } from "@/lib/matchJobs";
import type { Profile } from "@/data/profile";

export function RecommendedRail({ jobs = [], profile }: { jobs?: any[]; profile?: Profile | null }) {
  const recs = computeJobMatches(jobs, profile).slice(0, 5);

  if (recs.length === 0) return null;

  return (
    <section className="animate-fade-in-up rounded-2xl border bg-gradient-to-br from-brand-soft/60 via-surface to-surface p-6 shadow-soft">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-primary ring-soft">
            <Sparkles className="h-3 w-3" /> Matched to your profile
          </div>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Recommended for you
          </h2>
        </div>
        <Link
          to="/"
          className="hidden items-center gap-1 text-xs font-medium text-brand hover:underline md:inline-flex"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="scrollbar-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {recs.map((j) => (
          <Link
            key={j.id}
            to="/jobs/$jobId"
            params={{ jobId: j.id }}
            className="group w-[280px] shrink-0 rounded-xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <MatchRing value={j.matchPercent ?? 0} size={36} />
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <p className="truncate text-xs font-semibold text-foreground">{j.hospital}</p>
              {j.hospitalVerified && <VerifiedBadge />}
            </div>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{j.role}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> {j.city} · {formatLPA(j.salaryMin, j.salaryMax)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
