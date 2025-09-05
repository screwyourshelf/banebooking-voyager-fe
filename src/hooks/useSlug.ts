import { useContext } from "react";
import { SlugContext } from "@/contexts/SlugContext.js";

export function useSlug(): string {
  return useContext(SlugContext)!; // alltid definert pga Layout
}
