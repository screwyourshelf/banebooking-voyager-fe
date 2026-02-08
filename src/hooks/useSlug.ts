import { useContext } from "react";
import { SlugContext } from "@/contexts/SlugContext";

export function useSlug(): string {
  const slug = useContext(SlugContext);
  if (!slug) {
    throw new Error("useSlug m� brukes under <SlugProvider>");
  }
  return slug;
}
