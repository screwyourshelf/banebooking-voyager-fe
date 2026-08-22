import { createContext } from "svelte";

type FormFieldsContext = { readonly name: "form-fields" };

export const [getFormFieldsContext, setFormFieldsContext] = createContext<
  FormFieldsContext | undefined
>();

export function isInsideFormFields(): boolean {
  try {
    return getFormFieldsContext()?.name === "form-fields";
  } catch {
    return false;
  }
}
