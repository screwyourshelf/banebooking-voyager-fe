import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { KlasseType, MeldPaaKlasseForespørsel } from "@/types";
import { ServerFeil } from "@/components/errors";

const DOBBEL_KLASSER: KlasseType[] = ["HerreDobbel", "DameDobbel", "MixedDobbel", "JuniorDobbel"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  klasseType: KlasseType;
  erAdmin: boolean;
  onMeldPaa: (payload: MeldPaaKlasseForespørsel) => void;
  isPending: boolean;
  serverFeil?: string | null;
};

export function MeldPaaDialog({
  open,
  onOpenChange,
  klasseType,
  erAdmin,
  onMeldPaa,
  isPending,
  serverFeil,
}: Props) {
  const erDobbel = DOBBEL_KLASSER.includes(klasseType);

  const [manuellMakkerNavn, setManuellMakkerNavn] = useState("");
  const [manuellMakkerEpost, setManuellMakkerEpost] = useState("");

  const [adminSpiller1Navn, setAdminSpiller1Navn] = useState("");
  const [adminSpiller2Navn, setAdminSpiller2Navn] = useState("");

  const isSubmitDisabled =
    isPending ||
    (erAdmin && !adminSpiller1Navn.trim()) ||
    (!erAdmin && erDobbel && !manuellMakkerNavn.trim());

  function handleMeldPaa() {
    if (erAdmin && adminSpiller1Navn) {
      const payload: MeldPaaKlasseForespørsel = {
        spiller1Navn: adminSpiller1Navn,
      };
      if (erDobbel && adminSpiller2Navn) {
        payload.spiller2Navn = adminSpiller2Navn;
      }
      onMeldPaa(payload);
    } else if (erDobbel && manuellMakkerNavn) {
      const payload: MeldPaaKlasseForespørsel = {
        spiller2Navn: manuellMakkerNavn,
      };
      if (manuellMakkerEpost) payload.spiller2Epost = manuellMakkerEpost;
      onMeldPaa(payload);
    } else {
      onMeldPaa({});
    }
  }

  function handleClose(v: boolean) {
    if (!v) {
      setManuellMakkerNavn("");
      setManuellMakkerEpost("");
      setAdminSpiller1Navn("");
      setAdminSpiller2Navn("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meld på</DialogTitle>
          <DialogDescription>
            {erAdmin
              ? "Registrer deltaker manuelt"
              : erDobbel
                ? "Legg til makker"
                : "Bekreft påmelding"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {erAdmin ? (
            <>
              <div className="space-y-1.5">
                <Label>Spiller 1 navn</Label>
                <Input
                  value={adminSpiller1Navn}
                  onChange={(e) => setAdminSpiller1Navn(e.target.value)}
                  placeholder="Fullt navn"
                />
              </div>
              {erDobbel && (
                <div className="space-y-1.5">
                  <Label>Spiller 2 navn</Label>
                  <Input
                    value={adminSpiller2Navn}
                    onChange={(e) => setAdminSpiller2Navn(e.target.value)}
                    placeholder="Fullt navn (valgfritt)"
                  />
                </div>
              )}
            </>
          ) : erDobbel ? (
            <>
              <div className="space-y-1.5">
                <Label>Makkerens navn</Label>
                <Input
                  value={manuellMakkerNavn}
                  onChange={(e) => setManuellMakkerNavn(e.target.value)}
                  placeholder="Fullt navn"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Makkerens e-post (valgfritt)</Label>
                <Input
                  type="email"
                  value={manuellMakkerEpost}
                  onChange={(e) => setManuellMakkerEpost(e.target.value)}
                  placeholder="epost@eksempel.no"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Bekreft at du vil melde deg på klassen.</p>
          )}

          <ServerFeil feil={serverFeil ?? null} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
              Avbryt
            </Button>
            <Button onClick={handleMeldPaa} disabled={isSubmitDisabled}>
              {isPending ? "Melder på..." : "Meld på"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
