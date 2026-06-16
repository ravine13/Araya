import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, FileUp, X, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/auth/onboarding")({
  head: () => ({
    meta: [
      { title: "Hospital onboarding — ApronHanger" },
      { name: "description", content: "Complete your hospital verification on ApronHanger." },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = ["Hospital", "Address", "Verification", "Review"] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [docs, setDocs] = useState<string[]>([
    "Hospital_Registration_Cert.pdf",
    "NABH_Accreditation.pdf",
  ]);

  const next = () => {
    if (step === STEPS.length - 1) {
      navigate({ to: "/" });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step]}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={
                "flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] " +
                (i <= step
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground")
              }
            >
              {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}.</span>} {s}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-[26px] font-semibold tracking-tight text-foreground">
          {step === 0 && "Tell us about your hospital"}
          {step === 1 && "Where are you located?"}
          {step === 2 && "Upload verification documents"}
          {step === 3 && "Review and finish"}
        </h2>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {step === 0 && "This appears on your public recruiter profile."}
          {step === 1 && "Used to surface relevant candidates near you."}
          {step === 2 && "Required for the Verified Hospital badge."}
          {step === 3 && "Confirm details below — you can edit later from Settings."}
        </p>
      </div>

      {step === 0 && (
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Hospital / Clinic name</Label>
            <Input defaultValue="Apollo Multispeciality Hospital" className="h-11" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select defaultValue="multispeciality">
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="multispeciality">Multispeciality Hospital</SelectItem>
                  <SelectItem value="speciality">Speciality Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic Centre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Bed strength</Label>
              <Input defaultValue="750" className="h-11" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input defaultValue="apollohospitals.com" className="h-11" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input defaultValue="58, Canal Circular Road, Kadapara" className="h-11" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input defaultValue="Kolkata" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input defaultValue="West Bengal" className="h-11" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input defaultValue="+91 33 2320 3040" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Recruitment email</Label>
              <Input defaultValue="recruitment@apollokolkata.in" className="h-11" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-card text-accent">
              <FileUp className="h-5 w-5" />
            </div>
            <p className="mt-3 text-[14px] font-medium">Drag & drop documents here</p>
            <p className="text-[12px] text-muted-foreground">PDF, JPG or PNG · up to 10 MB each</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() =>
                setDocs((d) => [...d, `Document_${d.length + 1}.pdf`])
              }
            >
              Browse files
            </Button>
          </div>

          <div className="space-y-2">
            {docs.map((d) => (
              <div
                key={d}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/10 text-accent">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {d}
                </div>
                <button
                  type="button"
                  onClick={() => setDocs((arr) => arr.filter((x) => x !== d))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-muted-foreground">
            Required: Hospital registration certificate. Recommended: NABH / NABL accreditation,
            MCI / state council registration of authorised signatory.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12px] uppercase tracking-wider text-muted-foreground">Hospital</div>
                <div className="font-display text-[18px] font-semibold">Apollo Multispeciality Hospital</div>
                <div className="text-[13px] text-muted-foreground">Kolkata, West Bengal · 750 beds</div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                <ShieldCheck className="h-3.5 w-3.5" /> Pending verification
              </span>
            </div>
            <div className="mt-4 grid gap-3 border-t border-border pt-4 text-[13px] sm:grid-cols-2">
              <div>
                <div className="text-muted-foreground">Recruitment email</div>
                <div>recruitment@apollokolkata.in</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div>+91 33 2320 3040</div>
              </div>
              <div>
                <div className="text-muted-foreground">Documents</div>
                <div>{docs.length} uploaded</div>
              </div>
              <div>
                <div className="text-muted-foreground">Reviewer SLA</div>
                <div>Within 48 hours</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <Button type="button" onClick={next} className="h-11 px-6 text-[14px] font-medium">
          {step === STEPS.length - 1 ? "Enter dashboard" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
