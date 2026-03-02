import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Navbar, BreadcrumbMedSti } from "@/components/navigation";
import "animate.css";

export default function AppShell() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full max-w-screen-sm mx-auto px-4 py-4 flex-1 flex">
        <div className="bg-card rounded-md shadow-sm overflow-hidden w-full flex flex-col">
          <header className="bg-gradient-to-b from-muted to-card border-b border-border shadow-sm">
            <Navbar />
          </header>

          <BreadcrumbMedSti />

          {/* Viktig: flex-1 så main fyller resten av høyden */}
          <main className="py-1 px-1 flex-1 min-h-0">
            <div className="animate__animated animate__fadeIn animate__faster">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Toaster
        position="top-center"
        mobileOffset={{ top: "35vh" }}
        offset={{ top: "35vh" }}
        duration={1500}
      />
    </div>
  );
}
