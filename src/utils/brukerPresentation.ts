import type { RolleType } from "@/types";

export const ROLLE_VALG: Array<{ value: RolleType; label: string }> = [
  { value: "Medlem", label: "Medlem" },
  { value: "Utvidet", label: "Utvidet bruker" },
  { value: "KlubbAdmin", label: "Klubbadministrator" },
];

export function formaterRolle(rolle: RolleType) {
  return ROLLE_VALG.find((valg) => valg.value === rolle)?.label ?? rolle;
}

export function formaterRoller(roller: readonly RolleType[] | null | undefined, fallback: string) {
  return roller?.length ? roller.map(formaterRolle).join(", ") : fallback;
}

export const MEDLEMSKAP_TYPE_VALG = [
  { value: "BarnJunior", label: "Barn/junior (inntil 19 år)" },
  { value: "StudentVernepliktig", label: "Student/vernepliktig" },
  { value: "Voksen", label: "Voksen" },
  { value: "Familie", label: "Familiemedlemskap" },
] as const;

export function formaterMedlemskapType(type: string) {
  return MEDLEMSKAP_TYPE_VALG.find((valg) => valg.value === type)?.label ?? type;
}
