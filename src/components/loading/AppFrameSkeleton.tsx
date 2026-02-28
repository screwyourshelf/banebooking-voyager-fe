import { Skeleton } from "@/components/ui/skeleton";

export default function AppFrameSkeleton() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full max-w-screen-sm mx-auto px-4 py-4 flex-1 flex">
        <div className="bg-card rounded-md shadow-sm overflow-hidden w-full flex flex-col">
          {/* Header – matcher Navbar-layout */}
          <header className="bg-gradient-to-b from-muted to-card border-b border-border shadow-sm">
            <div className="w-full flex justify-between items-center px-2 py-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-sm" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </header>

          {/* Breadcrumb-placeholder */}
          <div className="px-3 py-2">
            <Skeleton className="h-3 w-1/3" />
          </div>

          {/* Main content – noen generiske rader */}
          <main className="py-1 px-3 flex-1 min-h-0 space-y-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>

            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-3">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
