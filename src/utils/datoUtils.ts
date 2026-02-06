import type { UkedagIso, UkedagKortNorsk } from "@/types/dato";

export const ukedager: readonly UkedagKortNorsk[] = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export const ukedagKortTilIso: Record<UkedagKortNorsk, UkedagIso> = {
    Man: 1,
    Tir: 2,
    Ons: 3,
    Tor: 4,
    Fre: 5,
    Lør: 6,
    Søn: 7,
};

export const ukedagIsoTilKort: Record<UkedagIso, UkedagKortNorsk> = {
    1: "Man",
    2: "Tir",
    3: "Ons",
    4: "Tor",
    5: "Fre",
    6: "Lør",
    7: "Søn",
};

export function ukedagTilLangNorsk(d: UkedagIso): string {
    switch (d) {
        case 1: return "Mandag";
        case 2: return "Tirsdag";
        case 3: return "Onsdag";
        case 4: return "Torsdag";
        case 5: return "Fredag";
        case 6: return "Lørdag";
        case 7: return "Søndag";
    }
}

export function sorterUkedager<T extends UkedagIso>(dager: T[]): T[] {
    return [...dager].sort((a, b) => a - b);
}

export function formatUkedagerLangNorsk(dager: UkedagIso[] | undefined): string {
    if (!dager?.length) return "—";
    return sorterUkedager(dager).map(ukedagTilLangNorsk).join(", ");
}

/** Date.getDay(): 0=søn..6=lør  => ISO: 1=man..7=søn */
export function dateTilUkedagIso(d: Date): UkedagIso {
    const js = d.getDay(); // 0..6
    return (js === 0 ? 7 : js) as UkedagIso;
}

/** Finn hvilke ISO-ukedager som faktisk finnes i et intervall */
export function finnUkedagerIDatoPeriode(fra: Date, til: Date): Set<UkedagIso> {
    const dager = new Set<UkedagIso>();
    const start = new Date(fra.getFullYear(), fra.getMonth(), fra.getDate());
    const slutt = new Date(til.getFullYear(), til.getMonth(), til.getDate());

    for (let d = new Date(start); d <= slutt; d.setDate(d.getDate() + 1)) {
        dager.add(dateTilUkedagIso(d));
    }

    return dager;
}

export function tilDatoTekst(dato: Date): string {
    const år = dato.getFullYear();
    const måned = String(dato.getMonth() + 1).padStart(2, "0");
    const dag = String(dato.getDate()).padStart(2, "0");
    return `${år}-${måned}-${dag}`;
}

export function formatDatoKort(datoInput: string | Date): string {
    const dato = new Date(datoInput);
    return dato.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDatoLang(datoStr: string): string {
    const dato = new Date(`${datoStr}T00:00:00`);
    return dato.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}
