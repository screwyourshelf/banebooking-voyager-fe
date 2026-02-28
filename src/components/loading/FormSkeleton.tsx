import { Skeleton } from "@/components/ui/skeleton";

export default function FormSkeleton() {
  return (
    <div className="animate__animated animate__fadeIn animate__faster space-y-4">
      {/* Seksjon-header */}
      <div className="space-y-1 px-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Form-rader */}
      <div className="space-y-3 px-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-1/5" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* Lagre-knapp */}
      <div className="px-2">
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
