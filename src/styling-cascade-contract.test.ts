import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

describe("styling cascade contract", () => {
  it("classifies every production CSS rule in a registered Tailwind layer", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/check-styling-cascade-contract.mjs"], {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});
