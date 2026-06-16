import { apiBase } from "@/lib/api";
import { authHeader } from "@/store/authStore";

export type RecruiterSearchJob = {
  id: string;
  role: string;
  specialty: string;
  location: string;
  status: string;
  hospital: string;
};

export type RecruiterSearchCandidate = {
  applicationId: string;
  candidateId: string;
  name: string;
  role: string;
  specialty: string;
  status: string;
  jobId: string;
  jobRole: string;
};

export type RecruiterSearchResults = {
  jobs: RecruiterSearchJob[];
  candidates: RecruiterSearchCandidate[];
};

export async function searchRecruiter(query: string): Promise<RecruiterSearchResults> {
  const q = query.trim();
  if (!q) return { jobs: [], candidates: [] };
  const res = await fetch(`${apiBase()}/api/search/recruiter?q=${encodeURIComponent(q)}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function jobMatchesLocalSearch(
  job: { role: string; specialty: string; location: string; city?: string; status: string; tags?: string[] },
  q: string,
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const tags = Array.isArray(job.tags) ? job.tags.join(" ") : "";
  const hay = [job.role, job.specialty, job.location, job.city, job.status, tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}
