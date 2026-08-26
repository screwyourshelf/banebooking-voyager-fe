import type { Snippet } from "svelte";
import type { SelectOption } from "../primitives/Select.svelte";

export type CollectionChoiceContext = {
  disabled: boolean;
  onSelect: () => void;
  selected: boolean;
};

type CollectionChoiceOption = {
  control?: Snippet<[CollectionChoiceContext]>;
  disabled?: boolean;
  label: string;
  value: string;
};

export type CollectionControlGroup = {
  label: string;
  onSelect: (value: string) => void;
  options: readonly CollectionChoiceOption[];
  selectedValues: readonly string[];
};

export type CollectionSearchControl = {
  label: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  value: string;
};

export type CollectionSortControl = {
  label: string;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  value: string;
};

type CollectionControlFieldBase = {
  disabled?: boolean;
  id: string;
  pending?: boolean;
  width?: "default" | "wide";
};

export type CollectionControlField =
  | (CollectionControlFieldBase & {
      label: string;
      max?: string;
      min?: string;
      onValueChange: (value: string) => void;
      type: "date";
      value: string;
    })
  | (CollectionControlFieldBase & {
      label: string;
      onValueChange: (value: string) => void;
      options: readonly SelectOption[];
      placeholder?: string;
      type: "select";
      value: string;
    })
  | (CollectionControlFieldBase & {
      checked: boolean;
      description?: string;
      onCheckedChange: (checked: boolean) => void;
      title: string;
      type: "switch";
    });
