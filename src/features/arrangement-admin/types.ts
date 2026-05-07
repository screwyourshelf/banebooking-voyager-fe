// Frontend-interne typer for arrangement-admin.
// Ikke speil mot backend – disse eksisterer kun i lokal state.

export type LokalBookingStatus = "ukjent" | "ledig" | "konflikt" | "aktiv" | "slettet";
export type LokalBookingKilde = "generert" | "manuell" | "eksisterende";

export type LokalBooking = {
  /** Lokal UUID – crypto.randomUUID(). Brukes som React key og for oppdatering/fjerning. */
  id: string;
  /** Booking-id fra backend. Finnes kun for bookinger lastet fra eksisterende arrangement. */
  eksternId?: string;
  /** ISO-dato "YYYY-MM-DD" */
  dato: string;
  /** Starttidspunkt "HH:MM" */
  startTid: string;
  /** Sluttidspunkt "HH:MM" – beregnes fra startTid + slotLengdeMinutter ved generering */
  sluttTid: string;
  baneId: string;
  baneNavn: string;
  status: LokalBookingStatus;
  /** Opprinnelse: generert fra periode-wizard, manuelt lagt til, eller lastet fra backend */
  kilde: LokalBookingKilde;
  /** true hvis en eksisterende booking (har eksternId) er modifisert i UI */
  erEndret?: boolean;
  /** true hvis en eksisterende booking er markert for avlysning */
  erSlettet?: boolean;
  /**
   * Nøkkelen (lagBookingNøkkel) for bookingen FØR eventuelle lokale endringer.
   * Settes kun når en eksisterende booking redigeres (dato/tid/bane endres).
   * Brukes til diffing: vi vet hvilken opprinnelig backend-booking raden representer
   * selv om lagBookingNøkkel() har endret seg.
   */
  opprinneligBookingNøkkel?: string;
  /** Lesbar feilmelding fra konfliktsjekk */
  konfliktInfo?: string;
};
