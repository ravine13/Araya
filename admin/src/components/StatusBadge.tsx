import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Suspended: "bg-destructive/10 text-destructive",
  Closed: "bg-muted text-muted-foreground",
  Draft: "bg-warning/10 text-warning-foreground",
  "Under Review": "bg-info/10 text-info",
  Shortlisted: "bg-chart-2/10 text-chart-2",
  Accepted: "bg-success/10 text-success",
  Rejected: "bg-destructive/10 text-destructive",
  Success: "bg-success/10 text-success",
  Error: "bg-destructive/10 text-destructive",
  Warning: "bg-warning/10 text-warning-foreground",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {status}
    </span>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
      ✓ Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-foreground">
      Pending
    </span>
  );
}
