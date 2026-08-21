import FormActions from "./FormActions";
import FormField, { FormFields } from "./FormField";
import FormLayout from "./FormLayout";
import FormSteps from "./FormSteps";
import FormSubmitButton from "./FormSubmitButton";

const Form = Object.assign(FormLayout, {
  Actions: FormActions,
  Field: FormField,
  Fields: FormFields,
  Steps: FormSteps,
  Submit: FormSubmitButton,
});

export default Form;
