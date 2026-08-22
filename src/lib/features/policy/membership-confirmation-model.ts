import type { BekreftMedlemskapForespørsel } from "$lib/contracts";

export type MembershipConfirmationDraft = {
  fullName: string;
  membershipType: string;
};

export type MembershipConfirmationErrors = {
  fullName: string | null;
  membershipType: string | null;
};

export function validateMembershipConfirmation(
  draft: MembershipConfirmationDraft
): MembershipConfirmationErrors {
  return {
    fullName: draft.fullName.trim() ? null : "Skriv inn fullt navn.",
    membershipType: draft.membershipType ? null : "Velg medlemskapstype.",
  };
}

export function toMembershipConfirmationRequest(
  draft: MembershipConfirmationDraft
): BekreftMedlemskapForespørsel | null {
  const errors = validateMembershipConfirmation(draft);
  if (errors.fullName || errors.membershipType) return null;

  return {
    fulltNavn: draft.fullName.trim(),
    medlemskapType: draft.membershipType,
  };
}
