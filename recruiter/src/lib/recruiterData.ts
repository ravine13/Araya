import { apiBase } from "@/lib/api";
import { authHeader, getUser } from "@/store/authStore";
import type { ApplicantStatus, Candidate } from "@/lib/mock";
import type { FormProfile } from "@/lib/formProfile";
import {
  apiToDisplayStatus,
  displayToApiStatus,
  type ApiApplicationStatus,
  type DisplayApplicantStatus,
} from "@/lib/applicationStatus";
import {
  formatResponseValue,
  type CustomFieldResponses,
  type JobCustomField,
} from "@/lib/jobCustomFields";

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapStatus(apiStatus: string): ApplicantStatus {
  const display = apiToDisplayStatus(apiStatus);
  return display as ApplicantStatus;
}

function mapFromFormProfile(profile: FormProfile, app: {
  id: string;
  status: string;
  appliedOn: string;
  jobId: string;
  cvSource?: string;
  uploadedCvName?: string;
  uploadedCvMime?: string;
  uploadedCvData?: string;
  candidate: Record<string, unknown>;
}): Candidate {
  const c = app.candidate;
  const initials =
    profile.avatar ||
    String(profile.name || "HP")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return {
    id: String(c.id),
    name: profile.name,
    initials,
    role: profile.role,
    specialty: profile.clinicalSkills?.[0] || profile.role,
    experienceYears: profile.yearsExperience,
    location: profile.state || profile.city,
    currentEmployer: profile.experience?.[0]?.hospital || "",
    summary: profile.summary,
    status: mapStatus(app.status),
    appliedTo: app.jobId,
    appliedOn: new Date(app.appliedOn).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    matchPercent: Number(c.matchPercent || profile.completeness || 75),
    verified: Boolean(profile.verified),
    registration: profile.registrationNumber
      ? `${profile.registrationNumber}${profile.registrationCouncil ? ` (${profile.registrationCouncil})` : ""}`
      : "",
    email: profile.email,
    phone: profile.phone,
    languages: profile.languages || [],
    procedures: (profile.procedures || []).map((p) =>
      typeof p === "string" ? p : `${p.name}${p.count ? ` (${p.count})` : ""}`,
    ),
    skills: [...(profile.clinicalSkills || []), ...(profile.technicalSkills || [])],
    education: (profile.qualifications || []).map((e) => ({
      degree: e.degree,
      institute: e.institution,
      year: e.year,
    })),
    certifications: (profile.certifications || []).map(
      (cert) => `${cert.name}${cert.issuer ? ` · ${cert.issuer}` : ""}${cert.year ? ` (${cert.year})` : ""}`,
    ),
    experience: (profile.experience || []).map((e) => ({
      role: e.role,
      employer: e.hospital,
      location: e.city,
      period: [e.start, e.end].filter(Boolean).join(" — "),
      highlights: e.summary ? [e.summary] : [],
    })),
    applicationId: app.id,
    cvSource: "form",
    formProfile: profile,
    uploadedCvName: app.uploadedCvName as string | undefined,
    uploadedCvMime: app.uploadedCvMime as string | undefined,
    uploadedCvData: app.uploadedCvData as string | undefined,
  } as Candidate;
}

function resolveCustomAnswers(
  fields: JobCustomField[],
  responses: CustomFieldResponses,
): { fieldId: string; label: string; value: string; required: boolean }[] {
  return fields.map((f) => ({
    fieldId: f.id,
    label: f.label,
    required: f.required,
    value: formatResponseValue(responses[f.id]),
  }));
}

export function mapApiCandidate(app: {
  id: string;
  status: string;
  appliedOn: string;
  jobId: string;
  cvSource?: string;
  uploadedCvName?: string;
  uploadedCvMime?: string;
  uploadedCvData?: string;
  customFieldResponses?: CustomFieldResponses;
  job?: { customApplicationFields?: JobCustomField[] };
  candidate: Record<string, unknown>;
}): Candidate {
  const c = app.candidate;
  const appCvSource = app.cvSource || (c.cvSource as string);
  const profile = c.profile as FormProfile | null | undefined;
  const jobFields = app.job?.customApplicationFields || [];
  const customAnswers = resolveCustomAnswers(
    jobFields,
    (app.customFieldResponses || {}) as CustomFieldResponses,
  );

  if (profile && appCvSource !== "upload") {
    const mapped = mapFromFormProfile(profile, app);
    return { ...mapped, customAnswers } as Candidate;
  }

  const education = safeJsonParse<{ degree: string; institution?: string; institute?: string; year: string }[]>(
    c.education as string | undefined,
    [],
  );
  const experience = safeJsonParse<
    {
      role: string;
      hospital?: string;
      employer?: string;
      city?: string;
      location?: string;
      start?: string;
      end?: string;
      summary?: string;
      highlights?: string[];
    }[]
  >(c.experience as string | undefined, []);
  const certifications = safeJsonParse<{ name: string; issuer?: string; year?: string }[] | string[]>(
    c.certifications as string | undefined,
    [],
  );

  return {
    id: String(c.id),
    name: String(c.name || "Candidate"),
    initials: String(c.initials || "—"),
    role: String(c.role || "Healthcare Professional"),
    specialty: String(c.specialty || "General"),
    experienceYears: Number(c.experienceYears || 0),
    location: String(c.location || ""),
    currentEmployer: String(c.currentEmployer || ""),
    summary: String(c.summary || ""),
    status: mapStatus(app.status),
    appliedTo: app.jobId,
    appliedOn: new Date(app.appliedOn).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    matchPercent: Number(c.matchPercent || 75),
    verified: Boolean(c.verified),
    registration: String(c.registration || ""),
    email: String(c.email || ""),
    phone: String(c.phone || ""),
    languages: safeJsonParse<string[]>(c.languages as string | undefined, []),
    procedures: safeJsonParse<string[] | { name: string; count?: number }[]>(
      c.procedures as string | undefined,
      [],
    ).map((p) => (typeof p === "string" ? p : `${p.name}${p.count ? ` (${p.count})` : ""}`)),
    skills: safeJsonParse<string[]>(c.skills as string | undefined, []),
    education: education.map((e) => ({
      degree: e.degree,
      institute: e.institution || e.institute || "",
      year: e.year,
    })),
    certifications: certifications.map((cert) =>
      typeof cert === "string"
        ? cert
        : `${cert.name}${cert.issuer ? ` · ${cert.issuer}` : ""}${cert.year ? ` (${cert.year})` : ""}`,
    ),
    experience: experience.map((e) => ({
      role: e.role,
      employer: e.hospital || e.employer || "",
      location: e.city || e.location || "",
      period: [e.start, e.end].filter(Boolean).join(" — ") || "",
      highlights: e.summary ? [e.summary] : e.highlights || [],
    })),
    applicationId: app.id,
    cvSource: (appCvSource === "upload" ? "upload" : "form") as "form" | "upload",
    formProfile: profile || null,
    uploadedCvName: (app.uploadedCvName as string) || (c.uploadedCvName as string),
    uploadedCvMime: (app.uploadedCvMime as string) || (c.uploadedCvMime as string),
    uploadedCvData: (app.uploadedCvData as string) || (c.uploadedCvData as string),
    customAnswers,
  } as Candidate;
}

export type DashboardStats = {
  kpis: { label: string; value: string; delta: string }[];
  chart: { week: string; jobs: number; applications: number }[];
  suggested: {
    id: string;
    name: string;
    initials: string;
    specialty: string;
    experienceYears: number;
    location: string;
    matchPercent: number;
  }[];
};

export type HospitalProfile = {
  id: string;
  name: string;
  shortName?: string | null;
  type?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  registrationNumber?: string | null;
  beds?: number | null;
  founded?: number | null;
  about?: string | null;
  specialties: string[];
  verified: boolean;
  verifiedOn?: string | null;
  verifiedBy?: string | null;
  profileComplete: boolean;
};

export async function loadHospitalProfile(): Promise<HospitalProfile | null> {
  const res = await fetch(`${apiBase()}/api/hospitals/me`, { headers: authHeader() });
  if (!res.ok) return null;
  return res.json();
}

export async function saveHospitalProfile(data: Partial<HospitalProfile>): Promise<HospitalProfile> {
  const res = await fetch(`${apiBase()}/api/hospitals/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to save hospital profile");
  }
  return res.json();
}

export async function loadDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${apiBase()}/api/dashboard/stats`, { headers: authHeader() });
  if (!res.ok) {
    return { kpis: [], chart: [], suggested: [] };
  }
  return res.json();
}

export type RecruiterDashboardData = {
  candidates: ReturnType<typeof mapApiCandidate>[];
  jobs: unknown[];
};

export async function loadRecruiterDashboard(): Promise<RecruiterDashboardData> {
  const user = getUser();
  const headers = authHeader();
  const hospitalParam = user?.hospitalId ? `?hospitalId=${user.hospitalId}` : "";
  const [appsRes, jobsRes] = await Promise.all([
    fetch(`${apiBase()}/api/applications`, { headers }),
    fetch(`${apiBase()}/api/jobs${hospitalParam}`, { headers }),
  ]);
  if (!appsRes.ok || !jobsRes.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  const applications = await appsRes.json();
  const jobs = await jobsRes.json();
  const candidates = applications.map((app: Parameters<typeof mapApiCandidate>[0]) => mapApiCandidate(app));
  return { candidates, jobs };
}

export async function closeJob(jobId: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/jobs/${jobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status: "Closed" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to close job");
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: DisplayApplicantStatus | ApiApplicationStatus,
): Promise<void> {
  const apiStatus =
    typeof status === "string" &&
      ["New", "Reviewed", "Shortlisted", "Rejected", "Contacted", "JobClosed"].includes(status)
      ? status
      : displayToApiStatus(status as DisplayApplicantStatus);
  const res = await fetch(`${apiBase()}/api/applications/${applicationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status: apiStatus }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to update status");
  }
}
