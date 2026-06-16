import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Item = {
  id: string;
  title: string;
  detail?: string;
  time?: string;
  unread?: boolean;
};

type Props = {
  items?: Item[];
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  contentClassName?: string;
  emptyHint?: string;
};

export function NotificationsMenu({
  items = [],
  align = "end",
  triggerClassName,
  contentClassName = "w-[360px]",
  emptyHint = "Application and pipeline updates will appear here.",
}: Props) {
  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className={
            triggerClassName ??
            "relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          }
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={`p-0 ${contentClassName}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator className="my-0" />
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No notifications yet</p>
            <p className="mt-1 text-xs text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">
            {items.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                    {n.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />}
                  </div>
                  {n.detail && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.detail}</p>
                  )}
                  {n.time && <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
