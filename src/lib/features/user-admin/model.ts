import type {
  BrukerRespons,
  OppdaterBrukerForespørsel,
  RolleType,
  SperrBrukerForespørsel,
} from "$lib/contracts";

export type MembershipFilter = "confirmed" | "unconfirmed";
export type UserSort = "newest" | "oldest" | "name";

export type UserFilters = {
  memberships: MembershipFilter[];
  query: string;
  roles: RolleType[];
  showDeleted: boolean;
  sort: UserSort;
};

export type UserEditDraft = {
  displayName: string;
  role: RolleType;
};

export type UserBlockDraft = {
  expiresOn: string;
  reason: string;
};

export type UserEditErrors = { displayName: string | null };
export type UserBlockErrors = { reason: string | null };

export const ROLE_OPTIONS: Array<{ value: RolleType; label: string }> = [
  { value: "Medlem", label: "Medlem" },
  { value: "Utvidet", label: "Utvidet bruker" },
  { value: "KlubbAdmin", label: "Klubbadministrator" },
];

export const MEMBERSHIP_OPTIONS: Array<{ value: MembershipFilter; label: string }> = [
  { value: "confirmed", label: "Bekreftet" },
  { value: "unconfirmed", label: "Ikke bekreftet" },
];

export const SORT_OPTIONS: Array<{ value: UserSort; label: string }> = [
  { value: "newest", label: "Nyeste opprettet" },
  { value: "oldest", label: "Eldste opprettet" },
  { value: "name", label: "Navn A–Å" },
];

export function createUserFilters(): UserFilters {
  return { memberships: [], query: "", roles: [], showDeleted: false, sort: "newest" };
}

export function isDeletedUser(user: Pick<BrukerRespons, "epost">) {
  return user.epost.toLocaleLowerCase().startsWith("slettet_");
}

export function getUserDisplayName(
  user: Pick<BrukerRespons, "epost" | "fulltNavn" | "visningsnavn">
) {
  return user.visningsnavn?.trim() || user.fulltNavn?.trim() || user.epost;
}

export function getPrimaryRole(user: Pick<BrukerRespons, "roller">): RolleType {
  return user.roller[0] ?? "Medlem";
}

export function filterAndSortUsers(users: readonly BrukerRespons[], filters: UserFilters) {
  const query = filters.query.toLocaleLowerCase("nb-NO").trim();
  return users
    .filter((user) => filters.showDeleted || !isDeletedUser(user))
    .filter((user) => filters.roles.length === 0 || filters.roles.includes(getPrimaryRole(user)))
    .filter((user) => {
      if (!query) return true;
      return (
        user.epost.toLocaleLowerCase("nb-NO").includes(query) ||
        user.visningsnavn?.toLocaleLowerCase("nb-NO").includes(query) ||
        user.fulltNavn?.toLocaleLowerCase("nb-NO").includes(query)
      );
    })
    .filter((user) => {
      if (filters.memberships.length === 0) return true;
      return filters.memberships.includes(
        user.medlemskapBekreftetDato ? "confirmed" : "unconfirmed"
      );
    })
    .toSorted((left, right) => compareUsers(left, right, filters.sort));
}

function compareUsers(left: BrukerRespons, right: BrukerRespons, sort: UserSort) {
  if (sort === "name") {
    return getUserDisplayName(left).localeCompare(getUserDisplayName(right), "nb-NO", {
      sensitivity: "base",
    });
  }
  const leftTime = left.opprettetTid ? Date.parse(left.opprettetTid) : Number.NaN;
  const rightTime = right.opprettetTid ? Date.parse(right.opprettetTid) : Number.NaN;
  if (Number.isNaN(leftTime)) return Number.isNaN(rightTime) ? 0 : 1;
  if (Number.isNaN(rightTime)) return -1;
  return sort === "newest" ? rightTime - leftTime : leftTime - rightTime;
}

export function userToEditDraft(user: BrukerRespons): UserEditDraft {
  return { displayName: user.visningsnavn ?? "", role: getPrimaryRole(user) };
}

export function validateUserEditDraft(draft: UserEditDraft): UserEditErrors {
  const displayName = draft.displayName.trim();
  return {
    displayName:
      displayName.length === 1
        ? "Visningsnavn må være minst 2 tegn."
        : displayName.length > 100
          ? "Visningsnavn kan ikke være mer enn 100 tegn."
          : null,
  };
}

export function toUserUpdateRequest(draft: UserEditDraft): OppdaterBrukerForespørsel {
  return { rolle: draft.role, visningsnavn: draft.displayName.trim() };
}

export function createUserBlockDraft(): UserBlockDraft {
  return { expiresOn: "", reason: "" };
}

export function validateUserBlockDraft(draft: UserBlockDraft): UserBlockErrors {
  const reason = draft.reason.trim();
  return {
    reason:
      reason.length < 3
        ? "Årsak må være minst 3 tegn."
        : reason.length > 500
          ? "Årsak kan ikke være mer enn 500 tegn."
          : null,
  };
}

export function toUserBlockRequest(draft: UserBlockDraft): SperrBrukerForespørsel {
  return {
    type: "ManuellSperre",
    årsak: draft.reason.trim(),
    aktivTil: draft.expiresOn ? `${draft.expiresOn}T00:00:00.000Z` : null,
  };
}
