import type { W2ComponentProps } from "../types/w2";
import { PanelStateMessage } from "./shared/StandardShell";
import { LINEAGE_METRIC_CONFIGS, resolveLineageMetricVariant } from "./lineage-metric-data";
import "./shared/standard-shell.css";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

/** catalog id: ihl-03-lineage-mortality-detail__MortalityListPanel */
export function LineageMortalityPanel({
  state = "ok",
  className,
  screenParams,
  onAction,
}: W2ComponentProps) {
  const cfg = LINEAGE_METRIC_CONFIGS[resolveLineageMetricVariant(screenParams?.metric)];

  if (state === "loading") {
    return (
      <div className="ihl-panel" data-component-id="ihl-03-lineage-mortality-detail__MortalityListPanel" data-state={state}>
        <PanelStateMessage state="loading" />
      </div>
    );
  }
  if (state === "empty") {
    return (
      <div className="ihl-panel" data-component-id="ihl-03-lineage-mortality-detail__MortalityListPanel" data-state={state}>
        <PanelStateMessage state="empty" emptyText="記録がありません" />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="ihl-panel" data-component-id="ihl-03-lineage-mortality-detail__MortalityListPanel" data-state={state}>
        <PanelStateMessage state="error" />
      </div>
    );
  }

  const rateClass =
    cfg.rateTone === "danger"
      ? " ihl-stat-card__value--danger"
      : cfg.rateTone === "success"
        ? " ihl-stat-card__value--success"
        : "";
  const eventClass =
    cfg.eventTone === "danger"
      ? " ihl-stat-card__value--danger"
      : cfg.eventTone === "success"
        ? " ihl-stat-card__value--success"
        : "";

  return (
    <div
      className={["ihl-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-03-lineage-mortality-detail__MortalityListPanel"
      data-state={state}
      data-metric-variant={cfg.variant}
    >
      <div className="ihl-panel__title-row">
        <div>
          <p className="ihl-shell__breadcrumb">血統 › 交配 #CR-2041 › {cfg.breadcrumbSuffix}</p>
          <h1 className="ihl-panel__title">{cfg.title}</h1>
        </div>
        <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 1)}>
          ← Crossへ
        </button>
      </div>

      <div className="ihl-stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="ihl-stat-card">
          <div className="ihl-stat-card__label">{cfg.headline}</div>
          <div className={`ihl-stat-card__value${rateClass}`}>{cfg.rate}</div>
        </div>
        <div className="ihl-stat-card">
          <div className="ihl-stat-card__label">{cfg.subjectLabel}</div>
          <div className="ihl-stat-card__value">{cfg.subjectCount}</div>
        </div>
        <div className="ihl-stat-card">
          <div className="ihl-stat-card__label">{cfg.eventLabel}</div>
          <div className={`ihl-stat-card__value${eventClass}`}>{cfg.eventCount}</div>
        </div>
      </div>

      <section className="ihl-card">
        <div className="ihl-card__head">
          <h2 className="ihl-card__title">{cfg.tableTitle}</h2>
          <span className="ihl-card__badge">モック</span>
        </div>
        <div className="ihl-table-wrap">
          <table className="ihl-table">
            <thead>
              <tr>
                <th>個体ID</th>
                <th>ステージ</th>
                <th>事由 (Event)</th>
                <th>日付</th>
                <th>観測</th>
              </tr>
            </thead>
            <tbody>
              {cfg.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span style={{ color: "#e85d5d", marginRight: 6 }}>■</span>
                    {row.id}
                  </td>
                  <td>{row.stage}</td>
                  <td>{row.reason}</td>
                  <td>{row.date}</td>
                  <td>
                    <button type="button" className="ihl-btn-ghost" onClick={() => hot(onAction, 0)}>
                      観測詳細 →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ihl-card__note">{cfg.tableNote}</p>
      </section>
    </div>
  );
}
