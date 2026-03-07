import { useEffect } from "react";
import { useSlug } from "./useSlug";

export function useDynamicFavicons() {
  const slug = useSlug();
  const base = import.meta.env.BASE_URL ?? "/";

  useEffect(() => {
    if (!slug) return;

    const updateFavicon = (type: "svg" | "ico" | "apple-touch-icon", selector: string) => {
      const fileName = type === "apple-touch-icon" ? "apple-touch-icon.png" : `favicon.${type}`;
      const href = `${base}klubber/${slug}/img/favicon/${fileName}`;
      const fallback = `${base}${fileName}`;

      const link = document.querySelector<HTMLLinkElement>(selector);

      if (link) {
        fetch(href, { method: "HEAD" })
          .then((r) => (link.href = r.ok ? href : fallback))
          .catch(() => (link.href = fallback));
      }
    };

    updateFavicon("svg", 'link[rel="icon"][type="image/svg+xml"]');
    updateFavicon("ico", 'link[rel="icon"][sizes="any"]');
    updateFavicon("apple-touch-icon", 'link[rel="apple-touch-icon"]');
  }, [slug, base]);
}
