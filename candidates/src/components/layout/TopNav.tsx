import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bookmark, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAuthenticated, logout, useAuth } from "@/store/authStore";
import { clearProfile } from "@/store/profileStore";
import { setSavedIds } from "@/store/savedJobsStore";
import { resetHydration } from "@/lib/hydrate";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationsMenu } from "@/components/common/NotificationsMenu";
import { useProfile } from "@/store/profileStore";
import { cn } from "@/lib/utils";

const PUBLIC_NAV = [{ to: "/", label: "Opportunities" }] as const;

const AUTH_NAV = [
  { to: "/", label: "Opportunities" },
  { to: "/saved-jobs", label: "Saved" },
  { to: "/applications", label: "Applications" },
  { to: "/profile", label: "Profile" },
] as const;

export function TopNav() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const authed = isAuthenticated();
  const { user } = useAuth();
  const profile = useProfile();
  const displayName = profile?.name || user?.name || "Guest";
  const displayInitials = profile?.avatar || "AH";
  const displayRole = profile?.role || "Healthcare Pro";
  const displayEmail = profile?.email || user?.email || "Browse jobs without signing in";

  const navItems = authed ? AUTH_NAV : PUBLIC_NAV;

  const handleSignOut = () => {
    clearProfile();       // wipe cached profile before clearing token
    setSavedIds([]);      // wipe saved-job cache
    resetHydration();     // allow fresh fetch for next user
    logout();             // clear auth token + user from localStorage
    navigate({ to: "/" });
  };

  const signInHref = () => ({
    to: "/auth" as const,
    search: pathname.startsWith("/auth")
      ? {}
      : { redirect: `${pathname}${typeof window !== "undefined" ? window.location.search : ""}` },
  });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-40 border-b bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">A</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            ApronHanger
          </span>
          <span className="ml-1 hidden rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-primary md:inline">
            Candidate
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive(item.to) && "bg-brand-soft text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!authed ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link {...signInHref()}>Sign in</Link>
            </Button>
          ) : (
            <>
              <NotificationsMenu />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border bg-surface py-1 pl-1 pr-3 text-left transition-colors hover:bg-muted">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-xs font-semibold leading-tight text-foreground">
                        {displayName.split(" ").slice(0, 2).join(" ")}
                      </p>
                      <p className="text-[10px] leading-tight text-muted-foreground">{displayRole}</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                        {displayInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{displayName}</p>
                      <p className="text-[11px] font-normal text-muted-foreground">{displayEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/saved-jobs" className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" /> Saved jobs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> View profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to={profile ? "/cv-preview" : "/build-cv"}
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="h-4 w-4" /> {profile ? "My CV" : "Build my CV"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive"
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!authed && (
            <Button asChild size="sm" variant="outline" className="md:hidden">
              <Link {...signInHref()}>Sign in</Link>
            </Button>
          )}

          <Badge variant="outline" className="md:hidden">
            Beta
          </Badge>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted",
              isActive(item.to) && "bg-brand-soft text-primary",
            )}
          >
            {item.label}
          </Link>
        ))}
        {!authed && (
          <Link
            {...signInHref()}
            className="shrink-0 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
