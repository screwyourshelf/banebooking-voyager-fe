import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
import type { BaneRespons } from "$lib/contracts";
import { getApiClient } from "$lib/platform/api";
import { getTenantContext } from "$lib/platform/tenant";
import {
  courtDraftIsDirty,
  courtToDraft,
  createCourtDraft,
  createCourtReorderUpdates,
  hasErrors,
  nextCourtSortOrder,
  sortActivities,
  sortCourts,
  toCourtBookingSettingsRequest,
  toCourtUpdateRequest,
  validateCourtDraft,
  type CourtDraft,
} from "./model";
import {
  adminActivitiesQueryOptions,
  adminCourtsQueryOptions,
  createCourtMutationOptions,
  reorderCourtsMutationOptions,
  saveCourtMutationOptions,
} from "./queries";

type CourtsSectionInput = {
  readonly closeCreateEditor: () => void;
};

/** Owns court queries, drafts, validation and mutation sequencing for the courts workspace. */
export function createCourtsSectionController(input: CourtsSectionInput) {
  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const courtsQuery = createQuery(() => adminCourtsQueryOptions(api, tenant.slug));
  const activitiesQuery = createQuery(() => adminActivitiesQueryOptions(api, tenant.slug));
  const createCourtMutation = createMutation(() =>
    createCourtMutationOptions(api, queryClient, tenant.slug)
  );
  const saveMutation = createMutation(() =>
    saveCourtMutationOptions(api, queryClient, tenant.slug)
  );
  const reorderMutation = createMutation(() =>
    reorderCourtsMutationOptions(api, queryClient, tenant.slug)
  );

  let editorOpen = $state(false);
  let selectedCourtId = $state("");
  let selectedActivities = $state<string[]>([]);
  let drafts = $state<Record<string, CourtDraft>>({});
  let createDraft = $state<CourtDraft>(createCourtDraft(""));
  let createAttempted = $state(false);
  let editAttempted = $state(false);
  let savedCourtId = $state<string | null>(null);
  let reorderSaved = $state(false);

  const courts = $derived(sortCourts(courtsQuery.data ?? []));
  const activities = $derived(sortActivities(activitiesQuery.data ?? []));
  const activeActivities = $derived(activities.filter((activity) => activity.aktiv));
  const selectedCourt = $derived(courts.find((court) => court.id === selectedCourtId) ?? null);
  const selectedDraft = $derived(
    selectedCourt ? (drafts[selectedCourt.id] ?? courtToDraft(selectedCourt)) : null
  );
  const selectedCourtActivities = $derived(
    selectedCourt && !activeActivities.some((activity) => activity.id === selectedCourt.grenId)
      ? [
          ...activeActivities,
          ...activities.filter((activity) => activity.id === selectedCourt.grenId),
        ]
      : activeActivities
  );
  const filteredCourts = $derived(
    selectedActivities.length === 0
      ? courts
      : courts.filter((court) => selectedActivities.includes(court.grenId))
  );
  const filterOptions = $derived(
    activities
      .filter((activity) => courts.some((court) => court.grenId === activity.id))
      .map((activity) => ({ label: activity.navn, value: activity.id }))
  );
  const editErrors = $derived(
    selectedDraft && editAttempted
      ? validateCourtDraft(selectedDraft)
      : { name: null, description: null, activityId: null }
  );
  const createErrors = $derived(
    createAttempted
      ? validateCourtDraft(createDraft)
      : { name: null, description: null, activityId: null }
  );
  const selectedDirty = $derived(
    Boolean(selectedCourt && selectedDraft && courtDraftIsDirty(selectedCourt, selectedDraft))
  );
  const createDirty = $derived(Boolean(createDraft.name.trim() || createDraft.description.trim()));
  const busy = $derived(
    courtsQuery.isFetching ||
      activitiesQuery.isFetching ||
      createCourtMutation.isPending ||
      saveMutation.isPending ||
      reorderMutation.isPending
  );

  $effect(() => {
    if (!createDraft.activityId && activeActivities[0]) {
      createDraft = { ...createDraft, activityId: activeActivities[0].id };
    }
  });

  function openCourt(court: BaneRespons) {
    selectedCourtId = court.id;
    editorOpen = true;
    editAttempted = false;
    savedCourtId = null;
    saveMutation.reset();
  }

  function updateSelectedDraft(draft: CourtDraft) {
    if (!selectedCourt) return;
    drafts = { ...drafts, [selectedCourt.id]: draft };
    savedCourtId = null;
    saveMutation.reset();
  }

  async function saveSelectedCourt() {
    if (!selectedCourt || !selectedDraft || !selectedDirty) return;
    editAttempted = true;
    const errors = validateCourtDraft(selectedDraft);
    if (hasErrors(errors)) return;
    const original = courtToDraft(selectedCourt);
    const bookingSettingsChanged =
      JSON.stringify(selectedDraft.overrides) !== JSON.stringify(original.overrides);
    const courtChanged =
      selectedDraft.name !== original.name ||
      selectedDraft.description !== original.description ||
      selectedDraft.active !== original.active ||
      selectedDraft.activityId !== original.activityId;

    try {
      await saveMutation.mutateAsync({
        bookingSettingsChanged,
        bookingSettingsRequest: toCourtBookingSettingsRequest(selectedDraft.overrides),
        courtChanged,
        courtId: selectedCourt.id,
        courtRequest: toCourtUpdateRequest(selectedCourt, selectedDraft),
      });
      const next = { ...drafts };
      delete next[selectedCourt.id];
      drafts = next;
      editAttempted = false;
      savedCourtId = selectedCourt.id;
    } catch {
      // Mutationfeilen vises i editorens vedvarende feedbackflate.
    }
  }

  async function submitCreateCourt() {
    createAttempted = true;
    const errors = validateCourtDraft(createDraft);
    if (hasErrors(errors) || !createDirty) return;
    try {
      await createCourtMutation.mutateAsync({
        grenId: createDraft.activityId,
        navn: createDraft.name.trim(),
        beskrivelse: createDraft.description,
        sortering: nextCourtSortOrder(courts, createDraft.activityId),
      });
      createDraft = createCourtDraft(activeActivities[0]?.id ?? "");
      createAttempted = false;
      input.closeCreateEditor();
    } catch {
      // Mutationfeilen vises i editorens vedvarende feedbackflate.
    }
  }

  async function moveCourt(court: BaneRespons, direction: -1 | 1) {
    const updates = createCourtReorderUpdates(courts, court.id, direction);
    if (updates.length === 0) return;
    reorderSaved = false;
    reorderMutation.reset();
    try {
      await reorderMutation.mutateAsync(updates);
      reorderSaved = true;
    } catch {
      // onSettled henter autoritativ rekkefølge; feilen beholdes over listen.
    }
  }

  function courtPosition(court: BaneRespons) {
    const activityCourts = courts.filter((candidate) => candidate.grenId === court.grenId);
    return {
      index: activityCourts.findIndex((candidate) => candidate.id === court.id),
      count: activityCourts.length,
    };
  }

  function toggleActivityFilter(activityId: string) {
    selectedActivities = selectedActivities.includes(activityId)
      ? selectedActivities.filter((selected) => selected !== activityId)
      : [...selectedActivities, activityId];
  }

  function resetActivityFilter() {
    selectedActivities = [];
  }

  function isCourtDraftDirty(court: BaneRespons) {
    const draft = drafts[court.id];
    return Boolean(draft && courtDraftIsDirty(court, draft));
  }

  return {
    activitiesQuery,
    courtsQuery,
    createCourtMutation,
    reorderMutation,
    saveMutation,
    get activeActivities() {
      return activeActivities;
    },
    get activities() {
      return activities;
    },
    get busy() {
      return busy;
    },
    get courts() {
      return courts;
    },
    get createDirty() {
      return createDirty;
    },
    get createDraft() {
      return createDraft;
    },
    set createDraft(value) {
      createDraft = value;
    },
    get createErrors() {
      return createErrors;
    },
    get editorOpen() {
      return editorOpen;
    },
    set editorOpen(value) {
      editorOpen = value;
    },
    get editErrors() {
      return editErrors;
    },
    get filterOptions() {
      return filterOptions;
    },
    get filteredCourts() {
      return filteredCourts;
    },
    get reorderSaved() {
      return reorderSaved;
    },
    get selectedActivities() {
      return selectedActivities;
    },
    get selectedCourt() {
      return selectedCourt;
    },
    get selectedCourtActivities() {
      return selectedCourtActivities;
    },
    get selectedDirty() {
      return selectedDirty;
    },
    get selectedDraft() {
      return selectedDraft;
    },
    get savedCourtId() {
      return savedCourtId;
    },
    courtPosition,
    draftFor: (courtId: string) => drafts[courtId],
    isCourtDraftDirty,
    moveCourt,
    openCourt,
    resetActivityFilter,
    saveSelectedCourt,
    submitCreateCourt,
    toggleActivityFilter,
    updateSelectedDraft,
  };
}
