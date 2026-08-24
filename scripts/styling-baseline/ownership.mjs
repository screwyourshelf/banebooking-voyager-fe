const patternFamilies = [
  {
    checkpoint: "SWP-4.2",
    family: "app-shell",
    matches: (name) => name === "app-shell",
  },
  {
    checkpoint: "SWP-4.1",
    family: "navigation",
    matches: (name) => name.startsWith("navigation"),
  },
  {
    checkpoint: "SWP-3.3",
    family: "collection",
    matches: (name) => name.startsWith("collection") || name === "row-list",
  },
  {
    checkpoint: "SWP-3.2",
    family: "form-and-settings",
    matches: (name) => name.startsWith("form") || name.startsWith("settings"),
  },
  {
    checkpoint: "SWP-3.4",
    family: "dialog-tabs-and-editor",
    matches: (name) =>
      ["dialog", "editor", "editor-dialog", "tabs"].includes(name) || name.startsWith("rich-text"),
  },
  {
    checkpoint: "SWP-3.5",
    family: "shared-data-patterns",
    matches: (name) => name.startsWith("metric") || ["schedule-time", "weather"].includes(name),
  },
  {
    checkpoint: "SWP-3.1",
    family: "page-section-feedback-and-document",
    matches: (name) =>
      name.startsWith("page") ||
      name.startsWith("section") ||
      name.startsWith("document") ||
      ["action-feedback", "visually-hidden"].includes(name),
  },
];

const patternKeyframeFamilies = new Map([
  ["page-loading-sheen", "page-section-feedback-and-document"],
  ["collection-loading", "collection"],
  ["form-submit-spin", "form-and-settings"],
  ["navigation-loading", "navigation"],
  ["app-desktop-content-enter", "app-shell"],
]);

const primitiveFamilies = [
  {
    checkpoint: "SWP-2.1",
    family: "primitive-base-and-text-controls",
    matches: (name) => ["button", "icon", "input", "textarea"].includes(name),
  },
  {
    checkpoint: "SWP-2.2",
    family: "primitive-choices-and-accordion",
    matches: (name) => name.startsWith("accordion") || ["choice", "radio", "switch"].includes(name),
  },
  {
    checkpoint: "SWP-2.3",
    family: "primitive-overlays-and-date-controls",
    matches: (name) =>
      name.startsWith("calendar") ||
      name.startsWith("date-") ||
      name.startsWith("dialog-") ||
      name.startsWith("select-") ||
      ["multi-date-picker", "tabs"].includes(name),
  },
  {
    checkpoint: "SWP-2.4",
    family: "primitive-rich-text-editor",
    matches: (name) => name.startsWith("rich-text-editor"),
  },
];

export function ownerForStylesheet({
  file,
  line,
  selectorFacts = emptySelectorFacts(),
  keyframeName = null,
}) {
  if (file === "src/index.css" || file.endsWith("/tokens.css")) {
    return owner("theme-and-tokens", "src/lib/platform/theme", "SWP-1.1");
  }

  if (file === "src/styles/design-system.css") {
    return owner("global-stylesheet-entry", "src/styles", "SWP-1.2");
  }

  if (
    file.endsWith("/feature-compositions.css") ||
    selectorFacts.classes.some((name) => name.startsWith("statistics-")) ||
    selectorFacts.attributes.some(
      ({ name, value }) => name === "data-context" && value === "statistics"
    )
  ) {
    return owner("statistics-visualization", "src/lib/features/statistics", "SWP-5.2");
  }

  const uiName = selectorFacts.uiNames.find(Boolean);
  const patternFamily = patternFamilies.find(({ matches }) => uiName && matches(uiName));
  if (patternFamily) {
    return owner(patternFamily.family, "src/lib/ui/patterns", patternFamily.checkpoint);
  }

  const primitiveName = selectorFacts.primitiveNames.find(Boolean);
  const primitiveFamily = primitiveFamilies.find(
    ({ matches }) => primitiveName && matches(primitiveName)
  );

  if (file.endsWith("/primitives.css")) {
    if (primitiveFamily) {
      return owner(primitiveFamily.family, "src/lib/ui/primitives", primitiveFamily.checkpoint);
    }
    if (selectorFacts.classes.includes("ProseMirror") || line >= 40) {
      return owner("primitive-rich-text-editor", "src/lib/ui/primitives", "SWP-2.4");
    }
    return owner("global-base", "src/styles", "SWP-1.2");
  }

  if (file.endsWith("/patterns.css")) {
    const keyframeFamily = patternKeyframeFamilies.get(keyframeName);
    if (keyframeFamily) {
      return owner(keyframeFamily, "src/lib/ui/patterns", "SWP-5.4");
    }
    if (primitiveFamily) {
      return owner("pattern-control-composition", "src/lib/ui/patterns", "SWP-3.3");
    }
    return owner("shared-product-patterns", "src/lib/ui/patterns", "SWP-5.4");
  }

  if (file.endsWith("/responsive.css")) {
    if (primitiveFamily) {
      return owner(primitiveFamily.family, "src/lib/ui/primitives", primitiveFamily.checkpoint);
    }
    return owner("global-responsive-and-motion", "src/styles", "SWP-5.4");
  }

  return owner("unclassified-global-style", "src/styles", "SWP-5.4");
}

export function ownerForMarkup(file) {
  if (file === "src/app.html") {
    return owner("startup-document", "src/app.html", null);
  }

  const featureMatch = file.match(/^src\/lib\/features\/([^/]+)\//);
  if (featureMatch) {
    const featureName = featureMatch[1];
    return owner(
      featureName === "statistics" ? "statistics-visualization" : `feature-${featureName}`,
      `src/lib/features/${featureName}`,
      featureName === "statistics" ? "SWP-5.2" : "SWP-5.1"
    );
  }

  if (file.startsWith("src/routes/")) {
    return owner("routes", "src/routes", "SWP-5.1");
  }

  if (file.startsWith("src/lib/ui/primitives/")) {
    const name =
      file
        .split("/")
        .at(-1)
        ?.replace(/\.svelte$/, "")
        .toLowerCase() ?? "";
    const primitiveFamily = primitiveFamilies.find(({ matches }) => matches(name));
    return owner(
      primitiveFamily?.family ?? "ui-primitives",
      "src/lib/ui/primitives",
      primitiveFamily?.checkpoint ?? "SWP-2"
    );
  }

  if (file.startsWith("src/lib/ui/patterns/")) {
    const name =
      file
        .split("/")
        .at(-1)
        ?.replace(/\.svelte$/, "")
        .toLowerCase() ?? "";
    const patternFamily = patternFamilies.find(({ matches }) => matches(name));
    return owner(
      patternFamily?.family ?? "shared-product-patterns",
      "src/lib/ui/patterns",
      patternFamily?.checkpoint ?? "SWP-3"
    );
  }

  if (file.startsWith("src/lib/platform/theme/")) {
    return owner("theme-and-tokens", "src/lib/platform/theme", "SWP-1.1");
  }

  if (file.startsWith("src/lib/platform/")) {
    return owner("platform", "src/lib/platform", null);
  }

  return owner("application-composition", "src", null);
}

export function emptySelectorFacts() {
  return { attributes: [], classes: [], primitiveNames: [], uiNames: [] };
}

function owner(ownerFamily, ownerPackage, plannedRemovalCheckpoint) {
  return { ownerFamily, ownerPackage, plannedRemovalCheckpoint };
}
