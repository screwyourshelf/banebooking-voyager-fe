import { useEffect } from "react";
import { useSlug } from "@/hooks/useSlug";
import { useKlubb } from "@/hooks/useKlubb";

type Props = {
  children: React.ReactNode;
};

export default function AppBoot({ children }: Props) {
  const slug = useSlug();
  const { data: klubb, error, isLoading } = useKlubb();

  useEffect(() => {
    if (slug) {
      localStorage.setItem("slug", slug);
    }
  }, [slug]);

  if (isLoading) {
    return null; // eller <AppSkeleton/>
  }

  if (error || !klubb) {
    return <div className="p-4 text-center">Fant ikke klubb.</div>;
  }

  return <>{children}</>;
}
