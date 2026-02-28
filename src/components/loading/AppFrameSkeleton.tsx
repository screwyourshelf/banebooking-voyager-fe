import LoaderSkeleton from "@/components/loading/LoaderSkeleton";

export default function AppFrameSkeleton() {
  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-screen-sm mx-auto px-4 py-4 overflow-x-hidden">
        <div className="bg-card rounded-md shadow-sm overflow-hidden">
          <header className="bg-gradient-to-b from-muted to-card border-b border-border shadow-sm">
            <div className="px-2 py-2">
              <LoaderSkeleton />
            </div>
          </header>

          <div className="p-3">
            <LoaderSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
