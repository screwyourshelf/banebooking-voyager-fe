import { lazy, Suspense } from "react";

import { Textarea } from "@/components/ui/textarea";
import type { TiptapEditorProps } from "./TiptapEditor";

const TiptapEditor = lazy(() => import("./TiptapEditor"));

export default function LazyTiptapEditor(props: TiptapEditorProps) {
  return (
    <Suspense
      fallback={
        <Textarea
          aria-label="Laster teksteditor"
          placeholder="Laster teksteditor…"
          disabled
          className={props.className}
        />
      }
    >
      <TiptapEditor {...props} />
    </Suspense>
  );
}
