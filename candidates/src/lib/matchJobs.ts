import type { Profile } from "@/data/profile";

export function scoreJobMatch(job: Record<string, unknown>, profile: Profile | null | undefined): number {
  if (!profile) return 0;
  let score = 40;
  const role = String(profile.role || "").toLowerCase();
  const jobRole = String(job.role || "").toLowerCase();
  const jobSpec = String(job.specialty || "").toLowerCase();
  if (role && (jobRole.includes(role) || jobSpec.includes(role))) score += 20;
  const years = profile.yearsExperience ?? 0;
  const min = Number(job.experienceMin ?? 0);
  const max = Number(job.experienceMax ?? 20);
  if (years >= min && years <= max + 2) score += 20;
  else if (years >= min - 1) score += 10;
  const city = String(profile.city || "").toLowerCase();
  const loc = String(job.city || job.location || "").toLowerCase();
  if (city && loc && (city.includes(loc.split(",")[0]) || loc.includes(city.split(",")[0]))) score += 15;
  const skills = [...profile.clinicalSkills, ...profile.technicalSkills].map((s) => s.toLowerCase());
  const tags = (Array.isArray(job.tags) ? job.tags : []) as string[];
  if (tags.some((t) => skills.some((s) => s.includes(String(t).toLowerCase())))) score += 5;
  return Math.min(98, Math.max(52, score));
}

export function computeJobMatches(jobs: Record<string, unknown>[], profile: Profile | null | undefined) {
  if (!profile || profile.completeness < 20) {
    return jobs
      .map((j) => ({ ...j, matchPercent: j.matchPercent ?? 0 }))
      .filter((j) => (j.matchPercent as number) > 0)
      .sort((a, b) => (b.matchPercent as number) - (a.matchPercent as number));
  }
  return jobs
    .map((j) => ({
      ...j,
      matchPercent: Number(j.matchPercent) || scoreJobMatch(j, profile),
    }))
    .filter((j) => (j.matchPercent as number) >= 55)
    .sort((a, b) => (b.matchPercent as number) - (a.matchPercent as number));
}
