export type Qualification = {
  degree: string;
  institution: string;
  year: string;
};

export type ExperienceItem = {
  role: string;
  hospital: string;
  city: string;
  start: string;
  end: string;
  summary: string;
};

export type Procedure = {
  name: string;
  count: number;
};

export type Certification = {
  name: string;
  issuer: string;
  year: string;
};

export type Profile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  avatar: string;
  verified: boolean;
  completeness: number; // 0-100
  role: "Doctor" | "Dentist" | "Nurse" | "Technician" | "Admin";
  registrationNumber: string;
  registrationCouncil: string;
  yearsExperience: number;
  summary: string;
  qualifications: Qualification[];
  experience: ExperienceItem[];
  clinicalSkills: string[];
  technicalSkills: string[];
  procedures: Procedure[];
  certifications: Certification[];
  publications: string[];
  languages: string[];
  availability: string;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  linkedinUrl: string;
};

/**
 * Sample profile — used purely as form pre-fill / demo seeding when the
 * candidate clicks "Use sample data". The real CV in the portal is built
 * from the form (see `src/store/profileStore.ts`).
 */
export const SAMPLE_PROFILE: Profile = {
  name: "Dr. Ananya Sengupta",
  headline: "Consultant Cardiologist · 7 years experience",
  email: "ananya.sengupta@apronhanger.in",
  phone: "+91 98300 12345",
  city: "Kolkata, West Bengal",
  state: "West Bengal",
  avatar: "AS",
  verified: true,
  completeness: 82,
  role: "Doctor",
  registrationNumber: "WBMC/2017/45821",
  registrationCouncil: "West Bengal Medical Council",
  yearsExperience: 7,
  summary:
    "DM Cardiology with 7 years of clinical practice across tertiary care hospitals in eastern India. Strong interventional skills (PTCA, pacemaker implantation), peer-reviewed publications in heart failure management, and a keen interest in preventive cardiology.",
  qualifications: [
    { degree: "DM Cardiology", institution: "PGIMER, Chandigarh", year: "2019" },
    { degree: "MD Internal Medicine", institution: "IPGMER, Kolkata", year: "2016" },
    { degree: "MBBS", institution: "Calcutta Medical College", year: "2012" },
  ],
  experience: [
    {
      role: "Consultant Cardiologist",
      hospital: "AMRI Hospitals",
      city: "Kolkata",
      start: "Aug 2021",
      end: "Present",
      summary: "Lead interventional cardiology service. 200+ angiographies/year.",
    },
    {
      role: "Senior Resident — Cardiology",
      hospital: "PGIMER",
      city: "Chandigarh",
      start: "Jul 2019",
      end: "Jul 2021",
      summary: "Cath lab, CCU, OPD. Published 6 peer-reviewed papers.",
    },
  ],
  clinicalSkills: [
    "Coronary Angiography",
    "PTCA",
    "Pacemaker Implantation",
    "Echocardiography",
    "Heart Failure Management",
    "Preventive Cardiology",
  ],
  technicalSkills: ["EPIC EMR", "Philips Cath Lab", "GE Echo", "Stata", "R"],
  procedures: [
    { name: "Diagnostic Coronary Angiography", count: 850 },
    { name: "PTCA / Stent", count: 220 },
    { name: "Permanent Pacemaker", count: 65 },
    { name: "Echocardiography", count: 1400 },
  ],
  certifications: [
    { name: "ACLS Provider", issuer: "American Heart Association", year: "2024" },
    { name: "BLS Instructor", issuer: "American Heart Association", year: "2023" },
    { name: "Diploma in Echocardiography", issuer: "ICC", year: "2020" },
  ],
  publications: [
    "Sengupta A. et al. Outcomes of primary PCI in eastern India — Indian Heart Journal 2023.",
    "Sengupta A., Roy K. Heart failure registry — JAPI 2022.",
  ],
  languages: ["English", "Bengali", "Hindi"],
  availability: "30 days notice",
  expectedSalaryMin: 32,
  expectedSalaryMax: 48,
  linkedinUrl: "https://www.linkedin.com/in/ananya-sengupta-md",
};

export const EMPTY_PROFILE: Profile = {
  name: "",
  headline: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  avatar: "AH",
  verified: false,
  completeness: 0,
  role: "Doctor",
  registrationNumber: "",
  registrationCouncil: "",
  yearsExperience: 0,
  summary: "",
  qualifications: [],
  experience: [],
  clinicalSkills: [],
  technicalSkills: [],
  procedures: [],
  certifications: [],
  publications: [],
  languages: [],
  availability: "30 days notice",
  expectedSalaryMin: 0,
  expectedSalaryMax: 0,
  linkedinUrl: "",
};

/**
 * Back-compat alias. Components that haven't migrated to the store yet
 * may still import `CANDIDATE`; treat it as the sample profile.
 * @deprecated Prefer `useProfile()` from `@/store/profileStore`.
 */
export const CANDIDATE = SAMPLE_PROFILE;

export function computeCompleteness(p: Profile): number {
  const checks = [
    !!p.name,
    !!p.email,
    !!p.phone,
    !!(p.state || p.city),
    !!p.registrationNumber,
    !!p.summary,
    p.qualifications.length > 0,
    p.experience.length > 0,
    p.clinicalSkills.length > 0,
    p.procedures.length > 0,
    p.certifications.length > 0,
    p.languages.length > 0,
  ];
  const score = checks.filter(Boolean).length / checks.length;
  return Math.round(score * 100);
}

export function deriveHeadline(p: Profile): string {
  if (p.headline) return p.headline;
  const exp = p.yearsExperience ? `${p.yearsExperience} years experience` : "";
  const role = p.experience[0]?.role || p.role;
  return [role, exp].filter(Boolean).join(" · ");
}

export function initialsFor(name: string): string {
  const parts = name.replace(/^Dr\.?\s+/i, "").trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "A";
  const last = parts[parts.length - 1]?.[0] ?? "H";
  return (first + last).toUpperCase();
}
