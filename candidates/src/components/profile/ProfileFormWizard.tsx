import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ApplicationError, submitApplication, syncCandidateProfile } from "@/lib/applications";
import { validateWizardStep } from "@/lib/validations";
import { isAuthenticated } from "@/store/authStore";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChipInput, FieldRow } from "@/components/apply/FormPrimitives";
import { ROLE_TYPES, type RoleType } from "@/data/categories";
import {
  EMPTY_PROFILE,
  computeCompleteness,
  deriveHeadline,
  initialsFor,
  type Profile,
} from "@/data/profile";
import { setProfile, useProfile } from "@/store/profileStore";
import type { Job } from "@/data/jobs";
import { JobCustomFieldsForm } from "@/components/apply/JobCustomFieldsForm";
import {
  formatResponseValue,
  validateCustomResponses,
  type CustomFieldResponses,
  type JobCustomField,
} from "@/lib/jobCustomFields";
import { cn } from "@/lib/utils";
import { INDIAN_STATES } from "@/data/states";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/common/DatePickerField";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import type { UploadedFile } from "@/lib/fileUpload";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  city: string;
  state: string;
  role: RoleType;
  registrationNumber: string;
  registrationCouncil: string;
  yearsExperience: number;
  qualifications: { degree: string; institution: string; year: string }[];
  experience: {
    role: string;
    hospital: string;
    city: string;
    start: string;
    end: string;
    summary: string;
    current?: boolean;
  }[];
  clinicalSkills: string[];
  technicalSkills: string[];
  procedures: { name: string; count: number }[];
  certifications: { name: string; issuer: string; year: string }[];
  publications: string[];
  languages: string[];
  availability: string;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  summary: string;
  documents: UploadedFile[];
};

const STEPS = [
  "Basic Details",
  "Professional Identity",
  "Qualifications",
  "Experience",
  "Clinical Skills",
  "Procedures",
  "Technical Skills",
  "Certifications",
  "Publications",
  "Availability",
  "Salary Expectations",
  "Languages",
  "Professional Summary",
  "Document Upload",
  "Review & Submit",
] as const;

function fromProfile(p: Profile): FormState {
  return {
    fullName: p.name,
    email: p.email,
    phone: p.phone,
    linkedinUrl: p.linkedinUrl ?? "",
    city: p.city,
    state: p.state || p.city,
    role: p.role,
    registrationNumber: p.registrationNumber,
    registrationCouncil: p.registrationCouncil,
    yearsExperience: p.yearsExperience,
    qualifications: p.qualifications,
    experience: p.experience,
    clinicalSkills: p.clinicalSkills,
    technicalSkills: p.technicalSkills,
    procedures: p.procedures,
    certifications: p.certifications,
    publications: p.publications,
    languages: p.languages,
    availability: p.availability,
    expectedSalaryMin: p.expectedSalaryMin,
    expectedSalaryMax: p.expectedSalaryMax,
    summary: p.summary,
    documents: [],
  };
}

function toProfile(s: FormState): Profile {
  const base: Profile = {
    ...EMPTY_PROFILE,
    name: s.fullName.trim() || "Healthcare Professional",
    email: s.email,
    phone: s.phone,
    linkedinUrl: s.linkedinUrl.trim(),
    city: s.state || s.city,
    state: s.state,
    role: s.role,
    registrationNumber: s.registrationNumber,
    registrationCouncil: s.registrationCouncil,
    yearsExperience: s.yearsExperience,
    qualifications: s.qualifications,
    experience: s.experience,
    clinicalSkills: s.clinicalSkills,
    technicalSkills: s.technicalSkills,
    procedures: s.procedures,
    certifications: s.certifications,
    publications: s.publications,
    languages: s.languages,
    availability: s.availability,
    expectedSalaryMin: s.expectedSalaryMin,
    expectedSalaryMax: s.expectedSalaryMax,
    summary: s.summary,
    verified: !!s.registrationNumber,
  };
  base.avatar = initialsFor(base.name);
  base.headline = deriveHeadline(base);
  base.completeness = computeCompleteness(base);
  return base;
}

export type ProfileFormWizardProps = {
  /** When provided, the wizard is in "apply to job" mode and the back link returns to the chooser. */
  job?: Job;
  /** Where to navigate after a successful submit. Defaults to `/cv-preview`. */
  redirectTo?: "/cv-preview" | "/profile" | "/applications";
  /** When true, submitting also creates an application for `job`. */
  applyMode?: boolean;
};

export function ProfileFormWizard({
  job,
  redirectTo = "/cv-preview",
  applyMode = false,
}: ProfileFormWizardProps) {
  const existing = useProfile();
  const navigate = useNavigate();
  const [state, setState] = useState<FormState>(() =>
    existing ? fromProfile(existing) : fromProfile(EMPTY_PROFILE),
  );
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const jobCustomFields: JobCustomField[] = job?.customApplicationFields ?? [];
  const [customResponses, setCustomResponses] = useState<CustomFieldResponses>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const handleSubmit = async () => {
    for (let i = 0; i <= 12; i++) {
      const err = validateWizardStep(i, state);
      if (err) {
        setStepError(err);
        setStep(i);
        toast.error(err);
        return;
      }
    }
    setStepError(null);
    const profile = toProfile(state);
    setProfile(profile);
    if (applyMode && job) {
      if (jobCustomFields.length > 0) {
        const customErr = validateCustomResponses(jobCustomFields, customResponses);
        if (customErr) {
          toast.error(customErr);
          return;
        }
      }
      setSubmitting(true);
      try {
        const attachment = state.documents[0];
        await submitApplication(job.id, profile, customResponses, attachment);
        toast.success("Application submitted!");
        navigate({ to: redirectTo });
      } catch (e) {
        if (e instanceof ApplicationError && e.code === "DUPLICATE") {
          toast.error(e.message);
        } else {
          toast.error(e instanceof Error ? e.message : "Could not submit application");
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (isAuthenticated()) {
      setSubmitting(true);
      try {
        await syncCandidateProfile(profile);
        toast.success("Profile saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not save profile");
      } finally {
        setSubmitting(false);
      }
    }
    navigate({ to: redirectTo });
  };

  const goNext = () => {
    const err = validateWizardStep(step, state);
    if (err) {
      setStepError(err);
      toast.error(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submitLabel = applyMode && job ? "Submit application" : "Save & generate CV";

  return (
    <div className={cn("mx-auto max-w-[1400px] px-6 py-8 animate-fade-in-up", applyMode && "pb-28")}>
      {job ? (
        <Link
          to="/apply/$jobId"
          params={{ jobId: job.id }}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back
        </Link>
      ) : (
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" /> Back to profile
        </Link>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {job ? "Application form" : "Build your CV"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {job ? `${job.role} · ${job.hospital}` : "Your professional profile"}
          </h1>
          {!job && (
            <p className="mt-1 text-sm text-muted-foreground">
              Fill the form once — we'll generate your CV and use it for every Quick Apply.
            </p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{progress}% complete</p>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ol className="space-y-1">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={label}>
                  <button
                    onClick={() => setStep(i)}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors",
                      active && "bg-brand-soft text-primary",
                      !active && "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                        done && "border-brand bg-brand text-brand-foreground",
                        active && !done && "border-primary bg-primary text-primary-foreground",
                        !done && !active && "border-border bg-surface",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className={cn("truncate", active && "font-semibold")}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {STEPS[step]}
          </h2>
          {step === 13 && job && (
            <p className="mt-1 text-xs text-muted-foreground">
              Documents uploaded here are attached only to this job application — your saved CV is
              not affected.
            </p>
          )}

          {stepError && (
            <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {stepError}
            </p>
          )}

          <div className="mt-6 space-y-6">
            {renderStep(step, state, set, !!job, jobCustomFields, customResponses, setCustomResponses)}
          </div>

          <div className="mt-10 flex items-center justify-between gap-3 border-t bg-card pt-5">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setStepError(null);
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                !applyMode && (
                  <Button type="button" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Saving…" : submitLabel} <Check className="h-4 w-4" />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {applyMode && job && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-6 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Applying to</p>
              <p className="truncate text-sm font-semibold text-foreground">
                {job.role} · {job.hospital}
              </p>
            </div>
            <Button type="button" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : submitLabel} <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderStep(
  step: number,
  s: FormState,
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void,
  isJobMode: boolean,
  jobCustomFields: JobCustomField[],
  customResponses: CustomFieldResponses,
  setCustomResponses: (v: CustomFieldResponses) => void,
) {
  switch (step) {
    case 0:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldRow label="Full name" required>
            <Input value={s.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </FieldRow>
          <FieldRow label="Email" required>
            <Input
              type="email"
              value={s.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </FieldRow>
          <FieldRow label="Phone" required>
            <Input value={s.phone} onChange={(e) => set("phone", e.target.value)} />
          </FieldRow>
          <FieldRow
            label="LinkedIn profile"
            hint="Optional · paste your public profile URL"
            className="md:col-span-2"
          >
            <Input
              type="url"
              value={s.linkedinUrl}
              onChange={(e) => set("linkedinUrl", e.target.value)}
              placeholder="https://www.linkedin.com/in/your-profile"
            />
          </FieldRow>
          <FieldRow label="State" required className="md:col-span-2">
            <Select value={s.state || undefined} onValueChange={(v) => set("state", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </div>
      );
    case 1:
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <FieldRow label="Role" required>
            <Select value={s.role} onValueChange={(v) => set("role", v as RoleType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_TYPES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Years of experience" required>
            <Input
              type="number"
              min={0}
              max={60}
              value={s.yearsExperience}
              onChange={(e) => set("yearsExperience", Number(e.target.value))}
            />
          </FieldRow>
          {s.role === "Doctor" && (
            <>
              <FieldRow label="Medical Council" required>
                <Input
                  value={s.registrationCouncil}
                  onChange={(e) => set("registrationCouncil", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Registration number" required hint="As per NMC / state council">
                <Input
                  value={s.registrationNumber}
                  onChange={(e) => set("registrationNumber", e.target.value)}
                />
              </FieldRow>
            </>
          )}
          {s.role === "Dentist" && (
            <>
              <FieldRow label="Dental Council" required>
                <Input
                  value={s.registrationCouncil}
                  onChange={(e) => set("registrationCouncil", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="DCI Registration number" required>
                <Input
                  value={s.registrationNumber}
                  onChange={(e) => set("registrationNumber", e.target.value)}
                />
              </FieldRow>
            </>
          )}
          {s.role === "Nurse" && (
            <>
              <FieldRow label="INC Registration number" required>
                <Input
                  value={s.registrationNumber}
                  onChange={(e) => set("registrationNumber", e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Ward / unit experience">
                <Input
                  value={s.registrationCouncil}
                  onChange={(e) => set("registrationCouncil", e.target.value)}
                  placeholder="e.g. ICU, OT, Paeds"
                />
              </FieldRow>
            </>
          )}
        </div>
      );
    case 2:
      return (
        <Repeater
          items={s.qualifications}
          onChange={(v) => set("qualifications", v)}
          empty={{ degree: "", institution: "", year: "" }}
          render={(item, i, update) => (
            <div className="grid gap-3 md:grid-cols-3">
              <FieldRow label="Degree" required>
                <Input
                  value={item.degree}
                  onChange={(e) => update(i, { ...item, degree: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Institution" required>
                <Input
                  value={item.institution}
                  onChange={(e) => update(i, { ...item, institution: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Year completed" required>
                <Input
                  type="number"
                  min={1950}
                  max={new Date().getFullYear()}
                  value={item.year}
                  onChange={(e) => update(i, { ...item, year: e.target.value })}
                  placeholder="e.g. 2018"
                />
              </FieldRow>
            </div>
          )}
          addLabel="Add qualification"
        />
      );
    case 3:
      return (
        <Repeater
          items={s.experience}
          onChange={(v) => set("experience", v)}
          empty={{ role: "", hospital: "", city: "", start: "", end: "", summary: "", current: false }}
          render={(item, i, update) => (
            <div className="grid gap-3 md:grid-cols-2">
              <FieldRow label="Role" required>
                <Input
                  value={item.role}
                  onChange={(e) => update(i, { ...item, role: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Hospital" required>
                <Input
                  value={item.hospital}
                  onChange={(e) => update(i, { ...item, hospital: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="City" required>
                <Input
                  value={item.city}
                  onChange={(e) => update(i, { ...item, city: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Start date" required>
                <DatePickerField
                  value={item.start}
                  onChange={(v) => update(i, { ...item, start: v })}
                  toDate={new Date()}
                  placeholder="Select start date"
                />
              </FieldRow>
              <div className="space-y-2">
                <FieldRow label="End date" required={!item.current}>
                  <DatePickerField
                    value={item.end}
                    onChange={(v) => update(i, { ...item, end: v })}
                    toDate={new Date()}
                    disabled={item.current}
                    placeholder={item.current ? "Present" : "Select end date"}
                  />
                </FieldRow>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={Boolean(item.current)}
                    onCheckedChange={(v) =>
                      update(i, {
                        ...item,
                        current: Boolean(v),
                        end: v ? "" : item.end,
                      })
                    }
                  />
                  I currently work here
                </label>
              </div>
              <FieldRow label="Summary" className="md:col-span-2">
                <Textarea
                  rows={3}
                  value={item.summary}
                  onChange={(e) => update(i, { ...item, summary: e.target.value })}
                />
              </FieldRow>
            </div>
          )}
          addLabel="Add experience"
        />
      );
    case 4:
      return (
        <FieldRow
          label={s.role === "Nurse" ? "Patient care & ward skills" : "Clinical skills"}
          required
          hint="Press Enter to add"
        >
          <ChipInput
            values={s.clinicalSkills}
            onChange={(v) => set("clinicalSkills", v)}
            placeholder="Type a skill and press Enter"
            suggestions={
              s.role === "Doctor"
                ? ["Echocardiography", "PTCA", "ICU Care", "OPD Management"]
                : s.role === "Nurse"
                  ? ["IV Cannulation", "Wound Care", "Ventilator Care", "Triage"]
                  : s.role === "Dentist"
                    ? ["RCT", "Restorations", "Crowns", "Implants"]
                    : ["Sterilization", "Equipment Setup", "Patient Handling"]
            }
          />
        </FieldRow>
      );
    case 5:
      return (
        <Repeater
          items={s.procedures}
          onChange={(v) => set("procedures", v)}
          empty={{ name: "", count: 0 }}
          render={(item, i, update) => (
            <div className="grid gap-3 md:grid-cols-[1fr_140px]">
              <FieldRow label="Procedure">
                <Input
                  value={item.name}
                  onChange={(e) => update(i, { ...item, name: e.target.value })}
                  placeholder={
                    s.role === "Dentist"
                      ? "e.g. Root Canal Therapy"
                      : s.role === "Nurse"
                        ? "e.g. Catheterization"
                        : "e.g. Coronary Angiography"
                  }
                />
              </FieldRow>
              <FieldRow label="Count">
                <Input
                  type="number"
                  min={0}
                  value={item.count}
                  onChange={(e) => update(i, { ...item, count: Number(e.target.value) })}
                />
              </FieldRow>
            </div>
          )}
          addLabel="Add procedure"
        />
      );
    case 6:
      return (
        <FieldRow label="Technical / software skills">
          <ChipInput
            values={s.technicalSkills}
            onChange={(v) => set("technicalSkills", v)}
            placeholder="EMR, PACS, MS Excel..."
            suggestions={["EPIC EMR", "PACS", "MS Excel", "Tally", "Stata", "R"]}
          />
        </FieldRow>
      );
    case 7:
      return (
        <Repeater
          items={s.certifications}
          onChange={(v) => set("certifications", v)}
          empty={{ name: "", issuer: "", year: "" }}
          render={(item, i, update) => (
            <div className="grid gap-3 md:grid-cols-3">
              <FieldRow label="Name">
                <Input
                  value={item.name}
                  onChange={(e) => update(i, { ...item, name: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Issuer">
                <Input
                  value={item.issuer}
                  onChange={(e) => update(i, { ...item, issuer: e.target.value })}
                />
              </FieldRow>
              <FieldRow label="Year">
                <Input
                  value={item.year}
                  onChange={(e) => update(i, { ...item, year: e.target.value })}
                />
              </FieldRow>
            </div>
          )}
          addLabel="Add certification"
        />
      );
    case 8:
      return (
        <FieldRow label="Publications & research" hint="One paper per chip">
          <ChipInput
            values={s.publications}
            onChange={(v) => set("publications", v)}
            placeholder="Citation or DOI"
          />
        </FieldRow>
      );
    case 9:
      return (
        <FieldRow label="Availability">
          <Select value={s.availability} onValueChange={(v) => set("availability", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Immediately",
                "15 days notice",
                "30 days notice",
                "60 days notice",
                "90 days notice",
              ].map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldRow>
      );
    case 10:
      return (
        <div className="space-y-6">
          <FieldRow
            label={`Expected salary range: ₹${s.expectedSalaryMin}–${s.expectedSalaryMax} LPA`}
            required
          >
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-[11px] text-muted-foreground">Minimum (LPA)</p>
                <Slider
                  value={[s.expectedSalaryMin]}
                  min={0}
                  max={120}
                  step={1}
                  onValueChange={(v) => {
                    const min = v[0];
                    set("expectedSalaryMin", min);
                    if (min > s.expectedSalaryMax) set("expectedSalaryMax", min);
                  }}
                />
              </div>
              <div>
                <p className="mb-1 text-[11px] text-muted-foreground">Maximum (LPA)</p>
                <Slider
                  value={[s.expectedSalaryMax]}
                  min={s.expectedSalaryMin}
                  max={120}
                  step={1}
                  onValueChange={(v) => set("expectedSalaryMax", v[0])}
                />
              </div>
              {s.expectedSalaryMin > s.expectedSalaryMax && (
                <p className="text-xs text-destructive">Minimum cannot exceed maximum</p>
              )}
            </div>
          </FieldRow>
        </div>
      );
    case 11:
      return (
        <FieldRow label="Languages">
          <ChipInput
            values={s.languages}
            onChange={(v) => set("languages", v)}
            placeholder="Add language"
            suggestions={["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Kannada"]}
          />
        </FieldRow>
      );
    case 12:
      return (
        <FieldRow label="Professional summary" required hint="At least 40 characters · 3–5 sentences">
          <Textarea
            rows={6}
            value={s.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </FieldRow>
      );
    case 13:
      return (
        <FileUploadZone
          files={s.documents}
          onChange={(v) => set("documents", v)}
          multiple={!isJobMode}
          title={
            isJobMode
              ? "Attach a CV or supporting documents for this job"
              : "Optional: registration certificate or ID proof"
          }
          hint="PDF or Word (.pdf, .doc, .docx), up to 5MB each"
        />
      );
    case 14:
      return (
        <div className="space-y-3">
          {isJobMode && jobCustomFields.length > 0 && (
            <JobCustomFieldsForm
              fields={jobCustomFields}
              values={customResponses}
              onChange={setCustomResponses}
            />
          )}
          <ReviewRow label="Name" value={s.fullName} />
          <ReviewRow label="LinkedIn" value={s.linkedinUrl || "—"} />
          <ReviewRow label="Role" value={`${s.role} · ${s.yearsExperience} yrs`} />
          <ReviewRow
            label="Registration"
            value={
              s.registrationNumber
                ? `${s.registrationNumber} (${s.registrationCouncil})`
                : ""
            }
          />
          <ReviewRow label="Qualifications" value={`${s.qualifications.length} entries`} />
          <ReviewRow label="Experience" value={`${s.experience.length} positions`} />
          <ReviewRow label="Clinical skills" value={s.clinicalSkills.join(", ")} />
          <ReviewRow
            label="Procedures"
            value={s.procedures.map((p) => `${p.name} (${p.count})`).join(", ")}
          />
          <ReviewRow label="Certifications" value={`${s.certifications.length} entries`} />
          <ReviewRow
            label="Salary expectation"
            value={`₹${s.expectedSalaryMin}–${s.expectedSalaryMax} LPA`}
          />
          <ReviewRow label="Languages" value={s.languages.join(", ")} />
          {isJobMode && (
            <ReviewRow
              label="Job documents"
              value={s.documents.map((d) => d.name).join(", ") || "None"}
            />
          )}
          {isJobMode &&
            jobCustomFields.map((f) => (
              <ReviewRow
                key={f.id}
                label={f.label}
                value={formatResponseValue(customResponses[f.id])}
              />
            ))}
        </div>
      );
    default:
      return null;
  }
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 rounded-lg border bg-surface px-4 py-3 text-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-foreground">{value || "—"}</p>
    </div>
  );
}

function Repeater<T>({
  items,
  onChange,
  empty,
  render,
  addLabel,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  empty: T;
  render: (item: T, i: number, update: (i: number, v: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  const update = (i: number, v: T) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="relative rounded-xl border bg-surface p-4">
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {render(item, i, update)}
        </div>
      ))}
      <Button variant="outline" type="button" onClick={() => onChange([...items, empty])}>
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
