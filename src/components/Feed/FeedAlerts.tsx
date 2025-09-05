import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BellRing, XIcon } from "lucide-react";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert.js";
import { useFeed } from "../../hooks/useFeed.js";

const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 timer

export default function FeedAlerts() {
  const { slug } = useParams<{ slug: string }>();
  const { data: feed = [], isLoading } = useFeed(slug);
  const [dismissedItems, setDismissedItems] = useState<Record<string, number>>(
    {}
  ); // link -> timestamp

  useEffect(() => {
    if (!slug || !feed) return;

    const key = `feed-dismissed-${slug}`;
    const stored = localStorage.getItem(key);
    const parsed: Record<string, number> = stored ? JSON.parse(stored) : {};

    const now = Date.now();
    const valid = Object.fromEntries(
      Object.entries(parsed).filter(
        ([, timestamp]) => now - timestamp < DISMISS_DURATION_MS
      )
    );

    setDismissedItems(valid);
    localStorage.setItem(key, JSON.stringify(valid)); // rydder gamle
  }, [slug, feed]);

  function dismissItem(id: string) {
    const now = Date.now();
    const updated = { ...dismissedItems, [id]: now };
    setDismissedItems(updated);
    if (slug) {
      localStorage.setItem(`feed-dismissed-${slug}`, JSON.stringify(updated));
    }
  }

  if (isLoading || feed.length === 0) return null;

  const activeFeed = feed.filter((item) => {
    const itemId = item.link || item.title;
    return !dismissedItems[itemId];
  });

  if (activeFeed.length === 0) return null;

  return (
    <div className="max-w-screen-sm mx-auto space-y-2">
      {activeFeed.map((item) => {
        const itemId = item.link || item.title;

        return (
          <Alert
            key={itemId}
            className="relative pr-10 bg-pink-50 border border-pink-200 shadow-md rounded-md animate__animated animate__fadeIn"
          >
            <BellRing className="text-pink-600 w-5 h-5 animate__animated animate__swing animate__slower" />
            <div>
              <AlertTitle className="font-semibold text-pink-800">
                {item.title}
              </AlertTitle>
              <AlertDescription>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sm text-pink-700"
                >
                  Les mer
                </a>
              </AlertDescription>
            </div>
            <button
              className="absolute top-2 right-2 text-pink-400 hover:text-pink-700 transition-colors"
              onClick={() => dismissItem(itemId)}
              aria-label="Lukk melding"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </Alert>
        );
      })}
    </div>
  );
}
