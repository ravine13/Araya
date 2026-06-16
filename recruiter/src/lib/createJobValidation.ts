export type CreateJobFormInput = {
  hospitalName: string;
  state: string;
  city: string;
  role: string;
  otherRoleTitle: string;
  description: string;
  salaryMin: string;
  salaryMax: string;
  expMin: string;
  expMax: string;
};

export type CreateJobFieldErrors = Partial<
  Record<
    | "hospitalName"
    | "state"
    | "city"
    | "role"
    | "otherRoleTitle"
    | "description"
    | "salaryMin"
    | "salaryMax"
    | "expMin"
    | "expMax"
    | "designation",
    string
  >
>;

import { plainTextFromHtml } from "@/lib/sanitizeHtml";

export function validateCreateJob(
  input: CreateJobFormInput,
  options: { roleIsOther: boolean; designation: string },
): { ok: true } | { ok: false; errors: CreateJobFieldErrors; message: string } {
  const errors: CreateJobFieldErrors = {};

  if (!input.hospitalName.trim()) {
    errors.hospitalName = "Hospital name is required";
  }
  if (!input.state.trim()) {
    errors.state = "Select a state";
  }
  if (!input.city.trim()) {
    errors.city = "City is required";
  }
  if (options.roleIsOther && !input.otherRoleTitle.trim()) {
    errors.otherRoleTitle = "Enter the position title (e.g. Room Service)";
  }
  if (!options.designation.trim()) {
    errors.designation = "Designation title is required";
  }

  const descText = plainTextFromHtml(input.description);
  if (!descText || descText.length < 40) {
    errors.description = "Job description should be at least 40 characters";
  }

  const salaryMin = parseInt(input.salaryMin, 10);
  const salaryMax = parseInt(input.salaryMax, 10);
  if (Number.isNaN(salaryMin) || salaryMin <= 0) {
    errors.salaryMin = "Enter a valid minimum salary (LPA)";
  }
  if (Number.isNaN(salaryMax) || salaryMax <= 0) {
    errors.salaryMax = "Enter a valid maximum salary (LPA)";
  }
  if (!errors.salaryMin && !errors.salaryMax && salaryMin > salaryMax) {
    errors.salaryMin = "Minimum cannot be greater than maximum";
    errors.salaryMax = "Maximum cannot be less than minimum";
  }

  const expMin = input.expMin === "" ? 0 : parseInt(input.expMin, 10);
  const expMax = input.expMax === "" ? 0 : parseInt(input.expMax, 10);
  if (input.expMin !== "" && (Number.isNaN(expMin) || expMin < 0)) {
    errors.expMin = "Enter a valid minimum experience";
  }
  if (input.expMax !== "" && (Number.isNaN(expMax) || expMax < 0)) {
    errors.expMax = "Enter a valid maximum experience";
  }
  if (
    input.expMin !== "" &&
    input.expMax !== "" &&
    !errors.expMin &&
    !errors.expMax &&
    expMin > expMax
  ) {
    errors.expMin = "Min experience cannot exceed max";
    errors.expMax = "Max experience cannot be less than min";
  }

  const firstError = Object.values(errors)[0];
  if (firstError) {
    return { ok: false, errors, message: firstError };
  }
  return { ok: true };
}
