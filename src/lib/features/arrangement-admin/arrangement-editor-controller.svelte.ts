import {
  createMutation as createSvelteMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/svelte-query";
import type { ArrangementRespons, BaneRespons, GrenRespons } from "$lib/contracts";
import { formaterAntallBanetider } from "$lib/domain";
import { getApiClient } from "$lib/platform/api";
import { getTenantContext } from "$lib/platform/tenant";
import {
  addUniqueBookings,
  arrangementToMetadataDraft,
  createArrangementRequest,
  createMetadataDraft,
  mapExistingBookings,
  mergePreview,
  metadataRequest,
  previewRequest,
  reconcileBatchResult,
  toBookingRequest,
  validateMetadata,
  type ArrangementEditorMode,
  type ArrangementEditorStep,
  type LocalBooking,
  type ScheduleMode,
} from "./model";
import {
  addArrangementBookingMutationOptions,
  addArrangementBookingsBatchMutationOptions,
  arrangementBookingsQueryOptions,
  createArrangementMutationOptions,
  deleteArrangementBookingMutationOptions,
  deleteArrangementMutationOptions,
  previewArrangementMutationOptions,
  updateArrangementBookingMutationOptions,
  updateArrangementMetadataMutationOptions,
} from "./queries";

type ArrangementEditorFeedback = {
  description?: string;
  title: string;
  tone: "danger" | "success" | "warning";
};

type ArrangementEditorInput = {
  readonly activities: readonly GrenRespons[];
  readonly arrangement?: ArrangementRespons;
  readonly courts: readonly BaneRespons[];
  readonly mode: ArrangementEditorMode;
  readonly onBusyChange?: (busy: boolean) => void;
  readonly onCreated?: (message: string, tone: "success" | "warning") => void;
  readonly onDeleted?: () => void;
};

function uniqueBookingMessages(bookings: readonly LocalBooking[]) {
  return bookings
    .reduce<string[]>((messages, booking) => {
      if (!booking.message || messages.includes(booking.message)) return messages;
      return [...messages, booking.message];
    }, [])
    .join(", ");
}

/** Owns the editor's query-backed, multi-step workflow while the component owns presentation. */
export function createArrangementEditorController(input: ArrangementEditorInput) {
  const api = getApiClient();
  const tenant = getTenantContext();
  const queryClient = useQueryClient();
  const arrangementId = $derived(input.arrangement?.id ?? "");
  const bookingsQuery = createQuery(() =>
    arrangementBookingsQueryOptions(api, tenant.slug, input.mode === "edit" ? arrangementId : "")
  );
  const previewMutation = createSvelteMutation(() =>
    previewArrangementMutationOptions(
      api,
      tenant.slug,
      input.mode === "edit" ? arrangementId : undefined
    )
  );
  const createArrangementMutation = createSvelteMutation(() =>
    createArrangementMutationOptions(api, queryClient, tenant.slug)
  );
  const metadataMutation = createSvelteMutation(() =>
    updateArrangementMetadataMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const deleteMutation = createSvelteMutation(() =>
    deleteArrangementMutationOptions(api, queryClient, tenant.slug)
  );
  const addBookingMutation = createSvelteMutation(() =>
    addArrangementBookingMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const addBatchMutation = createSvelteMutation(() =>
    addArrangementBookingsBatchMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const deleteBookingMutation = createSvelteMutation(() =>
    deleteArrangementBookingMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );
  const updateBookingMutation = createSvelteMutation(() =>
    updateArrangementBookingMutationOptions(api, queryClient, tenant.slug, arrangementId)
  );

  let synchronizedArrangementId = $state<string | undefined>();
  let initialized = $state(false);
  let synchronizedBookings = $state("");
  let step = $state<ArrangementEditorStep>("information");
  let scheduleMode = $state<ScheduleMode>("recurring");
  let draft = $state(createMetadataDraft());
  let metadataSubmitted = $state(false);
  let bookings = $state<LocalBooking[]>([]);
  let selectedBooking = $state<LocalBooking | null>(null);
  let bookingDialogOpen = $state(false);
  let deleteDialogOpen = $state(false);
  let feedback = $state<ArrangementEditorFeedback | null>(null);

  const errors = $derived(validateMetadata(draft));
  const visibleErrors = $derived(
    metadataSubmitted ? errors : { activityId: null, websiteTitle: null }
  );
  const filteredCourts = $derived(
    input.courts.filter((court) => court.grenId === draft.activityId)
  );
  const stagedBookings = $derived(bookings.filter((booking) => booking.source !== "existing"));
  const creatableBookings = $derived(
    stagedBookings.filter((booking) => booking.status !== "conflict")
  );
  const busy = $derived(
    bookingsQuery.isFetching ||
      previewMutation.isPending ||
      createArrangementMutation.isPending ||
      metadataMutation.isPending ||
      deleteMutation.isPending ||
      addBookingMutation.isPending ||
      addBatchMutation.isPending ||
      deleteBookingMutation.isPending ||
      updateBookingMutation.isPending
  );

  $effect(() => input.onBusyChange?.(busy));

  $effect(() => {
    if (initialized && input.arrangement?.id === synchronizedArrangementId) return;
    initialized = true;
    synchronizedArrangementId = input.arrangement?.id;
    step = "information";
    metadataSubmitted = false;
    feedback = null;
    bookings = [];
    synchronizedBookings = "";
    if (input.arrangement) {
      const activityId =
        input.activities.find((activity) => activity.slug === input.arrangement?.grenSlug)?.id ??
        "";
      draft = arrangementToMetadataDraft(input.arrangement, activityId);
    } else {
      draft = createMetadataDraft(input.activities[0]?.id ?? "");
    }
  });

  $effect(() => {
    if (input.mode !== "edit" || !bookingsQuery.data) return;
    const signature = JSON.stringify(bookingsQuery.data);
    if (signature === synchronizedBookings) return;
    synchronizedBookings = signature;
    bookings = addUniqueBookings(
      mapExistingBookings(bookingsQuery.data),
      bookings.filter((booking) => booking.source !== "existing")
    );
  });

  function resetFeedback() {
    feedback = null;
    metadataMutation.reset();
  }

  function showTimes() {
    metadataSubmitted = true;
    if (Object.values(errors).some(Boolean)) return;
    step = "times";
    feedback = null;
  }

  async function preview(nextBookings: LocalBooking[]) {
    const candidates = nextBookings.filter((booking) =>
      input.mode === "edit" ? booking.source !== "existing" : true
    );
    const request = previewRequest(candidates, draft.activityId, draft.category);
    if (!request) return;
    try {
      const result = await previewMutation.mutateAsync(request);
      bookings = nextBookings.map((booking) => {
        if (input.mode === "edit" && booking.source === "existing") return booking;
        return mergePreview([booking], result)[0];
      });
    } catch {
      feedback = {
        tone: "danger",
        title: "Konfliktsjekken feilet",
        description:
          previewMutation.error instanceof Error
            ? previewMutation.error.message
            : "Forslagene er beholdt. Prøv igjen før du lagrer.",
      };
    }
  }

  async function createNewArrangement() {
    metadataSubmitted = true;
    if (Object.values(errors).some(Boolean)) {
      step = "information";
      return;
    }
    const request = createArrangementRequest(draft, bookings);
    if (!request) {
      feedback = {
        tone: "warning",
        title: "Arrangementet mangler banetider",
        description: "Legg til minst én ledig banetid før du oppretter arrangementet.",
      };
      return;
    }
    try {
      const result = await createArrangementMutation.mutateAsync(request);
      if (result.antallOpprettet === 0) {
        bookings = mergePreview(bookings, {
          ledige: [],
          konflikter: result.konflikter.map((conflict) => ({ ...conflict, baneNavn: "" })),
        });
        feedback = {
          tone: "warning",
          title: "Ingen banetider ble opprettet",
          description: "Alle valgte tidspunkter var opptatt. Juster forslagene og prøv igjen.",
        };
        return;
      }
      const conflictCount =
        bookings.filter((booking) => booking.status === "conflict").length +
        result.konflikter.length;
      input.onCreated?.(
        conflictCount > 0
          ? `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet. ${conflictCount} tidspunkt ble ikke tatt med.`
          : `${formaterAntallBanetider(result.antallOpprettet)} ble opprettet.`,
        conflictCount > 0 ? "warning" : "success"
      );
    } catch {
      // Mutationfeilen vises i den vedvarende feedbackflaten i komponenten.
    }
  }

  async function saveMetadata() {
    metadataSubmitted = true;
    if (!input.arrangement || Object.values(errors).some(Boolean)) return;
    try {
      await metadataMutation.mutateAsync(metadataRequest(draft));
      feedback = {
        tone: "success",
        title: "Informasjonen er lagret",
        description: "Arrangementoversikten er oppdatert.",
      };
    } catch {
      // Mutationfeilen vises i komponentens vedvarende feedbackflate.
    }
  }

  async function saveStagedBookings() {
    if (!input.arrangement || creatableBookings.length === 0) return;
    const snapshot = [...creatableBookings];
    try {
      const result = await addBatchMutation.mutateAsync({
        bookinger: snapshot.map(toBookingRequest),
      });
      const reconciled = reconcileBatchResult(snapshot, result);
      bookings = [
        ...bookings.filter((booking) => booking.source === "existing"),
        ...reconciled.failed,
      ];
      feedback = reconciled.failed.length
        ? {
            tone: "warning",
            title: `${reconciled.failed.length} av ${snapshot.length} banetider kunne ikke opprettes`,
            description: uniqueBookingMessages(reconciled.failed),
          }
        : {
            tone: "success",
            title: `${formaterAntallBanetider(snapshot.length)} ble opprettet`,
            description: "De nye tidene vises nå i listen.",
          };
    } catch {
      // Mutationfeilen vises i komponentens vedvarende feedbackflate.
    }
  }

  function editBooking(booking: LocalBooking) {
    selectedBooking = booking;
    bookingDialogOpen = true;
    feedback = null;
  }

  async function deleteBooking(booking: LocalBooking) {
    if (booking.source === "existing" && booking.externalId) {
      await deleteBookingMutation.mutateAsync(booking.externalId);
    }
    bookings = bookings.filter((candidate) => candidate.id !== booking.id);
  }

  async function saveBooking(original: LocalBooking, updated: LocalBooking) {
    if (original.source === "existing" && original.externalId) {
      await updateBookingMutation.mutateAsync({
        bookingId: original.externalId,
        request: toBookingRequest(updated),
      });
      bookings = bookings.map((booking) => (booking.id === original.id ? updated : booking));
      return;
    }
    const next = bookings.map((booking) => (booking.id === original.id ? updated : booking));
    bookings = next;
    await preview(next);
  }

  async function deleteWholeArrangement() {
    if (!input.arrangement) return;
    try {
      await deleteMutation.mutateAsync(input.arrangement.id);
      deleteDialogOpen = false;
      input.onDeleted?.();
    } catch {
      // Dialogen forblir åpen og viser mutasjonsfeilen.
    }
  }

  return {
    addBatchMutation,
    addBookingMutation,
    bookingsQuery,
    createArrangementMutation,
    deleteBookingMutation,
    deleteMutation,
    metadataMutation,
    previewMutation,
    updateBookingMutation,
    get bookingDialogOpen() {
      return bookingDialogOpen;
    },
    set bookingDialogOpen(value) {
      bookingDialogOpen = value;
    },
    get bookings() {
      return bookings;
    },
    set bookings(value) {
      bookings = value;
    },
    get busy() {
      return busy;
    },
    get creatableBookings() {
      return creatableBookings;
    },
    get deleteDialogOpen() {
      return deleteDialogOpen;
    },
    set deleteDialogOpen(value) {
      deleteDialogOpen = value;
    },
    get draft() {
      return draft;
    },
    set draft(value) {
      draft = value;
    },
    get feedback() {
      return feedback;
    },
    get filteredCourts() {
      return filteredCourts;
    },
    get scheduleMode() {
      return scheduleMode;
    },
    set scheduleMode(value) {
      scheduleMode = value;
    },
    get selectedBooking() {
      return selectedBooking;
    },
    get step() {
      return step;
    },
    set step(value) {
      step = value;
    },
    get visibleErrors() {
      return visibleErrors;
    },
    createNewArrangement,
    deleteBooking,
    deleteWholeArrangement,
    editBooking,
    preview,
    resetFeedback,
    saveBooking,
    saveMetadata,
    saveStagedBookings,
    showTimes,
  };
}
