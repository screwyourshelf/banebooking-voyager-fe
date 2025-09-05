import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.js";
import LoaderSkeleton from "@/components/LoaderSkeleton.js";
import { RangeField } from "@/components/RangeField.js";
import { SelectField } from "@/components/SelectField.js";
import { useKlubb } from "@/hooks/useKlubb.js";

type Props = { slug: string };

export default function KlubbBookingTab({ slug }: Props) {
  const { data: klubb, isLoading, oppdaterKlubb } = useKlubb(slug);

  const [booking, setBooking] = useState({
    maksPerDag: 1,
    maksTotalt: 2,
    dagerFremITid: 7,
    slotLengdeMinutter: 60,
    aapningstid: "07:00",
    stengetid: "22:00",
  });

  useEffect(() => {
    if (klubb?.bookingRegel) {
      setBooking({ ...booking, ...klubb.bookingRegel });
    }
  }, [klubb]);

  if (isLoading || !klubb) return <LoaderSkeleton />;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();

        oppdaterKlubb.mutate({
          ...klubb, // behold navn, kontaktinfo, osv.
          bookingRegel: booking,
        });
      }}
    >
      <RangeField
        id="aapningstid"
        label="Åpningstid"
        value={parseInt(booking.aapningstid.split(":")[0])}
        onChange={(val) =>
          setBooking((b) => ({
            ...b,
            aapningstid: `${val.toString().padStart(2, "0")}:00`,
          }))
        }
        min={6}
        max={23}
      />
      <RangeField
        id="stengetid"
        label="Stengetid"
        value={parseInt(booking.stengetid.split(":")[0])}
        onChange={(val) =>
          setBooking((b) => ({
            ...b,
            stengetid: `${val.toString().padStart(2, "0")}:00`,
          }))
        }
        min={6}
        max={23}
      />
      <RangeField
        id="maksPerDag"
        label="Maks bookinger per dag"
        value={booking.maksPerDag}
        onChange={(val) => setBooking((b) => ({ ...b, maksPerDag: val }))}
        min={0}
        max={5}
      />
      <RangeField
        id="maksTotalt"
        label="Maks aktive bookinger totalt"
        value={booking.maksTotalt}
        onChange={(val) => setBooking((b) => ({ ...b, maksTotalt: val }))}
        min={0}
        max={10}
      />
      <RangeField
        id="dagerFremITid"
        label="Dager frem i tid"
        value={booking.dagerFremITid}
        onChange={(val) => setBooking((b) => ({ ...b, dagerFremITid: val }))}
        min={1}
        max={14}
      />
      <SelectField
        id="slotLengdeMinutter"
        label="Slot-lengde (minutter)"
        value={booking.slotLengdeMinutter.toString()}
        onChange={(val) =>
          setBooking((b) => ({ ...b, slotLengdeMinutter: parseInt(val) }))
        }
        options={[
          { label: "30 minutter", value: "30" },
          { label: "45 minutter", value: "45" },
          { label: "60 minutter", value: "60" },
          { label: "90 minutter", value: "90" },
        ]}
        disabled
      />

      <Button type="submit" size="sm" disabled={oppdaterKlubb.isPending}>
        {oppdaterKlubb.isPending ? "Lagrer..." : "Lagre endringer"}
      </Button>
    </form>
  );
}
