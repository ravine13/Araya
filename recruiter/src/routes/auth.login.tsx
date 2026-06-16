import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { login as saveAuth } from "@/store/authStore";
import { apiBase } from "@/lib/api";
import { authSignInSchema } from "@/lib/validations";
import { loginErrorMessage, rolePortalMismatchMessage } from "@/lib/authMessages";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in — ApronHanger Recruiter" },
      { name: "description", content: "Recruiter sign in to ApronHanger." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    const parsed = authSignInSchema.safeParse({ email, password });
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
      const res = await fetch(`${apiBase()}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
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
      toast.success("Welcome back!");
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
          Welcome back
        </h2>
        <p className="text-[14px] text-muted-foreground">
          Sign in to your hospital recruiter account.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {formError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Work email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder="you@hospital.in"
            className="h-11"
            aria-invalid={!!fieldErrors.email}
            required
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">
            Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            ref={passwordRef}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11"
            aria-invalid={!!fieldErrors.password}
            required
          />
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full text-[14px] font-medium">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          or
        </span>
      </div>

      <p className="text-center text-[13px] text-muted-foreground">
        New hospital?{" "}
        <Link to="/auth/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
