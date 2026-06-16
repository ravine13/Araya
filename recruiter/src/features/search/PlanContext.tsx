import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type PlanTier = "Basic" | "Pro" | "Premium";

export const PLAN_QUOTA: Record<PlanTier, number> = {
  Basic: 30,
  Pro: 50,
  Premium: 100,
};

export const PLAN_JOB_POSTS: Record<PlanTier, number> = {
  Basic: 5,
  Pro: 15,
  Premium: 40,
};

export const JOB_VALIDITY_DAYS = 30;

type Ctx = {
  plan: PlanTier;
  setPlan: (p: PlanTier) => void;
  used: number;
  quota: number;
  remaining: number;
  jobPostsQuota: number;
  jobPostsUsed: number;
  jobPostsRemaining: number;
  jobValidityDays: number;
  consume: () => boolean;
};

const PlanCtx = createContext<Ctx | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanTier>("Pro");
  const [used, setUsed] = useState(12);
  const [jobPostsUsed] = useState(4);

  const value = useMemo<Ctx>(() => {
    const quota = PLAN_QUOTA[plan];
    const jobPostsQuota = PLAN_JOB_POSTS[plan];
    return {
      plan,
      setPlan: (p) => {
        setPlan(p);
        setUsed(0);
      },
      used,
      quota,
      remaining: Math.max(0, quota - used),
      jobPostsQuota,
      jobPostsUsed,
      jobPostsRemaining: Math.max(0, jobPostsQuota - jobPostsUsed),
      jobValidityDays: JOB_VALIDITY_DAYS,
      consume: () => {
        if (used >= quota) return false;
        setUsed((u) => u + 1);
        return true;
      },
    };
  }, [plan, used, jobPostsUsed]);

  return <PlanCtx.Provider value={value}>{children}</PlanCtx.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanCtx);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
