import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STATUS_LABELS } from "./adminStatusUtils";
import type { TurneringStatus } from "@/types";

type Props = {
  neste: TurneringStatus;
  onNesteStatus: () => void;
  forrige?: TurneringStatus;
  onForrigeStatus?: () => void;
  pending: boolean;
};

export function NesteStatusKnapp({
  neste,
  onNesteStatus,
  forrige,
  onForrigeStatus,
  pending,
}: Props) {
  const [nesteOpen, setNesteOpen] = useState(false);
  const [forrigeOpen, setForrigeOpen] = useState(false);

  return (
    <div>
      {forrige && onForrigeStatus && (
        <Popover open={forrigeOpen} onOpenChange={setForrigeOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" disabled={pending}>
              ← {STATUS_LABELS[forrige]}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <p>
              Tilbake til <span>«{STATUS_LABELS[forrige]}»</span>?
            </p>
            <div>
              <Button size="sm" variant="ghost" onClick={() => setForrigeOpen(false)}>
                Avbryt
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setForrigeOpen(false);
                  onForrigeStatus();
                }}
              >
                Bekreft
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Popover open={nesteOpen} onOpenChange={setNesteOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" disabled={pending}>
            {pending ? "Oppdaterer..." : `Sett til «${STATUS_LABELS[neste]}»`}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end">
          <p>
            Sett til <span>«{STATUS_LABELS[neste]}»</span>?
          </p>
          <div>
            <Button size="sm" variant="ghost" onClick={() => setNesteOpen(false)}>
              Avbryt
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setNesteOpen(false);
                onNesteStatus();
              }}
            >
              Bekreft
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
