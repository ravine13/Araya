import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Users,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { login as saveAuth, isAuthenticated } from "@/store/authStore";
import { clearProfile } from "@/store/profileStore";
import { resetHydration } from "@/lib/hydrate";
import { authSignInSchema, authSignUpSchema } from "@/lib/validations";
import { loginErrorMessage, rolePortalMismatchMessage } from "@/lib/authMessages";
import { apiBase } from "@/lib/api";
import { toast } from "sonner";
import GoogleLogin from "@/googleSignIn/GoogleLogin";


type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (isAuthenticated()) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — ApronHanger" },
      {
        name: "description",
        content:
          "Sign in or join ApronHanger — India's premium hiring platform for healthcare professionals and institutions.",
      },
      { property: "og:title", content: "Sign in — ApronHanger" },
      {
        property: "og:description",
        content: "One platform. Two portals. Healthcare hiring, refined.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect: redirectAfterLogin } = Route.useSearch();

  console.log("GoogleLogin:", GoogleLogin); 
  
  const [mode, setMode] = useState<Mode>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    const name = nameRef.current?.value ?? "";
    const schema = mode === "signin" ? authSignInSchema : authSignUpSchema;
    const parsed = schema.safeParse(mode === "signin" ? { email, password } : { email, password, name });
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
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { email, password };
      if (mode === "signup") {
        body.name = name;
        body.role = "CANDIDATE";
      }
      const res = await fetch(`${apiBase()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = loginErrorMessage(res.status, data.error);
        setFormError(msg);
        toast.error(msg);
        return;
      }
      const roleMsg = rolePortalMismatchMessage(data.user?.role, "candidate");
      if (roleMsg) {
        setFormError(roleMsg);
        toast.error(roleMsg);
        return;
      }
      // Wipe any stale profile from a previous user BEFORE saving the new token.
      clearProfile();
      resetHydration();
      saveAuth(data.token, data.user);
      const { hydrateProfileFromApi } = await import("@/lib/hydrate");
      await hydrateProfileFromApi();
      toast.success(mode === "signin" ? "Welcome back!" : "Account created!");
      if (
        redirectAfterLogin &&
        redirectAfterLogin.startsWith("/") &&
        !redirectAfterLogin.startsWith("/auth")
      ) {
        window.location.assign(redirectAfterLogin);
      } else {
        navigate({ to: "/" });
      }
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-2">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — Brand panel */}
        <aside className="relative hidden overflow-hidden text-white lg:block">
          <BrandPanel />
        </aside>

        {/* RIGHT — Auth form */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            {/* Mobile brand header */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">ApronHanger</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin"
                  ? redirectAfterLogin
                    ? "Sign in to continue your application."
                    : "Continue your healthcare career journey."
                  : "Join 1.2L+ verified healthcare professionals."}
              </p>
            </div>

            {/* Divider */}
            <div className="space-y-3">
              <GoogleLogin />
            </div>
            <div className="my-6 flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                or with email
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      ref={nameRef}
                      placeholder="Dr. Aarav Mehta"
                      className="h-11 pl-9"
                      aria-invalid={!!fieldErrors.name}
                      required
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    ref={emailRef}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 pl-9"
                    aria-invalid={!!fieldErrors.email}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-11 px-9"
                    aria-invalid={!!fieldErrors.password}
                    required
                  />
                  {fieldErrors.password && (
                    <p className="text-xs text-destructive">{fieldErrors.password}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-brand text-brand-foreground shadow-soft hover:bg-brand/90"
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              {mode === "signup" && (
                <p className="text-center text-xs text-muted-foreground">
                  By continuing you agree to our{" "}
                  <a className="underline underline-offset-2">Terms</a> and{" "}
                  <a className="underline underline-offset-2">Privacy Policy</a>.
                </p>
              )}
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to ApronHanger?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setFormError(null);
                  setFieldErrors({});
                }}
                className="font-semibold text-foreground hover:text-brand"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>

            <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified credentials · MCI / DCI / INC compliant</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}




function SocialButton({
  provider,
  featured = false,
  hint,
  onClick,
}: {
  provider: "google" | "linkedin";
  featured?: boolean;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-11 w-full items-center justify-center gap-3 rounded-md border text-sm font-medium transition-colors",
        featured
          ? "border-brand/30 bg-brand-soft text-foreground shadow-soft hover:bg-brand-soft/70"
          : "border-border bg-surface text-foreground hover:bg-muted",
      )}
    >
      {provider === "google" ? <GoogleIcon /> : <LinkedInIcon />}
      <span>Continue with {provider === "google" ? "Google" : "LinkedIn"}</span>
      {featured && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-foreground">
           {/* Recommended */}
        </span>
      )}
      {hint && (
        <span className="sr-only">{hint}</span>
      )}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/* ---------- LEFT BRAND PANEL ---------- */

function BrandPanel() {
  return (
    <div
      className="relative flex h-full flex-col p-12 xl:p-16"
      style={{
        background:
          "linear-gradient(140deg, oklch(0.58 0.16 258) 0%, oklch(0.50 0.17 262) 45%, oklch(0.42 0.16 268) 100%)",
      }}
    >
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />

      {/* Logo */}
      <Link to="/" className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold tracking-tight">ApronHanger</div>
          <div className="text-[11px] uppercase tracking-wider text-white/50">
            Healthcare Hiring
          </div>
        </div>
      </Link>

      {/* Heading */}
      <div className="relative z-10 mt-16 max-w-md">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Candidate Portal
        </div>
        <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-[2.75rem]">
          <>
              Where India's clinicians
              <br />
              <span className="text-sky-200">find their next role.</span>
            </>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/70">
          A structured CV, role-aware applications, and a private network of India's leading hospitals.
        </p>
      </div>

      {/* Preview card */}
      <div className="relative z-10 mt-12 flex-1">
        <CandidatePreview />
      </div>

      {/* Footer stats */}
      <div className="relative z-10 mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
        <Stat value="1.2L+" label="Verified pros" />
        <Stat value="3,400+" label="Hospitals" />
        <Stat value="14 days" label="Avg. hire" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}

function CandidatePreview() {
  return (
    <div className="relative">
      {/* Job card */}
      <div className="rounded-2xl bg-white p-5 text-foreground shadow-pop ring-1 ring-black/5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Consultant Cardiologist</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Verified hospital · Bengaluru</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["DM Cardio", "5+ yrs", "₹38–48 LPA"].map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
            94%
          </div>
        </div>
      </div>

      {/* Floating mini-card */}
      <div className="absolute -bottom-6 -right-4 w-56 rounded-xl bg-white p-3 text-foreground shadow-pop ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold">Application sent</div>
            <div className="text-[10px] text-muted-foreground">City Hospital · Sr. Resident</div>
          </div>
        </div>
      </div>

      {/* Floating profile completeness */}
      <div className="absolute -left-4 -top-6 w-44 rounded-xl bg-white p-3 text-foreground shadow-pop ring-1 ring-black/5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Profile strength
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-base font-semibold">86%</div>
          <TrendingUp className="h-4 w-4 text-brand" />
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[86%] rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

function RecruiterPreview() {
  return (
    <div className="relative">
      {/* Pipeline card */}
      <div className="rounded-2xl bg-white p-5 text-foreground shadow-pop ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Cardiology · Bengaluru</h3>
            <p className="text-xs text-muted-foreground">128 candidates · 12 shortlisted</p>
          </div>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
            Live
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Applied", n: 128 },
            { label: "Screened", n: 42 },
            { label: "Interview", n: 18 },
            { label: "Offer", n: 4 },
          ].map((s, i) => (
            <div key={s.label} className="rounded-lg bg-muted p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-0.5 text-lg font-semibold">{s.n}</div>
              <div className="mt-1.5 h-1 rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${100 - i * 22}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating candidate card */}
      <div className="absolute -bottom-6 -right-4 w-60 rounded-xl bg-white p-3 text-foreground shadow-pop ring-1 ring-black/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <div className="text-xs font-semibold">Dr. Aarav Mehta</div>
              <CheckCircle2 className="h-3 w-3 text-brand" />
            </div>
            <div className="text-[10px] text-muted-foreground">
              DM Cardio · 7 yrs · 96% match
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat */}
      <div className="absolute -left-4 -top-6 w-44 rounded-xl bg-white p-3 text-foreground shadow-pop ring-1 ring-black/5">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          New this week
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-base font-semibold">+34</div>
          <Users className="h-4 w-4 text-brand" />
        </div>
        <div className="mt-1 text-[10px] text-muted-foreground">verified applicants</div>
      </div>
    </div>
  );
}
