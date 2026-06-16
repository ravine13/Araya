export type ApplicationStatus =
  | "Applied"
  | "Reviewed"
  | "Shortlisted"
  | "Contacted"
  | "Rejected"
  | "Job closed";

export const STATUS_FLOW: ApplicationStatus[] = [
  "Applied",
  "Reviewed",
  "Shortlisted",
  "Contacted",
];

export type Application = {
  id: string;
  jobId: string;
  role: string;
  hospital: string;
  city: string;
  appliedOn: string;
  status: ApplicationStatus;
  lastUpdate: string;
};
