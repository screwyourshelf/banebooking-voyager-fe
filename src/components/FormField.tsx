import { Input } from './ui/input.js';
import { FieldWrapper } from './FieldWrapper.js';

interface FormFieldProps {
    id: string;
    label: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    helpText?: string;
    error?: string | null;
    readOnly?: boolean;
    maxLength?: number;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function FormField({
    id,
    label,
    value,
    onChange,
    helpText,
    error,
    readOnly = false,
    maxLength,
    type = 'text',
    placeholder,
    disabled = false,
}: FormFieldProps) {
    return (
        <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
            <Input
                id={id}
                type={type}
                value={value}
                readOnly={readOnly}
                disabled={disabled}
                maxLength={maxLength}
                placeholder={placeholder}
                onChange={onChange}
                className={error ? 'border-destructive' : ''}
            />
        </FieldWrapper>
    );
}
