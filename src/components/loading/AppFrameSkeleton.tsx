import { RouteContentSkeleton } from "./PageContentSkeleton";

export default function AppFrameSkeleton() {
  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <aside className="app-shell__sidebar" aria-hidden="true">
          <div className="app-sidebar app-frame-skeleton__sidebar-content">
            <span className="app-frame-skeleton__brand" />
            <div className="app-frame-skeleton__utilities">
              <span />
              <span />
            </div>
            <div className="app-frame-skeleton__navigation">
              {Array.from({ length: 7 }, (_, index) => (
                <span key={index} />
              ))}
            </div>
          </div>
        </aside>

        <div className="app-shell__workspace">
          <header className="app-shell__topbar" aria-hidden="true">
            <div className="app-topbar app-frame-skeleton__topbar-content">
              <span className="app-frame-skeleton__mobile-brand" />
              <span className="app-frame-skeleton__topbar-action" />
              <span className="app-frame-skeleton__topbar-action" />
            </div>
          </header>

          <main className="app-shell__main">
            <RouteContentSkeleton label="Starter Banebooking" />
          </main>
        </div>
      </div>

      <div className="mobile-bottom-nav app-frame-skeleton__mobile-navigation" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}
