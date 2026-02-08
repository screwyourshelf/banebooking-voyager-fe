import { useEffect, useState } from "react";
import { BellRing, XIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useFeed } from "@/hooks/useFeed";
import { useSlug } from "@/hooks/useSlug";
import { config } from "@/config";

export default function FeedAlerts() {
    const slug = useSlug();
    const { feed = [], isLoading } = useFeed();

    const [dismissedItems, setDismissedItems] = useState<Record<string, number>>({});

    useEffect(() => {
        const key = `feed-dismissed-${slug}`;
        const stored = localStorage.getItem(key);

        let parsed: Record<string, number> = {};
        try {
            parsed = stored ? (JSON.parse(stored) as Record<string, number>) : {};
        } catch {
            parsed = {};
        }

        const now = Date.now();
        const valid = Object.fromEntries(
            Object.entries(parsed).filter(([, ts]) => now - ts < config.feedDismissDurationMs)
        );

        setDismissedItems(valid);
        localStorage.setItem(key, JSON.stringify(valid));
    }, [slug]);

    const dismissItem = (id: string) => {
        const key = `feed-dismissed-${slug}`;
        const now = Date.now();

        setDismissedItems((prev) => {
            const updated = { ...prev, [id]: now };
            localStorage.setItem(key, JSON.stringify(updated));
            return updated;
        });
    };

    if (isLoading || feed.length === 0) return null;

    const activeFeed = feed.filter((item) => {
        const itemId = item.lenke || item.tittel;
        return !dismissedItems[itemId];
    });

    if (activeFeed.length === 0) return null;

    return (
        <div className="max-w-screen-sm mx-auto space-y-2">
            {activeFeed.map((item) => {
                const itemId = item.lenke || item.tittel;

                return (
                    <Alert
                        key={itemId}
                        className="relative pr-10 bg-pink-50 border border-pink-200 shadow-md rounded-md animate__animated animate__fadeIn"
                    >
                        <BellRing className="text-pink-600 w-5 h-5 animate__animated animate__swing animate__slower" />
                        <div>
                            <AlertTitle className="font-semibold text-pink-800">
                                {item.tittel}
                            </AlertTitle>
                            <AlertDescription>
                                <a
                                    href={item.lenke}
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
