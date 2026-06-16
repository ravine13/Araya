import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import type { FormProfile } from "@/lib/formProfile";

function formatLPA(min: number, max: number) {
  if (min <= 0 && max <= 0) return "—";
  if (min === max) return `${min} LPA`;
  return `${min}–${max} LPA`;
}

/** Same layout as candidate portal generated CV. */
export function CvDocument({
  profile: c,
  id,
  className = "",
}: {
  profile: FormProfile;
  id?: string;
  className?: string;
}) {
  const locationLabel = c.state || c.city;

  return (
    <div
      id={id}
      className={`overflow-hidden rounded-2xl border bg-card shadow-soft ${className}`}
    >
      <div className="flex items-center justify-between bg-primary p-8 text-primary-foreground">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{c.name}</h2>
          <p className="mt-1 text-sm opacity-90">{c.headline}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs opacity-90">
            {c.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {c.email}
              </span>
            )}
            {c.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {c.phone}
              </span>
            )}
            {locationLabel && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {locationLabel}
              </span>
            )}
          </div>
        </div>
        {c.verified && (
          <div className="hidden flex-col items-end gap-2 md:flex">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-[11px] font-medium">
              <ShieldCheck className="h-3 w-3" /> Verified {c.role}
            </span>
            {c.registrationNumber && (
              <p className="text-[11px] opacity-80">Reg: {c.registrationNumber}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8 p-8 md:grid-cols-[1fr_240px]">
        <div className="space-y-7">
          {c.summary && (
            <CVSection title="Profile Summary">
              <p className="text-sm leading-relaxed text-foreground/80">{c.summary}</p>
            </CVSection>
          )}
          {c.experience.length > 0 && (
            <CVSection title="Experience">
              <div className="space-y-4">
                {c.experience.map((e, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{e.role}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {e.start} — {e.end}
                      </p>
                    </div>
                    <p className="text-xs text-foreground/70">
                      {e.hospital}
                      {e.city ? ` · ${e.city}` : ""}
                    </p>
                    {e.summary && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {e.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CVSection>
          )}
          {c.procedures.length > 0 && (
            <CVSection title="Procedures">
              <div className="grid gap-2 sm:grid-cols-2">
                {c.procedures.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                  >
                    <p className="text-xs font-medium text-foreground">{p.name}</p>
                    <span className="text-xs font-semibold text-primary">{p.count}</span>
                  </div>
                ))}
              </div>
            </CVSection>
          )}
          {c.certifications.length > 0 && (
            <CVSection title="Certifications">
              <ul className="space-y-1.5 text-xs">
                {c.certifications.map((cert, i) => (
                  <li key={i} className="flex justify-between gap-2">
                    <span className="text-foreground">
                      <span className="font-medium">{cert.name}</span> · {cert.issuer}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{cert.year}</span>
                  </li>
                ))}
              </ul>
            </CVSection>
          )}
          {c.publications.length > 0 && (
            <CVSection title="Publications">
              <ul className="space-y-1.5 text-xs leading-relaxed text-foreground/80">
                {c.publications.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </CVSection>
          )}
        </div>

        <aside className="space-y-7 border-l pl-6 md:border-l">
          {c.qualifications.length > 0 && (
            <CVSection title="Education">
              <div className="space-y-3">
                {c.qualifications.map((q, i) => (
                  <div key={i}>
                    <p className="text-xs font-semibold text-foreground">{q.degree}</p>
                    <p className="text-[11px] text-muted-foreground">{q.institution}</p>
                    <p className="text-[11px] text-muted-foreground">{q.year}</p>
                  </div>
                ))}
              </div>
            </CVSection>
          )}
          {c.clinicalSkills.length > 0 && (
            <CVSection title="Clinical Skills">
              <ChipList items={c.clinicalSkills} brand />
            </CVSection>
          )}
          {c.technicalSkills.length > 0 && (
            <CVSection title="Technical Skills">
              <ChipList items={c.technicalSkills} />
            </CVSection>
          )}
          {c.languages.length > 0 && (
            <CVSection title="Languages">
              <ul className="space-y-1 text-[11px] text-foreground/80">
                {c.languages.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </CVSection>
          )}
          <CVSection title="Availability">
            <p className="text-[11px] text-foreground/80">{c.availability}</p>
            {(c.expectedSalaryMin > 0 || c.expectedSalaryMax > 0) && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Expected: {formatLPA(c.expectedSalaryMin, c.expectedSalaryMax)}
              </p>
            )}
          </CVSection>
          {c.registrationCouncil && (
            <CVSection title="Registration">
              <p className="text-[11px] text-foreground/80">{c.registrationCouncil}</p>
            </CVSection>
          )}
        </aside>
      </div>
    </div>
  );
}

function ChipList({ items, brand }: { items: string[]; brand?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((s) => (
        <span
          key={s}
          className={
            brand
              ? "rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
              : "rounded-full border px-2 py-0.5 text-[10px] text-foreground/80"
          }
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function CVSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}
