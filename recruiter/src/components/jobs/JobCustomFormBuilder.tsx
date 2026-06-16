import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmptyCustomField,
  type JobCustomField,
  type JobCustomFieldType,
} from "@/lib/jobCustomFields";

const FIELD_TYPES: { value: JobCustomFieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Yes / No" },
];

type Props = {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  fields: JobCustomField[];
  onChange: (fields: JobCustomField[]) => void;
};

export function JobCustomFormBuilder({ enabled, onEnabledChange, fields, onChange }: Props) {
  const update = (id: string, patch: Partial<JobCustomField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id));

  const addField = () => onChange([...fields, createEmptyCustomField()]);

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={(v) => {
            const on = Boolean(v);
            onEnabledChange(on);
            if (on && fields.length === 0) onChange([createEmptyCustomField()]);
          }}
          className="mt-0.5"
        />
        <span>
          <span className="text-[13px] font-medium text-foreground">
            Add custom questions for this job
          </span>
          <span className="mt-0.5 block text-[12px] text-muted-foreground">
            Candidates will answer these in addition to the standard application form. Mark each
            field as mandatory or optional.
          </span>
        </span>
      </label>

      {enabled && (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-border bg-card p-4 shadow-soft"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <GripVertical className="h-3.5 w-3.5 opacity-40" />
                  Question {index + 1}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => remove(field.id)}
                  disabled={fields.length === 1}
                  aria-label="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[12px]">Question label</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => update(field.id, { label: e.target.value })}
                    placeholder="e.g. Do you have ACLS certification?"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Field type</Label>
                  <Select
                    value={field.type}
                    onValueChange={(v) =>
                      update(field.id, {
                        type: v as JobCustomFieldType,
                        options: v === "select" ? ["Option 1", "Option 2"] : undefined,
                      })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-[13px]">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(v) => update(field.id, { required: Boolean(v) })}
                    />
                    Mandatory for candidates
                  </label>
                </div>
                {field.type !== "checkbox" && field.type !== "select" && (
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[12px]">Placeholder (optional)</Label>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) => update(field.id, { placeholder: e.target.value })}
                      className="h-10"
                    />
                  </div>
                )}
                {field.type === "select" && (
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-[12px]">Dropdown options (one per line)</Label>
                    <Textarea
                      value={(field.options || []).join("\n")}
                      onChange={(e) =>
                        update(field.id, {
                          options: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                        })
                      }
                      rows={3}
                      placeholder={"Option A\nOption B\nOption C"}
                      className="text-[13px]"
                    />
                  </div>
                )}
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-[12px]">Help text (optional)</Label>
                  <Input
                    value={field.helpText || ""}
                    onChange={(e) => update(field.id, { helpText: e.target.value })}
                    placeholder="Shown below the question when candidates apply"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" className="h-10 w-full" onClick={addField}>
            <Plus className="mr-1.5 h-4 w-4" /> Add another question
          </Button>
        </div>
      )}
    </div>
  );
}
