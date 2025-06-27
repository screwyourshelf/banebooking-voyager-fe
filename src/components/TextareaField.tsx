import { Textarea } from './ui/textarea.js';
import { FieldWrapper } from './FieldWrapper.js';

interface TextareaFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    helpText?: string;
    error?: string | null;
}

export function TextareaField({
    id,
    label,
    value,
    onChange,
    helpText,
    error,
}: TextareaFieldProps) {
    return (
        <FieldWrapper id={id} label={label} helpText={helpText} error={error}>
            <Textarea
                id={id}
                value={value}
                onChange={onChange}
                className={error ? 'border-destructive' : ''}
            />
        </FieldWrapper>
    );
}
