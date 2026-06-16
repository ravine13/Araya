import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { useAuth, DEMO_CREDENTIALS } from "@/lib/auth-context";
import { ShieldCheck, Loader2, Lock, Mail, ArrowRight, Sparkles, Building2, Users, BarChart3 } from "lucide-react";
import { JoinUsDialog } from "@/components/JoinUsDialog";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  if (isReady && isAuthenticated) return <Navigate to="/" />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* LEFT — Premium dark brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-sidebar-active-foreground overflow-hidden bg-[var(--sidebar-bg)]">
        {/* Decorative gradient blobs */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-info/30 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur border border-white/15">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ApronHanger</span>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> Super Admin Control Center
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight leading-tight">
              Command every signal across<br />the healthcare hiring network.
            </h1>
            <p className="mt-3 text-sm text-white/70 max-w-md">
              Monitor hospitals, verify recruiters, approve onboarding, and govern the entire ApronHanger platform from a single command surface.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            <Highlight icon={Building2} label="Hospitals" value="248" />
            <Highlight icon={Users} label="Recruiters" value="1.2K" />
            <Highlight icon={BarChart3} label="Active Jobs" value="3.8K" />
          </div>
        </div>

        <p className="relative text-xs text-white/50 leading-relaxed max-w-md">
          ApronHanger acts as a professional networking and hiring facilitation platform and is not responsible for employment decisions.
        </p>
      </div>

      {/* RIGHT — Login form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile-only brand */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">ApronHanger</span>
          </div>

          <div className="rounded-2xl border bg-card shadow-xl shadow-foreground/5 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to the Super Admin dashboard.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-lg bg-muted/60 border p-3 text-xs">
              <p className="font-medium text-foreground mb-1">Demo Credentials</p>
              <p className="text-muted-foreground">Email: <span className="font-mono text-foreground">{DEMO_CREDENTIALS.email}</span></p>
              <p className="text-muted-foreground">Password: <span className="font-mono text-foreground">{DEMO_CREDENTIALS.password}</span></p>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">New to ApronHanger</span></div>
            </div>

            <button
              onClick={() => setJoinOpen(true)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10 hover:border-primary/40 transition-colors"
            >
              <Sparkles className="h-4 w-4" /> Join Us as a Recruiter
            </button>
          </div>

          <p className="lg:hidden mt-6 text-center text-xs text-muted-foreground leading-relaxed px-4">
            ApronHanger acts as a professional networking and hiring facilitation platform and is not responsible for employment decisions.
          </p>
        </div>
      </div>

      <JoinUsDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}

function Highlight({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur">
      <Icon className="h-4 w-4 text-white/60" />
      <p className="mt-2 text-lg font-bold">{value}</p>
      <p className="text-[11px] text-white/60">{label}</p>
    </div>
  );
}
