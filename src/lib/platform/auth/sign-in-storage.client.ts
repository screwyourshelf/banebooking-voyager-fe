import { lokalLagringErTilgjengelig } from "$lib/platform/storage/browser-storage.client";
import { SIGN_IN_STORAGE_REQUIRED_MESSAGE } from "./types";

export function requireSignInStorage() {
  if (!lokalLagringErTilgjengelig()) throw new Error(SIGN_IN_STORAGE_REQUIRED_MESSAGE);
}
