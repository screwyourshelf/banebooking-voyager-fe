import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "@/config";

function cleanSlug(raw: string | null): string {
  const s = (raw ?? "").trim();

  // Fjern leading/trailing slash + alt etter ? eller #
  const noHashQuery = s.split("#")[0].split("?")[0];
  const trimmed = noHashQuery.replace(/^\/+|\/+$/g, "");

  return trimmed || config.defaultSlug;
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const slug = cleanSlug(localStorage.getItem("slug"));
    navigate(`/${slug}`, { replace: true });
  }, [navigate]);

  return <div className="p-4 text-center">Logger inn ...</div>;
}
