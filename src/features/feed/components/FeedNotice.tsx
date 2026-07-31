import { ArrowUpRight, Megaphone } from "lucide-react";

import { useFeed } from "@/hooks/useFeed";

import NotifikasjonDrawer from "./NotifikasjonDrawer";

function tekstFraRss(innhold: string | null) {
  if (!innhold) return "";

  return innhold
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function FeedNotice() {
  const { feed = [], isLoading } = useFeed();

  if (isLoading || feed.length === 0) return null;

  const nyeste = feed[0];
  const ingress = tekstFraRss(nyeste.innhold);

  return (
    <aside className="feed-notice" aria-label="Melding fra klubben">
      <div className="feed-notice__icon" aria-hidden="true">
        <Megaphone className="size-5" />
      </div>

      <div className="feed-notice__content">
        <div className="feed-notice__eyebrow">Fra klubben</div>
        <a
          href={nyeste.lenke}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-notice__title"
        >
          {nyeste.tittel}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
        {ingress ? <p className="feed-notice__copy">{ingress}</p> : null}
      </div>

      {feed.length > 1 ? <NotifikasjonDrawer trigger="text" /> : null}
    </aside>
  );
}
