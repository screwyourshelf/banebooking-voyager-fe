import { Suspense } from "react";
import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import DeferredFeedbackToaster from "@/components/feedback/DeferredFeedbackToaster";
import { RouteContentSkeleton } from "@/components/loading";
import { AppSidebar } from "@/components/navigation";
import ModeToggle from "@/components/navigation/ModeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { routePrefetchProps } from "@/utils/prefetchRoute";

export default function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium">Banebooking</span>
          <div className="ml-auto flex items-center gap-1">
            <ModeToggle />
            <Button asChild variant="ghost" size="icon-sm">
              <Link to="nyheter" aria-label="Nyheter" {...routePrefetchProps("nyheter")}>
                <Newspaper />
              </Link>
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 bg-muted/20">
          <Suspense fallback={<RouteContentSkeleton label="Laster siden" />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
      <DeferredFeedbackToaster />
    </SidebarProvider>
  );
}
