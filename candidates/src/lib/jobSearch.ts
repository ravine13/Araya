import type { Job } from "@/data/jobs";

export function jobMatchesSearch(job: Job, query: string, city: string): boolean {
  const q = query.trim().toLowerCase();
  const c = city.trim().toLowerCase();

  if (c) {
    const loc = `${job.city || ""} ${job.location || ""}`.toLowerCase();
    if (!loc.includes(c)) return false;
  }

  if (!q) return true;

  const tags = Array.isArray(job.tags) ? job.tags.join(" ") : "";

  const hay = [
    job.role,
    job.specialty,
    job.hospital,
    job.location,
    job.city,
    job.category,
    job.type,
    tags,
    typeof job.description === "string" ? job.description.replace(/<[^>]+>/g, " ") : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return hay.includes(q);
}
