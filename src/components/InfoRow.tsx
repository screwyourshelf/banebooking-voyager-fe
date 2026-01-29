import type { ReactNode } from "react";
import SettingsRow from "@/components/SettingsRow";

/**
 * InfoRow
 *
 * Semantisk wrapper for "label + value" (read-only).
 * Brukes i SettingsList når du viser data (ikke inputs).
 */
type Props = {
    label: string;
    value: ReactNode;
    description?: string;
    className?: string;
};

export default function InfoRow({ label, value, description, className = "" }: Props) {
    return (
        <SettingsRow title={label} description={description} className={className}>
            {value}
        </SettingsRow>
    );
}
