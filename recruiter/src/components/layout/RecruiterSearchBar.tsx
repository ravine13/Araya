import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Briefcase, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  searchRecruiter,
  type RecruiterSearchCandidate,
  type RecruiterSearchJob,
} from "@/lib/recruiterSearch";
import { cn } from "@/lib/utils";

export function RecruiterSearchBar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<RecruiterSearchJob[]>([]);
  const [candidates, setCandidates] = useState<RecruiterSearchCandidate[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setJobs([]);
      setCandidates([]);
      setOpen(false);
      return;
    }
    const t = setTimeout(() => {
      setLoading(true);
      searchRecruiter(term)
        .then((res) => {
          setJobs(res.jobs);
          setCandidates(res.candidates);
          setOpen(res.jobs.length > 0 || res.candidates.length > 0);
        })
        .catch(() => {
          setJobs([]);
          setCandidates([]);
          setOpen(false);
        })
        .finally(() => setLoading(false));
    }, 280);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const goJobs = () => {
    const term = q.trim();
    setOpen(false);
    navigate({ to: "/jobs", search: term ? { q: term } : {} });
  };

  return (
    <div ref={wrapRef} className={cn("relative w-full max-w-md", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim().length >= 2 && setOpen(jobs.length > 0 || candidates.length > 0)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            goJobs();
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search candidates, jobs, hospitals…"
        className="h-10 rounded-lg border-border bg-muted/40 pl-9 text-sm focus-visible:bg-card"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(400px,70vh)] overflow-auto rounded-lg border border-border bg-card py-2 shadow-pop">
          {loading && (
            <p className="px-4 py-2 text-[12px] text-muted-foreground">Searching…</p>
          )}
          {!loading && jobs.length === 0 && candidates.length === 0 && (
            <p className="px-4 py-2 text-[12px] text-muted-foreground">No matches</p>
          )}
          {jobs.length > 0 && (
            <div className="px-2 pb-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Jobs
              </p>
              {jobs.map((j) => (
                <Link
                  key={j.id}
                  to="/jobs"
                  search={{ q: q.trim() }}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/60"
                >
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <span className="block text-[13px] font-medium">{j.role}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {j.specialty} · {j.status}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          {candidates.length > 0 && (
            <div className="border-t border-border px-2 pt-1">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Applicants
              </p>
              {candidates.map((c) => (
                <Link
                  key={c.applicationId}
                  to="/applicants"
                  search={{ jobId: c.jobId, q: q.trim() }}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-muted/60"
                >
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    <span className="block text-[13px] font-medium">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {c.jobRole} · {c.status}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={goJobs}
            className="mt-1 w-full border-t border-border px-4 py-2 text-left text-[12px] font-medium text-primary hover:bg-muted/40"
          >
            View all job matches →
          </button>
        </div>
      )}
    </div>
  );
}
