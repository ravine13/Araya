import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  className?: string;
}

export function KPICard({ title, value, icon, change, changeType = "neutral", className }: KPICardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
      {change && (
        <p className={cn("mt-1 text-xs font-medium", changeType === "up" ? "text-success" : changeType === "down" ? "text-destructive" : "text-muted-foreground")}>
          {change}
        </p>
      )}
    </div>
  );
}
