import AppDialog from "./AppDialog";
import EditorDialog from "./EditorDialog";

const Dialog = Object.assign(AppDialog, {
  Editor: EditorDialog,
});

export default Dialog;
