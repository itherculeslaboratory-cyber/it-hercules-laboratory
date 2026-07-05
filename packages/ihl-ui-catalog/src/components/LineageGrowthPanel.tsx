import type { W2ComponentProps } from "../types/w2";
import { PanelStateMessage, StandardShell, type NavItem } from "./shared/StandardShell";
import "./shared/standard-shell.css";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

const GROWTH_NAV: NavItem[] = [
  { id: "dash", label: "ダッシュボード", icon: "▣", target: "01" },
  { id: "list", label: "血統一覧", icon: "☰", target: "03" },
  { id: "cross", label: "クロス管理", icon: "✕", target: "03", active: true },
  { id: "ind", label: "個体管理", icon: "◎", target: "05a" },
  { id: "breed", label: "飼育管理", icon: "♨", target: "05i" },
  { id: "report", label: "分析・レポート", icon: "📊", target: "03g", active: true },
  { id: "lib", label: "血統ライブラリ", icon: "📚", target: "03" },
  { id: "settings", label: "設定", icon: "⚙", target: "12hub" },
];

const GEN_ROWS = [
  { gen: "F1", code: "X-2024-F1", init: 50, adult: 38, rate: "76.0%", avg: "7.2 g", maxW: "8.7 g", maxL: "72 mm", minL: "58 mm" },
  { gen: "F2", code: "X-2024-F2", init: 45, adult: 34, rate: "75.6%", avg: "7.5 g", maxW: "9.1 g", maxL: "74 mm", minL: "59 mm" },
  { gen: "F3", code: "X-2024-F3", init: 42, adult: 33, rate: "78.6%", avg: "7.8 g", maxW: "9.4 g", maxL: "76 mm", minL: "60 mm" },
  { gen: "F4", code: "X-2024-F4", init: 40, adult: 32, rate: "80.0%", avg: "8.0 g", maxW: "9.8 g", maxL: "77 mm", minL: "61 mm" },
  { gen: "F5", code: "X-2024-F5", init: 38, adult: 31, rate: "81.6%", avg: "8.2 g", maxW: "10.2 g", maxL: "78 mm", minL: "62 mm" },
];

/** catalog id: ihl-03-lineage-growth-detail__GrowthDetailPanel */
export function LineageGrowthPanel({
  state = "ok",
  className,
  onAction,
  onNavigate,
}: W2ComponentProps) {
  if (state !== "ok") {
    return (
      <StandardShell breadcrumb="血統 › Cross #X-2024 › 成長詳細" nav={GROWTH_NAV} onNavigate={onNavigate}>
        <PanelStateMessage
          state={state === "loading" ? "loading" : state === "empty" ? "empty" : "error"}
          emptyText="成長データがありません"
        />
      </StandardShell>
    );
  }

  return (
    <StandardShell breadcrumb="血統 › Cross #X-2024 › 成長詳細" nav={GROWTH_NAV} onNavigate={onNavigate}>
      <div
        className={["ihl-panel", className].filter(Boolean).join(" ")}
        data-component-id="ihl-03-lineage-growth-detail__GrowthDetailPanel"
        data-state={state}
      >
        <div className="ihl-panel__title-row">
          <div>
            <h1 className="ihl-panel__title">世代別成長 Snapshot</h1>
            <p className="ihl-panel__subtitle">再構築 Snapshot (真実ではない)</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" className="ihl-btn-outline" style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
              エクスポート ▾
            </button>
            <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 0)}>
              ← Crossへ
            </button>
          </div>
        </div>

        <section className="ihl-card" style={{ marginBottom: 16 }}>
          <h2 className="ihl-card__title">体重の成長推移 (instar 別平均)</h2>
          <div style={{ height: 160, marginTop: 12, position: "relative" }}>
            <svg viewBox="0 0 500 120" style={{ width: "100%", height: "100%" }} aria-hidden>
              <polyline fill="none" stroke="#4da3ff" strokeWidth="2" points="20,100 140,80 260,50 460,15" />
              <polyline fill="none" stroke="#5cd68d" strokeWidth="2" points="20,105 140,85 260,55 460,20" />
              <polyline fill="none" stroke="#a78bfa" strokeWidth="2" points="20,108 140,88 260,58 460,25" />
              <polyline fill="none" stroke="#c9a227" strokeWidth="2" points="20,110 140,90 260,60 460,30" />
              <polyline fill="none" stroke="#e85d5d" strokeWidth="2" points="20,112 140,92 260,62 460,35" />
            </svg>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: "0.72rem", color: "var(--civ-fg-muted)" }}>
            <span>● F1</span>
            <span>● F2</span>
            <span>● F3</span>
            <span>● F4</span>
            <span>● F5</span>
          </div>
        </section>

        <div className="ihl-grid-3" style={{ marginBottom: 16 }}>
          <div className="ihl-stat-card">
            <div className="ihl-stat-card__label">最大重量</div>
            <div className="ihl-stat-card__value">12.4 g</div>
            <button type="button" className="ihl-btn-ghost" style={{ marginTop: 8 }}>
              該当個体一覧 →
            </button>
          </div>
          <div className="ihl-stat-card">
            <div className="ihl-stat-card__label">最大全長</div>
            <div className="ihl-stat-card__value">78 mm</div>
          </div>
          <div className="ihl-stat-card">
            <div className="ihl-stat-card__label">最小全長</div>
            <div className="ihl-stat-card__value">62 mm</div>
          </div>
        </div>

        <section className="ihl-card">
          <h2 className="ihl-card__title">世代別成長サマリー</h2>
          <div className="ihl-table-wrap" style={{ marginTop: 12 }}>
            <table className="ihl-table">
              <thead>
                <tr>
                  <th>世代</th>
                  <th>管理コード</th>
                  <th>頭数 (初期)</th>
                  <th>羽化数 (成虫)</th>
                  <th>生存率</th>
                  <th>平均体重 (三令後期)</th>
                  <th>最大体重</th>
                  <th>最大全長</th>
                  <th>最小全長</th>
                  <th>備考</th>
                </tr>
              </thead>
              <tbody>
                {GEN_ROWS.map((r) => (
                  <tr key={r.gen}>
                    <td>{r.gen}</td>
                    <td>{r.code}</td>
                    <td>{r.init}</td>
                    <td>{r.adult}</td>
                    <td style={{ color: "var(--civ-success)" }}>{r.rate}</td>
                    <td>{r.avg}</td>
                    <td>{r.maxW}</td>
                    <td>{r.maxL}</td>
                    <td>{r.minL}</td>
                    <td>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: "0.75rem", color: "var(--civ-fg-muted)" }}>
            <span>※ 本データは再構築された Snapshot であり、実測値ではありません。</span>
            <span>
              最終更新: 2024/05/26 23:41 ·{" "}
              <button type="button" className="ihl-btn-ghost">
                更新 ↻
              </button>
            </span>
          </div>
        </section>
      </div>
    </StandardShell>
  );
}
