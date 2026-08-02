import type { BaneRespons, GrenRespons, KalenderSlotRespons } from "@/types";

export type BookingSelectionProps = {
  grener: GrenRespons[];
  valgtGrenId: string;
  onGrenChange: (grenId: string) => void;
  baner: BaneRespons[];
  valgtBaneId: string;
  onBaneChange: (baneId: string) => void;
  valgtDato: Date | null;
  onDatoChange: (dato: Date | null) => void;
};

export type BookingResultProps = {
  slots: KalenderSlotRespons[];
  isLoading: boolean;
  isFetching: boolean;
  isSetupFetching: boolean;
  isAuthenticated: boolean;
  onBook: (slot: KalenderSlotRespons, arrangementId?: string) => void;
  onFjern: (slot: KalenderSlotRespons) => void;
  setupFeil: string | null;
  queryFeil: string | null;
  bookFeil: string | null;
  fjernFeil: string | null;
  onSetupRetry: () => void;
  onSlotsRetry: () => void;
};

export type BookingContentProps = BookingSelectionProps & BookingResultProps;
