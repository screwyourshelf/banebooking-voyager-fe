import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

describe("styling production tree contract", () => {
  it("keeps discovery explicit and rejects a new occurrence for every enforced rule", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/test-styling-production-tree-contract.mjs"], {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});
