import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import DeferredFeedbackToaster from "@/components/feedback/DeferredFeedbackToaster";
import { RouteContentSkeleton } from "@/components/loading";
import { AppSidebar, MobileAppHeader, MobileBottomNav } from "@/components/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppShell() {
  return (
    <SidebarProvider className="brand-court-background">
      <AppSidebar />
      <SidebarInset className="min-w-0 md:bg-transparent md:shadow-none">
        <MobileAppHeader />

        <main className="min-h-0 flex-1 bg-muted/20 pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:bg-transparent md:pb-0">
          <Suspense fallback={<RouteContentSkeleton label="Laster siden" />}>
            <Outlet />
          </Suspense>
        </main>
      </SidebarInset>
      <MobileBottomNav />
      <DeferredFeedbackToaster />
    </SidebarProvider>
  );
}
