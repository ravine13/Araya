import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { RecruiterSearchBar } from "@/components/layout/RecruiterSearchBar";
import { logout, useAuth } from "@/store/authStore";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsMenu } from "@/components/common/NotificationsMenu";

export function TopBar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initials = user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "AH";
  const hospitalName = user?.name ?? "My Hospital";

  const handleSignOut = () => {
    logout();
    navigate({ to: "/auth/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <div className="min-w-0 flex-1 px-1">
        <RecruiterSearchBar className="max-w-none" />
      </div>

      <div className="ml-auto flex items-center gap-1.5 md:gap-2">
        <NotificationsMenu
          triggerClassName="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          contentClassName="w-80"
          emptyHint="New applicants and job activity will show up here."
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left transition-colors hover:bg-muted/40">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-display text-xs font-semibold">
                {initials}
              </span>
              <div className="hidden leading-tight md:block">
                <div className="text-[13px] font-medium text-foreground">{hospitalName}</div>
                <div className="text-[11px] text-muted-foreground">{user?.email}</div>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="text-[13px] font-medium">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">Hospital profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Verification</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
