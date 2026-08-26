// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { requireSignInStorage } from "./sign-in-storage.client";
import { SIGN_IN_STORAGE_REQUIRED_MESSAGE } from "./types";

afterEach(() => vi.restoreAllMocks());

describe("sign-in storage boundary", () => {
  it("avviser innlogging når nettleseren blokkerer lokal lagring", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => requireSignInStorage()).toThrow(SIGN_IN_STORAGE_REQUIRED_MESSAGE);
  });
});
