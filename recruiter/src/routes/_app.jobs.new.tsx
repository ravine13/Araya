import { createFileRoute } from "@tanstack/react-router";
import { CreateJobPage } from "@/features/jobs/CreateJobPage";

export const Route = createFileRoute("/_app/jobs/new")({
  head: () => ({
    meta: [
      { title: "Create Job — ApronHanger" },
      { name: "description", content: "Post a new healthcare opportunity on ApronHanger." },
    ],
  }),
  component: CreateJobPage,
});
