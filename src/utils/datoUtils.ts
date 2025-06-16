// utils/datoUtils.ts

/**
 * Norsk ukedagsrekkefølge som brukes i frontend-GUI.
 * Brukes bl.a. for rendering av ukedagsvalg og i knappetiketter.
 */
export const ukedager = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

/**
 * Mapping fra norsk kortform til .NET/DayOfWeek-navn (brukes mot backend).
 * F.eks. 'Man' → 'Monday'
 */
export const dagNavnTilEnum: Record<string, string> = {
    Man: 'Monday',
    Tir: 'Tuesday',
    Ons: 'Wednesday',
    Tor: 'Thursday',
    Fre: 'Friday',
    Lør: 'Saturday',
    Søn: 'Sunday',
};

/**
 * Mapping fra .NET/DayOfWeek-navn tilbake til norsk kortform.
 * F.eks. 'Monday' → 'Man'
 */
export const enumTilDagNavn: Record<string, string> = {
    Monday: 'Man',
    Tuesday: 'Tir',
    Wednesday: 'Ons',
    Thursday: 'Tor',
    Friday: 'Fre',
    Saturday: 'Lør',
    Sunday: 'Søn',
};

/**
 * Mapping fra Date.getDay() (0–6) til backend-vennlig DayOfWeek-verdi.
 * 0 = søndag, 1 = mandag, ..., 6 = lørdag.
 */
export const dagIndexTilBackendUkedag: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};

/**
 * Mapping fra Date.getDay() (0–6) til norsk kortform.
 */
export const dagIndexTilKortNorskUkedag: Record<number, string> = {
    0: 'Søn',
    1: 'Man',
    2: 'Tir',
    3: 'Ons',
    4: 'Tor',
    5: 'Fre',
    6: 'Lør',
};

/**
 * Mapping fra Date.getDay() (0–6) til norsk langform.
 */
export const dagIndexTilLangNorskUkedag: Record<number, string> = {
    0: 'Søndag',
    1: 'Mandag',
    2: 'Tirsdag',
    3: 'Onsdag',
    4: 'Torsdag',
    5: 'Fredag',
    6: 'Lørdag',
};

/**
 * Konverterer en JavaScript Date til tekst på formen 'YYYY-MM-DD'.
 * Dette er trygt for bruk mot backend som forventer DateOnly i ISO-format.
 *
 * @param dato JavaScript Date-objekt
 * @returns En streng på formen '2025-09-14'
 */
export function tilDatoTekst(dato: Date): string {
    const år = dato.getFullYear();
    const måned = String(dato.getMonth() + 1).padStart(2, '0');
    const dag = String(dato.getDate()).padStart(2, '0');
    return `${år}-${måned}-${dag}`;
}

/**
 * Returnerer en Set med backend-ukedager (f.eks. 'Monday', 'Tuesday') for dato-intervall.
 *
 * @param fra Startdato (inkludert)
 * @param til Sluttdato (inkludert)
 * @returns Set med backend-ukedager i perioden
 */
export function finnUkedagerIDatoPeriode(fra: Date, til: Date): Set<string> {
    const dager = new Set<string>();
    const start = new Date(fra.getFullYear(), fra.getMonth(), fra.getDate());
    const slutt = new Date(til.getFullYear(), til.getMonth(), til.getDate());

    for (let d = new Date(start); d <= slutt; d.setDate(d.getDate() + 1)) {
        const dayIndex = d.getDay(); // 0–6
        const backendUkedag = dagIndexTilBackendUkedag[dayIndex];
        dager.add(backendUkedag);
    }

    return dager;
}

/** Konverterer Day.getDay()-verdi til norsk kortform. */
export function getKortUkedagFraDate(dato: Date): string {
    return dagIndexTilKortNorskUkedag[dato.getDay()];
}

/** Konverterer Day.getDay()-verdi til backend-ukedag. */
export function getBackendUkedagFraDate(dato: Date): string {
    return dagIndexTilBackendUkedag[dato.getDay()];
}

/** Viser dato som 'dd.MM.yyyy' – f.eks. '01.06.2025' */
export function formatDatoKort(datoStr: string): string {
    const dato = new Date(`${datoStr}T00:00:00`); // unngå UTC-problemer
    return dato.toLocaleDateString('nb-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/** Viser dato som 'd. MMMM yyyy' – f.eks. '1. juni 2025' */
export function formatDatoLang(datoStr: string): string {
    const dato = new Date(`${datoStr}T00:00:00`);
    return dato.toLocaleDateString('nb-NO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}




