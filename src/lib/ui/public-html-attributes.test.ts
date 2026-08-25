import type { Component } from "svelte";
import { describe, expect, it } from "vitest";

type PublicUiModule = typeof import("./index");

type ComponentNames<Module> = {
  [Name in keyof Module]: Module[Name] extends Component<infer _Props> ? Name : never;
}[keyof Module];

type ComponentNamesWithStylingProps<Module> = {
  [Name in keyof Module]: Module[Name] extends Component<infer Props>
    ? Extract<keyof Props, "class" | "style"> extends never
      ? never
      : Name
    : never;
}[keyof Module];

type PublicComponentsWithStylingProps = ComponentNamesWithStylingProps<PublicUiModule>;
type PublicNonComponentExports = Exclude<keyof PublicUiModule, ComponentNames<PublicUiModule>>;
type BroadForwarderProbe = Component<{ class?: string; style?: string; title: string }>;
type BroadForwarderProbeResult = ComponentNamesWithStylingProps<{
  BroadForwarder: BroadForwarderProbe;
}>;

const publicUiBarrelContractIsClosed: [PublicComponentsWithStylingProps] extends [never]
  ? true
  : false = true;
const publicUiBarrelDiscoveryIsComplete: [keyof PublicUiModule] extends [never]
  ? false
  : [PublicNonComponentExports] extends [never]
    ? true
    : false = true;
const broadForwarderProbeIsRejected: BroadForwarderProbeResult extends "BroadForwarder"
  ? true
  : false = true;

describe("public HTML prop ownership", () => {
  it("derives every public component from the UI barrel and omits class and style", () => {
    expect(publicUiBarrelContractIsClosed).toBe(true);
    expect(publicUiBarrelDiscoveryIsComplete).toBe(true);
    expect(broadForwarderProbeIsRejected).toBe(true);
  });
});
