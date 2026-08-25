import { spawnSync } from "node:child_process";
import process from "node:process";

const issueTypes = [
  "files",
  "dependencies",
  "devDependencies",
  "optionalPeerDependencies",
  "unlisted",
  "binaries",
  "unresolved",
  "exports",
  "nsExports",
  "types",
  "nsTypes",
  "enumMembers",
  "namespaceMembers",
  "duplicates",
  "catalog",
  "catalogReferences",
  "cycles",
];

const result = spawnSync(
  "knip",
  [
    "--config",
    "knip.json",
    "--no-progress",
    "--reporter",
    "json",
    "--treat-config-hints-as-errors",
    "--treat-tag-hints-as-errors",
  ],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }
);

if (result.error) {
  console.error("Statisk analyse kunne ikke starte Knip.");
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0 && result.status !== 1) {
  console.error("Knip avsluttet uventet før resultatet kunne klassifiseres.");
  if (result.stderr.trim()) console.error(result.stderr.trim());
  process.exit(1);
}

if (result.stderr.trim()) {
  console.error("Knip rapporterte en konfigurasjons- eller runtimefeil.");
  console.error(result.stderr.trim());
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("Knip returnerte ikke gyldig JSON.");
  if (result.stdout.trim()) console.error(result.stdout.trim());
  if (result.stderr.trim()) console.error(result.stderr.trim());
  process.exit(1);
}

const violations = [];

for (const fileIssues of report.issues ?? []) {
  for (const issueType of issueTypes) {
    for (const issue of fileIssues[issueType] ?? []) {
      const name = typeof issue === "string" ? issue : issue.name;
      violations.push(`${fileIssues.file}: ${issueType} ${name ?? JSON.stringify(issue)}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Den statiske analysen avviker fra den lukkede kontrakten.");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log("Statisk analyse er grønn: ingen døde filer, pakker, importer, eksporter eller typer.");
