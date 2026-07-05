import type { W2ComponentProps } from "../types/w2";
import { PanelStateMessage } from "./shared/StandardShell";
import "./shared/standard-shell.css";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

const RATE_CARDS = [
  { label: "生体までの死亡率", value: "12%", pct: 12, tone: "danger" as const, hotspot: 0 },
  { label: "完品率", value: "78%", pct: 78, tone: "success" as const, hotspot: 1 },
  { label: "羽化不全率", value: "9%", pct: 9, tone: "warn" as const, hotspot: 2 },
];

const OFFSPRING = [
  { id: "IND-0210", prob: "0.92" },
  { id: "IND-0211", prob: "0.88" },
  { id: "IND-0212", prob: "0.85" },
  { id: "IND-0213", prob: "0.79" },
];

/** catalog id: ihl-03-lineage-cross__CrossDashboardPanel */
export function LineageCrossPanel({
  state = "ok",
  className,
  screenParams,
  onAction,
}: W2ComponentProps) {
  const organismId = screenParams?.organism;

  if (state !== "ok") {
    return (
      <div className="ihl-panel" data-component-id="ihl-03-lineage-cross__CrossDashboardPanel" data-state={state}>
        <PanelStateMessage
          state={state === "loading" ? "loading" : state === "empty" ? "empty" : "error"}
          emptyText="交配データがありません"
        />
      </div>
    );
  }

  return (
    <div
      className={["ihl-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-03-lineage-cross__CrossDashboardPanel"
      data-state={state}
    >
      {organismId && (
        <div style={{ marginBottom: 12 }}>
          <span className="ihl-chip ihl-chip--success">対象個体: {organismId}</span>
          <span className="ihl-chip" style={{ marginLeft: 8 }}>
            観測詳細から遷移
          </span>
        </div>
      )}

      <div className="ihl-panel__title-row">
        <div>
          <p className="ihl-shell__breadcrumb">血統 › 交配 #CR-2041</p>
          <h1 className="ihl-panel__title">交配 #CR-2041</h1>
        </div>
        <button type="button" className="ihl-btn-primary" style={{ fontSize: "0.82rem", padding: "8px 16px" }}>
          この交配を記録
        </button>
      </div>

      <div className="ihl-grid-2">
        <section className="ihl-card">
          <div className="ihl-card__head">
            <h2 className="ihl-card__title">親 (CrossParent)</h2>
            <span className="ihl-card__badge">モック</span>
          </div>
          <div className="ihl-grid-2">
            <div className="ihl-card" style={{ padding: 12 }}>
              <div
                style={{
                  height: 80,
                  background: "var(--civ-bg-input)",
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--civ-fg-muted)",
                  fontSize: "0.75rem",
                }}
              >
                IND-0098
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem" }}>ヘラクレス・ヘラクレス</p>
              <span className="ihl-chip" style={{ marginTop: 8, borderColor: "var(--civ-link)" }}>
                sire (DHHテンプレ例)
              </span>
            </div>
            <div className="ihl-card" style={{ padding: 12 }}>
              <div
                style={{
                  height: 80,
                  background: "var(--civ-bg-input)",
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--civ-fg-muted)",
                  fontSize: "0.75rem",
                }}
              >
                IND-0102
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem" }}>ヘラクレス・ヘラクレス</p>
              <span className="ihl-chip ihl-chip--warn" style={{ marginTop: 8 }}>
                dam (DHHテンプレ例)
              </span>
            </div>
          </div>
          <p className="ihl-card__note">ⓘ 親役割はテンプレ定義 (コア固定ではない)</p>
        </section>

        <section className="ihl-card">
          <div className="ihl-card__head">
            <h2 className="ihl-card__title">交配サマリー</h2>
            <span className="ihl-card__badge">モック</span>
          </div>
          <dl style={{ margin: 0, fontSize: "0.85rem", lineHeight: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--civ-fg-muted)" }}>交配名</dt>
              <dd style={{ margin: 0 }}>#CR-2041 DHH-98 x DHH-102</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--civ-fg-muted)" }}>計画日</dt>
              <dd style={{ margin: 0 }}>2025-05-20</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt style={{ color: "var(--civ-fg-muted)" }}>実施日</dt>
              <dd style={{ margin: 0 }}>2025-05-28</dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <dt style={{ color: "var(--civ-fg-muted)" }}>ステータス</dt>
              <dd style={{ margin: 0 }}>
                <span className="ihl-chip ihl-chip--success">executed</span>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="ihl-card" style={{ marginTop: 16 }}>
        <div className="ihl-card__head">
          <h2 className="ihl-card__title">世代集計 (Snapshot)</h2>
          <span className="ihl-card__badge">モック</span>
        </div>
        <div className="ihl-grid-2">
          <div className="ihl-table-wrap">
            <table className="ihl-table">
              <thead>
                <tr>
                  <th>令ステージ</th>
                  <th>平均体重 (g)</th>
                  <th>n</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>初令</td>
                  <td>1.8</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>二令</td>
                  <td>6.4</td>
                  <td>28</td>
                </tr>
                <tr>
                  <td>三令 初期</td>
                  <td>18.2</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>三令 後期</td>
                  <td>41.7</td>
                  <td>25</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="ihl-grid-3">
            <div className="ihl-stat-card">
              <div className="ihl-stat-card__label">最大重量</div>
              <div className="ihl-stat-card__value ihl-stat-card__value--success">52.3 g</div>
            </div>
            <div className="ihl-stat-card">
              <div className="ihl-stat-card__label">最大全長</div>
              <div className="ihl-stat-card__value" style={{ color: "var(--civ-link)" }}>
                92 mm
              </div>
            </div>
            <div className="ihl-stat-card">
              <div className="ihl-stat-card__label">最小全長</div>
              <div className="ihl-stat-card__value" style={{ color: "var(--civ-accent)" }}>
                61 mm
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <p className="ihl-card__note" style={{ margin: 0 }}>
            ⓘ 再構築 Snapshot (真実ではない)
          </p>
          <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 3)}>
            成長 詳細 →
          </button>
        </div>
      </section>

      <section className="ihl-card" style={{ marginTop: 16 }}>
        <div className="ihl-card__head">
          <h2 className="ihl-card__title">率 (詳細で一覧表示)</h2>
          <span className="ihl-card__badge">モック</span>
        </div>
        <div className="ihl-grid-3">
          {RATE_CARDS.map((r) => (
            <div key={r.label} className="ihl-stat-card">
              <div className="ihl-stat-card__label">{r.label}</div>
              <div
                className={`ihl-stat-card__value${r.tone === "danger" ? " ihl-stat-card__value--danger" : r.tone === "success" ? " ihl-stat-card__value--success" : ""}`}
              >
                {r.value}
              </div>
              <div className={`ihl-progress__bar ihl-progress__bar--${r.tone}`} style={{ width: `${r.pct}%`, height: 6, marginTop: 8, borderRadius: 999 }} />
              <button type="button" className="ihl-btn-ghost" style={{ marginTop: 8 }} onClick={() => hot(onAction, r.hotspot)}>
                詳細 →
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="ihl-card" style={{ marginTop: 16 }}>
        <div className="ihl-card__head">
          <h2 className="ihl-card__title">子個体 (OffspringAssignment)</h2>
          <span className="ihl-card__badge">モック</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {OFFSPRING.map((o) => (
            <div key={o.id} className="ihl-stat-card" style={{ padding: 12 }}>
              <div
                style={{
                  height: 48,
                  background: "var(--civ-bg-input)",
                  borderRadius: 6,
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{o.id}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)" }}>確度 {o.prob}</div>
              <button type="button" className="ihl-btn-ghost" style={{ marginTop: 6 }}>
                観測詳細 →
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
