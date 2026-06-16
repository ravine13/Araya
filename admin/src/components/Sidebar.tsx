import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Network,
  Users,
  Briefcase,
  FileText,
  ShieldCheck,
  BarChart3,
  ScrollText,
  Settings,
  Inbox,
  X,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/hospitals", label: "Hospitals", icon: Network },
  { to: "/recruiters", label: "Recruiters", icon: Building2 },
  { to: "/recruiter-applications", label: "Recruiter Applications", icon: Inbox },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: FileText },
  { to: "/verifications", label: "Verifications", icon: ShieldCheck },
  { to: "/analytics", label: "Reports / Analytics", icon: BarChart3 },
  { to: "/system-logs", label: "System Logs", icon: ScrollText },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-sidebar-bg border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:translate-x-0 lg:z-30 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-active">
              <span className="text-sm font-bold text-sidebar-active-foreground">A</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-active-foreground tracking-tight">ApronHanger</span>
          </div>
          <button onClick={onClose} className="lg:hidden rounded p-1 text-sidebar-foreground hover:text-sidebar-active-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-active text-sidebar-active-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active-foreground"
                }`}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60 leading-relaxed">
            ApronHanger acts as a professional networking and hiring facilitation platform and is not responsible for employment decisions.
          </p>
        </div>
      </aside>
    </>
  );
}
