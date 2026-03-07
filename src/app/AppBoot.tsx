import { useEffect } from "react";
import { Building2 } from "lucide-react";
import { useSlug } from "@/hooks/useSlug";
import { useKlubb } from "@/hooks/useKlubb";
import { ErrorDisplay } from "@/components/errors";
import ErrorShell from "@/app/ErrorShell";

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
    return null;
  }

  if (error || !klubb) {
    return (
      <ErrorShell>
        <ErrorDisplay
          icon={Building2}
          title="Fant ikke klubben"
          description="Sjekk at adressen er riktig og prøv igjen."
          error={error}
        />
      </ErrorShell>
    );
  }

  return <>{children}</>;
}
