import type { W2ComponentProps } from "../types/w2";
import { PanelStateMessage } from "./shared/StandardShell";
import "./shared/standard-shell.css";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

/** catalog id: ihl-03-lineage-metrics-detail__MetricsDetailPanel */
export function LineageMetricsPanel({
  state = "ok",
  className,
  onAction,
}: W2ComponentProps) {
  if (state !== "ok") {
    return (
      <div className="ihl-panel" data-component-id="ihl-03-lineage-metrics-detail__MetricsDetailPanel" data-state={state}>
        <PanelStateMessage
          state={state === "loading" ? "loading" : state === "empty" ? "empty" : "error"}
          emptyText="指標データがありません"
        />
      </div>
    );
  }

  return (
    <div
      className={["ihl-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-03-lineage-metrics-detail__MetricsDetailPanel"
      data-state={state}
    >
      <div className="ihl-panel__title-row">
        <div>
          <p className="ihl-shell__breadcrumb">血統 › 交配 › 死亡率 詳細</p>
          <h1 className="ihl-panel__title">血統メトリクス 詳細</h1>
          <p className="ihl-panel__subtitle">クワガタ・カブトムシ 血統分析ダッシュボード</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 1)}>
            ← Crossへ
          </button>
          <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 2)}>
            死亡一覧へ →
          </button>
        </div>
      </div>

      <section className="ihl-card" style={{ marginBottom: 16 }}>
        <h2 className="ihl-card__title">令別 平均体重推移</h2>
        <div
          style={{
            height: 180,
            marginTop: 16,
            background: "linear-gradient(180deg, rgba(92,214,141,0.15) 0%, transparent 100%)",
            borderBottom: "1px solid var(--civ-border)",
            position: "relative",
          }}
        >
          <svg viewBox="0 0 400 140" style={{ width: "100%", height: "100%" }} aria-hidden>
            <polyline
              fill="none"
              stroke="var(--civ-success)"
              strokeWidth="2"
              points="20,120 120,95 220,60 360,20"
            />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--civ-fg-muted)", padding: "0 8px" }}>
            <span>初令</span>
            <span>二令</span>
            <span>三令初期</span>
            <span>三令後期</span>
          </div>
        </div>
        <p className="ihl-card__note">平均体重 (g) · 最小～最大範囲</p>
      </section>

      <div className="ihl-grid-2">
        <section className="ihl-card">
          <h2 className="ihl-card__title">世代別 死亡率</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, marginTop: 16 }}>
            {[
              { gen: "F2", h: 88 },
              { gen: "F3", h: 72 },
              { gen: "F4", h: 48 },
              { gen: "F5", h: 32 },
              { gen: "F6", h: 16 },
            ].map((b) => (
              <div key={b.gen} style={{ flex: 1, textAlign: "center" }}>
                <div
                  style={{
                    height: b.h,
                    background: "#e85d5d",
                    borderRadius: "4px 4px 0 0",
                    minHeight: 8,
                  }}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--civ-fg-muted)" }}>{b.gen}</span>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <section className="ihl-card">
            <div className="ihl-grid-3">
              <div>
                <div className="ihl-stat-card__label">完品率</div>
                <div className="ihl-stat-card__value ihl-stat-card__value--success">92%</div>
                <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "var(--civ-fg-muted)" }}>
                  (正常に羽化した個体の割合)
                </p>
              </div>
              <div>
                <div className="ihl-stat-card__label">羽化不全率</div>
                <div className="ihl-stat-card__value ihl-stat-card__value--danger">4%</div>
                <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "var(--civ-fg-muted)" }}>
                  (羽化不全の割合)
                </p>
              </div>
              <div>
                <div className="ihl-stat-card__label">総個体数</div>
                <div className="ihl-stat-card__value">48</div>
                <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: "var(--civ-fg-muted)" }}>
                  (全世代 合計)
                </p>
              </div>
            </div>
          </section>
          <section className="ihl-card">
            <div className="ihl-grid-2">
              <div>
                <div className="ihl-stat-card__label">最大体長</div>
                <div className="ihl-stat-card__value">78mm</div>
              </div>
              <div>
                <div className="ihl-stat-card__label">最小体長</div>
                <div className="ihl-stat-card__value">61mm</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <p className="ihl-card__note" style={{ marginTop: 16 }}>
        Snapshot (再計算可能) / 由来: cross_growth_summary · cross_death_summary
      </p>

      <div style={{ marginTop: 12 }}>
        <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 0)}>
          観測詳細へ →
        </button>
      </div>
    </div>
  );
}
