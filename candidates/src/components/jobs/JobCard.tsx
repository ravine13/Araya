import { Link } from "@tanstack/react-router";
import { MapPin, Building2, Share2 } from "lucide-react";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { MatchRing } from "@/components/common/MatchRing";
import type { Job } from "@/data/jobs";
import { formatExp, formatLPA } from "@/lib/format";
import { toast } from "sonner";

export function JobCard({ job }: { job: Job }) {
  const handleShare = async () => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    const shareData = {
      title: `${job.role} at ${job.hospital}`,
      text: `${job.role} — ${job.specialty} in ${job.location}`,
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary">
          <Building2 className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{job.hospital}</p>
            {job.hospitalVerified && <VerifiedBadge />}
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location}
          </p>
        </div> 

        {/* Share button */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            aria-label="Share job"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <SaveJobButton jobId={job.id} />
        </div>
      </div> 

      <h3 className="mt-4 text-base font-semibold text-foreground">{job.role}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{job.specialty}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Pill>{job.type}</Pill>
        <Pill>{formatExp(job.experienceMin, job.experienceMax)}</Pill>
        <Pill>{formatLPA(job.salaryMin, job.salaryMax)}</Pill>
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-4">
        <span className="text-[11px] text-muted-foreground">
          {job.postedDays === 0 ? "Today" : `${job.postedDays}d ago`}
        </span>
        <div className="flex items-center gap-3">
          {job.matchPercent !== undefined && <MatchRing value={job.matchPercent} size={36} />}
          <Button asChild size="sm" variant="default">
            <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article> 
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-foreground/80">
      {children}
    </span>
  );
}