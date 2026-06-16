import { apiBase } from "@/lib/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/common/EmptyState";
import { authHeader } from "@/store/authStore";
import { requireCandidateAuth } from "@/lib/requireAuth";
import { setSavedIds, useSavedJobIds } from "@/store/savedJobsStore";
import type { Job } from "@/data/jobs";
import { PageLoader } from "@/components/common/PageLoader";
import { clientLoaderWithHydrate, ssrEmptyLoader } from "@/lib/clientLoader";

async function loadSavedJobsData() {
  const res = await fetch(`${apiBase()}/api/saved-jobs`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load saved jobs");
  const data = await res.json();
  return { jobs: (data.jobs ?? []) as Job[], jobIds: (data.jobIds ?? []) as string[] };
}

const savedJobsClientLoader = clientLoaderWithHydrate(loadSavedJobsData);

export const Route = createFileRoute("/saved-jobs")({
  beforeLoad: () => requireCandidateAuth("/saved-jobs"),
  loader: ssrEmptyLoader({ jobs: [] as Job[], jobIds: [] as string[] }, loadSavedJobsData),
  clientLoader: savedJobsClientLoader,
  pendingComponent: PageLoader,
  head: () => ({
    meta: [{ title: "Saved Jobs — ApronHanger" }],
  }),
  component: SavedJobsPage,
});

function SavedJobsPage() {
  const loaderData = Route.useLoaderData();
  const savedIds = useSavedJobIds();
  const [allJobs, setAllJobs] = useState<Job[]>(loaderData.jobs);

  useEffect(() => {
    setAllJobs(loaderData.jobs);
    setSavedIds(loaderData.jobIds ?? loaderData.jobs.map((j) => j.id));
  }, [loaderData]);

  const jobs = allJobs.filter((j) => savedIds.includes(j.id));

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Saved jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {jobs.length} role{jobs.length !== 1 ? "s" : ""} bookmarked for later
          </p>
        </div>
        <Link
          to="/"
          className="text-sm font-medium text-primary hover:underline"
        >
          Browse opportunities →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={Bookmark}
            title="No saved jobs yet"
            description="Tap the bookmark icon on any job to save it here."
            ctaLabel="Find opportunities"
            ctaTo="/"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}
    </div>
  );
}
