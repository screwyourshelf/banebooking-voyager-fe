import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";

export default function ScoreInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  return <Input {...props} type="number" />;
}
