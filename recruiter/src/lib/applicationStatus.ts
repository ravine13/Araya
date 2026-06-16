export type ApiApplicationStatus =
  | "New"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Contacted"
  | "JobClosed";

export type DisplayApplicantStatus =
  | "Applied"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Contacted"
  | "Job closed";

export function apiToDisplayStatus(api: string): DisplayApplicantStatus {
  const s = api.toLowerCase();
  if (s === "new") return "Applied";
  if (s === "reviewed") return "Reviewed";
  if (s === "shortlisted") return "Shortlisted";
  if (s === "rejected") return "Rejected";
  if (s === "contacted") return "Contacted";
  if (s === "jobclosed") return "Job closed";
  return "Applied";
}

export function displayToApiStatus(display: DisplayApplicantStatus): ApiApplicationStatus {
  if (display === "Applied") return "New";
  if (display === "Job closed") return "JobClosed";
  return display;
}

export function getAllowedNextStatuses(current: string): ApiApplicationStatus[] {
  const s = current.toLowerCase();
  if (s === "jobclosed") return [];
  if (s === "new" || s === "applied") return ["Reviewed"];
  if (s === "reviewed") return ["Shortlisted", "Rejected"];
  if (s === "shortlisted") return ["Contacted"];
  return [];
}

export function isTerminalApplicationStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "rejected" || s === "contacted" || s === "jobclosed" || s === "job closed";
}

export function statusPillClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "job closed" || s === "jobclosed")
    return "bg-muted text-muted-foreground border border-border";
  if (s === "rejected") return "bg-destructive/15 text-destructive border border-destructive/30";
  if (s === "shortlisted") return "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30";
  if (s === "contacted") return "bg-sky-500/15 text-sky-900 border border-sky-500/30";
  if (s === "reviewed") return "bg-amber-500/15 text-amber-950 border border-amber-500/30";
  if (s === "new" || s === "applied") return "bg-muted text-foreground border border-border";
  return "bg-muted text-muted-foreground border border-border";
}
