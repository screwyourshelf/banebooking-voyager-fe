import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";

export default function DateTimeInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  return <Input type="datetime-local" {...props} />;
}
