/** Shared recruiter portal types (no mock data). */

import type { FormProfile } from "@/lib/formProfile";

export type JobType = "Full-time" | "Part-time" | "Locum";
export type JobStatus = "Active" | "Closed" | "Draft";
export type ApplicantStatus =
  | "Applied"
  | "Reviewed"
  | "Shortlisted"
  | "Rejected"
  | "Contacted"
  | "Job closed";

export type Job = {
  id: string;
  role: string;
  specialty: string;
  subSpecialty?: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  type: JobType;
  shift: "Day" | "Night" | "Rotational";
  experience: string;
  applicants: number;
  shortlisted: number;
  status: JobStatus;
  postedOn: string;
  description: string;
  tags: string[];
};

export type Candidate = {
  id: string;
  applicationId?: string;
  cvSource?: "form" | "upload";
  uploadedCvName?: string;
  uploadedCvMime?: string;
  uploadedCvData?: string;
  formProfile?: FormProfile | null;
  name: string;
  initials: string;
  role: string;
  specialty: string;
  experienceYears: number;
  location: string;
  currentEmployer: string;
  summary: string;
  status: ApplicantStatus;
  appliedTo: string;
  appliedOn: string;
  matchPercent: number;
  verified: boolean;
  registration: string;
  email: string;
  phone: string;
  languages: string[];
  procedures: string[];
  skills: string[];
  education: { degree: string; institute: string; year: string }[];
  certifications: string[];
  experience: {
    role: string;
    employer: string;
    location: string;
    period: string;
    highlights: string[];
  }[];
  customAnswers?: { fieldId: string; label: string; value: string; required: boolean }[];
};
