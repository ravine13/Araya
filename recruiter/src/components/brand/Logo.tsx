import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={"flex items-center gap-2 " + className}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l1 3h3v4a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4V6h3l1-3Z" />
          <path d="M12 14v7" />
          <path d="M9 21h6" />
        </svg>
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
        ApronHanger
      </span>
    </Link>
  );
}
