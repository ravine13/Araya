import { useState, FormEvent } from "react";
import { X, CheckCircle2, Building2 } from "lucide-react";
import { useAdminStore, PlanTier } from "@/lib/admin-store";

interface JoinUsDialogProps {
  open: boolean;
  onClose: () => void;
}

const HOSPITAL_TYPES = ["Multi-Specialty", "Super-Specialty", "Clinic", "Diagnostic Center", "Nursing Home"];

const PLANS: { id: PlanTier; price: string; tagline: string; features: string[] }[] = [
  { id: "Basic", price: "Free", tagline: "Get started", features: ["5 job posts/mo", "Basic analytics", "Email support"] },
  { id: "Pro", price: "₹4,999/mo", tagline: "Most popular", features: ["50 job posts/mo", "Candidate insights", "Priority support"] },
  { id: "Premium", price: "₹14,999/mo", tagline: "Enterprise", features: ["Unlimited posts", "Verified badge", "Dedicated manager"] },
];

export function JoinUsDialog({ open, onClose }: JoinUsDialogProps) {
  const { submitRecruiterApplication } = useAdminStore();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    hospitalName: "",
    hospitalType: HOSPITAL_TYPES[0],
    registrationNumber: "",
    city: "",
    state: "",
    beds: "",
    address: "",
    website: "",
    phone: "",
    email: "",
    plan: "Pro" as PlanTier,
  });

  if (!open) return null;

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitRecruiterApplication({
      hospitalName: form.hospitalName.trim(),
      hospitalType: form.hospitalType,
      registrationNumber: form.registrationNumber.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      beds: parseInt(form.beds, 10) || 0,
      address: form.address.trim(),
      website: form.website.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      plan: form.plan,
    });
    setSubmitted(true);
  };

  const close = () => {
    setSubmitted(false);
    setForm({
      hospitalName: "", hospitalType: HOSPITAL_TYPES[0], registrationNumber: "", city: "",
      state: "", beds: "", address: "", website: "", phone: "", email: "", plan: "Pro",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm overflow-y-auto">
      <div className="my-8 w-full max-w-2xl rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight">Join ApronHanger as a Recruiter</h2>
              <p className="text-xs text-muted-foreground">Submit your hospital for admin verification</p>
            </div>
          </div>
          <button onClick={close} className="rounded-md p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h3 className="text-lg font-semibold">Application Submitted</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Your hospital has been submitted for review. Our Super Admin team will verify your details and notify you via email.
            </p>
            <button
              onClick={close}
              className="mt-6 h-10 px-6 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hospital Name" required>
                <input required value={form.hospitalName} onChange={(e) => update("hospitalName", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Hospital Type" required>
                <select value={form.hospitalType} onChange={(e) => update("hospitalType", e.target.value)} className={inputCls}>
                  {HOSPITAL_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Registration Number" required>
                <input required value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Number of Beds" required>
                <input required type="number" min="0" value={form.beds} onChange={(e) => update("beds", e.target.value)} className={inputCls} />
              </Field>
              <Field label="City" required>
                <input required value={form.city} onChange={(e) => update("city", e.target.value)} className={inputCls} />
              </Field>
              <Field label="State" required>
                <input required value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Phone Number" required>
                <input required type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Email" required>
                <input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Website">
                <input type="url" placeholder="https://" value={form.website} onChange={(e) => update("website", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Address" required>
                <input required value={form.address} onChange={(e) => update("address", e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Choose Plan</label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLANS.map((p) => {
                  const active = form.plan === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => update("plan", p.id)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        active
                          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{p.id}</span>
                        {active && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-base font-bold mt-1">{p.price}</p>
                      <p className="text-xs text-muted-foreground">{p.tagline}</p>
                      <ul className="mt-2 space-y-1">
                        {p.features.map((f) => (
                          <li key={f} className="text-xs text-muted-foreground">• {f}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={close} className="h-10 px-4 rounded-lg border text-sm font-medium hover:bg-muted">
                Cancel
              </button>
              <button type="submit" className="h-10 px-5 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Submit Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "mt-1 h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {children}
    </div>
  );
}
