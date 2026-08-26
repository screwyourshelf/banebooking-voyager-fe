import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

describe("styling theme contract", () => {
  it("maps every semantic utility through a light- and dark-theme product role", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/check-styling-theme-contract.mjs"], {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});
