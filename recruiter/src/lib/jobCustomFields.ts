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

export function newCustomFieldId(): string {
  return `cf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyCustomField(): JobCustomField {
  return {
    id: newCustomFieldId(),
    label: "",
    type: "text",
    required: false,
    placeholder: "",
  };
}

export function validateCustomFieldsForPost(fields: JobCustomField[]): string | null {
  if (fields.length > 30) return "Maximum 30 custom fields";
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (!f.label.trim()) return `Field ${i + 1}: enter a question label`;
    if (f.type === "select") {
      const opts = (f.options || []).map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) return `"${f.label}": add at least 2 dropdown options`;
    }
  }
  return null;
}

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
