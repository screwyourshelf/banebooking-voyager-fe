import type { KlasseType } from "@/types";
import { klasseTypeNavn } from "./klasseTypeUtils";

type Props = { type: KlasseType };

export function KlasseTypeLabel({ type }: Props) {
  return <span>{klasseTypeNavn(type)}</span>;
}
