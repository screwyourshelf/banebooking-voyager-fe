import { useContext } from "react";
import { SlugContext } from "@/contexts/SlugContext.js";

export function useSlug(): string {
    const slug = useContext(SlugContext);
    if (!slug) throw new Error("useSlug må brukes under <SlugContext.Provider> (Layout)");
    return slug;
}
