import { Briefcase, Mail, MapPin, Phone, FileText, Download } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/lib/recruiterData";
import {
  getAllowedNextStatuses,
  isTerminalApplicationStatus,
  statusPillClass,
  displayToApiStatus,
  type DisplayApplicantStatus,
} from "@/lib/applicationStatus";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/brand/VerifiedBadge";
import { Separator } from "@/components/ui/separator";
import type { Candidate } from "@/lib/mock";

export function CandidatePanel({
  candidate,
  onClose,
  onViewCv,
}: {
  candidate: Candidate | null;
  onClose: () => void;
  onViewCv: (id: string) => void;
}) {
  const router = useRouter();

  const setStatus = async (display: DisplayApplicantStatus, message: string) => {
    if (!candidate?.applicationId) {
      toast(message);
      return;
    }
    try {
      await updateApplicationStatus(candidate.applicationId, display);
      toast.success(message);
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update application status");
    }
  };

  const apiStatus = displayToApiStatus(candidate?.status as DisplayApplicantStatus);
  const nextStatuses = candidate ? getAllowedNextStatuses(apiStatus) : [];
  const locked = candidate ? isTerminalApplicationStatus(apiStatus) : true;
  const statusClass = candidate ? statusPillClass(candidate.status) : "";

  return (
    <Sheet open={!!candidate} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]">
        {candidate && (
          <>
            <SheetHeader className="space-y-3 border-b border-border bg-muted/30 p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-[14px] font-semibold">
                  {candidate.initials}
                </span>
                <div className="flex-1">
                  <SheetTitle className="font-display text-[18px]">{candidate.name}</SheetTitle>
                  <div className="text-[12.5px] text-muted-foreground">
                    {candidate.role} · {candidate.specialty}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {candidate.verified && <VerifiedBadge label="Verified Candidate" />}
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                      Match {candidate.matchPercent}%
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
                    >
                      {candidate.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[12px] text-muted-foreground">
                <Meta icon={<MapPin className="h-3.5 w-3.5" />}>{candidate.location}</Meta>
                <Meta icon={<Briefcase className="h-3.5 w-3.5" />}>
                  {candidate.experienceYears} yrs
                </Meta>
                <Meta icon={<Mail className="h-3.5 w-3.5" />}>{candidate.email}</Meta>
                <Meta icon={<Phone className="h-3.5 w-3.5" />}>{candidate.phone}</Meta>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {nextStatuses.includes("Reviewed") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => setStatus("Reviewed", "Marked as reviewed")}
                  >
                    Mark reviewed
                  </Button>
                )}
                {nextStatuses.includes("Shortlisted") && (
                  <Button
                    size="sm"
                    className="h-9"
                    onClick={() => setStatus("Shortlisted", "Candidate shortlisted")}
                  >
                    Shortlist
                  </Button>
                )}
                {nextStatuses.includes("Rejected") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 border-destructive/30 text-destructive hover:bg-destructive/5"
                    onClick={() => setStatus("Rejected", "Candidate rejected")}
                  >
                    Reject
                  </Button>
                )}
                {nextStatuses.includes("Contacted") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => setStatus("Contacted", "Marked as contacted")}
                  >
                    Mark contacted
                  </Button>
                )}
                {locked && (
                  <span className="self-center text-[11px] text-muted-foreground">
                    Status is final and cannot be changed.
                  </span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9"
                  onClick={() => onViewCv(candidate.id)}
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" /> View CV
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9"
                  onClick={() => {
                    if (candidate.formProfile) {
                      onViewCv(candidate.id);
                    } else {
                      toast("Download started (demo)");
                    }
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="exp">Experience</TabsTrigger>
                  <TabsTrigger value="edu">Education</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-5 space-y-5">
                  {candidate.customAnswers && candidate.customAnswers.length > 0 && (
                    <Section title="Job-specific application answers">
                      <dl className="space-y-3">
                        {candidate.customAnswers.map((a) => (
                          <div
                            key={a.fieldId}
                            className="rounded-lg border border-border bg-muted/20 px-3 py-2.5"
                          >
                            <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                              {a.label}
                              {a.required && (
                                <span className="ml-1 normal-case text-destructive">(required)</span>
                              )}
                            </dt>
                            <dd className="mt-1 text-[13px] text-foreground">{a.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </Section>
                  )}
                  <Section title="Professional summary">
                    <p className="text-[13.5px] leading-relaxed text-foreground/90">
                      {candidate.summary || "—"}
                    </p>
                  </Section>
                  {candidate.formProfile?.publications && candidate.formProfile.publications.length > 0 && (
                    <Section title="Publications">
                      <ul className="list-disc space-y-1 pl-4 text-[13px] text-foreground/85">
                        {candidate.formProfile.publications.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </Section>
                  )}
                  {candidate.formProfile?.availability && (
                    <Section title="Availability">
                      <p className="text-[13px] text-foreground/85">
                        {candidate.formProfile.availability}
                      </p>
                    </Section>
                  )}
                  <Section title="Key procedures">
                    <Chips items={candidate.procedures} />
                  </Section>
                  <Section title="Languages">
                    <Chips items={candidate.languages} />
                  </Section>
                </TabsContent>

                <TabsContent value="exp" className="mt-5 space-y-5">
                  {candidate.experience.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No experience listed.</p>
                  ) : (
                    candidate.experience.map((e, i) => (
                      <div key={i} className="relative pl-5">
                        <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-accent" />
                        {i < candidate.experience.length - 1 && (
                          <span className="absolute left-[3px] top-4 h-full w-px bg-border" />
                        )}
                        <div className="text-[13.5px] font-medium">{e.role}</div>
                        <div className="text-[12px] text-muted-foreground">
                          {e.employer} · {e.location} · {e.period}
                        </div>
                        {e.highlights.length > 0 && (
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-[13px] text-foreground/85">
                            {e.highlights.map((h, j) => (
                              <li key={j}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="edu" className="mt-5 space-y-5">
                  <Section title="Education">
                    <div className="space-y-2">
                      {candidate.education.map((ed, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-[13px]"
                        >
                          <div>
                            <div className="font-medium">{ed.degree}</div>
                            <div className="text-[11.5px] text-muted-foreground">{ed.institute}</div>
                          </div>
                          <span className="text-[11.5px] text-muted-foreground">{ed.year}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                  <Section title="Certifications">
                    <Chips items={candidate.certifications} />
                  </Section>
                  <Separator />
                  <div className="text-[12px] text-muted-foreground">
                    Registration:{" "}
                    <span className="text-foreground">{candidate.registration || "—"}</span>
                  </div>
                </TabsContent>

                <TabsContent value="skills" className="mt-5 space-y-5">
                  <Section title="Clinical skills">
                    <Chips
                      items={
                        candidate.formProfile?.clinicalSkills?.length
                          ? candidate.formProfile.clinicalSkills
                          : candidate.skills
                      }
                    />
                  </Section>
                  {candidate.formProfile?.technicalSkills &&
                    candidate.formProfile.technicalSkills.length > 0 && (
                      <Section title="Technical skills">
                        <Chips items={candidate.formProfile.technicalSkills} />
                      </Section>
                    )}
                  <Section title="Procedures performed">
                    <Chips items={candidate.procedures} />
                  </Section>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="truncate">{children}</span>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}
function Chips({ items }: { items: string[] }) {
  if (!items.length) {
    return <span className="text-[12px] text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span
          key={s}
          className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11.5px] text-foreground/80"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
