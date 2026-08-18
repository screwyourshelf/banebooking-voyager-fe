import { Badge } from "@/components/ui/badge";
import { brandedPageStyles } from "@/styles/recipes";
import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-6 sm:px-6 md:py-6 lg:gap-8 lg:px-8 lg:py-10">
      <div className="-mx-4 space-y-3 bg-sidebar px-4 py-6 text-sidebar-foreground sm:-mx-6 sm:px-6 md:mx-0 md:bg-transparent md:p-0">
        <Badge
          variant="outline"
          className={`${brandedPageStyles.badge} md:border-white/25 md:bg-white/10 md:text-white`}
        >
          Booking
        </Badge>
        <div className="space-y-1.5">
          <h1 className={`${brandedPageStyles.title} md:text-white`}>Book bane</h1>
          <p className={`${brandedPageStyles.description} md:text-white/75`}>
            Velg aktivitet, dag og bane for å finne en ledig tid.
          </p>
        </div>
      </div>

      <BookingSchedule {...props} valgtGren={valgtGren} />
    </div>
  );
}
