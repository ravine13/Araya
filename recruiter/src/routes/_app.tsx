import { Outlet, createFileRoute } from "@tanstack/react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { PageLoader } from "@/components/common/PageLoader";

import { PlanProvider } from "@/features/search/PlanContext";

/** Auth + API need the browser; SSR loaders would run without a token and show empty data. */
export const Route = createFileRoute("/_app")({
  ssr: false,
  pendingComponent: PageLoader,
  component: AppLayout,
});

function AppLayout() {
  return (
    <PlanProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />

          <SidebarInset className="flex min-h-screen flex-1 flex-col">
            <TopBar />

            <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
              <Outlet />
            </main>

            <Footer />
          </SidebarInset>
        </div>

        <Toaster position="top-right" />
      </SidebarProvider>
    </PlanProvider>
  );
}