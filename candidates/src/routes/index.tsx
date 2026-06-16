import { apiBase } from "@/lib/api";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { jobMatchesSearch } from "@/lib/jobSearch";
import { hydrateSavedJobIds } from "@/store/savedJobsStore";
import { FileText, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/jobs/JobCard";
import { OpportunitiesHero } from "@/components/home/OpportunitiesHero";
import { FilterSidebar, DEFAULT_FILTERS, type Filters } from "@/components/jobs/FilterSidebar";
import { RecommendedRail } from "@/components/jobs/RecommendedRail";
import { authHeader } from "@/store/authStore";
import { useProfile } from "@/store/profileStore";
import { PageLoader } from "@/components/common/PageLoader";
import { clientLoaderWithHydrate } from "@/lib/clientLoader";

async function loadOpportunities() {
  const res = await fetch(`${apiBase()}/api/jobs`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return { jobs: await res.json() };
}

const opportunitiesClientLoader = clientLoaderWithHydrate(loadOpportunities);

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    city: typeof search.city === "string" ? search.city : "",
  }),
  staleTime: 0,
  loader: loadOpportunities,
  clientLoader: opportunitiesClientLoader,
  pendingComponent: PageLoader,
  head: () => ({
    meta: [
      { title: "Opportunities — ApronHanger" },
      {
        name: "description",
        content:
          "Discover verified healthcare jobs across India — browse live hospital postings and apply with your ApronHanger profile.",
      },
    ],
  }),
  component: Opportunities,
});

function Opportunities() {
  const navigate = useNavigate();
  const { jobs: JOBS } = Route.useLoaderData();
  const { q: urlQ, city: urlCity } = Route.useSearch();
  const profile = useProfile();
  const [query, setQuery] = useState(urlQ);
  const [city, setCity] = useState(urlCity);
  const [category, setCategory] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBuildBanner = !profile && !bannerDismissed;

  useEffect(() => {
    void hydrateSavedJobIds();
  }, []);

  useEffect(() => {
    setQuery(urlQ);
    setCity(urlCity);
  }, [urlQ, urlCity]);

  const runSearch = () => {
    navigate({
      to: "/",
      search: { q: query.trim(), city: city.trim() },
    });
    setTimeout(() => {
      document.getElementById("job-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const filtered = useMemo(() => {
    let list = JOBS.slice();
    list = list.filter((j: any) => jobMatchesSearch(j, query, city));
    if (category) list = list.filter((j: any) => j.category === category);
    if (specialty) {
      list = list.filter((j: any) => j.specialty.toLowerCase().replace(/\s+/g, "-") === specialty);
    }
    if (filters.cities.length) list = list.filter((j: any) => filters.cities.includes(j.city));
    list = list.filter((j: any) => j.experienceMin >= filters.minExp || j.experienceMax >= filters.minExp);
    list = list.filter((j: any) => j.salaryMax >= filters.minSalary);
    if (filters.types.length) list = list.filter((j: any) => filters.types.includes(j.type));

    if (filters.sort === "salary") list.sort((a: any, b: any) => b.salaryMax - a.salaryMax);
    else if (filters.sort === "relevance")
      list.sort((a: any, b: any) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0));
    else list.sort((a: any, b: any) => a.postedDays - b.postedDays);

    return list;
  }, [query, city, category, specialty, filters]);

  return (
    <div>
      {showBuildBanner && (
        <div className="border-b bg-gradient-to-r from-brand-soft to-surface">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-6 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                Build your ApronHanger CV in one go
              </p>
              <p className="text-xs text-muted-foreground">
                Fill the detailed form once — we'll generate your CV and unlock Quick Apply on every
                job.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/build-cv">
                Fill the form <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <OpportunitiesHero
        query={query}
        city={city}
        onQueryChange={setQuery}
        onCityChange={setCity}
        onSearch={runSearch}
        category={category}
        onCategoryChange={setCategory}
        specialty={specialty}
        onSpecialtyChange={setSpecialty}
        jobCount={JOBS.length}
      />

      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <RecommendedRail jobs={JOBS} profile={profile} />

        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          <FilterSidebar jobs={JOBS} filters={filters} onChange={setFilters} />
          <div id="job-results">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  All Opportunities
                </h2>
                <p className="text-xs text-muted-foreground">
                  Showing {filtered.length} of {JOBS.length} verified roles
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((j: any) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="rounded-2xl border bg-surface p-10 text-center">
                <p className="text-sm font-medium text-foreground">
                  {JOBS.length === 0 ? "No open positions yet" : "No matches"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {JOBS.length === 0
                    ? "Hospitals post roles from the recruiter portal. Check back soon or widen your search."
                    : "Try clearing filters or searching for a different role."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
