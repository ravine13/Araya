import type { Profile } from "@/data/profile";

export function CvMiniPreview({ profile }: { profile: Profile }) {
  return (
    <div className="flex h-full flex-col rounded-lg bg-gradient-to-br from-primary to-[oklch(0.28_0.06_265)] p-3 text-primary-foreground">
      <p className="truncate text-[11px] font-semibold">{profile.name}</p>
      <p className="mt-0.5 line-clamp-2 text-[9px] opacity-90">{profile.headline}</p>
      <div className="mt-3 flex-1 space-y-1">
        {profile.experience.slice(0, 2).map((e, i) => (
          <div key={i} className="rounded bg-primary-foreground/10 px-1.5 py-1">
            <p className="truncate text-[8px] font-medium">{e.role}</p>
            <p className="truncate text-[7px] opacity-80">{e.hospital}</p>
          </div>
        ))}
        {profile.clinicalSkills.slice(0, 3).map((s) => (
          <span
            key={s}
            className="mr-1 inline-block rounded-full bg-primary-foreground/15 px-1.5 py-0.5 text-[7px]"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
