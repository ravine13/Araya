import { Briefcase, MapPin, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryRail } from "@/components/jobs/CategoryRail";

type Props = {
  query: string;
  city: string;
  onQueryChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onSearch: () => void;
  category: string | null;
  onCategoryChange: (v: string | null) => void;
  specialty: string | null;
  onSpecialtyChange: (v: string | null) => void;
  jobCount: number;
};

export function OpportunitiesHero({
  query,
  city,
  onQueryChange,
  onCityChange,
  onSearch,
  category,
  onCategoryChange,
  specialty,
  onSpecialtyChange,
  jobCount,
}: Props) {
  return (
    <section className="hero-premium relative overflow-hidden border-b">
      <div className="hero-orb hero-orb-a" aria-hidden />
      <div className="hero-orb hero-orb-b" aria-hidden />
      <div className="hero-orb hero-orb-c" aria-hidden />
      <div className="hero-grid-motion absolute inset-0" aria-hidden />
      <div className="hero-shine absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[1400px] px-6 pb-12 pt-12 md:pb-16 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="hero-stagger">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-primary shadow-soft backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Verified hospitals · Live openings
            </div>

            <h1 className="hero-title mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-[3.25rem] md:leading-[1.08]">
              Your next clinical role,
              <span className="hero-gradient-text"> curated </span>
              for you.
            </h1>

            <p className="hero-sub mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Browse verified healthcare openings across India. Build one structured profile and apply
              with confidence — salary disclosed, credentials checked.
            </p>

            <div className="hero-search mt-8 rounded-2xl border border-white/70 bg-white/75 p-2 shadow-pop backdrop-blur-xl">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
                  <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    placeholder="Role or specialty"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="hidden h-8 w-px bg-border md:block" />
                <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    placeholder="City or state"
                    className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button
                  size="lg"
                  className="hero-cta h-11 shrink-0 bg-brand text-brand-foreground shadow-soft hover:bg-brand/90 md:w-auto"
                  type="button"
                  onClick={onSearch}
                >
                  <Search className="h-4 w-4" /> Search roles
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <CategoryRail
                active={category}
                onChange={onCategoryChange}
                activeSpecialty={specialty}
                onSpecialtyChange={onSpecialtyChange}
              />
            </div>
          </div>

          <div className="hero-cards relative hidden lg:block">
            <div className="hero-float-card hero-float-a absolute right-4 top-0 w-[240px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-pop backdrop-blur-md">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3 text-brand" /> Match score
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">92%</p>
              <p className="mt-1 text-xs text-muted-foreground">Based on your profile & skills</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="hero-progress h-full w-[92%] rounded-full bg-brand" />
              </div>
            </div>

            <div className="hero-float-card hero-float-b absolute left-0 top-24 w-[220px] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-card backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Verified listing</p>
                  <p className="text-[10px] text-muted-foreground">NMC · INC compliant</p>
                </div>
              </div>
            </div>

            <div className="hero-float-card hero-float-c absolute bottom-0 right-0 w-[260px] rounded-2xl border border-white/80 bg-gradient-to-br from-brand-soft/80 to-white/95 p-4 shadow-pop backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Open roles now
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{jobCount}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {jobCount === 0
                  ? "New positions appear as hospitals post on ApronHanger."
                  : "Updated from live hospital postings."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
