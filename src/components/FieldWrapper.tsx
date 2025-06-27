import { Label } from './ui/label.js';

interface FieldWrapperProps {
    id: string;
    label: string;
    children: React.ReactNode;
    helpText?: string;
    error?: string | null;
    className?: string;
}

export function FieldWrapper({
    id,
    label,
    children,
    helpText,
    error,
    className,
}: FieldWrapperProps) {
    return (
        <div className={`space-y-1 ${className ?? ''}`}>
            <Label htmlFor={id}>{label}</Label>

            {helpText && (
                <p className="text-xs text-muted-foreground">{helpText}</p>
            )}

            {children}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
