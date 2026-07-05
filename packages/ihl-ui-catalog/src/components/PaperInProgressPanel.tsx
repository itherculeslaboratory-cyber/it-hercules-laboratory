import type { W2ComponentProps } from "../types/w2";
import { PanelStateMessage } from "./shared/StandardShell";
import "./shared/standard-shell.css";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

const STEPS = ["観測", "仮説", "試す", "記録", "引用"];

/** catalog id: ihl-09-paper-in-progress__PaperProgressPanel */
export function PaperInProgressPanel({
  state = "ok",
  className,
  onAction,
}: W2ComponentProps) {
  if (state !== "ok") {
    return (
      <div className="ihl-panel" data-component-id="ihl-09-paper-in-progress__PaperProgressPanel" data-state={state}>
        <PanelStateMessage
          state={state === "loading" ? "loading" : state === "empty" ? "empty" : "error"}
          emptyText="進行中の論文がありません"
        />
      </div>
    );
  }

  return (
    <div
      className={["ihl-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-09-paper-in-progress__PaperProgressPanel"
      data-state={state}
    >
      <p className="ihl-shell__breadcrumb">掲示板 › 論文</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {["論文", "観察", "繁殖ログ", "分析", "査読", "追試", "仮説", "その他"].map((tab, i) => (
          <span
            key={tab}
            className="ihl-chip"
            style={i === 0 ? { borderColor: "var(--civ-link)", color: "var(--civ-link)" } : undefined}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="ihl-panel__title-row">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "2px solid var(--civ-link)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            📄
          </span>
          <div>
            <h1 className="ihl-panel__title">温度と角長の相関 (進行中)</h1>
            <span className="ihl-chip ihl-chip--warn">🔄 進行中 (temperature実験)</span>
          </div>
        </div>
        <span className="ihl-chip ihl-chip--warn">⚠️ 今この phase: 試す</span>
      </div>

      <div className="ihl-grid-2">
        <section className="ihl-card">
          {[
            { label: "目的", value: "温度がクワガタの角長に与える影響を明らかにする。" },
            { label: "仮説", value: "温度が高いほど、オスの角長は長くなる。" },
            {
              label: "条件 (温度/湿度/餌)",
              value: null,
              chips: ["温度 22-30°C", "湿度 60%", "餌 昆虫ゼリー"],
            },
            {
              label: "検証したいこと",
              value: "異なる温度条件下で飼育した個体の角長を比較し、温度と角長の相関を検証する。",
            },
            { label: "現在のフェーズ", chip: "試す (記録中)" },
            { label: "必要なデータ / ギャップ", gap: true },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                gap: 16,
                padding: "12px 0",
                borderBottom: "1px solid var(--civ-border)",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ width: 140, flexShrink: 0, color: "var(--civ-fg-muted)" }}>{row.label}</span>
              <span style={{ flex: 1 }}>
                {row.chips && (
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {row.chips.map((c) => (
                      <span key={c} className="ihl-chip">
                        {c}
                      </span>
                    ))}
                  </span>
                )}
                {row.chip && <span className="ihl-chip ihl-chip--warn">{row.chip}</span>}
                {row.gap && (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, height: 8, background: "var(--civ-bg-input)", borderRadius: 4 }} />
                    <span className="ihl-chip ihl-chip--danger">不足</span>
                  </span>
                )}
                {row.value && row.value}
              </span>
            </div>
          ))}
        </section>

        <section className="ihl-card">
          <h2 className="ihl-card__title">研究の進行ステップ</h2>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "20px 0", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: 14,
                left: "10%",
                right: "10%",
                height: 2,
                background: "var(--civ-border)",
              }}
            />
            {STEPS.map((step, i) => (
              <div key={step} style={{ textAlign: "center", zIndex: 1, flex: 1 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    margin: "0 auto 6px",
                    border: i === 2 ? "3px solid var(--civ-accent)" : "2px solid var(--civ-border)",
                    background: i === 2 ? "var(--civ-accent)" : "var(--civ-bg-card)",
                    color: i === 2 ? "#0d0d0d" : "var(--civ-fg-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </div>
                <span style={{ fontSize: "0.72rem", color: i === 2 ? "var(--civ-accent)" : "var(--civ-fg-muted)" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          <button type="button" className="ihl-btn-outline" style={{ width: "100%", justifyContent: "center" }}>
            + 同じ条件でデータを追加する
          </button>
          <p style={{ margin: "12px 0 0", fontSize: "0.75rem", color: "var(--civ-fg-muted)", textAlign: "center" }}>
            👥 条件を合わせて参加できます
          </p>
        </section>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid var(--civ-border)",
          fontSize: "0.82rem",
        }}
      >
        <button type="button" className="ihl-btn-ghost">
          ← 観測キャプチャへ (Capture)
        </button>
        <button type="button" className="ihl-btn-ghost">
          引用を追加 (Citation)
        </button>
        <button type="button" className="ihl-btn-primary" onClick={() => hot(onAction, 0)}>
          テンプレ穴埋め →
        </button>
      </div>
      <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--civ-fg-muted)", textAlign: "center" }}>
        ⓘ 論文は終点ではなく研究の起点
      </p>
    </div>
  );
}
