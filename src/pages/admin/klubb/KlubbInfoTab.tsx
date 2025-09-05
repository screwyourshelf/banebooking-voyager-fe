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
        });
      }}
    >
      <FormField
        id="navn"
        label="Navn"
        value={form.navn}
        onChange={(e) => setForm((f) => ({ ...f, navn: e.target.value }))}
      />
      <FormField
        id="kontaktEpost"
        label="Kontakt-e-post"
        type="email"
        value={form.kontaktEpost}
        onChange={(e) => setForm((f) => ({ ...f, kontaktEpost: e.target.value }))}
      />
      <TextareaField
        id="banereglement"
        label="Banereglement"
        value={form.banereglement}
        onChange={(e) => setForm((f) => ({ ...f, banereglement: e.target.value }))}
      />
      <FormField
        id="latitude"
        label="Latitude"
        value={form.latitude}
        onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
      />
      <FormField
        id="longitude"
        label="Longitude"
        value={form.longitude}
        onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
      />
      <FormField
        id="feedUrl"
        label="RSS-feed (valgfritt)"
        value={form.feedUrl}
        onChange={(e) => setForm((f) => ({ ...f, feedUrl: e.target.value }))}
      />

      <Button type="submit" size="sm" disabled={oppdaterKlubb.isPending}>
        {oppdaterKlubb.isPending ? "Lagrer..." : "Lagre endringer"}
      </Button>
    </form>
  );
}
