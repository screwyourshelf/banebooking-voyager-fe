import { ArrowUpRight } from "lucide-react";

import {
  RecordCard,
  RecordCardStatic,
  RecordEyebrow,
  RecordSummaryCopy,
} from "@/components/records";
import { Button } from "@/components/ui/button";
import type { FeedItemRespons } from "@/types";

import { formatFeedDate, textFromFeedContent } from "../../feedPresentation";

type Props = {
  item: FeedItemRespons;
};

export default function NyhetRow({ item }: Props) {
  const publishedDate = formatFeedDate(item.publisertDato);
  const summary = textFromFeedContent(item.innhold);

  return (
    <RecordCard as="article">
      <RecordCardStatic layout="content-action">
        <div>
          <RecordEyebrow>
            {publishedDate ? (
              <time dateTime={item.publisertDato ?? undefined}>{publishedDate}</time>
            ) : (
              "Fra klubben"
            )}
          </RecordEyebrow>

          <RecordSummaryCopy title={item.tittel} description={summary || undefined} />
        </div>

        {item.lenke ? (
          <Button asChild variant="outline" size="sm">
            <a href={item.lenke} target="_blank" rel="noopener noreferrer">
              Les mer
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </RecordCardStatic>
    </RecordCard>
  );
}
