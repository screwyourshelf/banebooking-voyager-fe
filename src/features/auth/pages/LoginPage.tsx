import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { LoginPageLayout } from "@/components/navigation";
import LoginPanel from "@/components/navigation/LoginPanel";
import { useAuth } from "@/hooks/useAuth";
import { useSlug } from "@/hooks/useSlug";
import { buildTenantRoute } from "@/utils/tenantRoute";

type LoginLocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

function getRequestedPath(state: LoginLocationState | null) {
  const from = state?.from;
  if (!from?.pathname || from.pathname.endsWith("/login")) return null;

  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}

export default function LoginPage() {
  const { currentUser, ready } = useAuth();
  const slug = useSlug();
  const location = useLocation();
  const navigate = useNavigate();
  const fallbackPath = buildTenantRoute(slug);
  const targetPath = getRequestedPath(location.state as LoginLocationState | null) ?? fallbackPath;

  if (!ready) return null;
  if (currentUser) return <Navigate to={targetPath} replace />;

  return (
    <LoginPageLayout>
      <LoginPanel
        showIntro={false}
        onLoginSuccess={() => navigate(targetPath, { replace: true })}
      />
    </LoginPageLayout>
  );
}
