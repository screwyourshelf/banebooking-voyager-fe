import { Badge } from "@/components/ui/badge";
import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-6 sm:px-6 md:py-6 lg:gap-8 lg:px-8 lg:py-10">
      <div className="-mx-4 space-y-3 border-b border-primary/10 bg-muted px-4 py-6 sm:-mx-6 sm:px-6 md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Badge
          variant="outline"
          className="border-transparent bg-accent text-accent-foreground md:border-white/25 md:bg-white/10 md:text-white"
        >
          Booking
        </Badge>
        <div className="space-y-1.5">
          <h1 className="font-heading text-page-title text-balance md:text-white">
            Book bane
          </h1>
          <p className="max-w-2xl text-body text-muted-foreground md:text-lead md:text-white/75">
            Velg aktivitet, dag og bane for å finne en ledig tid.
          </p>
        </div>
      </div>

      <BookingSchedule {...props} valgtGren={valgtGren} />
    </div>
  );
}
