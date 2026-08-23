import { createContext } from "svelte";

type FormFieldsContext = { readonly name: "form-fields" };

const [getFormFieldsContext, setFormFieldsContext] = createContext<FormFieldsContext | undefined>();
export { setFormFieldsContext };

export function isInsideFormFields(): boolean {
  try {
    return getFormFieldsContext()?.name === "form-fields";
  } catch {
    return false;
  }
}
