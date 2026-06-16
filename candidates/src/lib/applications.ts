import { apiBase } from "@/lib/api";
import type { Profile } from "@/data/profile";
import { authHeader } from "@/store/authStore";
import type { CustomFieldResponses } from "@/lib/jobCustomFields";

export class ApplicationError extends Error {
  constructor(
    message: string,
    public code?: "DUPLICATE" | "NETWORK",
  ) {
    super(message);
  }
}

export async function fetchAppliedJobIds(): Promise<Set<string>> {
  const res = await fetch(`${apiBase()}/api/applications`, { headers: authHeader() });
  if (!res.ok) return new Set();
  const data = await res.json();
  return new Set(data.map((a: { jobId: string }) => a.jobId));
}

export async function hasAppliedToJob(jobId: string): Promise<boolean> {
  const ids = await fetchAppliedJobIds();
  return ids.has(jobId);
}

/** Safely converts an API error response value to a string, never throws. */
function toErrorMsg(raw: unknown, fallback: string): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
  }
  return fallback;
}

export async function syncCandidateProfile(profile: Profile): Promise<void> {
  let serialized: string;
  try {
    serialized = JSON.stringify({ profile });
  } catch {
    throw new ApplicationError("Could not serialize profile data. Please try again.");
  }
  const res = await fetch(`${apiBase()}/api/candidates/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: serialized,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApplicationError(toErrorMsg(body.error, "Failed to save profile"));
  }
}

async function postApplication(body: Record<string, unknown>): Promise<void> {
  let serialized: string;
  try {
    serialized = JSON.stringify(body);
  } catch {
    throw new ApplicationError("Could not prepare application data. Please try again.");
  }
  const res = await fetch(`${apiBase()}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: serialized,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 409) {
      throw new ApplicationError(
        toErrorMsg(data.error, "You have already applied to this job"),
        "DUPLICATE",
      );
    }
    if (res.status === 413) {
      throw new ApplicationError(
        "CV file is too large for upload. Try a smaller PDF (under 4MB) or use the form application.",
      );
    }
    const msg = toErrorMsg(data.error, "");
    if (msg.toLowerCase().includes("entity too large") || msg.toLowerCase().includes("payload")) {
      throw new ApplicationError(
        "CV upload failed — file may be too large. Try a PDF under 4MB or use the form instead.",
      );
    }
    throw new ApplicationError(toErrorMsg(data.error, "Failed to submit application"));
  }
}

export async function submitApplication(
  jobId: string,
  profile: Profile,
  customFieldResponses?: CustomFieldResponses,
  attachment?: { name: string; mime: string; data: string },
): Promise<void> {
  await postApplication({
    jobId,
    cvSource: "form",
    profile,
    ...(attachment ? { uploadedCv: attachment } : {}),
    ...(customFieldResponses && Object.keys(customFieldResponses).length > 0
      ? { customFieldResponses }
      : {}),
  });
}

export async function submitUploadApplication(
  jobId: string,
  file: { name: string; mime: string; data: string },
  contact: { name: string; email: string; phone: string },
  customFieldResponses?: CustomFieldResponses,
): Promise<void> {
  await postApplication({
    jobId,
    cvSource: "upload",
    uploadedCv: { ...file, contact },
    ...(customFieldResponses && Object.keys(customFieldResponses).length > 0
      ? { customFieldResponses }
      : {}),
  });
}

export async function quickApplyToJob(
  jobId: string,
  profile: Profile,
  customFieldResponses?: CustomFieldResponses,
): Promise<void> {
  return submitApplication(jobId, profile, customFieldResponses);
}

export type ApiApplication = {
  id: string;
  status: string;
  appliedOn: string;
  jobId: string;
  job: {
    id: string;
    role: string;
    location: string;
    city?: string | null;
    hospital: string;
  };
};

export async function fetchMyApplications(): Promise<ApiApplication[]> {
  const res = await fetch(`${apiBase()}/api/applications`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json();
}
