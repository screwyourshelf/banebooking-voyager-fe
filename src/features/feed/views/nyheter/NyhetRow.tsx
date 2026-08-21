import { ArrowUpRight } from "lucide-react";

import { Collection } from "@/components";
import { Button } from "@/components/ui/button";
import type { FeedItemRespons } from "@/types";

import { formatFeedDate, textFromFeedContent } from "../../feedPresentation";

type Props = {
  item: FeedItemRespons;
};

export default function NyhetRow({ item }: Props) {
  const publishedDate = formatFeedDate(item.publisertDato);
  const summary = textFromFeedContent(item.innhold);
  const action = item.lenke ? (
    <Button asChild variant="outline" size="sm">
      <a href={item.lenke} target="_blank" rel="noopener noreferrer">
        Les mer
        <ArrowUpRight aria-hidden="true" />
      </a>
    </Button>
  ) : null;

  return (
    <Collection.Row
      meta={
        publishedDate ? (
          <time dateTime={item.publisertDato ?? undefined}>{publishedDate}</time>
        ) : (
          "Fra klubben"
        )
      }
      title={item.tittel}
      description={summary || undefined}
      interaction={action ? { type: "action", action } : { type: "static" }}
    />
  );
}
