import { format, addDays, subDays } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Props = {
    value: Date | null;
    onChange: (date: Date) => void;
    minDate?: Date;
    visNavigering?: boolean;
};

export default function DatoVelger({ value, onChange, minDate, visNavigering = true }: Props) {
    const visningsformat = value ? format(value, "dd.MM.yyyy", { locale: nb }) : "Velg dato";

    const forrigeDag = () => {
        if (!value) return;
        const ny = subDays(value, 1);
        if (minDate && ny < minDate) return;
        onChange(ny);
    };

    const nesteDag = () => {
        if (!value) return;
        onChange(addDays(value, 1));
    };

    const disablePrev = !value || (!!minDate && subDays(value, 1) < minDate);

    return (
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-2 text-sm flex-1 justify-start text-left min-w-[10rem]"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {visningsformat}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value ?? undefined}
                        onSelect={(dato) => {
                            if (!dato) return;
                            if (minDate && dato < minDate) return;
                            onChange(dato);
                        }}
                        locale={nb}
                        hidden={minDate ? { before: minDate } : undefined}
                    />
                </PopoverContent>
            </Popover>

            {visNavigering && (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={forrigeDag}
                        className="h-8 w-8"
                        disabled={disablePrev}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={nesteDag}
                        className="h-8 w-8"
                        disabled={!value}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
