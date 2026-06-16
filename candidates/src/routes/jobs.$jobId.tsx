import { apiBase } from "@/lib/api";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Building2, Calendar, IndianRupee, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { SaveJobButton } from "@/components/jobs/SaveJobButton";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { JobCard } from "@/components/jobs/JobCard";
import { formatExp, formatLPA } from "@/lib/format";
import { isHtmlContent } from "@/lib/renderHtml";
// Auth
import { useAuth } from "@/store/authStore";
import { useNavigate } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({
  loader: async ({ params }) => {
    const res = await fetch(`${apiBase()}/api/jobs/${params.jobId}`);
    if (!res.ok) throw notFound();
    const job = await res.json();
    
    // Fetch similar jobs (just fetching all and filtering for simplicity right now)
    const allRes = await fetch(`${apiBase()}/api/jobs`);
    let similar = [];
    if (allRes.ok) {
      const allJobs = await allRes.json();
      similar = allJobs.filter((j: any) => j.id !== job.id && j.category === job.category).slice(0, 4);
    }
    return { job, similar };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.job.role} — ${loaderData.job.hospital} | ApronHanger` },
          { name: "description", content: loaderData.job.description.slice(0, 150) },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-20 text-center">
      <h2 className="text-xl font-semibold">Job not found</h2>
      <Button asChild className="mt-4">
        <Link to="/">Browse opportunities</Link>
      </Button>
    </div>
  ),
  component: JobDetails,
});

function JobDetails() {
  const { job, similar } = Route.useLoaderData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleShare() {
    const url = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success("Job link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy job link."));
  }

  function handleApply() {
    if (!isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: `/apply/${job.id}` } });
      return;
    }
    navigate({ to: "/apply/$jobId", params: { jobId: job.id } });
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
    <div className="flex items-center justify-between">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to opportunities
      </Link>
      <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
        <Share2 className="h-4 w-4" /> Share Job
      </Button>
    </div>
     
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Header card */}
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-soft text-primary">
                <Building2 className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {job.role}
                  </h1>
                  {job.hospitalVerified && <VerifiedBadge label="Verified Hospital" />}
                </div>
                <p className="mt-1 text-sm text-foreground/80">
                  {job.hospital} · {job.specialty}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Posted{" "}
                    {job.postedDays === 0 ? "today" : `${job.postedDays}d ago`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {job.description && (
            <Section title="About the role">
              <JobDescriptionContent html={job.description} />
            </Section>
          )}

          {job.responsibilities?.length > 0 && (
            <Section title="Responsibilities">
              <ul className="space-y-2">
                {job.responsibilities.map((r: string) => (
                  <li key={r} className="flex gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {job.requirements?.length > 0 && (
            <Section title="Requirements">
              <ul className="space-y-2">
                {job.requirements.map((r: string) => (
                  <li key={r} className="flex gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {r}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {job.perks?.length > 0 && (
            <Section title="Perks & benefits">
              <div className="flex flex-wrap gap-2">
                {job.perks.map((p: string) => (
                  <span
                    key={p}
                    className="rounded-full border bg-surface-2 px-3 py-1 text-xs text-foreground/80"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {job.hospitalAbout && (
            <Section title={`About ${job.hospital}`}>
              <p className="text-sm leading-relaxed text-foreground/80">{job.hospitalAbout}</p>
            </Section>
          )}
        </div>

        {/* Sticky right rail */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Compensation
            </p>
            <p className="mt-1 flex items-center gap-1 text-2xl font-semibold tracking-tight text-foreground">
              <IndianRupee className="h-5 w-5" />
              {job.salaryMin}–{job.salaryMax}
              <span className="text-base font-medium text-muted-foreground"> LPA</span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Stat label="Experience" value={job.experienceMin != null && job.experienceMax != null && (job.experienceMin > 0 || job.experienceMax > 0) ? formatExp(job.experienceMin, job.experienceMax) : job.experience || "—"} />
              <Stat label="Job type" value={job.type || "—"} />
              <Stat label="Location" value={job.city || "—"} />
              <Stat label="Posted" value={job.postedDays === 0 ? "Today" : `${job.postedDays}d ago`} />
            </div>
            <div className="mt-5 grid gap-2">
              {job.status === "Closed" ? (
                <Button size="lg" disabled>
                  Position closed
                </Button>
                // change apply button to saveJob button
              ) : (
                <Button size="lg" onClick={handleApply}>
                  {/* <Link to="/apply/$jobId" params={{ jobId: job.id }}> */}
                    Apply Now
                  {/* </Link> */}
                </Button>
              )}
              {/* <SaveJobButton jobId={job.id} variant="button" /> */}
              {isAuthenticated && <SaveJobButton 
                jobId={job.id} variant="button"
              />}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Salary disclosed by hospital · Verified
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Match insights
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              {job.matchPercent
                ?'Your profile matches ' + job.matchPercent + '% of this role\'s criteria.'
                :isAuthenticated
                  ?"Complete your profile for a personalized match."
                // ? `Your profile matches ${job.matchPercent}% of this role's criteria.`
                : "Sign in and complete your profile to see how well you match this job and get personalized recommendations! "}
            </p>
          </div>
        </aside>
      </div>

      {/* Similar jobs */}
      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Similar opportunities
          </h2>
          <div className="scrollbar-thin -mx-1 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {similar.map((j: any) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-surface-2 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function JobDescriptionContent({ html }: { html: string }) {
  if (isHtmlContent(html)) {
    return (
      <div
        className="text-sm leading-relaxed text-foreground/80 [&_a]:text-brand [&_a]:underline [&_em]:italic [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <p className="text-sm leading-relaxed text-foreground/80">{html}</p>;
}
