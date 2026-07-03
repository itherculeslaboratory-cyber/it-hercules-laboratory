import { Link, useLocation } from "react-router-dom";
import { groupScreens, screensData } from "../lib/catalog";

type LabSidebarProps = {
  showHotspots: boolean;
  showLabels: boolean;
  onToggleHotspots: (v: boolean) => void;
  onToggleLabels: (v: boolean) => void;
};

export function LabSidebar({
  showHotspots,
  showLabels,
  onToggleHotspots,
  onToggleLabels,
}: LabSidebarProps) {
  const location = useLocation();
  const groups = groupScreens();
  const activeId = location.pathname.startsWith("/s/") ? location.pathname.slice(3) : null;

  return (
    <aside className="lab-sidebar">
      <header className="lab-sidebar-header">
        <h1>IHL UI Parts Lab</h1>
        <span className="lab-badge">port 3100 · apps/web 非接触</span>
      </header>
      <nav className="lab-nav">
        <Link to="/parts" className={`nav-link${location.pathname === "/parts" ? " active" : ""}`}>
          部品カタログ（{screensData.screens ? Object.keys(screensData.screens).length : 0} 画面）
        </Link>
        {Object.entries(groups).map(([name, screens]) => (
          <div key={name}>
            <h3>{name}</h3>
            {screens.map((s) => (
              <Link
                key={s.id}
                to={`/s/${s.id}`}
                className={`nav-link${activeId === s.id ? " active" : ""}`}
              >
                {s.id} {s.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <footer className="lab-sidebar-footer">
        <label>
          <input type="checkbox" checked={showHotspots} onChange={(e) => onToggleHotspots(e.target.checked)} />
          ホットスポット表示
        </label>
        <label>
          <input type="checkbox" checked={showLabels} onChange={(e) => onToggleLabels(e.target.checked)} />
          ラベル常時表示
        </label>
      </footer>
    </aside>
  );
}
