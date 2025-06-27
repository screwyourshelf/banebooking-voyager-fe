import { FieldWrapper } from './FieldWrapper.js';

interface RangeFieldProps {
    id: string;
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    helpText?: string;
    error?: string | null;
}

export function RangeField({
    id,
    label,
    value,
    onChange,
    min = 0,
    max = 10,
    step = 1,
    helpText,
    error,
}: RangeFieldProps) {
    return (
        <FieldWrapper id={id} label={`${label}: ${value}`} helpText={helpText} error={error}>
            <input
                id={id}
                type="range"
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full"
            />
        </FieldWrapper>
    );
}
