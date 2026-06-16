import { useState } from "react";
import { Search, Bell, ChevronDown, Menu, LogOut } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center justify-between gap-3 border-b bg-card px-3 sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border hover:bg-accent shrink-0">
        <Menu className="h-4.5 w-4.5" />
      </button>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(e.target.value.length > 0); }}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          className="h-9 sm:h-10 w-full rounded-lg border bg-secondary/50 pl-9 sm:pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {showSearch && (
          <div className="absolute top-full left-0 mt-1 w-full rounded-lg border bg-card p-3 shadow-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">Hospitals</p>
            <p className="text-sm py-1">Apollo Hospitals – Chennai</p>
            <p className="text-xs font-medium text-muted-foreground mt-3 mb-2">Candidates</p>
            <p className="text-sm py-1">Dr. Priya Sharma – Cardiology</p>
            <p className="text-xs font-medium text-muted-foreground mt-3 mb-2">Jobs</p>
            <p className="text-sm py-1">Senior Cardiologist – Apollo</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border bg-secondary/50 transition-colors hover:bg-accent"
          >
            <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-destructive text-[9px] sm:text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-lg border bg-card shadow-lg">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`border-b px-4 py-3 last:border-0 ${!n.read ? "bg-navy-50/50" : ""}`}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 rounded-lg border px-2 sm:px-3 py-1.5 hover:bg-accent"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-[10px] sm:text-xs font-bold text-primary-foreground">{user?.initials ?? "SA"}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">{user?.name ?? "Super Admin"}</p>
              <p className="text-xs text-muted-foreground">{user?.email ?? "admin@apronhanger.in"}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-card shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowProfile(false); logout(); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent text-left"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
