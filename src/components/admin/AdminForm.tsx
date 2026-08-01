import type { ComponentProps, ReactNode } from "react";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";

type FormProps = Omit<ComponentProps<typeof FormLayout>, "className">;

export function AdminEditorForm(props: FormProps) {
  return <FormLayout className="admin-editor-form" {...props} />;
}

export function AdminFormActions({ children }: { children: ReactNode }) {
  return (
    <FormActions
      variant="inline"
      align="right"
      spaced={false}
      className="admin-form__actions admin-form__actions--embedded"
    >
      {children}
    </FormActions>
  );
}

type SubmitProps = Omit<ComponentProps<typeof FormSubmitButton>, "className">;

export function AdminFormSubmitButton(props: SubmitProps) {
  return <FormSubmitButton className="admin-form__submit" {...props} />;
}
