import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Page from "@/components/Page";
import { PageHeader } from "@/components/layout";
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
    <Page width="lg" className="login-page">
      <PageHeader
        eyebrow="Min konto"
        title="Logg inn"
        description="Book bane og hold oversikt over tidene dine."
      />

      <div className="login-page__layout">
        <section className="login-page__surface" aria-labelledby="login-method-heading">
          <header className="control-surface login-page__surface-header">
            <strong id="login-method-heading">Velg innlogging</strong>
            <span>Bruk en innloggingstjeneste eller få kode på e-post.</span>
          </header>

          <div className="login-page__panel">
            <LoginPanel
              showIntro={false}
              onLoginSuccess={() => navigate(targetPath, { replace: true })}
            />
          </div>
        </section>
      </div>
    </Page>
  );
}
