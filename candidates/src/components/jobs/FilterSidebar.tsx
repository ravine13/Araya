import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo } from "react";


export type Filters = {
  cities: string[];
  minExp: number;
  minSalary: number;
  types: string[];
  sort: "latest" | "salary" | "relevance";
};

export const DEFAULT_FILTERS: Filters = {
  cities: [],
  minExp: 0,
  minSalary: 0,
  types: [],
  sort: "latest",
};

const TYPES = ["Full-time", "Locum", "Part-time", "Contract"];

export function FilterSidebar({
  jobs = [],
  filters,
  onChange,
}: {
  jobs?: any[];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const cities = useMemo(() => Array.from(new Set(jobs.map((j) => j.city))).filter(Boolean).sort(), [jobs]);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <aside className="sticky top-20 space-y-6 rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-xs font-medium text-brand hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort by
        </Label>
        <Select
          value={filters.sort}
          onValueChange={(v: Filters["sort"]) => onChange({ ...filters, sort: v })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="salary">Salary (high → low)</SelectItem>
            <SelectItem value="relevance">Relevance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Group title="Location">
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {cities.map((c) => (
            <label key={c} className="flex items-center gap-2 text-xs text-foreground">
              <Checkbox
                checked={filters.cities.includes(c)}
                onCheckedChange={() => onChange({ ...filters, cities: toggle(filters.cities, c) })}
              />
              {c}
            </label>
          ))}
        </div>
      </Group>

      <Group title={`Experience: ${filters.minExp}+ yrs`}>
        <Slider
          value={[filters.minExp]}
          min={0}
          max={15}
          step={1}
          onValueChange={(v) => onChange({ ...filters, minExp: v[0] })}
        />
      </Group>

      <Group title={`Min salary: ₹${filters.minSalary} LPA`}>
        <Slider
          value={[filters.minSalary]}
          min={0}
          max={50}
          step={2}
          onValueChange={(v) => onChange({ ...filters, minSalary: v[0] })}
        />
      </Group>

      <Group title="Job type">
        <div className="space-y-2">
          {TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 text-xs text-foreground">
              <Checkbox
                checked={filters.types.includes(t)}
                onCheckedChange={() => onChange({ ...filters, types: toggle(filters.types, t) })}
              />
              {t}
            </label>
          ))}
        </div>
      </Group>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t pt-5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </Label>
      {children}
    </div>
  );
}
