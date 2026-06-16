/** Mirrors candidate portal Profile for form-built CVs. */
export type FormProfile = {
  name: string;
  headline: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  avatar: string;
  verified: boolean;
  completeness: number;
  role: string;
  registrationNumber: string;
  registrationCouncil: string;
  yearsExperience: number;
  summary: string;
  qualifications: { degree: string; institution: string; year: string }[];
  experience: {
    role: string;
    hospital: string;
    city: string;
    start: string;
    end: string;
    summary: string;
  }[];
  clinicalSkills: string[];
  technicalSkills: string[];
  procedures: { name: string; count: number }[];
  certifications: { name: string; issuer: string; year: string }[];
  publications: string[];
  languages: string[];
  availability: string;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
};
