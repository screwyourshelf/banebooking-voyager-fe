import { useCallback, useState } from "react";

export function useTouchedFields<TKeys extends string>(initial: Record<TKeys, boolean>) {
    const [touched, setTouched] = useState<Record<TKeys, boolean>>(initial);

    const touch = useCallback((key: TKeys) => {
        setTouched((t) => (t[key] ? t : { ...t, [key]: true }));
    }, []);

    const touchMany = useCallback((keys: TKeys[]) => {
        setTouched((t) => {
            let changed = false;
            const next = { ...t };
            for (const k of keys) {
                if (!next[k]) {
                    next[k] = true;
                    changed = true;
                }
            }
            return changed ? next : t;
        });
    }, []);

    const resetTouched = useCallback((next?: Record<TKeys, boolean>) => {
        setTouched(next ?? initial);
    }, [initial]);

    return { touched, touch, touchMany, resetTouched };
}