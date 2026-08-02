import { useState, type ComponentProps, type ReactNode } from "react";
import { nb } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  function handleSelect(date: Date | undefined) {
    if (!date || (minDate && date < minDate)) return;

    onChange(date);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="date-picker-popover w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          locale={nb}
          hidden={minDate ? { before: minDate } : undefined}
        />
      </PopoverContent>
    </Popover>
  );
}
