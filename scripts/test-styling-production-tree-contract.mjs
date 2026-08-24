import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeStylingSource } from "./styling-guards/analyze.mjs";
import { loadStylingGuardContract } from "./styling-guards/contract.mjs";
import {
  assertNoProductionStylingDiagnostics,
  analyzeProductionStylingTree,
  checkStylingProductionTree,
  collectProductionStylingSourcePaths,
} from "./styling-guards/production-tree-contract.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const fixturesRoot = path.join(projectRoot, "scripts/styling-guards/fixtures");
const contract = await loadStylingGuardContract();
const manifest = JSON.parse(await readFile(path.join(fixturesRoot, "manifest.json"), "utf8"));

await checkStylingProductionTree(projectRoot);
assert.equal(Object.hasOwn(contract.productionTree, "legacyBaselinePath"), false);
await proveProductionDiscoveryIsNarrowAndExplicit();
await proveCustomPropertyReferencesResolveAcrossTheProject();
await proveEveryProductionRuleRejectsANewOccurrence();
proveMarkupMutationChannelsCannotBypass();

console.log(
  `Styling-produksjonstreets kontrakt er bevist for ${contract.productionTree.enforcedRuleIds.length} regler.`
);

async function proveProductionDiscoveryIsNarrowAndExplicit() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "banebooking-styling-tree-"));
  try {
    await mkdir(path.join(temporaryRoot, "src/generated"), { recursive: true });
    await Promise.all([
      writeFile(path.join(temporaryRoot, "src/base.css"), "@layer base {}\n"),
      writeFile(path.join(temporaryRoot, "src/Screen.svelte"), "<div>Produksjon</div>\n"),
      writeFile(
        path.join(temporaryRoot, "src/Guard.fixture.svelte"),
        "<div>Fixture-navn i produksjon</div>\n"
      ),
      writeFile(
        path.join(temporaryRoot, "src/generated/Generated.svelte"),
        "<div>Generert navn i produksjon</div>\n"
      ),
      writeFile(
        path.join(temporaryRoot, "src/Guard.test.svelte"),
        "<div>Eksplisitt testfixture</div>\n"
      ),
      writeFile(path.join(temporaryRoot, "src/ignored.ts"), "export const ignored = true;\n"),
    ]);

    assert.deepEqual(await collectProductionStylingSourcePaths(temporaryRoot, contract), [
      "src/Guard.fixture.svelte",
      "src/Screen.svelte",
      "src/base.css",
      "src/generated/Generated.svelte",
    ]);
  } finally {
    await rm(temporaryRoot, { recursive: true });
  }
}

async function proveCustomPropertyReferencesResolveAcrossTheProject() {
  const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "banebooking-styling-reference-"));
  const tokenPath = path.join(temporaryRoot, "src/styles/design-system/tokens.css");
  const entryPath = path.join(temporaryRoot, "src/index.css");
  try {
    await mkdir(path.dirname(tokenPath), { recursive: true });
    await writeFile(tokenPath, "@layer theme { :root { --app-guard-cross-file: #fff; } }\n");
    await writeFile(
      entryPath,
      "@theme inline { --color-guard-cross-file: var(--app-guard-cross-file); }\n"
    );

    const resolved = await analyzeProductionStylingTree(temporaryRoot, contract);
    assert.deepEqual(resolved.diagnostics, []);

    await writeFile(entryPath, "@theme inline { --color-guard-cross-file: #fff; }\n");
    const unresolved = await analyzeProductionStylingTree(temporaryRoot, contract);
    assert.equal(unresolved.diagnostics.length, 1);
    assert.equal(unresolved.diagnostics[0].ruleId, contract.rules.customProperty.id);
    assert.match(unresolved.diagnostics[0].message, /uten en registrert konsument/);
  } finally {
    await rm(temporaryRoot, { recursive: true });
  }
}

async function proveEveryProductionRuleRejectsANewOccurrence() {
  for (const ruleId of contract.productionTree.enforcedRuleIds) {
    const fixture = manifest.fixtures.find(
      ({ diagnostics, outcome }) =>
        outcome === "rejected" && diagnostics.some((diagnostic) => diagnostic.ruleId === ruleId)
    );
    assert.ok(fixture, `${ruleId} mangler en negativ produksjonsfixture.`);

    const source = await readFile(path.join(fixturesRoot, fixture.fixture), "utf8");
    const newDiagnostics = analyzeStylingSource({
      contract,
      source,
      sourcePath: fixture.sourcePath,
    }).filter((diagnostic) => diagnostic.ruleId === ruleId);
    assert.ok(newDiagnostics.length > 0, `${ruleId} produserte ingen diagnostics.`);
    const [newDiagnostic] = newDiagnostics;
    const expectedLocation = `${fixture.sourcePath}:${newDiagnostic.line}:${newDiagnostic.column} [${ruleId}]`;
    assert.throws(
      () => assertNoProductionStylingDiagnostics([newDiagnostic]),
      (error) => error instanceof Error && error.message.includes(expectedLocation)
    );
  }
}

function proveMarkupMutationChannelsCannotBypass() {
  const featurePath = "src/lib/features/example/MarkupMutation.svelte";
  const uiPath = "src/lib/ui/patterns/MarkupMutation.svelte";
  const cases = [
    {
      label: "expression class",
      source: '<script>let visual = "bg-red-500";</script><div class={visual}></div>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /kan ikke bruke class/,
    },
    {
      label: "case-insensitive native styling attributes",
      source: '<div CLASS="bg-red-500" STYLE="color:red"></div>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /kan ikke bruke class/,
    },
    {
      label: "case-insensitive SVG presentation attribute",
      source: '<svg><path FILL="red" /></svg>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /SVG-presentasjonsattributtet/,
    },
    {
      label: "case-insensitive SVG geometry attribute",
      source: '<svg VIEWBOX="0 0 10 10"></svg>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /SVG-geometriattributtet/,
    },
    {
      label: "native attribute spread",
      source: '<div {...{ class: "bg-red-500", style: "color:red" }}></div>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /attributtspread/,
    },
    {
      label: "public UI attribute spread",
      source:
        '<script>import { Page } from "$lib/ui"; let props = { title: "Baner" };</script><Page {...props} />',
      sourcePath: featurePath,
      ruleId: contract.rules.publicUiOverride.id,
      message: /attributtspread/,
    },
    {
      label: "dynamic element",
      source: '<svelte:element this="div" class="bg-red-500"></svelte:element>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /SvelteElement/,
    },
    {
      label: "dynamic component",
      source: "<script>let Component;</script><svelte:component this={Component} />",
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /SvelteComponent/,
    },
    {
      label: "raw HTML",
      source: '{@html `<div class="bg-red-500"></div>`}',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /\{@html\}/,
    },
    {
      label: "action",
      source: "<div use:decorate></div>",
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /UseDirective/,
    },
    {
      label: "attachment",
      source: "<div {@attach decorate}></div>",
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /AttachTag/,
    },
    {
      label: "transition",
      source: "<div transition:fade></div>",
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /TransitionDirective/,
    },
    {
      label: "stylesheet markup",
      source: '<svelte:head><link rel="stylesheet" href="/feature.css" /></svelte:head>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /stylesheet-markup/,
    },
    {
      label: "dynamic stylesheet markup",
      source:
        '<script>let relation = "stylesheet";</script><svelte:head><link REL={relation} href="/feature.css" /></svelte:head>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /stylesheet-markup/,
    },
    {
      label: "spread-overridden stylesheet markup",
      source:
        '<svelte:head><link rel="preload" {...{ rel: "stylesheet", href: "/feature.css" }} /></svelte:head>',
      sourcePath: featurePath,
      ruleId: contract.rules.featureStyling.id,
      message: /stylesheet-markup/,
    },
    {
      label: "public UI spread styling",
      source: '<div {...{ class: "bg-surface", style: "color:red" }}></div>',
      sourcePath: uiPath,
      ruleId: contract.rules.cssApplication.id,
      message: /class\/style/,
    },
  ];

  for (const mutation of cases) {
    const diagnostics = analyzeStylingSource({
      contract,
      source: mutation.source,
      sourcePath: mutation.sourcePath,
    });
    assert.ok(
      diagnostics.some(
        (entry) => entry.ruleId === mutation.ruleId && mutation.message.test(entry.message)
      ),
      `${mutation.label} passerte markupkontrakten uten forventet diagnostic.`
    );
  }

  const controlledIconSource = [
    '<script>let icon = [["path", { d: "M5 12h14", key: "line" }]];</script>',
    "<svg bind:this={iconRoot}>",
    "{#each icon as [element, attributes] (attributes.key)}",
    "{@const { key: _key, class: _class, style: _style, ...elementAttributes } = attributes}",
    "<svelte:element this={element} {...elementAttributes} />",
    "{/each}",
    "</svg>",
  ].join("\n");
  assert.deepEqual(
    analyzeStylingSource({
      contract,
      source: controlledIconSource,
      sourcePath: contract.markup.dynamicElementException.sourcePath,
    }),
    []
  );

  const unfilteredIconSource = controlledIconSource.replace(
    "key: _key, class: _class, style: _style, ...elementAttributes",
    "key: _key, ...elementAttributes"
  );
  assert.ok(
    analyzeStylingSource({
      contract,
      source: unfilteredIconSource,
      sourcePath: contract.markup.dynamicElementException.sourcePath,
    }).some(
      (entry) =>
        entry.ruleId === contract.rules.cssApplication.id && /SvelteElement/.test(entry.message)
    ),
    "Icon-unntaket godtok et ufiltrert dynamisk attributtspread."
  );

  const shadowedIconSource = controlledIconSource.replace(
    "<svelte:element this={element} {...elementAttributes} />",
    "{@const elementAttributes = attributes}\n<svelte:element this={element} {...elementAttributes} />"
  );
  assert.ok(
    analyzeStylingSource({
      contract,
      source: shadowedIconSource,
      sourcePath: contract.markup.dynamicElementException.sourcePath,
    }).some(
      (entry) =>
        entry.ruleId === contract.rules.cssApplication.id && /SvelteElement/.test(entry.message)
    ),
    "Icon-unntaket godtok et shadowed attributtspread uten direkte sanitiseringsbinding."
  );
}
