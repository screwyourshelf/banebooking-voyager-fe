import { Skeleton } from "@/components/ui/skeleton";

export default function SlotListSkeleton() {
  return (
    <div className="animate__animated animate__fadeIn animate__faster space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex-1" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}
