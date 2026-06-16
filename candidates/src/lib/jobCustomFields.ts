export type JobCustomFieldType = "text" | "textarea" | "number" | "select" | "checkbox";

export type JobCustomField = {
  id: string;
  label: string;
  type: JobCustomFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
};

export type CustomFieldResponses = Record<string, string | number | boolean>;

export function validateCustomResponses(
  fields: JobCustomField[],
  responses: CustomFieldResponses,
): string | null {
  for (const f of fields) {
    const raw = responses[f.id];
    if (f.type === "checkbox") {
      if (f.required && !raw) return `"${f.label}" is required`;
      continue;
    }
    const empty = raw === undefined || raw === null || String(raw).trim() === "";
    if (f.required && empty) return `"${f.label}" is required`;
    if (f.type === "number" && !empty && Number.isNaN(Number(raw))) {
      return `"${f.label}" must be a number`;
    }
    if (f.type === "select" && !empty && f.options && !f.options.includes(String(raw))) {
      return `"${f.label}": choose a valid option`;
    }
  }
  return null;
}

export function formatResponseValue(value: string | number | boolean | undefined): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
