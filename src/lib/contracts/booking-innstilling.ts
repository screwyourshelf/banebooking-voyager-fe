// Effektive bookinginnstillinger: Gren eier kvotene, bane kan avvike på tid og horisont.
export type BookingInnstillingRespons = {
  aapningstid: string;
  stengetid: string;
  maksPerDag: number;
  maksKommende: number;
  dagerFremITid: number;
  slotLengdeMinutter: number;
};
