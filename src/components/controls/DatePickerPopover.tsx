import { useState, type ComponentProps, type ReactNode } from "react";
import { startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { norskeKalenderEtiketter, norskKalenderLocale } from "./kalenderLokalisering";

type Props = {
  children: ReactNode;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  align?: ComponentProps<typeof PopoverContent>["align"];
};

export default function DatePickerPopover({
  children,
  value,
  onChange,
  minDate,
  align = "center",
}: Props) {
  const [open, setOpen] = useState(false);
  const minimumDate = minDate ? startOfDay(minDate) : undefined;

  function handleSelect(date: Date | undefined) {
    if (!date || (minimumDate && date < minimumDate)) return;

    onChange(date);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="date-picker-popover" align={align}>
        <Calendar
          mode="single"
          selected={value ?? undefined}
          defaultMonth={value ?? undefined}
          onSelect={handleSelect}
          locale={norskKalenderLocale}
          labels={norskeKalenderEtiketter}
          hidden={minimumDate ? { before: minimumDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
