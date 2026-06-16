import { apiBase } from "@/lib/api";
import { authHeader } from "@/store/authStore";
import { requireCandidateAuth } from "@/lib/requireAuth";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/apply/$jobId")({
  beforeLoad: ({ location, params }) => {
    requireCandidateAuth(`/apply/${params.jobId}${location.searchStr}`);
  },
  loader: async ({ params }) => {
    const headers = authHeader();
    const [jobRes, appsRes] = await Promise.all([
      fetch(`${apiBase()}/api/jobs/${params.jobId}`, { headers }),
      typeof window !== "undefined"
        ? fetch(`${apiBase()}/api/applications`, { headers })
        : Promise.resolve(null),
    ]);
    if (!jobRes.ok) throw notFound();
    const job = await jobRes.json();
    let alreadyApplied = false;
    if (appsRes?.ok) {
      const apps = await appsRes.json();
      alreadyApplied = apps.some((a: { jobId: string }) => a.jobId === params.jobId);
    }
    return { job, alreadyApplied };
  },
  component: ApplyLayout,
});

function ApplyLayout() {
  return <Outlet />;
}
