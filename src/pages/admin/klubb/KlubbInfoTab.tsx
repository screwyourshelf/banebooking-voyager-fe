import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import { FormField } from "@/components/FormField.js";
import { TextareaField } from "@/components/TextareaField.js";
import { useKlubb } from "@/hooks/useKlubb.js";

type Props = { slug: string };

export default function KlubbInfoTab({ slug }: Props) {
  const { data: klubb, isLoading, oppdaterKlubb } = useKlubb(slug);

  const [form, setForm] = useState({
    navn: "",
    kontaktEpost: "",
    banereglement: "",
    latitude: "",
    longitude: "",
    feedUrl: "",
    feedSynligAntallDager: "7",
  });

  useEffect(() => {
    if (klubb) {
      setForm({
        navn: klubb.navn ?? "",
        kontaktEpost: klubb.kontaktEpost ?? "",
        banereglement: klubb.banereglement ?? "",
        latitude: klubb.latitude?.toString() ?? "",
        longitude: klubb.longitude?.toString() ?? "",
        feedUrl: klubb.feedUrl ?? "",
        feedSynligAntallDager: klubb.feedSynligAntallDager?.toString() ?? "50",
      });
    }
  }, [klubb]);

  if (isLoading || !klubb) return <LoaderSkeleton />;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        oppdaterKlubb.mutate({
          ...klubb, // behold bookingRegel og annet
          navn: form.navn,
          kontaktEpost: form.kontaktEpost,
          banereglement: form.banereglement,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          feedUrl: form.feedUrl,
          feedSynligAntallDager: parseInt(form.feedSynligAntallDager, 10),
        });
      }}
    >
      <FormField
        id="navn"
        label="Klubbnavn"
        value={form.navn}
        onChange={(e) => setForm((f) => ({ ...f, navn: e.target.value }))}
        helpText="Navnet på klubben slik det vises utad i Banebooking."
      />

      <FormField
        id="kontaktEpost"
        label="Kontakt-e-post"
        type="email"
        value={form.kontaktEpost}
        onChange={(e) => setForm((f) => ({ ...f, kontaktEpost: e.target.value }))}
        helpText="E-postadresse som vises på klubbens infoside. Brukes til henvendelser fra medlemmer og gjester."
      />

      <TextareaField
        id="banereglement"
        label="Banereglement"
        value={form.banereglement}
        onChange={(e) => setForm((f) => ({ ...f, banereglement: e.target.value }))}
        helpText="Tekst som beskriver klubbens regler for bruk av banene. Vises til brukere når de booker."
      />

      <FormField
        id="latitude"
        label="Latitude (breddegrad)"
        value={form.latitude}
        onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
        helpText="Breddegrad for klubbens beliggenhet. Brukes til kartvisning."
      />

      <FormField
        id="longitude"
        label="Longitude (lengdegrad)"
        value={form.longitude}
        onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
        helpText="Lengdegrad for klubbens beliggenhet. Brukes til kartvisning."
      />

      <FormField
        id="feedUrl"
        label="RSS-feed (valgfritt)"
        value={form.feedUrl}
        onChange={(e) => setForm((f) => ({ ...f, feedUrl: e.target.value }))}
        helpText="URL til klubbens RSS-feed (f.eks. nyheter). Hvis satt, hentes og vises de nyeste innleggene i appen."
      />

      <FormField
        id="feedSynligAntallDager"
        label="Aldergrense for feedinnslag (dager)"
        type="number"
        min={0}
        value={form.feedSynligAntallDager}
        onChange={(e) =>
          setForm((f) => ({ ...f, feedSynligAntallDager: e.target.value }))
        }
        helpText="Bestemmer hvor mange dager gamle innslag fra klubbens RSS-feed som skal vises. Sett til 0 for å inkludere alle."
      />

      <Button type="submit" size="sm" disabled={oppdaterKlubb.isPending}>
        {oppdaterKlubb.isPending ? "Lagrer..." : "Lagre endringer"}
      </Button>
    </form>
  );
}
