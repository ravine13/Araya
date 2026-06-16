import { Outlet, createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ShieldCheck, Stethoscope, BadgeCheck } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { isAuthenticated } from "@/store/authStore";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (isAuthenticated()) throw redirect({ to: "/" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid-faint opacity-[0.06]" aria-hidden />
        <div className="relative z-10">
          <Logo className="[&_span:last-child]:text-primary-foreground" />
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="font-display text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
            Hire trusted clinicians, faster.
          </h1>
          <p className="text-[15px] leading-relaxed text-primary-foreground/75">
            ApronHanger is the premium hiring platform for hospitals and clinics across India —
            built for verified recruiters and verified candidates.
          </p>

          <ul className="space-y-3 text-[14px] text-primary-foreground/85">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary-foreground/90" />
              Verified hospital onboarding with NABH / MCI checks
            </li>
            <li className="flex items-start gap-3">
              <Stethoscope className="mt-0.5 h-5 w-5 text-primary-foreground/90" />
              Structured candidate profiles for doctors, nurses & technicians
            </li>
            <li className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 text-primary-foreground/90" />
              Match-scored shortlists, not endless CV piles
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-[12px] text-primary-foreground/60">
          © {new Date().getFullYear()} ApronHanger · Hiring facilitation platform
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Logo />
          <Link to="/auth/login" className="text-[13px] text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 md:px-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <p className="px-6 pb-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          ApronHanger acts as a professional networking and hiring facilitation platform and is not
          responsible for employment decisions.
        </p>
      </main>
    </div>
  );
}
