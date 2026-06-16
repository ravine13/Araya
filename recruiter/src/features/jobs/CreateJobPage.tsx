import { useEffect, useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { apiBase } from "@/lib/api";
import { authHeader } from "@/store/authStore";
import { loadHospitalProfile } from "@/lib/recruiterData";
import { validateCreateJob, type CreateJobFieldErrors } from "@/lib/createJobValidation";
import { JobDescriptionEditor } from "@/components/jobs/JobDescriptionEditor";
import { JobCustomFormBuilder } from "@/components/jobs/JobCustomFormBuilder";
import {
  type JobCustomField,
  validateCustomFieldsForPost,
} from "@/lib/jobCustomFields";
import { sanitizeJobDescriptionHtml } from "@/lib/sanitizeHtml";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



const ROLES = ["Doctor", "Nurse", "Technician", "Pharmacist", "Allied Health", "Other"] as const;
const SPECIALTIES: Record<(typeof ROLES)[number], string[]> = {
  Doctor: ["General Medicine", "Cardiology", "Neurology", "Pediatrics", "Anesthesiology", "Radiology"],
  Nurse: ["Critical Care", "OT", "Emergency", "Pediatric", "General Ward"],
  Technician: ["Radiology", "Cath Lab", "Lab", "Dialysis"],
  Pharmacist: ["Clinical", "Retail", "Inpatient"],
  "Allied Health": ["Physiotherapy", "Dietetics", "Respiratory Therapy"],
  Other: ["Other"],
};
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi (NCT)", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
] as const;

const TAG_OPTIONS = ["Emergency", "OPD", "IPD", "ICU", "OT", "Surgery", "Cath Lab", "NICU", "BLS", "ACLS"];

export function CreateJobPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [role, setRole] = useState<(typeof ROLES)[number]>("Doctor");
  const [specialty, setSpecialty] = useState(SPECIALTIES.Doctor[0]);
  const [expMin, setExpMin] = useState("");
  const [expMax, setExpMax] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [type, setType] = useState("Full-time");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [hospitalName, setHospitalName] = useState("");
  const [otherRoleTitle, setOtherRoleTitle] = useState("");
  const [otherRequirements, setOtherRequirements] = useState("");
  const [description, setDescription] = useState("");
  const [designation, setDesignation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CreateJobFieldErrors>({});
  const [customTag, setCustomTag] = useState("");
  const [customFormEnabled, setCustomFormEnabled] = useState(false);
  const [customFields, setCustomFields] = useState<JobCustomField[]>([]);

  useEffect(() => {
    loadHospitalProfile().then((h) => {
      if (!h) return;
      setProfileComplete(h.profileComplete ?? false);
      setHospitalName(h.name || "");
      if (h.city) setCity(h.city);
      if (h.state) setState(h.state);
    });
  }, []);

  const toggleTag = (t: string) =>
    setTags((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));

  const addCustomTag = () => {
    const t = customTag.trim();
    if (!t) return;
    if (t.length > 40) {
      toast.error("Tag must be 40 characters or fewer");
      return;
    }
    if (tags.includes(t)) {
      setCustomTag("");
      return;
    }
    setTags((arr) => [...arr, t]);
    setCustomTag("");
  };

  const removeTag = (t: string) => setTags((arr) => arr.filter((x) => x !== t));

  return (
    <>
      {profileComplete === false && (
        <div className="mx-auto mb-4 max-w-[1100px] rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-950">
          Complete your hospital profile in{" "}
          <Link to="/settings" className="font-medium underline">
            Settings
          </Link>{" "}
          before you can post a job.
        </div>
      )}
    <form
      className="mx-auto w-full max-w-[1100px] space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (profileComplete === false) {
          toast.error("Complete your hospital profile in Settings before posting a job.");
          return;
        }
        const validation = validateCreateJob(
          {
            hospitalName,
            state,
            city,
            role,
            otherRoleTitle,
            description,
            salaryMin,
            salaryMax,
            expMin,
            expMax,
          },
          { roleIsOther: role === "Other", designation },
        );
        if (!validation.ok) {
          setFieldErrors(validation.errors);
          toast.error(validation.message);
          return;
        }
        setFieldErrors({});
        if (customFormEnabled) {
          const customErr = validateCustomFieldsForPost(customFields);
          if (customErr) {
            toast.error(customErr);
            return;
          }
        }
        const cleanDescription = sanitizeJobDescriptionHtml(description);
        try {
          const locationStr = city.trim() ? `${city.trim()}, ${state}` : state;
          const jobCategory = role === "Other" ? "Other" : role;
          const jobSpecialty = role === "Other" ? "Other" : specialty;
          const requirementLines = otherRequirements
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
          const body = {
            hospitalName: hospitalName.trim(),
            role: designation.trim(),
            specialty: jobSpecialty,
            category: jobCategory,
            experienceMin: parseInt(expMin, 10) || 0,
            experienceMax: parseInt(expMax, 10) || 0,
            tags,
            type,
            description: cleanDescription,
            location: locationStr,
            city: city.trim() || state,
            salaryMin: parseInt(salaryMin, 10),
            salaryMax: parseInt(salaryMax, 10),
            requirements: requirementLines.length > 0 ? requirementLines : undefined,
            status: "Active",
            customApplicationFields: customFormEnabled
              ? customFields.map((f) => ({
                  id: f.id,
                  label: f.label.trim(),
                  type: f.type,
                  required: f.required,
                  placeholder: f.placeholder?.trim() || undefined,
                  helpText: f.helpText?.trim() || undefined,
                  options: f.type === "select" ? f.options : undefined,
                }))
              : [],
          };
          const res = await fetch(`${apiBase()}/api/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader() },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error((err as { error?: string }).error || "Failed to post");
          }
          toast.success("Opportunity posted");
          await router.invalidate();
          navigate({ to: "/jobs" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to post opportunity");
        }
      }}
    >
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-tight">Create job</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Post a new opportunity. Fields marked with <span className="text-destructive">*</span> are required.
        </p>
      </div>

      {/* Section 1 */}
      <Section title="Hospital & role">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Hospital / Clinic name" required error={fieldErrors.hospitalName}>
            <Input
              name="hospitalName"
              value={hospitalName}
              onChange={(e) => {
                setHospitalName(e.target.value);
                setFieldErrors((e) => ({ ...e, hospitalName: undefined }));
              }}
              placeholder="From your hospital profile"
              className="h-11 bg-muted/30"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Pre-filled from your{" "}
              <Link to="/settings" className="text-primary underline">
                hospital profile
              </Link>
              . Edit there if this name is wrong.
            </p>
          </Field>
          <Field label="Job ID">
            <Input placeholder="Auto-generated" disabled className="h-11" />
          </Field>
          <Field label="Role" required>
            <Select
              value={role}
              onValueChange={(v) => {
                const r = v as (typeof ROLES)[number];
                setRole(r);
                setSpecialty(SPECIALTIES[r][0]);
                if (r !== "Other") setOtherRoleTitle("");
              }}
            >
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {role === "Other" ? (
            <Field label="Position title" required error={fieldErrors.otherRoleTitle}>
              <Input
                value={otherRoleTitle}
                onChange={(e) => {
                  setOtherRoleTitle(e.target.value);
                  setFieldErrors((err) => ({ ...err, otherRoleTitle: undefined }));
                }}
                placeholder="e.g. Room Service, Housekeeping, Front Office"
                className="h-11"
                required
              />
            </Field>
          ) : (
            <Field label="Specialty" required>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPECIALTIES[role].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Sub-specialty (optional)">
            <Input placeholder="e.g. Interventional, Pulmonology" className="h-11" />
          </Field>
          <Field label="Designation title" required error={fieldErrors.designation}>
            <Input
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                setFieldErrors((err) => ({ ...err, designation: undefined }));
              }}
              placeholder="e.g. Senior Consultant, Staff Nurse"
              className="h-11"
              required
            />
          </Field>
        </div>
      </Section>

      {/* Section 2 */}
      <Section title="Eligibility & compensation">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Experience required (years)"
            required
            error={fieldErrors.expMin || fieldErrors.expMax}
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min (e.g. 2)"
                min={0}
                max={50}
                value={expMin}
                onChange={(e) => {
                  setExpMin(e.target.value);
                  setFieldErrors((err) => ({ ...err, expMin: undefined, expMax: undefined }));
                }}
                className="h-11"
              />
              <Input
                type="number"
                placeholder="Max (e.g. 8)"
                min={0}
                max={50}
                value={expMax}
                onChange={(e) => {
                  setExpMax(e.target.value);
                  setFieldErrors((err) => ({ ...err, expMin: undefined, expMax: undefined }));
                }}
                className="h-11"
              />
            </div>
          </Field>
          <Field label="State" required error={fieldErrors.state}>
            <Select
              value={state}
              onValueChange={(v) => {
                setState(v);
                setFieldErrors((err) => ({ ...err, state: undefined }));
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {INDIAN_STATES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="City" required error={fieldErrors.city}>
            <Input
              placeholder="e.g. Kolkata"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setFieldErrors((err) => ({ ...err, city: undefined }));
              }}
              className="h-11"
            />
          </Field>
          <Field
            label="Salary range (₹ Lakhs / annum)"
            required
            error={fieldErrors.salaryMin || fieldErrors.salaryMax}
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                name="salaryMin"
                placeholder="Min (₹ Lakhs)"
                className="h-11"
                value={salaryMin}
                onChange={(e) => {
                  setSalaryMin(e.target.value);
                  setFieldErrors((err) => ({ ...err, salaryMin: undefined, salaryMax: undefined }));
                }}
              />
              <Input
                name="salaryMax"
                placeholder="Max (₹ Lakhs)"
                className="h-11"
                value={salaryMax}
                onChange={(e) => {
                  setSalaryMax(e.target.value);
                  setFieldErrors((err) => ({ ...err, salaryMin: undefined, salaryMax: undefined }));
                }}
              />
            </div>
          </Field>
          <Field label="Job type" required>
            <div className="inline-flex w-full rounded-lg border border-border bg-muted/30 p-1">
              {["Full-time", "Part-time", "Locum"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={
                    "flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-colors " +
                    (type === t
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Shift">
            <Select>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select shift" /></SelectTrigger>
              <SelectContent>
                {["Day", "Night", "Rotational"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Number of openings">
            <Input type="number" placeholder="e.g. 2" min={1} className="h-11" />
          </Field>
        </div>
      </Section>

      {/* Section 3 */}
      <Section title="Tags & description">
        <div className="space-y-4">
          <Field label="Tags">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map((t) => {
                  const active = tags.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={
                        "rounded-full px-3 py-1 text-[12px] font-medium transition-colors " +
                        (active
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted")
                      }
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="Type a custom tag and press Enter"
                  className="h-10 flex-1 text-[13px]"
                />
                <Button type="button" variant="outline" className="h-10 shrink-0" onClick={addCustomTag}>
                  Add tag
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="ml-0.5 rounded-full px-1 text-primary/70 hover:bg-primary/20 hover:text-primary"
                        aria-label={`Remove ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                Pick presets or add your own (e.g. Night shift, Hindi required).
              </p>
            </div>
          </Field>

          <Field label="Other requirements">
            <Textarea
              value={otherRequirements}
              onChange={(e) => setOtherRequirements(e.target.value)}
              rows={4}
              placeholder={
                "List any extra requirements, one per line — e.g.\nRoom service experience\nFood safety certification\nFluent in Hindi & English"
              }
              className="min-h-[100px] resize-y text-[13.5px] leading-relaxed"
            />
            <p className="text-[11px] text-muted-foreground">
              Use this for non-clinical roles or extra criteria (room service, admin, support staff,
              etc.). Shown to candidates as a requirements list.
            </p>
          </Field>

          <Field label="Job description" required error={fieldErrors.description}>
            <JobDescriptionEditor
              value={description}
              onChange={(html) => {
                setDescription(html);
                setFieldErrors((err) => ({ ...err, description: undefined }));
              }}
              placeholder="Describe the role, responsibilities, and requirements…"
            />
          </Field>
        </div>
      </Section>

      <Section title="Custom application form">
        <JobCustomFormBuilder
          enabled={customFormEnabled}
          onEnabledChange={setCustomFormEnabled}
          fields={customFields}
          onChange={setCustomFields}
        />
      </Section>

      {/* Footer actions */}
      <Card className="border-border bg-card shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] text-muted-foreground">
            Posting as{" "}
            <span className="font-medium text-foreground">
              {hospitalName.trim() || "Your hospital"}
            </span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="outline" className="h-10" onClick={() => toast("Saved as draft")}>
              <Save className="mr-1.5 h-4 w-4" /> Save as draft
            </Button>
            <Button type="submit" className="h-10 px-6">
              Post Opportunity
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border bg-card shadow-soft">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <h2 className="font-display text-[15px] font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h2>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px]">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
