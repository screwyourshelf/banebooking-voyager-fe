import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";

export default function ScoreInput(
  props: Omit<ComponentProps<typeof Input>, "className" | "type">
) {
  return <Input {...props} type="number" className="score-input" />;
}
