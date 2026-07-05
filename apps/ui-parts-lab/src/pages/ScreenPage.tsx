import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ScreenRenderer } from "@ihl/ui-catalog/renderer/ScreenRenderer";
import { getScreen, screensData } from "../lib/catalog";
import { LabSidebar } from "../components/LabSidebar";
import { getScreenDef, hasScreenDef } from "../lib/screen-defs";

export function ScreenPage() {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([screensData.defaultScreen]);

  const currentId = screenId ?? screensData.defaultScreen;
  const screen = getScreen(currentId);
  const screenDef = screenId ? getScreenDef(screenId) : null;
  const w2 = screenId ? hasScreenDef(screenId) : false;

  const [searchParams] = useSearchParams();
  const screenParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const key of ["metric", "organism"]) {
      const v = searchParams.get(key);
      if (v) params[key] = v;
    }
    return Object.keys(params).length ? params : undefined;
  }, [searchParams]);

  useEffect(() => {
    if (!screenId) return;
    setHistory((h) => (h[h.length - 1] === screenId ? h : [...h, screenId]));
  }, [screenId]);

  const goTo = (targetId: string, params?: Record<string, string>) => {
    const qs = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    navigate(`/s/${targetId}${qs}`);
  };

  if (!screenId) {
    return <Navigate to={`/s/${screensData.defaultScreen}`} replace />;
  }

  if (!screen && !w2) {
    return (
      <div className="lab-layout">
        <LabSidebar
        showHotspots={false}
        showLabels={false}
        onToggleHotspots={() => {}}
        onToggleLabels={() => {}}
      />
        <main className="lab-main">
          <p style={{ padding: 24 }}>画面 ID 不明: {screenId}</p>
        </main>
      </div>
    );
  }

  const hint =
    screenDef?.transitions?.map((t) => t.label).filter(Boolean).join(" · ") ||
    screen?.hotspots?.map((h) => h.label).join(" · ") ||
    "W2 実装画面 · 実ボタン操作";

  return (
    <div className="lab-layout">
      <LabSidebar
        showHotspots={false}
        showLabels={false}
        onToggleHotspots={() => {}}
        onToggleLabels={() => {}}
      />
      <main className="lab-main">
        <div className="lab-stage lab-stage--coded">
          {screenDef ? (
            <ScreenRenderer def={screenDef} screenParams={screenParams} onNavigate={goTo} />
          ) : (
            <p style={{ padding: 24 }}>ScreenDef 未生成: {screenId}</p>
          )}
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
