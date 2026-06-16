import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldRow } from "@/components/apply/FormPrimitives";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { ApplicationError, submitUploadApplication } from "@/lib/applications";
import { JobCustomFieldsForm } from "@/components/apply/JobCustomFieldsForm";
import {
  validateCustomResponses,
  type CustomFieldResponses,
  type JobCustomField,
} from "@/lib/jobCustomFields";
import type { UploadedFile } from "@/lib/fileUpload";
import { uploadApplySchema } from "@/lib/validations";
import { useAuth } from "@/store/authStore";
import { Route as ApplyParentRoute } from "./apply.$jobId";

export const Route = createFileRoute("/apply/$jobId/upload")({
  component: UploadApplyPage,
});

function UploadApplyPage() {
  const { job, alreadyApplied } = ApplyParentRoute.useLoaderData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const jobCustomFields: JobCustomField[] = job.customApplicationFields ?? [];
  const [customResponses, setCustomResponses] = useState<CustomFieldResponses>({});

  if (alreadyApplied) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold">Already applied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You have already submitted an application for {job.role}.
        </p>
        <Button asChild className="mt-6">
          <Link to="/applications">View my applications</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async () => {
    const parsed = uploadApplySchema.safeParse({ name, email, phone });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.errors) {
        const key = String(issue.path[0] ?? "form");
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      toast.error(parsed.error.errors[0]?.message ?? "Please fix the form");
      return;
    }
    setFieldErrors({});
    if (files.length === 0) {
      toast.error("Please upload your CV (PDF or Word document)");
      return;
    }
    if (jobCustomFields.length > 0) {
      const customErr = validateCustomResponses(jobCustomFields, customResponses);
      if (customErr) {
        toast.error(customErr);
        return;
      }
    }
    const cv = files[0];
    setSubmitting(true);
    try {
      await submitUploadApplication(
        job.id,
        { name: cv.name, mime: cv.mime, data: cv.data },
        parsed.data,
        customResponses,
      );
      toast.success("Application submitted with your CV!");
      navigate({ to: "/applications" });
    } catch (e) {
      if (e instanceof ApplicationError && e.code === "DUPLICATE") {
        toast.error(e.message);
      } else {
        toast.error(e instanceof Error ? e.message : "Could not submit");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 animate-fade-in-up">
      <Link
        to="/apply/$jobId"
        params={{ jobId: job.id }}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3 w-3" /> Back
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Upload CV · {job.role}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit a PDF or Word document — this application uses your uploaded file, not the structured
        form.
      </p>

      <div className="mt-8 space-y-5 rounded-2xl border bg-card p-6 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <FieldRow label="Full name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!fieldErrors.name}
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive">{fieldErrors.name}</p>
            )}
          </FieldRow>
          <FieldRow label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </FieldRow>
          <FieldRow label="Phone" required className="md:col-span-2">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-invalid={!!fieldErrors.phone}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-destructive">{fieldErrors.phone}</p>
            )}
          </FieldRow>
        </div>

        <FileUploadZone
          files={files}
          onChange={setFiles}
          multiple={false}
          title={files[0]?.name ?? "Click to upload your CV"}
          hint="PDF or Word (.pdf, .doc, .docx), up to 5MB"
        />

        {jobCustomFields.length > 0 && (
          <JobCustomFieldsForm
            fields={jobCustomFields}
            values={customResponses}
            onChange={setCustomResponses}
          />
        )}
      </div>

      <div className="sticky bottom-4 mt-6 flex justify-end">
        <Button size="lg" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Submitting…" : "Submit application"}
        </Button>
      </div>
    </div>
  );
}
