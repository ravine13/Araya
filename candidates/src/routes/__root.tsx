import { Outlet, createRootRoute, HeadContent, Scripts, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { hydrateProfileFromApi } from "@/lib/hydrate";
import { hydrateSavedJobIds } from "@/store/savedJobsStore";
import appCss from "../styles.css?url";
import { TopNav } from "@/components/layout/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { isAuthenticated } from "@/store/authStore";
import { GoogleProvider } from "@/googleSignIn/GoogleLogin";



function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ApronHanger — Candidate Portal" },
      {
        name: "description",
        content:
          "ApronHanger Candidate Portal — discover healthcare jobs, build your professional profile, and apply with a structured CV.",
      },
      { property: "og:title", content: "ApronHanger — Candidate Portal" },
      {
        property: "og:description",
        content: "Premium hiring platform for India's doctors, dentists, nurses & technicians.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  // Candidates may browse jobs without signing in; protected routes use requireCandidateAuth.
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
function RootComponent() {
  // console.log("GOOGLE CLIENT ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isFullBleed = pathname.startsWith("/auth");

  useEffect(() => {
    if (isAuthenticated()) {
      void hydrateProfileFromApi();
      void hydrateSavedJobIds();
    }
  }, []);

  return (
    <GoogleProvider>
    
      {isFullBleed ? (
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
      ) : (
        <div className="flex min-h-screen flex-col bg-background">
          <TopNav />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          {/* <Toaster position="top-right" /> */}
        </div>
      )}
    </GoogleProvider>
  );
}