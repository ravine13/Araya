// ==================== MOCK DATA ====================

export const kpiData = {
  totalRecruiters: 284,
  totalCandidates: 3_847,
  activeJobs: 512,
  totalApplications: 12_390,
  verifiedUsers: 3_210,
  pendingVerifications: 87,
};

export const recruiters = [
  { id: "R001", hospital: "Apollo Hospitals", location: "Chennai", jobsPosted: 45, status: "Active" as const, verified: true, joined: "2024-01-15" },
  { id: "R002", hospital: "Fortis Healthcare", location: "Mumbai", jobsPosted: 38, status: "Active" as const, verified: true, joined: "2024-02-08" },
  { id: "R003", hospital: "Max Super Speciality", location: "Delhi", jobsPosted: 29, status: "Active" as const, verified: true, joined: "2024-03-12" },
  { id: "R004", hospital: "Manipal Hospital", location: "Bangalore", jobsPosted: 22, status: "Suspended" as const, verified: false, joined: "2024-04-20" },
  { id: "R005", hospital: "AIIMS", location: "Delhi", jobsPosted: 67, status: "Active" as const, verified: true, joined: "2023-11-05" },
  { id: "R006", hospital: "Medanta", location: "Gurugram", jobsPosted: 31, status: "Active" as const, verified: true, joined: "2024-05-18" },
  { id: "R007", hospital: "Narayana Health", location: "Bangalore", jobsPosted: 18, status: "Active" as const, verified: false, joined: "2024-06-22" },
  { id: "R008", hospital: "Kokilaben Hospital", location: "Mumbai", jobsPosted: 14, status: "Suspended" as const, verified: false, joined: "2024-07-01" },
];

export const candidates = [
  { id: "C001", name: "Dr. Priya Sharma", role: "Doctor", specialty: "Cardiology", experience: "12 years", status: "Active" as const, verified: true, joined: "2024-01-20" },
  { id: "C002", name: "Anjali Patel", role: "Nurse", specialty: "ICU", experience: "6 years", status: "Active" as const, verified: true, joined: "2024-02-14" },
  { id: "C003", name: "Dr. Rajesh Kumar", role: "Doctor", specialty: "Orthopedics", experience: "15 years", status: "Active" as const, verified: true, joined: "2024-03-01" },
  { id: "C004", name: "Sunita Reddy", role: "Nurse", specialty: "Pediatrics", experience: "4 years", status: "Suspended" as const, verified: false, joined: "2024-04-10" },
  { id: "C005", name: "Dr. Amit Verma", role: "Doctor", specialty: "Neurology", experience: "9 years", status: "Active" as const, verified: true, joined: "2024-05-05" },
  { id: "C006", name: "Kavitha Nair", role: "Physiotherapist", specialty: "Sports Medicine", experience: "7 years", status: "Active" as const, verified: true, joined: "2024-06-12" },
  { id: "C007", name: "Dr. Deepak Joshi", role: "Doctor", specialty: "General Surgery", experience: "20 years", status: "Active" as const, verified: true, joined: "2023-12-01" },
  { id: "C008", name: "Meena Iyer", role: "Lab Technician", specialty: "Pathology", experience: "5 years", status: "Active" as const, verified: false, joined: "2024-07-20" },
];

export const jobs = [
  { id: "J001", title: "Senior Cardiologist", hospital: "Apollo Hospitals", location: "Chennai", applicants: 23, status: "Active" as const, posted: "2024-08-01" },
  { id: "J002", title: "ICU Nurse", hospital: "Fortis Healthcare", location: "Mumbai", applicants: 45, status: "Active" as const, posted: "2024-08-05" },
  { id: "J003", title: "Orthopedic Surgeon", hospital: "Max Super Speciality", location: "Delhi", applicants: 12, status: "Closed" as const, posted: "2024-07-15" },
  { id: "J004", title: "Pediatric Nurse", hospital: "Manipal Hospital", location: "Bangalore", applicants: 31, status: "Active" as const, posted: "2024-08-10" },
  { id: "J005", title: "General Physician", hospital: "AIIMS", location: "Delhi", applicants: 56, status: "Active" as const, posted: "2024-08-12" },
  { id: "J006", title: "Neurologist", hospital: "Medanta", location: "Gurugram", applicants: 8, status: "Draft" as const, posted: "2024-08-18" },
  { id: "J007", title: "Lab Technician", hospital: "Narayana Health", location: "Bangalore", applicants: 19, status: "Active" as const, posted: "2024-08-20" },
  { id: "J008", title: "Physiotherapist", hospital: "Kokilaben Hospital", location: "Mumbai", applicants: 14, status: "Closed" as const, posted: "2024-07-25" },
];

export const applications = [
  { id: "A001", candidate: "Dr. Priya Sharma", job: "Senior Cardiologist", hospital: "Apollo Hospitals", status: "Under Review" as const, applied: "2024-08-02" },
  { id: "A002", candidate: "Anjali Patel", job: "ICU Nurse", hospital: "Fortis Healthcare", status: "Shortlisted" as const, applied: "2024-08-06" },
  { id: "A003", candidate: "Dr. Rajesh Kumar", job: "Orthopedic Surgeon", hospital: "Max Super Speciality", status: "Accepted" as const, applied: "2024-07-16" },
  { id: "A004", candidate: "Sunita Reddy", job: "Pediatric Nurse", hospital: "Manipal Hospital", status: "Rejected" as const, applied: "2024-08-11" },
  { id: "A005", candidate: "Dr. Amit Verma", job: "General Physician", hospital: "AIIMS", status: "Under Review" as const, applied: "2024-08-13" },
  { id: "A006", candidate: "Kavitha Nair", job: "Physiotherapist", hospital: "Kokilaben Hospital", status: "Shortlisted" as const, applied: "2024-07-26" },
  { id: "A007", candidate: "Dr. Deepak Joshi", job: "Neurologist", hospital: "Medanta", status: "Under Review" as const, applied: "2024-08-19" },
  { id: "A008", candidate: "Meena Iyer", job: "Lab Technician", hospital: "Narayana Health", status: "Accepted" as const, applied: "2024-08-21" },
];

export const verifications = {
  pendingHospitals: [
    { id: "VH001", name: "City Care Hospital", location: "Pune", submitted: "2024-08-25", documents: ["Registration Certificate", "License"] },
    { id: "VH002", name: "Sunrise Medical Center", location: "Hyderabad", submitted: "2024-08-26", documents: ["Registration Certificate", "Tax ID"] },
  ],
  pendingCandidates: [
    { id: "VC001", name: "Dr. Sneha Gupta", role: "Doctor", submitted: "2024-08-24", documents: ["Medical Degree", "License", "ID Proof"] },
    { id: "VC002", name: "Ravi Shankar", role: "Nurse", submitted: "2024-08-27", documents: ["Nursing Diploma", "ID Proof"] },
    { id: "VC003", name: "Dr. Arjun Menon", role: "Doctor", submitted: "2024-08-28", documents: ["MBBS Certificate", "PG Degree"] },
  ],
};

export const systemLogs = [
  { id: "L001", action: "Recruiter created job", user: "Apollo Hospitals", timestamp: "2024-08-28 14:32:00", status: "Success" as const },
  { id: "L002", action: "Candidate applied", user: "Dr. Priya Sharma", timestamp: "2024-08-28 13:45:00", status: "Success" as const },
  { id: "L003", action: "Admin verified hospital", user: "Super Admin", timestamp: "2024-08-28 12:10:00", status: "Success" as const },
  { id: "L004", action: "Candidate registration failed", user: "System", timestamp: "2024-08-28 11:30:00", status: "Error" as const },
  { id: "L005", action: "Job posting flagged", user: "System", timestamp: "2024-08-28 10:20:00", status: "Warning" as const },
  { id: "L006", action: "Recruiter suspended", user: "Super Admin", timestamp: "2024-08-27 16:45:00", status: "Success" as const },
  { id: "L007", action: "Password reset requested", user: "Dr. Rajesh Kumar", timestamp: "2024-08-27 15:30:00", status: "Success" as const },
  { id: "L008", action: "Bulk email sent", user: "Super Admin", timestamp: "2024-08-27 14:00:00", status: "Success" as const },
];

export const activityFeed = [
  { id: 1, text: "New hospital registered: City Care Hospital, Pune", time: "2 mins ago", type: "registration" as const },
  { id: 2, text: "Dr. Priya Sharma applied to Senior Cardiologist at Apollo", time: "15 mins ago", type: "application" as const },
  { id: 3, text: "New job posted: ICU Nurse at Fortis Healthcare", time: "32 mins ago", type: "job" as const },
  { id: 4, text: "Manipal Hospital account suspended by admin", time: "1 hour ago", type: "alert" as const },
  { id: 5, text: "Verification approved: Dr. Rajesh Kumar", time: "2 hours ago", type: "verification" as const },
  { id: 6, text: "Candidate Sunita Reddy uploaded new credentials", time: "3 hours ago", type: "registration" as const },
];

export const monthlyTrend = [
  { month: "Jan", jobsPosted: 42, applications: 180 },
  { month: "Feb", jobsPosted: 55, applications: 240 },
  { month: "Mar", jobsPosted: 48, applications: 210 },
  { month: "Apr", jobsPosted: 62, applications: 310 },
  { month: "May", jobsPosted: 78, applications: 420 },
  { month: "Jun", jobsPosted: 65, applications: 350 },
  { month: "Jul", jobsPosted: 71, applications: 380 },
  { month: "Aug", jobsPosted: 85, applications: 460 },
];

export const userGrowth = [
  { month: "Jan", recruiters: 20, candidates: 320 },
  { month: "Feb", recruiters: 35, candidates: 480 },
  { month: "Mar", recruiters: 28, candidates: 410 },
  { month: "Apr", recruiters: 42, candidates: 550 },
  { month: "May", recruiters: 38, candidates: 620 },
  { month: "Jun", recruiters: 45, candidates: 580 },
  { month: "Jul", recruiters: 32, candidates: 490 },
  { month: "Aug", recruiters: 44, candidates: 540 },
];

export const notifications = [
  { id: 1, title: "New Hospital Registration", message: "City Care Hospital, Pune has registered and needs verification.", time: "2 mins ago", read: false },
  { id: 2, title: "Verification Request", message: "Dr. Sneha Gupta submitted credentials for verification.", time: "15 mins ago", read: false },
  { id: 3, title: "System Alert", message: "Database backup completed successfully.", time: "1 hour ago", read: true },
  { id: 4, title: "Flagged Content", message: "Job posting by Kokilaben Hospital flagged for review.", time: "3 hours ago", read: false },
  { id: 5, title: "New Candidate Batch", message: "12 new candidates registered in the last 24 hours.", time: "5 hours ago", read: true },
];

export const roleDistribution = [
  { name: "Doctors", value: 1520, fill: "var(--color-chart-1)" },
  { name: "Nurses", value: 1180, fill: "var(--color-chart-2)" },
  { name: "Technicians", value: 620, fill: "var(--color-chart-3)" },
  { name: "Physiotherapists", value: 340, fill: "var(--color-chart-4)" },
  { name: "Others", value: 187, fill: "var(--color-chart-5)" },
];
