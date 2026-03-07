import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar, BreadcrumbMedSti } from "@/components/navigation";
import { useDynamicFavicons } from "@/hooks/useDynamicFavicons";
import "@/styles/animate-fadeIn.css";

export default function AppShell() {
  useDynamicFavicons();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex flex-1 w-full max-w-screen-sm mx-auto px-2 py-5">
        <div className="flex flex-col w-full bg-card rounded-md shadow-sm overflow-hidden">
          <header className="border-b border-border bg-gradient-to-b from-muted to-card shadow-sm">
            <Navbar />
          </header>

          <BreadcrumbMedSti />

          <main className="flex-1 min-h-0 py-1">
            <div className="animate__animated animate__fadeIn animate__faster">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Toaster
        position="top-center"
        offset={{ top: "35vh" }}
        mobileOffset={{ top: "35vh" }}
        duration={1500}
      />
    </div>
  );
}
