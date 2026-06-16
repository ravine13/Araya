import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileFormWizard } from "@/components/profile/ProfileFormWizard";
import { Route as ApplyParentRoute } from "./apply.$jobId";

export const Route = createFileRoute("/apply/$jobId/form")({
  head: () => ({ meta: [{ title: "Application form — ApronHanger" }] }),
  component: ApplyForm,
});

function ApplyForm() {
  const { job, alreadyApplied } = ApplyParentRoute.useLoaderData();
  if (alreadyApplied) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center animate-fade-in-up">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <h1 className="mt-4 text-xl font-semibold">Already applied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You have already submitted an application for {job.role}.
        </p>
        <Button asChild className="mt-6">
          <Link to="/applications">View my applications</Link>
        </Button>
      </div>
    );
  }
  return <ProfileFormWizard job={job} redirectTo="/applications" applyMode />;
}
