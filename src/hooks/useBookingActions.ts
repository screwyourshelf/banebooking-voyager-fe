import { useState } from 'react';

export function useBookingActions() {
    const [erBekreftet, setErBekreftet] = useState(false);

    const reset = () => setErBekreftet(false);

    return { erBekreftet, setErBekreftet, reset };
}
