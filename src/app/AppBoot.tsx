import { useEffect } from "react";
import { useSlug } from "@/hooks/useSlug";
import { useKlubb } from "@/hooks/useKlubb";
import { AppFrameSkeleton } from "@/components/loading";

export default function AppBoot({ children }: { children: React.ReactNode }) {
  const slug = useSlug();

  const { data: klubb, isLoading: loadingKlubb } = useKlubb();

  useEffect(() => {
    localStorage.setItem("slug", slug);
  }, [slug]);

  if (loadingKlubb) return <AppFrameSkeleton />;
  if (!klubb) return <div className="p-4">Fant ikke klubb.</div>;

  return <>{children}</>;
}
