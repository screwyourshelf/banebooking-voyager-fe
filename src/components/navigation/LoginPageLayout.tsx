import type { ReactNode } from "react";
import { Page } from "@/components";

export default function LoginPageLayout({ children }: { children: ReactNode }) {
  return (
    <Page
      className="login-page"
      eyebrow="Min konto"
      title="Logg inn"
      description="Book bane og hold oversikt over tidene dine."
    >
      <div className="login-page__layout">
        <section className="login-page__surface" aria-labelledby="login-method-heading">
          <header className="login-page__surface-header" data-surface="control">
            <strong id="login-method-heading">Velg innlogging</strong>
            <span>Bruk en innloggingstjeneste eller få kode på e-post.</span>
          </header>
          <div className="login-page__panel">{children}</div>
        </section>
      </div>
    </Page>
  );
}
