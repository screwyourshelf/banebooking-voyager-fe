import type { ReactNode } from "react";
import SettingsRow from "@/components/SettingsRow";

type Option<T extends string> = {
    value: T;
    label: ReactNode;
};

type Props<T extends string> = {
    name: string;
    title: string;
    description?: string;
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    className?: string;
};

export default function RadioGroupRow<T extends string>({
    name,
    title,
    description,
    value,
    options,
    onChange,
    className = "",
}: Props<T>) {
    return (
        <SettingsRow title={title} description={description} className={className}>
            <div className="space-y-2">
                {options.map((o) => (
                    <label
                        key={String(o.value)}
                        className="flex items-center gap-2 text-sm cursor-pointer select-none"
                    >
                        <input
                            type="radio"
                            name={name}
                            checked={value === o.value}
                            onChange={() => onChange(o.value)}
                        />
                        <span>{o.label}</span>
                    </label>
                ))}
            </div>
        </SettingsRow>
    );
}
