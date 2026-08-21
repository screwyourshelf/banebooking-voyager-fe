import { createContext, useContext, type ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

const FormFieldsContext = createContext(false);

export function FormFields({ children }: { children: ReactNode }) {
  return (
    <FormFieldsContext.Provider value>
      <div data-ui="form-fields">{children}</div>
    </FormFieldsContext.Provider>
  );
}

export default function FormField({
  label,
  description,
  htmlFor,
  error,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  htmlFor?: string;
  error?: ReactNode;
  children: ReactNode;
}) {
  const isInsideFormFields = useContext(FormFieldsContext);

  if (!isInsideFormFields) {
    throw new Error("Form.Field må brukes inni Form.Fields for å beholde felles skjemalayout.");
  }

  return (
    <Field data-ui="form-field" data-invalid={Boolean(error) || undefined}>
      <div data-part="intro">
        <FieldLabel htmlFor={htmlFor} data-part="label">
          {label}
        </FieldLabel>
        {description ? (
          <FieldDescription data-part="description">{description}</FieldDescription>
        ) : null}
      </div>
      <div data-part="control">
        {children}
        {error ? <FieldError>{error}</FieldError> : null}
      </div>
    </Field>
  );
}
