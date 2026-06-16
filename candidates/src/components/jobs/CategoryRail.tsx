import { useState } from "react";
import { CATEGORIES } from "@/data/categories";
import { cn } from "@/lib/utils";

export function CategoryRail({
  active,
  onChange,
  activeSpecialty,
  onSpecialtyChange,
}: {
  active: string | null;
  onChange: (id: string | null) => void;
  activeSpecialty: string | null;
  onSpecialtyChange: (id: string | null) => void;
}) {
  const current = CATEGORIES.find((c) => c.id === active);

  return (
    <div className="space-y-3">
      <div className="scrollbar-thin -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button
          onClick={() => {
            onChange(null);
            onSpecialtyChange(null);
          }}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
            !active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-foreground hover:bg-muted",
          )}
        >
          All Roles
        </button>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                onChange(c.id);
                onSpecialtyChange(null);
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {c.label}
            </button>
          );
        })}
      </div>

      {current?.specialties && (
        <div className="scrollbar-thin flex gap-1.5 overflow-x-auto pb-1">
          <SpecialtyChip
            label="All specialties"
            active={!activeSpecialty}
            onClick={() => onSpecialtyChange(null)}
          />
          {current.specialties.map((s) => (
            <SpecialtyChip
              key={s.id}
              label={s.label}
              active={activeSpecialty === s.id}
              onClick={() => onSpecialtyChange(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SpecialtyChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
        active
          ? "bg-brand-soft text-primary"
          : "bg-transparent text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}

// re-export hook helper for convenience if needed
export function useCategoryState() {
  const [cat, setCat] = useState<string | null>(null);
  const [spec, setSpec] = useState<string | null>(null);
  return { cat, setCat, spec, setSpec };
}
