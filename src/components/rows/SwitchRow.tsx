import Row from "./Row";
import { Switch } from "@/components/ui/switch";

type Props = {
    title: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    density?: "default" | "compact";
};

export default function SwitchRow({
    title,
    description,
    checked,
    onCheckedChange,
    disabled = false,
    className,
    density = "compact",
}: Props) {
    return (
        <Row
            title={title}
            description={description}
            density={density}
            className={className}
            right={
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    disabled={disabled}
                />
            }
        />
    );
}
