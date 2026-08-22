import { describe, expect, it, vi } from "vitest";
import { createUnauthorizedHandler } from "./unauthorized";

describe("createUnauthorizedHandler", () => {
  it("slår sammen samtidige 401-effekter, men tillater en senere håndtering", async () => {
    let release: (() => void) | undefined;
    const effect = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    const handleUnauthorized = createUnauthorizedHandler(effect);

    const first = handleUnauthorized();
    const second = handleUnauthorized();
    await vi.waitFor(() => expect(effect).toHaveBeenCalledTimes(1));
    release?.();
    await Promise.all([first, second]);

    const third = handleUnauthorized();
    await vi.waitFor(() => expect(effect).toHaveBeenCalledTimes(2));
    release?.();
    await third;
  });
});
