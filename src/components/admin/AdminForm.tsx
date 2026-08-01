import type { ComponentProps, ReactNode } from "react";
import { FormActions, FormLayout, FormSubmitButton } from "@/components/forms";
import { cn } from "@/lib/utils";

type FormProps = Omit<ComponentProps<typeof FormLayout>, "className">;

export function AdminEditorForm(props: FormProps) {
  return <FormLayout className="admin-editor-form" {...props} />;
}

export function AdminSettingsForm(props: FormProps) {
  return <FormLayout className="admin-settings-form" {...props} />;
}

export function AdminFormActions({
  children,
  embedded = true,
}: {
  children: ReactNode;
  embedded?: boolean;
}) {
  return (
    <FormActions
      variant="inline"
      align="right"
      spaced={false}
      className={cn("admin-form__actions", embedded && "admin-form__actions--embedded")}
    >
      {children}
    </FormActions>
  );
}

type SubmitProps = Omit<ComponentProps<typeof FormSubmitButton>, "className">;

export function AdminFormSubmitButton(props: SubmitProps) {
  return <FormSubmitButton className="admin-form__submit" {...props} />;
}
