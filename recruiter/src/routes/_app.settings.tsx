import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { loadHospitalProfile } from "@/lib/recruiterData";
import { PageLoader } from "@/components/common/PageLoader";

export const Route = createFileRoute("/_app/settings")({
  staleTime: 0,
  loader: async () => {
    const hospital = await loadHospitalProfile();
    return { hospital };
  },
  pendingComponent: PageLoader,
  head: () => ({
    meta: [
      { title: "Hospital Profile & Settings — ApronHanger" },
      { name: "description", content: "Manage your hospital's profile and verification status." },
    ],
  }),
  component: SettingsPage,
});
