import { createContext } from "svelte";
import type { BrukerRespons, KlubbRespons } from "$lib/contracts";

export type SessionQueryStatus = "error" | "pending" | "success";

export type SessionDataContext = {
  readonly bruker: BrukerRespons | null | undefined;
  readonly brukerFetching: boolean;
  readonly brukerStatus: SessionQueryStatus;
  readonly klubb: KlubbRespons | undefined;
  readonly klubbFetching: boolean;
  readonly klubbStatus: SessionQueryStatus;
  invalidateBruker(): Promise<void>;
  refetchBruker(): Promise<unknown>;
  refetchKlubb(): Promise<unknown>;
};

export const [getSessionDataContext, setSessionDataContext] = createContext<SessionDataContext>();
