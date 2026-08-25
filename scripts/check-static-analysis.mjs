import { spawnSync } from "node:child_process";
import process from "node:process";

// Disse typene fullfører backendens transportgraf uten å produsere runtimekode. Det eksakte
// settet gjør både nye funn og oppryddede kontrakter til en eksplisitt checkpointbeslutning.
const allowedUnusedContractTypes = new Map([
  [
    "src/lib/contracts/arrangement.ts",
    new Set([
      "BaneGruppeForespørsel",
      "SlettArrangementForespørsel",
      "ArrangementPresentasjonType",
      "ArrangementPresentasjon",
      "ArrangementSlotRespons",
      "ArrangementKonfliktRespons",
      "BaneGruppeRespons",
      "OffentligArrangementRespons",
      "BatchBookingFeilet",
      "ErstattArrangementRespons",
    ]),
  ],
  ["src/lib/contracts/booking-slot.ts", new Set(["BookingSlotRespons"])],
  ["src/lib/contracts/bruker.ts", new Set(["AksepterVilkårForespørsel"])],
  ["src/lib/contracts/kunngjoring.ts", new Set(["KunngjøringBekreftelseRespons"])],
  [
    "src/lib/contracts/statistikk.ts",
    new Set([
      "StatistikkPeriode",
      "SammenlignbarBookingstatistikk",
      "BookingPerGren",
      "BookingPerUkedag",
      "BookingToppBruker",
      "BookingMedlemsstatistikkPerBookingtype",
    ]),
  ],
]);

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

const observedContractTypes = new Map(
  [...allowedUnusedContractTypes].map(([file, names]) => [
    file,
    new Map([...names].map((name) => [name, 0])),
  ])
);
const violations = [];

for (const fileIssues of report.issues ?? []) {
  for (const issueType of issueTypes) {
    for (const issue of fileIssues[issueType] ?? []) {
      const name = typeof issue === "string" ? issue : issue.name;
      const expectedTypes = observedContractTypes.get(fileIssues.file);

      if (issueType === "types" && name && expectedTypes?.has(name)) {
        expectedTypes.set(name, expectedTypes.get(name) + 1);
        continue;
      }

      violations.push(`${fileIssues.file}: ${issueType} ${name ?? JSON.stringify(issue)}`);
    }
  }
}

for (const [file, expectedTypes] of observedContractTypes) {
  for (const [name, count] of expectedTypes) {
    if (count !== 1) {
      violations.push(
        `${file}: forventet nøyaktig ett beholdt typefunn for ${name}, men fant ${count}`
      );
    }
  }
}

if (violations.length > 0) {
  console.error("Den statiske analysen avviker fra den lukkede kontrakten.");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

const allowedTypeCount = [...allowedUnusedContractTypes.values()].reduce(
  (count, names) => count + names.size,
  0
);

console.log(
  `Statisk analyse er grønn: ingen runtime-, eksport-, import- eller pakkefunn; ${allowedTypeCount} eksakt registrerte transporttyper er beholdt.`
);
