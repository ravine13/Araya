export type ApiApplicationStatus =
  | "New"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Contacted"
  | "JobClosed";

export type DisplayApplicationStatus =
  | "Applied"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Contacted"
  | "Job closed";

/** Candidate-facing timeline (Rejected is a terminal branch, not in main flow). */
export const CANDIDATE_STATUS_STEPS: DisplayApplicationStatus[] = [
  "Applied",
  "Reviewed",
  "Shortlisted",
  "Contacted",
];

export function apiToDisplayStatus(api: string): DisplayApplicationStatus {
  const s = api.toLowerCase();
  if (s === "new") return "Applied";
  if (s === "reviewed") return "Reviewed";
  if (s === "shortlisted") return "Shortlisted";
  if (s === "rejected") return "Rejected";
  if (s === "contacted") return "Contacted";
  if (s === "jobclosed") return "Job closed";
  return "Applied";
}

export function displayToApiStatus(display: DisplayApplicationStatus): ApiApplicationStatus {
  if (display === "Applied") return "New";
  return display;
}

/** Allowed recruiter transitions — no skipping steps. */
export function getAllowedNextStatuses(current: string): ApiApplicationStatus[] {
  const s = current.toLowerCase();
  if (s === "jobclosed") return [];
  if (s === "new") return ["Reviewed"];
  if (s === "reviewed") return ["Shortlisted", "Rejected"];
  if (s === "shortlisted") return ["Contacted"];
  return [];
}

/** Rejected and Contacted are final; Shortlisted can only move to Contacted. */
export function isTerminalApplicationStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "rejected" || s === "contacted" || s === "jobclosed" || s === "job closed";
}

export function isLockedApplicationStatus(status: string): boolean {
  const s = status.toLowerCase();
  return (
    s === "rejected" ||
    s === "shortlisted" ||
    s === "contacted" ||
    s === "jobclosed" ||
    s === "job closed"
  );
}

export function statusPillClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "job closed" || s === "jobclosed")
    return "bg-muted text-muted-foreground border-border";
  if (s === "rejected") return "bg-destructive/15 text-destructive border-destructive/30";
  if (s === "shortlisted") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  if (s === "contacted") return "bg-sky-500/15 text-sky-800 border-sky-500/30";
  if (s === "reviewed") return "bg-amber-500/15 text-amber-900 border-amber-500/30";
  if (s === "new" || s === "applied") return "bg-muted text-foreground border-border";
  return "bg-muted text-muted-foreground border-border";
}

export function timelineStepIndex(status: DisplayApplicationStatus): number {
  if (status === "Rejected") return 1;
  return CANDIDATE_STATUS_STEPS.indexOf(status);
}
