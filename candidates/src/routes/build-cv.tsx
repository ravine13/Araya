import { createFileRoute } from "@tanstack/react-router";
import { ProfileFormWizard } from "@/components/profile/ProfileFormWizard";
import { requireCandidateAuth } from "@/lib/requireAuth";

export const Route = createFileRoute("/build-cv")({
  beforeLoad: () => requireCandidateAuth("/build-cv"),
  head: () => ({
    meta: [
      { title: "Build your CV — ApronHanger" },
      {
        name: "description",
        content:
          "Fill out your professional profile once — ApronHanger generates your CV and uses it for every Quick Apply.",
      },
    ],
  }),
  component: () => <ProfileFormWizard redirectTo="/cv-preview" />,
});
