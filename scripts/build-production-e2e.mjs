import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryDirectory = fileURLToPath(new URL("..", import.meta.url));
const outputDirectory = resolve(repositoryDirectory, ".e2e-build");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

rmSync(outputDirectory, { force: true, recursive: true });

for (const build of [
  { output: ".e2e-build/root", script: "build:cloudflare-pages" },
  { output: ".e2e-build/base", script: "build:github-pages" },
]) {
  execFileSync(npmCommand, ["run", build.script], {
    cwd: repositoryDirectory,
    env: {
      ...process.env,
      BANEBOOKING_STATIC_OUTPUT_DIR: build.output,
    },
    stdio: "inherit",
  });
}
