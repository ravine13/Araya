import { createContext, useContext, useState, ReactNode, useMemo, useEffect } from "react";
import {
  recruiters as seedHospitals,
  candidates as seedCandidates,
  jobs as seedJobs,
  applications as seedApplications,
} from "@/lib/mock-data";

// ============= Types =============
export type EntityStatus = "Active" | "Suspended";

export interface Hospital {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  status: EntityStatus;
  joined: string;
}

export interface Recruiter {
  id: string;
  name: string;
  email: string;
  role: string;
  hospitalId: string;
  status: EntityStatus;
  joined: string;
}

export interface Job {
  id: string;
  title: string;
  hospitalId: string;
  recruiterId: string;
  location: string;
  status: "Active" | "Closed" | "Draft";
  posted: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  verified: boolean;
  status: EntityStatus;
  joined: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: "Under Review" | "Shortlisted" | "Accepted" | "Rejected";
  applied: string;
}

export type PlanTier = "Basic" | "Pro" | "Premium";
export type RecruiterApplicationStatus = "Pending" | "Approved" | "Rejected";

export interface RecruiterApplication {
  id: string;
  hospitalName: string;
  hospitalType: string;
  registrationNumber: string;
  city: string;
  state: string;
  beds: number;
  address: string;
  website: string;
  phone: string;
  email: string;
  plan: PlanTier;
  status: RecruiterApplicationStatus;
  submitted: string;
}

// ============= Seed =============
const initialHospitals: Hospital[] = seedHospitals.map((r) => ({
  id: r.id,
  name: r.hospital,
  location: r.location,
  verified: r.verified,
  status: r.status,
  joined: r.joined,
}));

const recruiterFirstNames = ["Vikram", "Neha", "Suresh", "Pooja", "Arjun", "Lakshmi", "Rohit", "Divya"];
const recruiterLastNames = ["Mehta", "Kapoor", "Iyer", "Singh", "Bose", "Krishnan", "Malhotra", "Rao"];
const initialRecruiters: Recruiter[] = [];
initialHospitals.forEach((h, hi) => {
  const count = 2 + (hi % 2); // 2-3 recruiters each
  for (let i = 0; i < count; i++) {
    const fn = recruiterFirstNames[(hi + i) % recruiterFirstNames.length];
    const ln = recruiterLastNames[(hi * 2 + i) % recruiterLastNames.length];
    initialRecruiters.push({
      id: `${h.id}-REC${i + 1}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${h.name.toLowerCase().replace(/[^a-z]/g, "")}.in`,
      role: i === 0 ? "Hiring Manager" : "HR Recruiter",
      hospitalId: h.id,
      status: "Active",
      joined: h.joined,
    });
  }
});

const initialJobs: Job[] = seedJobs.map((j, i) => {
  const hospital = initialHospitals.find((h) => h.name === j.hospital) ?? initialHospitals[i % initialHospitals.length];
  const recruiter = initialRecruiters.find((r) => r.hospitalId === hospital.id) ?? initialRecruiters[0];
  return {
    id: j.id,
    title: j.title,
    hospitalId: hospital.id,
    recruiterId: recruiter.id,
    location: j.location,
    status: j.status,
    posted: j.posted,
  };
});

const initialCandidates: Candidate[] = seedCandidates.map((c) => ({
  id: c.id,
  name: c.name,
  role: c.role,
  specialty: c.specialty,
  experience: c.experience,
  verified: c.verified,
  status: c.status,
  joined: c.joined,
}));

const initialApplications: Application[] = seedApplications.map((a, i) => {
  const candidate = initialCandidates.find((c) => c.name === a.candidate) ?? initialCandidates[i % initialCandidates.length];
  const job = initialJobs.find((j) => j.title === a.job) ?? initialJobs[i % initialJobs.length];
  return {
    id: a.id,
    jobId: job.id,
    candidateId: candidate.id,
    status: a.status,
    applied: a.applied,
  };
});

// ============= Context =============
const RECRUITER_APPS_KEY = "apronhanger.recruiter-applications";

interface AdminStoreValue {
  hospitals: Hospital[];
  recruiters: Recruiter[];
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  recruiterApplications: RecruiterApplication[];
  // Hospital actions
  verifyHospital: (id: string) => void;
  unverifyHospital: (id: string) => void;
  toggleHospitalBlock: (id: string) => void;
  // Recruiter actions
  toggleRecruiterBlock: (id: string) => void;
  // Candidate actions
  toggleCandidateBlock: (id: string) => void;
  verifyCandidate: (id: string) => void;
  // Job actions
  deleteJob: (id: string) => void;
  // Recruiter application actions
  submitRecruiterApplication: (
    data: Omit<RecruiterApplication, "id" | "status" | "submitted">,
  ) => void;
  approveRecruiterApplication: (id: string) => void;
  rejectRecruiterApplication: (id: string) => void;
  // Helpers
  isRecruiterVerified: (recruiterId: string) => boolean;
}

const AdminStore = createContext<AdminStoreValue | null>(null);

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [recruiters, setRecruiters] = useState(initialRecruiters);
  const [jobs, setJobs] = useState(initialJobs);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [applications, setApplications] = useState(initialApplications);
  const [recruiterApplications, setRecruiterApplications] = useState<RecruiterApplication[]>([]);

  // Load recruiter applications from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(RECRUITER_APPS_KEY) : null;
      if (raw) setRecruiterApplications(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist recruiter applications to localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(RECRUITER_APPS_KEY, JSON.stringify(recruiterApplications));
      }
    } catch {
      /* ignore */
    }
  }, [recruiterApplications]);

  const verifiedHospitalIds = useMemo(
    () => new Set(hospitals.filter((h) => h.verified).map((h) => h.id)),
    [hospitals],
  );

  const value: AdminStoreValue = {
    hospitals,
    recruiters,
    jobs,
    candidates,
    applications,
    recruiterApplications,
    verifyHospital: (id) =>
      setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, verified: true } : h))),
    unverifyHospital: (id) =>
      setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, verified: false } : h))),
    toggleHospitalBlock: (id) =>
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, status: h.status === "Active" ? "Suspended" : "Active" } : h,
        ),
      ),
    toggleRecruiterBlock: (id) =>
      setRecruiters((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: r.status === "Active" ? "Suspended" : "Active" } : r,
        ),
      ),
    toggleCandidateBlock: (id) =>
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: c.status === "Active" ? "Suspended" : "Active" } : c,
        ),
      ),
    verifyCandidate: (id) =>
      setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, verified: true } : c))),
    deleteJob: (id) => {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setApplications((prev) => prev.filter((a) => a.jobId !== id));
    },
    submitRecruiterApplication: (data) => {
      const app: RecruiterApplication = {
        ...data,
        id: `RAPP-${Date.now().toString(36).toUpperCase()}`,
        status: "Pending",
        submitted: new Date().toISOString().slice(0, 10),
      };
      setRecruiterApplications((prev) => [app, ...prev]);
    },
    approveRecruiterApplication: (id) => {
      setRecruiterApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Approved" } : a)),
      );
      const app = recruiterApplications.find((a) => a.id === id);
      if (app) {
        const newHospitalId = `H-${Date.now().toString(36).toUpperCase()}`;
        setHospitals((prev) => [
          {
            id: newHospitalId,
            name: app.hospitalName,
            location: `${app.city}, ${app.state}`,
            verified: true,
            status: "Active",
            joined: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
        setRecruiters((prev) => [
          {
            id: `${newHospitalId}-REC1`,
            name: "Primary Contact",
            email: app.email,
            role: "Hiring Manager",
            hospitalId: newHospitalId,
            status: "Active",
            joined: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
      }
    },
    rejectRecruiterApplication: (id) =>
      setRecruiterApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a)),
      ),
    isRecruiterVerified: (recruiterId) => {
      const r = recruiters.find((x) => x.id === recruiterId);
      return r ? verifiedHospitalIds.has(r.hospitalId) : false;
    },
  };

  return <AdminStore.Provider value={value}>{children}</AdminStore.Provider>;
}

export function useAdminStore() {
  const ctx = useContext(AdminStore);
  if (!ctx) throw new Error("useAdminStore must be used within AdminStoreProvider");
  return ctx;
}
