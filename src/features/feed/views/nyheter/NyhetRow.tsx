import { ArrowUpRight } from "lucide-react";

import { RecordCard, RecordCardStatic, RecordEyebrow } from "@/components/records";
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
        <div className="news-card__content">
          <RecordEyebrow>
            {publishedDate ? (
              <time dateTime={item.publisertDato ?? undefined}>{publishedDate}</time>
            ) : (
              "Fra klubben"
            )}
          </RecordEyebrow>

          <h2 className="news-card__title">{item.tittel}</h2>
          {summary ? <p className="news-card__summary">{summary}</p> : null}
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
