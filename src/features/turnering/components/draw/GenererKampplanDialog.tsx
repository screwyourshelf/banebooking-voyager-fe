import { useState } from "react";
import { SettingsChoiceGroup, SettingsRange } from "@/components/admin";
import DateTimeInput from "@/components/controls/DateTimeInput";
import { AppDialog } from "@/components/dialogs";
import { Inline, Stack, Text } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBaner } from "@/hooks/useBaner";
import type { GenererKampplanForespørsel } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forslagStartTid?: string | null;
  onGenerer: (payload: GenererKampplanForespørsel) => void;
  isPending: boolean;
};

function toDatetimeLocal(isoOrDato: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(isoOrDato)) {
    return isoOrDato.substring(0, 16);
  }
  return `${isoOrDato}T09:00`;
}

function defaultStartTid(forslagStartTid?: string | null): string {
  if (forslagStartTid) {
    return toDatetimeLocal(forslagStartTid);
  }
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
}

const VARIGHET_VERDIER = [30, 60, 90, 120] as const;

export function GenererKampplanDialog({
  open,
  onOpenChange,
  forslagStartTid,
  onGenerer,
  isPending,
}: Props) {
  const { baner: tilgjengeligeBaner } = useBaner(false);

  const [startTid, setStartTid] = useState<string>(() => defaultStartTid(forslagStartTid));
  const [varighetIndex, setVarighetIndex] = useState(1);
  const [valgteBaner, setValgteBaner] = useState<string[]>([]);

  function toggleBane(navn: string) {
    setValgteBaner((prev) =>
      prev.includes(navn) ? prev.filter((b) => b !== navn) : [...prev, navn]
    );
  }

  function handleGenerer() {
    if (!startTid || valgteBaner.length === 0) return;
    onGenerer({
      startTid: new Date(startTid).toISOString(),
      kampVarighetMinutter: VARIGHET_VERDIER[varighetIndex],
      baner: valgteBaner,
    });
  }

  function handleClose(v: boolean) {
    if (!v) {
      setStartTid(defaultStartTid(forslagStartTid));
      setVarighetIndex(1);
      setValgteBaner([]);
    }
    onOpenChange(v);
  }

  const kanGenerer = !!startTid && valgteBaner.length > 0;

  return (
    <AppDialog
      open={open}
      onOpenChange={handleClose}
      title="Generer kampplan"
      description="Kampplanen er et forslag og kan genereres på nytt ved behov."
      actions={
        <>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button onClick={handleGenerer} disabled={isPending || !kanGenerer}>
            {isPending ? "Genererer..." : "Generer kampplan"}
          </Button>
        </>
      }
    >
      <Stack gap="lg">
        <Stack gap="xs">
          <Label htmlFor="kampplan-starttid">Starttid</Label>
          <DateTimeInput
            id="kampplan-starttid"
            value={startTid}
            onChange={(e) => setStartTid(e.target.value)}
          />
        </Stack>

        <Stack gap="xs">
          <Inline justify="between">
            <Label>Kampvarighet</Label>
            <Text as="span" variant="strong">
              {VARIGHET_VERDIER[varighetIndex]} min
            </Text>
          </Inline>
          <SettingsRange
            min={0}
            max={VARIGHET_VERDIER.length - 1}
            step={1}
            value={varighetIndex}
            onChange={(e) => setVarighetIndex(Number(e.target.value))}
            labels={VARIGHET_VERDIER.map((v) => (
              <span key={v}>{v}</span>
            ))}
          />
        </Stack>

        <Stack gap="xs">
          <Label>Baner</Label>
          {tilgjengeligeBaner.length === 0 ? (
            <Text variant="empty">Ingen aktive baner funnet.</Text>
          ) : (
            <SettingsChoiceGroup
              label="Baner"
              options={tilgjengeligeBaner.map((bane) => ({ value: bane.navn, label: bane.navn }))}
              selectedValues={valgteBaner}
              onToggle={toggleBane}
            />
          )}
        </Stack>
      </Stack>
    </AppDialog>
  );
}
