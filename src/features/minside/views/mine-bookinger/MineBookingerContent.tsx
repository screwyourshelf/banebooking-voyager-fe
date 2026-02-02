import PageSection from "@/components/sections/PageSection";
import { FieldGroup, FieldList } from "@/components/fields";
import SwitchRow from "@/components/fields/SwitchRow";
import BookingSlotItem from "@/components/Booking/BookingSlotItem";
import type { BookingSlot } from "@/types";

import BookingSlotHeaderLeft from "./BookingSlotHeaderLeft";
import { buildBookingKey } from "./bookingSort";

type Props = {
    visHistoriske: boolean;
    onToggleVisHistoriske: (value: boolean) => void;

    bookinger: BookingSlot[];
    isPending: boolean;

    openKey: string | null;
    onToggleOpenKey: (key: string | null) => void;

    onAvbestill: (slot: BookingSlot) => void;
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
    return (
        <PageSection
            title="Bookinger"
            description="Se kommende bookinger og velg om du vil inkludere tidligere."
        >
            {/* Gruppe 1: controls + status */}
            <FieldGroup>
                <FieldList>
                    <SwitchRow
                        title="Vis også tidligere bookinger"
                        description="Inkluder bookinger som allerede er gjennomført."
                        checked={visHistoriske}
                        onCheckedChange={onToggleVisHistoriske}
                    />

                    {bookinger.length === 0 ? (
                        // Tomtilstand som en “rad”
                        <div className="px-3 py-2 text-sm text-muted-foreground italic">
                            {visHistoriske
                                ? "Du har ingen registrerte bookinger."
                                : "Du har ingen kommende bookinger."}
                        </div>
                    ) : null}
                </FieldList>
            </FieldGroup>

            {/* Gruppe 2: booking-kort */}
            {bookinger.length > 0 ? (
                <div className={isPending ? "pointer-events-none opacity-60" : ""}>
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
