import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login as saveAuth } from "@/store/authStore";
import { apiBase } from "@/lib/api";
import { authSignUpRecruiterSchema } from "@/lib/validations";
import { loginErrorMessage, rolePortalMismatchMessage } from "@/lib/authMessages";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create hospital account — ApronHanger" },
      { name: "description", content: "Onboard your hospital or clinic to ApronHanger." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const hospitalRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setFormError("Please confirm you are authorised to recruit for this hospital.");
      return;
    }
    const payload = {
      hospitalName: hospitalRef.current?.value ?? "",
      name: nameRef.current?.value ?? "",
      email: emailRef.current?.value ?? "",
      password: passwordRef.current?.value ?? "",
    };
    const parsed = authSignUpRecruiterSchema.safeParse(payload);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.errors) {
        const key = String(issue.path[0] ?? "form");
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      setFormError(parsed.error.errors[0]?.message ?? "Please fix the form");
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase()}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          role: "RECRUITER",
          hospitalName: parsed.data.hospitalName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = loginErrorMessage(res.status, data.error);
        setFormError(msg);
        toast.error(msg);
        return;
      }
      const roleMsg = rolePortalMismatchMessage(data.user?.role, "recruiter");
      if (roleMsg) {
        setFormError(roleMsg);
        toast.error(roleMsg);
        return;
      }
      saveAuth(data.token, data.user);
      toast.success("Account created! Welcome to ApronHanger.");
      navigate({ to: "/" });
    } catch {
      const msg = "Network error. Is the backend running?";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-foreground">
          Onboard your hospital
        </h2>
        <p className="text-[14px] text-muted-foreground">
          Create a recruiter workspace for your hospital or clinic.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {formError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="hospital">
            Hospital / Clinic name <span className="text-destructive">*</span>
          </Label>
          <Input
            ref={hospitalRef}
            id="hospital"
            placeholder="e.g. Apollo Multispeciality Hospital"
            className="h-11"
            aria-invalid={!!fieldErrors.hospitalName}
            required
          />
          {fieldErrors.hospitalName && (
            <p className="text-xs text-destructive">{fieldErrors.hospitalName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Your name <span className="text-destructive">*</span>
          </Label>
          <Input
            ref={nameRef}
            id="name"
            placeholder="Dr. Ananya Sen"
            className="h-11"
            aria-invalid={!!fieldErrors.name}
            required
          />
          {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Official work email <span className="text-destructive">*</span>
          </Label>
          <Input
            ref={emailRef}
            id="email"
            type="email"
            placeholder="name@hospital.in"
            className="h-11"
            aria-invalid={!!fieldErrors.email}
            required
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">
            Create password <span className="text-destructive">*</span>
          </Label>
          <Input
            ref={passwordRef}
            id="password"
            type="password"
            className="h-11"
            aria-invalid={!!fieldErrors.password}
            required
          />
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          )}
          <p className="text-[11px] text-muted-foreground">Minimum 8 characters.</p>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-[12px] text-muted-foreground">
          <Checkbox
            checked={agree}
            onCheckedChange={(v) => setAgree(Boolean(v))}
            className="mt-0.5"
          />
          <span>
            I confirm I am authorised to recruit on behalf of this hospital and agree to
            ApronHanger&apos;s <span className="text-accent">Terms</span> and{" "}
            <span className="text-accent">Verification Policy</span>.
            <span className="text-destructive"> *</span>
          </span>
        </label>

        <Button type="submit" className="h-11 w-full text-[14px] font-medium" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
