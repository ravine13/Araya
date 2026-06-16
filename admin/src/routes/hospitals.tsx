import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { StatusBadge, VerifiedBadge } from "@/components/StatusBadge";
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  ChevronRight,
  ShieldCheck,
  Ban,
  Trash2,
  ArrowLeft,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/hospitals")({
  component: HospitalsPage,
});

type Level = "hospitals" | "recruiters" | "jobs" | "applicants";

function HospitalsPage() {
  const store = useAdminStore();
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const level: Level = jobId
    ? "applicants"
    : recruiterId
      ? "jobs"
      : hospitalId
        ? "recruiters"
        : "hospitals";

  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  const recruiter = store.recruiters.find((r) => r.id === recruiterId);
  const job = store.jobs.find((j) => j.id === jobId);

  return (
    <div className="space-y-6">
      {/* Header + breadcrumb */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hospital Hierarchy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drill from hospitals to recruiters, jobs, and candidate applications.
          </p>
        </div>
      </div>

      <Breadcrumbs
        level={level}
        hospital={hospital?.name}
        recruiter={recruiter?.name}
        job={job?.title}
        onHospitals={() => { setHospitalId(null); setRecruiterId(null); setJobId(null); }}
        onRecruiters={() => { setRecruiterId(null); setJobId(null); }}
        onJobs={() => { setJobId(null); }}
      />

      {level === "hospitals" && (
        <HospitalsList onOpen={(id) => setHospitalId(id)} />
      )}
      {level === "recruiters" && hospital && (
        <RecruitersList hospitalId={hospital.id} onOpen={(id) => setRecruiterId(id)} onBack={() => setHospitalId(null)} />
      )}
      {level === "jobs" && hospital && recruiter && (
        <JobsList
          hospitalId={hospital.id}
          recruiterId={recruiter.id}
          onOpen={(id) => setJobId(id)}
          onBack={() => setRecruiterId(null)}
        />
      )}
      {level === "applicants" && job && (
        <ApplicantsList jobId={job.id} onBack={() => setJobId(null)} />
      )}
    </div>
  );
}

function Breadcrumbs({
  level,
  hospital,
  recruiter,
  job,
  onHospitals,
  onRecruiters,
  onJobs,
}: {
  level: Level;
  hospital?: string;
  recruiter?: string;
  job?: string;
  onHospitals: () => void;
  onRecruiters: () => void;
  onJobs: () => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <button onClick={onHospitals} className="font-medium hover:text-foreground inline-flex items-center gap-1">
        <Building2 className="h-3.5 w-3.5" /> Hospitals
      </button>
      {hospital && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <button
            onClick={onRecruiters}
            disabled={level === "recruiters"}
            className="font-medium hover:text-foreground disabled:text-foreground disabled:cursor-default"
          >
            {hospital}
          </button>
        </>
      )}
      {recruiter && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <button
            onClick={onJobs}
            disabled={level === "jobs"}
            className="font-medium hover:text-foreground disabled:text-foreground disabled:cursor-default"
          >
            {recruiter}
          </button>
        </>
      )}
      {job && (
        <>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{job}</span>
        </>
      )}
    </nav>
  );
}

// ============= Hospitals list =============
function HospitalsList({ onOpen }: { onOpen: (id: string) => void }) {
  const store = useAdminStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {store.hospitals.map((h) => {
        const recCount = store.recruiters.filter((r) => r.hospitalId === h.id).length;
        const jobCount = store.jobs.filter((j) => j.hospitalId === h.id).length;
        return (
          <div key={h.id} className="rounded-xl border bg-card shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-primary font-bold">
                  {h.name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.location} · Joined {h.joined}</p>
                </div>
              </div>
              <VerifiedBadge verified={h.verified} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Recruiters" value={recCount} icon={<Users className="h-3.5 w-3.5" />} />
              <Stat label="Jobs" value={jobCount} icon={<Briefcase className="h-3.5 w-3.5" />} />
              <div className="rounded-lg border p-2">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <StatusBadge status={h.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onOpen(h.id)}
                className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Eye className="h-3.5 w-3.5" /> View Recruiters
              </button>
              <button
                onClick={() =>
                  h.verified ? store.unverifyHospital(h.id) : store.verifyHospital(h.id)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-accent"
                title={h.verified ? "Revoke verification" : "Verify hospital"}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                {h.verified ? "Revoke" : "Verify"}
              </button>
              <button
                onClick={() => store.toggleHospitalBlock(h.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium ${
                  h.status === "Active"
                    ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                    : "hover:bg-accent"
                }`}
              >
                <Ban className="h-3.5 w-3.5" />
                {h.status === "Active" ? "Block" : "Unblock"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-2">
      <p className="text-xs text-muted-foreground mb-1 inline-flex items-center justify-center gap-1">{icon}{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

// ============= Recruiters list =============
function RecruitersList({
  hospitalId,
  onOpen,
  onBack,
}: {
  hospitalId: string;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  const store = useAdminStore();
  const hospital = store.hospitals.find((h) => h.id === hospitalId)!;
  const recs = store.recruiters.filter((r) => r.hospitalId === hospitalId);

  return (
    <div className="space-y-4">
      <BackBar onBack={onBack} label="Back to hospitals" />

      <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{hospital.name}</p>
          <p className="text-xs text-muted-foreground">{hospital.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <VerifiedBadge verified={hospital.verified} />
          <StatusBadge status={hospital.status} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Recruiter</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verification</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Jobs</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recs.map((r) => {
                const jobCount = store.jobs.filter((j) => j.recruiterId === r.id).length;
                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                    <td className="px-4 py-3">
                      <VerifiedBadge verified={store.isRecruiterVerified(r.id)} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">{jobCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpen(r.id)}
                          className="rounded p-1.5 hover:bg-accent"
                          title="View jobs"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => store.toggleRecruiterBlock(r.id)}
                          className={`rounded p-1.5 hover:bg-accent ${r.status === "Active" ? "text-destructive" : ""}`}
                          title={r.status === "Active" ? "Block recruiter" : "Unblock recruiter"}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No recruiters under this hospital yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============= Jobs list =============
function JobsList({
  hospitalId,
  recruiterId,
  onOpen,
  onBack,
}: {
  hospitalId: string;
  recruiterId: string;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  const store = useAdminStore();
  const recruiter = store.recruiters.find((r) => r.id === recruiterId)!;
  const list = store.jobs.filter((j) => j.recruiterId === recruiterId && j.hospitalId === hospitalId);

  return (
    <div className="space-y-4">
      <BackBar onBack={onBack} label="Back to recruiters" />

      <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{recruiter.name}</p>
          <p className="text-xs text-muted-foreground">{recruiter.email} · {recruiter.role}</p>
        </div>
        <VerifiedBadge verified={store.isRecruiterVerified(recruiter.id)} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Job Title</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applicants</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Posted</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((j) => {
                const apps = store.applications.filter((a) => a.jobId === j.id).length;
                return (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{j.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{j.location}</td>
                    <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                    <td className="px-4 py-3">{apps}</td>
                    <td className="px-4 py-3 text-muted-foreground">{j.posted}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onOpen(j.id)} className="rounded p-1.5 hover:bg-accent" title="View applicants">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete job "${j.title}"?`)) store.deleteJob(j.id);
                          }}
                          className="rounded p-1.5 hover:bg-accent text-destructive"
                          title="Delete job"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    This recruiter has not posted any jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============= Applicants list =============
function ApplicantsList({ jobId, onBack }: { jobId: string; onBack: () => void }) {
  const store = useAdminStore();
  const job = store.jobs.find((j) => j.id === jobId)!;
  const apps = store.applications.filter((a) => a.jobId === jobId);

  return (
    <div className="space-y-4">
      <BackBar onBack={onBack} label="Back to jobs" />

      <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {job.title}
          </p>
          <p className="text-xs text-muted-foreground">{job.location} · Posted {job.posted}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Candidate</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Specialty</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Application</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Verified</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Account</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Applied</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const c = store.candidates.find((x) => x.id === a.candidateId);
                if (!c) return null;
                return (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.role}</td>
                    <td className="px-4 py-3">{c.specialty}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3"><VerifiedBadge verified={c.verified} /></td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.applied}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => store.toggleCandidateBlock(c.id)}
                        className={`inline-flex items-center gap-1 rounded p-1.5 hover:bg-accent ${c.status === "Active" ? "text-destructive" : ""}`}
                        title={c.status === "Active" ? "Block candidate" : "Unblock candidate"}
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No applications received yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BackBar({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </button>
  );
}
