import { Link, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { closeJob } from "@/lib/recruiterData";
import {
  Banknote,
  Briefcase,
  Edit3,
  EyeOff,
  MapPin,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type JobStatus } from "@/lib/mock";
import { jobMatchesLocalSearch } from "@/lib/recruiterSearch";
import { Route } from "@/routes/_app.jobs.index";
import { toast } from "sonner";

function fmtSalary(min: number, max: number) {
  return `₹${min}L – ₹${max}L`;
}

export function JobsPage() {
  const { jobs: JOBS } = Route.useLoaderData();
  const { q: searchQ } = Route.useSearch();
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus | "All">("All");
  const [closingId, setClosingId] = useState<string | null>(null);
  const [type, setType] = useState<string>("All");
  const [city, setCity] = useState<string>("All");

  const cities = useMemo(
    () => Array.from(new Set<string>(JOBS.map((j: any) => j.location as string))),
    [JOBS],
  );

  const filtered = JOBS.filter(
    (j: any) =>
      jobMatchesLocalSearch(j, searchQ) &&
      (status === "All" || j.status === status) &&
      (type === "All" || j.type === type) &&
      (city === "All" || j.location === city),
  );

  const handleCloseJob = async (jobId: string) => {
    setClosingId(jobId);
    try {
      await closeJob(jobId);
      toast.success("Job closed. Pipeline applicants have been notified.");
      await router.invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not close job");
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold tracking-tight">Posted jobs</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Manage all opportunities published by your hospital.
          </p>
        </div>
        <Button asChild className="h-10">
          <Link to="/jobs/new">
            <Plus className="mr-1.5 h-4 w-4" /> Create job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card shadow-soft">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as JobStatus | "All")}
            options={["All", "Active", "Closed", "Draft"]}
          />
          <FilterSelect
            label="Job type"
            value={type}
            onChange={setType}
            options={["All", "Full-time", "Part-time", "Locum"]}
          />
          <FilterSelect
            label="Location"
            value={city}
            onChange={setCity}
            options={["All", ...cities]}
          />
          <div className="ml-auto text-[12px] text-muted-foreground">
            Showing {filtered.length} of {JOBS.length}
            {searchQ.trim() ? ` · search: “${searchQ.trim()}”` : ""}
          </div>
        </CardContent>
      </Card>

      {/* Job cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((j: any) => (
          <Card
            key={j.id}
            className="group border-border bg-card shadow-soft transition-shadow hover:shadow-pop"
          >
            <CardContent className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        j.status === "Active"
                          ? "border-success/30 bg-success/10 text-success"
                          : j.status === "Closed"
                            ? "border-border bg-muted text-muted-foreground"
                            : "border-warning/30 bg-warning/15 text-warning-foreground"
                      }
                    >
                      {j.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{j.id}</span>
                  </div>
                  <h3 className="mt-2 font-display text-[17px] font-semibold leading-tight">
                    {j.role}
                  </h3>
                  <div className="mt-0.5 text-[13px] text-muted-foreground">
                    {j.specialty}
                    {j.subSpecialty ? ` · ${j.subSpecialty}` : ""}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/applicants" search={{ jobId: j.id }}>
                        <Users className="mr-2 h-4 w-4" /> View applicants
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast("Edit form opened (demo)")}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit job
                    </DropdownMenuItem>
                    {j.status !== "Closed" && (
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={closingId === j.id}
                        onClick={() => handleCloseJob(j.id)}
                      >
                        <EyeOff className="mr-2 h-4 w-4" /> Close job
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px] text-muted-foreground">
                <Meta icon={<MapPin className="h-3.5 w-3.5" />}>{j.location}</Meta>
                <Meta icon={<Briefcase className="h-3.5 w-3.5" />}>{j.type} · {j.shift}</Meta>
                <Meta icon={<Banknote className="h-3.5 w-3.5" />}>
                  {fmtSalary(j.salaryMin, j.salaryMax)}
                </Meta>
                <Meta icon={<Users className="h-3.5 w-3.5" />}>
                  {j.applicants} applicants
                </Meta>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {j.tags.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="text-[11px] text-muted-foreground">
                  Posted {j.postedOn} · {j.experience}
                </div>
                <Button asChild size="sm" variant="outline" className="h-8 text-[12px]">
                  <Link to="/applicants" search={{ jobId: j.id }}>
                    View applicants
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-w-[140px] text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="truncate text-foreground/80">{children}</span>
    </div>
  );
}
