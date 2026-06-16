import { createFileRoute } from "@tanstack/react-router";
import { ApplicantsPage } from "@/features/applicants/ApplicantsPage";
import { loadRecruiterDashboard } from "@/lib/recruiterData";
import { PageLoader } from "@/components/common/PageLoader";

export const Route = createFileRoute("/_app/applicants")({
  validateSearch: (search: Record<string, unknown>) => ({
    jobId: typeof search.jobId === "string" ? search.jobId : undefined,
    q: typeof search.q === "string" ? search.q : "",
  }),
  staleTime: 0,
  loader: loadRecruiterDashboard,
  pendingComponent: PageLoader,
  head: () => ({
    meta: [
      { title: "Applicants — ApronHanger" },
      { name: "description", content: "Review applicants for your job postings." },
    ],
  }),
  component: ApplicantsPage,
});
