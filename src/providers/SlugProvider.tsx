import { ReactNode } from "react";
import { SlugContext } from "@/contexts/SlugContext";

type Props = {
  slug: string;
  children: ReactNode;
};

export default function SlugProvider({ slug, children }: Props) {
  return <SlugContext.Provider value={slug}>{children}</SlugContext.Provider>;
}
