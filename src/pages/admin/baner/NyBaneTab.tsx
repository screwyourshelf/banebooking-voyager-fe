import { useState } from "react";
import { toast } from "sonner";
import { useBaner } from "@/hooks/useBaner.js";

import { Button } from "@/components/ui/button.js";
import { FormField } from "@/components/FormField.js";
import PageSection from "@/components/PageSection.js";

type BaneFormData = {
  navn: string;
  beskrivelse: string;
};

type Props = { slug: string };

export default function NyBaneTab({ slug }: Props) {
  const { opprettBane } = useBaner(slug);
  const [nyBane, setNyBane] = useState<BaneFormData>({
    navn: "",
    beskrivelse: "",
  });

  async function leggTil() {
    if (!nyBane.navn.trim()) {
      toast.error("Navn er påkrevd");
      return;
    }

    try {
      await opprettBane.mutateAsync(nyBane);
      setNyBane({ navn: "", beskrivelse: "" });
    } catch {
      // Feil håndteres i hook (toast)
    }
  }

  return (
    <PageSection bordered className="space-y-3">
      <FormField
        id="ny-navn"
        label="Navn"
        value={nyBane.navn}
        onChange={(e) =>
          setNyBane((f) => ({ ...f, navn: e.target.value }))
        }
      />
      <FormField
        id="ny-beskrivelse"
        label="Beskrivelse"
        value={nyBane.beskrivelse}
        onChange={(e) =>
          setNyBane((f) => ({ ...f, beskrivelse: e.target.value }))
        }
      />
      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          leggTil();
        }}
        disabled={opprettBane.isPending}
      >
        {opprettBane.isPending ? "Legger til..." : "Legg til"}
      </Button>
    </PageSection>
  );
}
