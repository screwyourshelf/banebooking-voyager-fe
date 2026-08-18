import type { ReactNode } from "react";
import Page from "@/components/Page";
import PageHeader from "@/components/layout/PageHeader";

export default function LoginPageLayout({ children }: { children: ReactNode }) {
  return (
    <Page width="lg" className="login-page">
      <PageHeader
        eyebrow="Min konto"
        title="Logg inn"
        description="Book bane og hold oversikt over tidene dine."
        className="login-page__heading"
      />

      <div className="login-page__layout">
        <section className="login-page__surface" aria-labelledby="login-method-heading">
          <header className="control-surface login-page__surface-header">
            <strong id="login-method-heading">Velg innlogging</strong>
            <span>Bruk en innloggingstjeneste eller få kode på e-post.</span>
          </header>
          <div className="login-page__panel">{children}</div>
        </section>
      </div>
    </Page>
  );
}
