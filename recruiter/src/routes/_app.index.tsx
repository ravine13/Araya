import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { loadRecruiterDashboard, loadDashboardStats, loadHospitalProfile } from "@/lib/recruiterData";
import { PageLoader } from "@/components/common/PageLoader";

async function loadDashboardPage() {
  const [dashboard, stats, hospital] = await Promise.all([
    loadRecruiterDashboard(),
    loadDashboardStats(),
    loadHospitalProfile(),
  ]);
  return { ...dashboard, stats, hospital };
}

export const Route = createFileRoute("/_app/")({
  staleTime: 0,
  loader: loadDashboardPage,
  pendingComponent: PageLoader,
  head: () => ({
    meta: [
      { title: "Dashboard — ApronHanger" },
      { name: "description", content: "Overview of your hospital's hiring activity on ApronHanger." },
    ],
  }),
  component: DashboardPage,
});
