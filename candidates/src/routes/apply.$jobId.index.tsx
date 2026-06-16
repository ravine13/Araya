import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, Lock, UploadCloud, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { ApplicationError, quickApplyToJob } from "@/lib/applications";
import { JobCustomFieldsForm } from "@/components/apply/JobCustomFieldsForm";
import {
  validateCustomResponses,
  type CustomFieldResponses,
} from "@/lib/jobCustomFields";
import { useProfile } from "@/store/profileStore";
import { Route as ApplyParentRoute } from "./apply.$jobId";

export const Route = createFileRoute("/apply/$jobId/")({
  component: ApplyChooser,
});

function ApplyChooser() {
  const { job, alreadyApplied } = ApplyParentRoute.useLoaderData();
  const profile = useProfile();
  const hasFormCV = !!profile && profile.completeness >= 30;
  const navigate = useNavigate();
  const [quickApplying, setQuickApplying] = useState(false);
  const jobCustomFields = job.customApplicationFields ?? [];
  const [customResponses, setCustomResponses] = useState<CustomFieldResponses>({});
  const hasCustomForm = jobCustomFields.length > 0;

  if (alreadyApplied) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center animate-fade-in-up">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <h1 className="mt-4 text-xl font-semibold">Already applied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You have already submitted an application for {job.role} at {job.hospital}.
        </p>
        <Button asChild className="mt-6">
          <Link to="/applications">View my applications</Link>
        </Button>
      </div>
    );
  }

  const handleQuickApply = async () => {
    if (!profile) return;
    if (hasCustomForm) {
      const customErr = validateCustomResponses(jobCustomFields, customResponses);
      if (customErr) {
        toast.error(customErr);
        return;
      }
    }
    setQuickApplying(true);
    try {
      await quickApplyToJob(job.id, profile, hasCustomForm ? customResponses : undefined);
      toast.success("Application submitted!");
      navigate({ to: "/applications" });
    } catch (e) {
      if (e instanceof ApplicationError && e.code === "DUPLICATE") {
        toast.error(e.message);
      } else {
        toast.error(e instanceof Error ? e.message : "Could not submit application");
      }
    } finally {
      setQuickApplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 animate-fade-in-up">
      <div className="rounded-2xl border bg-card p-6 shadow-soft">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Applying for
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{job.role}</h1>
          <VerifiedBadge />
        </div>
        <p className="text-sm text-muted-foreground">
          {job.hospital} · {job.location}
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-semibold tracking-tight text-foreground">
        Choose one way to apply
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the structured form <strong>or</strong> upload a CV file — not both for the same application.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ChoiceCard
          icon={FileText}
          title="Structured form"
          desc="15-step form that builds your professional CV and syncs to recruiters."
          to="/apply/$jobId/form"
          jobId={job.id}
          ctaLabel={hasFormCV ? "Edit & apply" : "Start form"}
          highlight={!hasFormCV}
        />

        <ChoiceCard
          icon={UploadCloud}
          title="Upload CV"
          desc="Submit a PDF or DOCX only. Your portal form CV won't be used for this application."
          to="/apply/$jobId/upload"
          jobId={job.id}
          ctaLabel="Upload & apply"
        />
      </div>

      {hasCustomForm && (
        <div className="mt-6">
          <JobCustomFieldsForm
            fields={jobCustomFields}
            values={customResponses}
            onChange={setCustomResponses}
            title="Answer these job-specific questions"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Required for all application methods (form, upload, or quick apply).
          </p>
        </div>
      )}

      {hasFormCV && profile ? (
        <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Quick Apply</p>
                <p className="text-xs text-muted-foreground">One tap with your saved form CV</p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-[11px] text-primary-foreground">
                  {profile.avatar}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button disabled={quickApplying} onClick={handleQuickApply}>
              {quickApplying ? "Submitting…" : "Quick Apply"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed bg-surface-2 px-4 py-3 text-xs text-muted-foreground">
          <Lock className="mr-1 inline h-3.5 w-3.5" />
          Quick Apply unlocks after you complete the structured form once.
        </div>
      )}
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  title,
  desc,
  to,
  jobId,
  ctaLabel,
  highlight,
}: {
  icon: typeof Zap;
  title: string;
  desc: string;
  to: "/apply/$jobId/form" | "/apply/$jobId/upload";
  jobId: string;
  ctaLabel: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        "relative flex flex-col rounded-2xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card " +
        (highlight ? "ring-2 ring-brand" : "")
      }
    >
      {highlight && (
        <span className="absolute -top-2 right-4 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">
          Recommended
        </span>
      )}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="flex-1" />
      <Button asChild className="mt-5" variant={highlight ? "default" : "outline"}>
        <Link to={to} params={{ jobId }}>
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
