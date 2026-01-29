import SettingsRow from "@/components/SettingsRow";
import { SelectField } from "@/components/SelectField";

type Option = { label: string; value: string };

type Props = {
    title: string;
    description?: string;
    id: string;
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    disabled?: boolean;
    className?: string;
};

export default function SettingsSelectRow({
    title,
    description,
    id,
    value,
    onChange,
    options,
    disabled,
    className,
}: Props) {
    return (
        <SettingsRow title={title} description={description} className={className}>
            <SelectField
                id={id}
                label={title}     // brukes kun for a11y, ikke visuelt
                hideLabel
                value={value}
                onChange={onChange}
                options={options}
                disabled={disabled}
            />
        </SettingsRow>
    );
}
