import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth/invite")({
  head: () => ({
    meta: [
      { title: "Join with invite code — ApronHanger" },
      { name: "description", content: "Join your hospital's recruiter workspace using an invite code." },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("APOLLO-KOL-7821");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="font-display text-[28px] font-semibold tracking-tight text-foreground">
          Join your hospital
        </h2>
        <p className="text-[14px] text-muted-foreground">
          Ask your hospital admin for an invite code, or accept the email invite forwarded to you.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/auth/onboarding" });
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="code">Invite code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-12 font-display text-[15px] tracking-[0.18em]"
          />
          <p className="text-[11px] text-muted-foreground">
            Format: HOSPITAL-CITY-XXXX (e.g. APOLLO-KOL-7821).
          </p>
        </div>

        <div className="rounded-lg border border-accent/20 bg-accent/[0.06] p-4">
          <div className="text-[12px] uppercase tracking-wider text-accent">Invite preview</div>
          <div className="mt-1 text-[14px] font-medium text-foreground">
            Apollo Multispeciality Hospital — Kolkata
          </div>
          <div className="text-[12px] text-muted-foreground">
            Invited as: Recruiter · Talent Acquisition team
          </div>
        </div>

        <Button type="submit" className="h-11 w-full text-[14px] font-medium">
          Accept and continue
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Don&apos;t have a code?{" "}
        <Link to="/auth/signup" className="font-medium text-accent hover:underline">
          Onboard a new hospital
        </Link>
      </p>
    </div>
  );
}
