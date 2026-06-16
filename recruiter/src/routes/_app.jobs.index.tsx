import { apiBase } from "@/lib/api";
import { authHeader, getUser } from "@/store/authStore";
import { createFileRoute } from "@tanstack/react-router";
import { JobsPage } from "@/features/jobs/JobsPage";
import { PageLoader } from "@/components/common/PageLoader";

async function loadPostedJobs() {
  const user = getUser();
  const headers = authHeader();
  const hospitalParam = user?.hospitalId ? `?hospitalId=${user.hospitalId}` : "";
  const res = await fetch(`${apiBase()}/api/jobs${hospitalParam}`, { headers });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return { jobs: await res.json() };
}

export const Route = createFileRoute("/_app/jobs/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  staleTime: 0,
  loader: loadPostedJobs,
  pendingComponent: PageLoader,
  head: () => ({
    meta: [
      { title: "Posted Jobs — ApronHanger" },
      { name: "description", content: "Manage all jobs posted by your hospital." },
    ],
  }),
  component: JobsPage,
});
