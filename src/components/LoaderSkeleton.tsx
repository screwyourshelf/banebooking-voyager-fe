import { Skeleton } from '@/components/ui/skeleton.js';

export default function LoaderSkeleton() {
    return (
        <div className="animate__animated animate__fadeIn animate__faster space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
        </div>
    );
}
