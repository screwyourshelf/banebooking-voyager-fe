import { bookingPageStyles } from "@/styles/recipes";
import BookingSchedule from "./BookingSchedule";
import type { BookingContentProps } from "./bookingViewTypes";

export default function BookingContent(props: BookingContentProps) {
  const valgtGren = props.grener.find((gren) => gren.id === props.valgtGrenId);

  return (
    <div className={bookingPageStyles.frame}>
      <header className={bookingPageStyles.hero}>
        <p className={bookingPageStyles.heroKicker}>Booking</p>
        <div className="space-y-1.5">
          <h1 className={bookingPageStyles.heroTitle}>Book bane</h1>
          <p className={bookingPageStyles.heroDescription}>Finn en ledig tid.</p>
        </div>
      </header>

      <BookingSchedule {...props} valgtGren={valgtGren} />
    </div>
  );
}
