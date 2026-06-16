export type JobType = "Full-time" | "Locum" | "Part-time" | "Contract";

export type Job = {
  id: string;
  hospital: string;
  hospitalVerified: boolean;
  hospitalAbout: string;
  role: string;
  category: string;
  specialty: string;
  location: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  experienceMax: number;
  type: JobType;
  postedDays: number;
  matchPercent?: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
  customApplicationFields?: import("@/lib/jobCustomFields").JobCustomField[];
  status?: string;
  tags?: string[];
};
