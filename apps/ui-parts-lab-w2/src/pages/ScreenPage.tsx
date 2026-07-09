import { useEffect, useMemo, useState } from "react";import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getScreen, screensData } from "../lib/catalog";
import { LabSidebar } from "../components/LabSidebar";
import { getScreenDef, hasScreenDef } from "../lib/screen-defs";
import { isW2ExcludedScreen } from "../w2/excluded-screens";
import { getW2RouteRedirect } from "../w2/route-redirects";
import { W2ScreenRenderer } from "../w2/W2ScreenRenderer";

export function ScreenPage() {
  const { screenId } = useParams<{ screenId: string }>();
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([screensData.defaultScreen]);

  const currentId = screenId ?? screensData.defaultScreen;

  const [searchParams] = useSearchParams();
  const screenParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const key of ["metric", "organism", "tab", "stage", "species", "domain", "subscription_id", "capture_id", "lotteryStep", "priorityStep", "partState", "edit", "guest", "eval", "gmo", "matched", "source", "fixed", "bid", "auction", "mode", "applied", "thread", "thread_id", "board"]) {
      const v = searchParams.get(key);
      if (v) params[key] = v;
    }
    return Object.keys(params).length ? params : undefined;
  }, [searchParams]);

  const stageRedirect: Record<string, string> = { "06b-s2": "2", "06b-s3": "3" };
  const routeRedirect = screenId ? getW2RouteRedirect(screenId) : null;
  const effectiveScreenId =
    routeRedirect?.target ?? (screenId && stageRedirect[screenId] ? "06b" : screenId);
  const effectiveParams = useMemo(() => {
    if (routeRedirect) {
      return { ...screenParams, ...routeRedirect.params };
    }
    if (!screenId || !stageRedirect[screenId]) return screenParams;
    return { ...screenParams, stage: stageRedirect[screenId] };
  }, [screenId, screenParams, routeRedirect]);

  const screen = getScreen(currentId);
  const screenDef = effectiveScreenId ? getScreenDef(effectiveScreenId) : null;
  const w2 = effectiveScreenId ? hasScreenDef(effectiveScreenId) : false;

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

  if (isW2ExcludedScreen(screenId)) {
    return <Navigate to="/s/06a" replace />;
  }

  if (routeRedirect && screenId !== routeRedirect.target) {
    const qs = effectiveParams ? `?${new URLSearchParams(effectiveParams).toString()}` : "";
    return <Navigate to={`/s/${routeRedirect.target}${qs}`} replace />;
  }

  if (
    effectiveScreenId === "06b" &&
    effectiveParams?.matched === "1" &&
    effectiveParams?.source === "auction" &&
    !effectiveParams?.stage
  ) {
    const qs = new URLSearchParams({ ...effectiveParams, stage: "2" }).toString();
    return <Navigate to={`/s/06b?${qs}`} replace />;
  }

  if (effectiveScreenId === "06bid" && effectiveParams?.mode && effectiveParams.mode !== "auction") {
    const target = effectiveParams.mode === "lottery" ? "06lot-apply" : "06priority-apply";
    const qs = new URLSearchParams({ mode: effectiveParams.mode, ...(effectiveParams.applied ? { applied: effectiveParams.applied } : {}) }).toString();
    return <Navigate to={`/s/${target}?${qs}`} replace />;
  }

  if (screenId && stageRedirect[screenId] && screenId !== effectiveScreenId) {
    const qs = effectiveParams
      ? `?${new URLSearchParams(effectiveParams).toString()}`
      : "";
    return <Navigate to={`/s/${effectiveScreenId}${qs}`} replace />;
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

  const hint = useMemo(() => {
    if (effectiveScreenId === "06detail") {
      const mode = effectiveParams?.mode?.trim().toLowerCase();
      if (mode === "priority") return "申し込む · キュー状況 · プラチナコイン優先";
      if (mode === "lottery") return "応募する · 抽選詳細";
    }
    return (
      screenDef?.transitions?.map((t) => t.label).filter(Boolean).join(" · ") ||
      screen?.hotspots?.map((h) => h.label).join(" · ") ||
      "W2 実装画面 · 実ボタン操作"
    );
  }, [effectiveScreenId, effectiveParams?.mode, screenDef?.transitions, screen?.hotspots]);

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
            <W2ScreenRenderer def={screenDef} screenParams={effectiveParams} onNavigate={goTo} />
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
