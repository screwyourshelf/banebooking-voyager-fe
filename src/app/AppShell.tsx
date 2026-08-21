import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import DeferredFeedbackToaster from "@/components/feedback/DeferredFeedbackToaster";
import { RouteContentSkeleton } from "@/components/loading";
import { AppSidebar, MobileAppHeader, MobileBottomNav } from "@/components/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AppShell() {
  return (
    <SidebarProvider data-ui="app-shell" data-background="court">
      <AppSidebar />
      <SidebarInset data-part="workspace">
        <MobileAppHeader />

        <main data-part="main">
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
