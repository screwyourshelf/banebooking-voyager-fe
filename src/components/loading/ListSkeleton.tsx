import { Skeleton } from "@/components/ui/skeleton";

export default function ListSkeleton() {
  return (
    <div className="animate__animated animate__fadeIn animate__faster space-y-4">
      {/* Seksjon-header */}
      <div className="space-y-1 px-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Accordion-lignende rader */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-3">
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
