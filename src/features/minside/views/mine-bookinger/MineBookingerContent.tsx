import PageSection from "@/components/sections/PageSection";
import { RowPanel, RowList, Row } from "@/components/rows";
import SwitchRow from "@/components/rows/SwitchRow";
import { BookingSlotItem } from "@/features/booking/components";
import type { BookingSlotRespons } from "@/types";

import BookingSlotHeaderLeft from "./BookingSlotHeaderLeft";
import { buildBookingKey } from "./bookingSort";

type Props = {
  visHistoriske: boolean;
  onToggleVisHistoriske: (value: boolean) => void;

  bookinger: BookingSlotRespons[];
  isPending: boolean;

  openKey: string | null;
  onToggleOpenKey: (key: string | null) => void;

  onAvbestill: (slot: BookingSlotRespons) => void;
};

export default function MineBookingerContent({
  visHistoriske,
  onToggleVisHistoriske,
  bookinger,
  isPending,
  openKey,
  onToggleOpenKey,
  onAvbestill,
}: Props) {
  const hasBookinger = bookinger.length > 0;

  const tomTekst = visHistoriske
    ? "Du har ingen registrerte bookinger."
    : "Du har ingen kommende bookinger.";

  return (
    <PageSection
      title="Bookinger"
      description="Se kommende bookinger og velg om du vil inkludere tidligere."
    >
      <RowPanel>
        <RowList>
          <SwitchRow
            title="Vis også tidligere bookinger"
            description="Inkluder bookinger som allerede er gjennomført."
            checked={visHistoriske}
            onCheckedChange={onToggleVisHistoriske}
          />

          {!hasBookinger ? <Row title="Ingen bookinger" description={tomTekst} /> : null}
        </RowList>
      </RowPanel>

      {hasBookinger ? (
        <div className={isPending ? "pointer-events-none opacity-60 mt-4" : "mt-4"}>
          {bookinger.map((b) => {
            const key = buildBookingKey(b);
            const isOpen = openKey === key;

            const harHandlinger = !!b.kanAvbestille;
            const erInteraktiv = harHandlinger && !b.erPassert;

            return (
              <BookingSlotItem
                key={key}
                slot={b}
                currentUser={null}
                erInteraktivOverride={erInteraktiv}
                isOpen={isOpen}
                onToggle={() => {
                  if (!erInteraktiv) return;
                  onToggleOpenKey(isOpen ? null : key);
                }}
                onCancel={() => onAvbestill(b)}
                headerOverrideTitle={b.baneNavn}
                headerLeftPrefix={<BookingSlotHeaderLeft slot={b} />}
              />
            );
          })}
        </div>
      ) : null}
    </PageSection>
  );
}
