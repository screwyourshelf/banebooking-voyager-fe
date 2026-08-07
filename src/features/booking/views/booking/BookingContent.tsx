import { Badge } from "@/components/ui/badge";
import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-10">
      <div className="space-y-3">
        <Badge variant="outline">Booking</Badge>
        <div className="space-y-1.5">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Book bane
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Velg aktivitet, dag og bane for å finne en ledig tid.
          </p>
        </div>
      </div>

      <BookingSchedule {...props} valgtGren={valgtGren} />
    </div>
  );
}
