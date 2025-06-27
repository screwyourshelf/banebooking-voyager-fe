import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select.js';
import { FieldWrapper } from './FieldWrapper.js';

interface SelectFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    helpText?: string;
    error?: string | null;
    disabled?: boolean;
}

export function SelectField({
    id,
    label,
    value,
    onChange,
    options,
    helpText,
    error,
    disabled = false,
}: SelectFieldProps) {
    return (
        <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger
                    id={id}
                    className={error ? 'border-destructive' : ''}
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </FieldWrapper>
    );
}
