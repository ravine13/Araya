import { Bookmark } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isAuthenticated } from "@/store/authStore";
import { isJobSaved, toggleSavedJob, useSavedJobIds } from "@/store/savedJobsStore";

type Props = {
  jobId: string;
  variant?: "icon" | "button";
  className?: string;
};

export function SaveJobButton({ jobId, variant = "icon", className }: Props) {
  useSavedJobIds();
  const navigate = useNavigate();
  const saved = isJobSaved(jobId);
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      toast.info("Sign in to save jobs");
      const returnPath =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : "/";
      navigate({ to: "/auth", search: { redirect: returnPath } });
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const nowSaved = await toggleSavedJob(jobId);
      toast.success(nowSaved ? "Job saved" : "Removed from saved jobs");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update saved jobs");
    } finally {
      setBusy(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={handleClick}
        className={cn(
          "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
          saved
            ? "border-primary bg-primary/10 text-primary"
            : "bg-background hover:bg-muted",
          className,
        )}
      >
        <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save job"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      onClick={handleClick}
      className={cn(
        "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary",
        saved && "text-primary",
        className,
      )}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
    </button>
  );
}
