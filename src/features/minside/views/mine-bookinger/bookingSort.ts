import type { BookingSlot } from "@/types";

export function sortBookingerNyesteFoerst(bookinger: BookingSlot[]): BookingSlot[] {
    return [...bookinger].sort((a, b) => {
        const datoDiff = new Date(b.dato).getTime() - new Date(a.dato).getTime();
        if (datoDiff !== 0) return datoDiff;
        return b.startTid.localeCompare(a.startTid);
    });
}

export function buildBookingKey(b: BookingSlot): string {
    return `${b.baneId}-${b.dato}-${b.startTid}-${b.sluttTid}`;
}
