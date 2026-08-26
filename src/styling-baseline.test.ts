import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));

describe("styling baseline", () => {
  it("regenerates deterministically from the current source tree", () => {
    expect(() =>
      execFileSync(process.execPath, ["scripts/measure-styling-baseline.mjs", "--check"], {
        cwd: projectRoot,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).not.toThrow();
  });
});
