import { RouteContentSkeleton } from "./PageContentSkeleton";

export default function AppFrameSkeleton() {
  return (
    <div data-ui="app-shell">
      <div data-part="frame">
        <aside data-part="sidebar" aria-hidden="true">
          <div className="app-sidebar" data-ui="frame-skeleton-sidebar">
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

        <div data-part="workspace">
          <header data-part="topbar" aria-hidden="true">
            <div className="app-topbar" data-ui="frame-skeleton-topbar">
              <span className="app-frame-skeleton__mobile-brand" />
              <span className="app-frame-skeleton__topbar-action" />
              <span className="app-frame-skeleton__topbar-action" />
            </div>
          </header>

          <main data-part="main">
            <RouteContentSkeleton label="Starter Banebooking" />
          </main>
        </div>
      </div>

      <div className="mobile-bottom-nav" data-ui="frame-skeleton-mobile-nav" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}
