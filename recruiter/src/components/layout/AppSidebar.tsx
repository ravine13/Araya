import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  PlusSquare,
  Users,
  Settings,
  Search,
  Crown,
  Sparkles,
  CalendarDays,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Logo } from "@/components/brand/Logo";
import { VerifiedBadge } from "@/components/brand/VerifiedBadge";

import {
  loadHospitalProfile,
  type HospitalProfile,
} from "@/lib/recruiterData";

import { usePlan } from "@/features/search/PlanContext";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const items: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Posted Jobs", url: "/jobs", icon: Briefcase },
  { title: "Create Job", url: "/jobs/new", icon: PlusSquare },
  { title: "Search Candidates", url: "/search", icon: Search },
  { title: "Applicants", url: "/applicants", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const [hospital, setHospital] = useState<HospitalProfile | null>(null);

  const {
    plan,
    used,
    quota,
    remaining,
    jobPostsUsed,
    jobPostsQuota,
    jobPostsRemaining,
    jobValidityDays,
    setPlan,
  } = usePlan();

  const pct = Math.min(100, Math.round((used / quota) * 100));
  const jobPct = Math.min(100, Math.round((jobPostsUsed / jobPostsQuota) * 100));

  useEffect(() => {
    void loadHospitalProfile().then(setHospital);
  }, []);

  const isActive = (url: string, exact?: boolean) =>
    exact
      ? pathname === url
      : pathname === url || pathname.startsWith(url + "/");

  const initials = (hospital?.shortName || hospital?.name || "H")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-sm font-semibold">
                {initials[0]}
              </span>
            </span>
          </div>
        ) : (
          <Logo />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url, item.exact);

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:bg-sidebar-accent"
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="space-y-2 p-3">
        {/* Plan Card — hidden when collapsed to icon mode */}
        {!collapsed && (
          <div className="rounded-xl border border-[oklch(0.72_0.14_85_/_0.35)] bg-gradient-to-br from-[oklch(0.18_0.05_265)] to-[oklch(0.12_0.04_265)] p-3 text-white">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-[oklch(0.82_0.14_85)]" />
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">
                  {plan} Plan
                </span>
              </div>
              <span className="rounded-full border border-[oklch(0.72_0.14_85_/_0.4)] bg-[oklch(0.72_0.14_85_/_0.12)] px-2 py-0.5 text-[9.5px] font-medium text-[oklch(0.88_0.12_85)]">
                Active
              </span>
            </div>

            {/* Divider */}
            <div className="my-2.5 h-px bg-white/10" />

            {/* Premium Searches */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10.5px] text-white/60">
                  <Search className="h-3 w-3" />
                  <span>Premium Searches</span>
                </div>
                <span className="text-[10.5px] font-medium text-white">
                  {used}
                  <span className="text-white/40"> / {quota}</span>
                  <span className="ml-1 text-[9.5px] text-white/45">({remaining} left)</span>
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.14_85)] to-[oklch(0.88_0.12_85)] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Job Posts */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10.5px] text-white/60">
                  <FileText className="h-3 w-3" />
                  <span>Job Posts</span>
                </div>
                <span className="text-[10.5px] font-medium text-white">
                  {jobPostsUsed}
                  <span className="text-white/40"> / {jobPostsQuota}</span>
                  <span className="ml-1 text-[9.5px] text-white/45">({jobPostsRemaining} left)</span>
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.62_0.18_200)] to-[oklch(0.72_0.16_200)] transition-all"
                  style={{ width: `${jobPct}%` }}
                />
              </div>
            </div>

            {/* Job Validity */}
            <div className="mt-2.5 flex items-center gap-1 text-[10.5px] text-white/55">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span>
                Job validity:{" "}
                <span className="font-medium text-white/80">
                  {jobValidityDays} days
                </span>
                <span className="ml-1 text-white/35">(all plans)</span>
              </span>
            </div>

            {/* Divider */}
            <div className="my-2.5 h-px bg-white/10" />

            {/* Upgrade button */}
            <button
              onClick={() => {
                const tiers = ["Basic", "Pro", "Premium"] as const;
                const next = tiers[(tiers.indexOf(plan) + 1) % tiers.length];
                setPlan(next);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[oklch(0.78_0.14_85_/_0.4)] bg-[oklch(0.78_0.14_85_/_0.12)] py-1.5 text-[10.5px] font-medium text-[oklch(0.88_0.12_85)] transition-colors hover:bg-[oklch(0.78_0.14_85_/_0.25)]"
            >
              <Sparkles className="h-3 w-3" />
              Upgrade Plan
            </button>
          </div>
        )}

        {/* Hospital Card */}
        {!collapsed && (
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-display text-sm font-semibold">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-sidebar-foreground">
                  {hospital?.shortName ||
                    hospital?.name ||
                    "Your hospital"}
                </div>

                <div className="truncate text-[11px] text-muted-foreground">
                  {hospital?.type || "Complete profile in Settings"}
                </div>
              </div>
            </div>

            {hospital?.verified && (
              <div className="mt-2">
                <VerifiedBadge label="Verified Hospital" />
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}