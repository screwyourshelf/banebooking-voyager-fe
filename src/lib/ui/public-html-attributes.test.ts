import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";

const publicHtmlComponentNames = [
  "Button",
  "ButtonLink",
  "Collection",
  "CollectionList",
  "Dialog",
  "Document",
  "DocumentFacts",
  "DocumentIntro",
  "DocumentSection",
  "EditorDialog",
  "Form",
  "FormActions",
  "FormField",
  "FormFields",
  "FormSubmit",
  "Input",
  "Navigation",
  "NavigationAction",
  "NavigationIdentity",
  "NavigationLink",
  "NavigationList",
  "NavigationSection",
  "Page",
  "Section",
  "SettingsPanel",
  "SettingsRange",
  "SettingsRow",
  "SettingsSection",
  "SettingsStack",
  "SettingsSwitchRow",
  "Textarea",
] as const;

type PublicHtmlComponents = {
  Button: typeof import("./primitives/Button.svelte").default;
  ButtonLink: typeof import("./primitives/ButtonLink.svelte").default;
  Collection: typeof import("./patterns/Collection.svelte").default;
  CollectionList: typeof import("./patterns/CollectionList.svelte").default;
  Dialog: typeof import("./patterns/Dialog.svelte").default;
  Document: typeof import("./patterns/Document.svelte").default;
  DocumentFacts: typeof import("./patterns/DocumentFacts.svelte").default;
  DocumentIntro: typeof import("./patterns/DocumentIntro.svelte").default;
  DocumentSection: typeof import("./patterns/DocumentSection.svelte").default;
  EditorDialog: typeof import("./patterns/EditorDialog.svelte").default;
  Form: typeof import("./patterns/Form.svelte").default;
  FormActions: typeof import("./patterns/FormActions.svelte").default;
  FormField: typeof import("./patterns/FormField.svelte").default;
  FormFields: typeof import("./patterns/FormFields.svelte").default;
  FormSubmit: typeof import("./patterns/FormSubmit.svelte").default;
  Input: typeof import("./primitives/Input.svelte").default;
  Navigation: typeof import("./patterns/Navigation.svelte").default;
  NavigationAction: typeof import("./patterns/NavigationAction.svelte").default;
  NavigationIdentity: typeof import("./patterns/NavigationIdentity.svelte").default;
  NavigationLink: typeof import("./patterns/NavigationLink.svelte").default;
  NavigationList: typeof import("./patterns/NavigationList.svelte").default;
  NavigationSection: typeof import("./patterns/NavigationSection.svelte").default;
  Page: typeof import("./patterns/Page.svelte").default;
  Section: typeof import("./patterns/Section.svelte").default;
  SettingsPanel: typeof import("./patterns/SettingsPanel.svelte").default;
  SettingsRange: typeof import("./patterns/SettingsRange.svelte").default;
  SettingsRow: typeof import("./patterns/SettingsRow.svelte").default;
  SettingsSection: typeof import("./patterns/SettingsSection.svelte").default;
  SettingsStack: typeof import("./patterns/SettingsStack.svelte").default;
  SettingsSwitchRow: typeof import("./patterns/SettingsSwitchRow.svelte").default;
  Textarea: typeof import("./primitives/Textarea.svelte").default;
};

type StylingPropAudit = {
  [Name in keyof PublicHtmlComponents]: Extract<
    keyof ComponentProps<PublicHtmlComponents[Name]>,
    "class" | "style"
  >;
};

type ComponentsWithStylingProps = {
  [Name in keyof StylingPropAudit]: [StylingPropAudit[Name]] extends [never] ? never : Name;
}[keyof StylingPropAudit];

type RegisteredName = (typeof publicHtmlComponentNames)[number];
type ComponentNameMismatch =
  | Exclude<keyof PublicHtmlComponents, RegisteredName>
  | Exclude<RegisteredName, keyof PublicHtmlComponents>;

const publicHtmlPropsContractIsClosed: [
  ComponentsWithStylingProps | ComponentNameMismatch,
] extends [never]
  ? true
  : false = true;

describe("public HTML prop ownership", () => {
  it("keeps class and style out of all 31 public forwarding components", () => {
    expect(publicHtmlComponentNames).toHaveLength(31);
    expect(publicHtmlPropsContractIsClosed).toBe(true);
  });
});
