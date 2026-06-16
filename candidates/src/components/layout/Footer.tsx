import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-surface">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-semibold text-foreground">ApronHanger</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            ApronHanger acts as a professional networking and hiring facilitation platform and is
            not responsible for employment decisions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-xs sm:grid-cols-4">
          {[
            { h: "Platform", links: ["Opportunities", "Hospitals", "Specialties"] },
            { h: "Resources", links: ["CV Builder", "Career Guide", "Salary Insights"] },
            { h: "Company", links: ["About", "Press", "Contact"] },
            { h: "Legal", links: ["Privacy", "Terms", "Code of Conduct"] },
          ].map((c) => (
            <div key={c.h}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {c.h}
              </p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link
                      to="/"
                      className="text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-4 text-[11px] text-muted-foreground md:flex-row">
          <p>© 2026 ApronHanger Technologies Pvt. Ltd. All rights reserved.</p>
          <p>Made for India's healthcare workforce.</p>
        </div>
      </div>
    </footer>
  );
}
