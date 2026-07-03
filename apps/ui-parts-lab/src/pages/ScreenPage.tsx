import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getScreen, screensData } from "../lib/catalog";
import { ComposedScreen } from "../components/ComposedScreen";
import { LabSidebar } from "../components/LabSidebar";

export function ScreenPage() {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([screensData.defaultScreen]);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  const currentId = screenId ?? screensData.defaultScreen;
  const screen = getScreen(currentId);

  useEffect(() => {
    if (!screenId) return;
    setHistory((h) => (h[h.length - 1] === screenId ? h : [...h, screenId]));
  }, [screenId]);

  const goTo = (targetId: string) => navigate(`/s/${targetId}`);

  if (!screenId) {
    return <Navigate to={`/s/${screensData.defaultScreen}`} replace />;
  }

  if (!screen) {
    return (
      <div className="lab-layout">
        <LabSidebar
          showHotspots={showHotspots}
          showLabels={showLabels}
          onToggleHotspots={setShowHotspots}
          onToggleLabels={setShowLabels}
        />
        <main className="lab-main">
          <p style={{ padding: 24 }}>画面 ID 不明: {screenId}</p>
        </main>
      </div>
    );
  }

  const hint = (screen.hotspots ?? []).map((h) => h.label).join(" · ") || "（ジャンプ専用）";

  return (
    <div className="lab-layout">
      <LabSidebar
        showHotspots={showHotspots}
        showLabels={showLabels}
        onToggleHotspots={setShowHotspots}
        onToggleLabels={setShowLabels}
      />
      <main className="lab-main">
        <header className="lab-screen-header">
          <h2>{screen.title}</h2>
          <p className="lab-meta">{screen.breadcrumb}</p>
        </header>
        <div className="lab-stage">
          <ComposedScreen
            screen={screen}
            showHotspots={showHotspots}
            showLabels={showLabels}
            onNavigate={goTo}
          />
        </div>
        <nav className="lab-footer-nav" aria-label="補助ナビ">
          <button
            type="button"
            disabled={history.length <= 1}
            onClick={() => {
              if (history.length <= 1) return;
              const next = history.slice(0, -1);
              setHistory(next);
              navigate(`/s/${next[next.length - 1]}`);
            }}
          >
            ← 戻る
          </button>
          <span className="lab-hint">{hint}</span>
          <button
            type="button"
            onClick={() => {
              setHistory([screensData.defaultScreen]);
              navigate(`/s/${screensData.defaultScreen}`);
            }}
          >
            ホームへ
          </button>
        </nav>
      </main>
    </div>
  );
}
