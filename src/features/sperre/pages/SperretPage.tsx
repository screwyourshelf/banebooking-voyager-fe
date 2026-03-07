import { ShieldX, Mail } from "lucide-react";
import { useKlubb } from "@/hooks/useKlubb";
import { LoaderSkeleton } from "@/components/loading";
import Page from "@/components/Page";

export default function SperretPage() {
  const { data: klubb, isLoading } = useKlubb();

  if (isLoading) {
    return (
      <Page>
        <div className="p-4">
          <LoaderSkeleton />
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <ShieldX className="h-12 w-12 text-destructive" />

        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Kontoen din er låst</h1>
          <p className="text-sm text-muted-foreground">
            Du er låst ute fra {klubb?.navn ?? "klubben"} og kan ikke booke baner eller melde deg på
            arrangementer.
          </p>
        </div>

        <div className="rounded-md border p-4 space-y-2 text-sm w-full max-w-xs text-left">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Hva gjør jeg nå?</div>
            <p className="text-sm">
              Ta kontakt med {klubb?.navn ?? "klubben"} for å få mer informasjon og løse
              situasjonen.
            </p>
          </div>

          {klubb?.kontaktEpost && (
            <a
              href={`mailto:${klubb.kontaktEpost}`}
              className="flex items-center gap-2 text-sm font-medium hover:underline pt-1"
            >
              <Mail className="h-4 w-4 shrink-0" />
              {klubb.kontaktEpost}
            </a>
          )}
        </div>
      </div>
    </Page>
  );
}
