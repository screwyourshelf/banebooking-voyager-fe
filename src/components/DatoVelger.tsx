import { format, addDays, subDays } from 'date-fns'
import { nb } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button.js'
import { Calendar } from '@/components/ui/calendar.js'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.js'

type Props = {
    value: Date | null
    onChange: (date: Date) => void
    minDate?: Date
    visNavigering?: boolean
}

export default function DatoVelger({ value, onChange, minDate, visNavigering = true }: Props) {
    const visningsformat = value
        ? format(value, 'dd.MM.yyyy', { locale: nb })
        : 'Velg dato'

    const forrigeDag = () => {
        if (value) onChange(subDays(value, 1))
    }

    const nesteDag = () => {
        if (value) onChange(addDays(value, 1))
    }

    return (
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center w-full">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
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
                        fromDate={minDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {visNavigering && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={forrigeDag}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nesteDag}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );

}
