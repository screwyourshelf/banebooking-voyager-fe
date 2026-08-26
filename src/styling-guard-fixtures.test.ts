import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

describe("styling guard fixtures", () => {
  it("prove every stable rule with allowed and rejected source", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/check-styling-guard-fixtures.mjs"], {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});
