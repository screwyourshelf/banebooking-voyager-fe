type Props = {
    id: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
};

export default function SettingsRange({
    id,
    value,
    onChange,
    min = 0,
    max = 10,
    step = 1,
    disabled = false,
}: Props) {
    return (
        <input
            id={id}
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full"
        />
    );
}
