import { createFileRoute } from "@tanstack/react-router";
import { User, Globe, Shield } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage admin profile, platform configuration, and permissions</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Admin Profile */}
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">SA</div>
            <div>
              <p className="text-sm font-semibold">Super Admin</p>
              <p className="text-xs text-muted-foreground">admin@apronhanger.in</p>
            </div>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground">Full Name</label><input className="mt-1 w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm" defaultValue="Arjun Mehta" /></div>
            <div><label className="text-xs text-muted-foreground">Email</label><input className="mt-1 w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm" defaultValue="admin@apronhanger.in" /></div>
            <div><label className="text-xs text-muted-foreground">Role</label><input className="mt-1 w-full rounded-lg border bg-secondary/50 px-3 py-2 text-sm text-muted-foreground" defaultValue="Super Admin" disabled /></div>
          </div>
          <button className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save Profile</button>
        </div>

        {/* Platform Settings */}
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Platform Settings</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Maintenance Mode</p><p className="text-xs text-muted-foreground">Disable public access</p></div>
              <div className="h-5 w-9 rounded-full bg-muted relative cursor-pointer"><div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow" /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-muted-foreground">System email alerts</p></div>
              <div className="h-5 w-9 rounded-full bg-success relative cursor-pointer"><div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow" /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Auto-Verification</p><p className="text-xs text-muted-foreground">Auto-verify trusted hospitals</p></div>
              <div className="h-5 w-9 rounded-full bg-muted relative cursor-pointer"><div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow" /></div>
            </div>
          </div>
        </div>

        {/* Role Permissions */}
        <div className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Role Permissions</h3>
          </div>
          <div className="space-y-3">
            {[
              { role: "Super Admin", perms: "Full access to all modules", color: "bg-primary" },
              { role: "Admin", perms: "Manage users, jobs, applications", color: "bg-chart-1" },
              { role: "Moderator", perms: "Review verifications, flag content", color: "bg-chart-2" },
              { role: "Viewer", perms: "Read-only access to dashboards", color: "bg-muted-foreground" },
            ].map((r) => (
              <div key={r.role} className="flex items-center gap-3 rounded-lg border p-3">
                <div className={`h-2 w-2 rounded-full ${r.color}`} />
                <div>
                  <p className="text-sm font-medium">{r.role}</p>
                  <p className="text-xs text-muted-foreground">{r.perms}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
