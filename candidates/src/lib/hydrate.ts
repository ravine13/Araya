import { apiBase } from "@/lib/api";
import type { Profile } from "@/data/profile";
import { authHeader, isAuthenticated } from "@/store/authStore";
import { setProfile } from "@/store/profileStore";

let hydrateInFlight: Promise<Profile | null> | null = null;

/** Reset the in-flight deduplication guard — call this on logout/login
 *  so the next hydrateProfileFromApi() always fetches fresh data. */
export function resetHydration() {
  hydrateInFlight = null;
}

export async function hydrateProfileFromApi(): Promise<Profile | null> {
  if (!isAuthenticated()) return null;
  if (hydrateInFlight) return hydrateInFlight;

  hydrateInFlight = hydrateProfileFromApiInner().finally(() => {
    hydrateInFlight = null;
  });
  return hydrateInFlight;
}

async function hydrateProfileFromApiInner(): Promise<Profile | null> {
  try {
    const res = await fetch(`${apiBase()}/api/candidates/me`, { headers: authHeader() });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.profile && data.cvSource !== "upload") {
      const profile = data.profile as Profile;
      setProfile(profile);
      return profile;
    }
    if (data.cvSource === "upload" && data.name) {
      const minimal: Profile = {
        name: data.name,
        headline: `${data.role || "Healthcare"} · CV uploaded`,
        email: data.email,
        phone: data.phone || "",
        city: data.location || "",
        state: (data.profile as { state?: string } | null)?.state || data.location || "",
        avatar: data.initials || "CV",
        verified: false,
        completeness: 60,
        role: (data.role as Profile["role"]) || "Doctor",
        registrationNumber: "",
        registrationCouncil: "",
        yearsExperience: data.experienceYears || 0,
        summary: data.summary || "CV submitted via file upload.",
        qualifications: [],
        experience: [],
        clinicalSkills: [],
        technicalSkills: [],
        procedures: [],
        certifications: [],
        publications: [],
        languages: [],
        availability: "Immediately",
        expectedSalaryMin: 0,
        expectedSalaryMax: 0,
        linkedinUrl: "",
      };
      setProfile(minimal);
      return minimal;
    }
    if(data.name || data.email) {
      const minimal: Profile = {
        name: data.name || "",
        headline: `${data.role || "Healthcare"} · Profile incomplete`,
        email: data.email || "",
        phone: data.phone || "",
        city: data.location || "",
        state: (data.profile as { state?: string } | null)?.state || data.location || "",
        avatar: data.initials || "AP",
        verified: false,
        completeness: 30,
        role: (data.role as Profile["role"]) || "Candidate",
        registrationNumber: "",
        registrationCouncil: "",
        yearsExperience: data.experienceYears || 0,
        summary: "",
        qualifications: [],
        experience: [],
        clinicalSkills: [],
        technicalSkills: [],
        procedures: [],
        certifications: [],
        publications: [],
        languages: [],
        availability: "Immediately",
        expectedSalaryMin: 0,
        expectedSalaryMax: 0,
        linkedinUrl: "",
      };
      setProfile(minimal);
      return minimal;     
      }
    return null;
  } catch {
    return null;
  }
}
