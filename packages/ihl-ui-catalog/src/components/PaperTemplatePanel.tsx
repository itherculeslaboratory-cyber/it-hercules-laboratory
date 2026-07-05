import { useState } from "react";
import type { W2ComponentProps } from "../types/w2";
import { PanelStateMessage } from "./shared/StandardShell";
import "./shared/standard-shell.css";

function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

/** catalog id: ihl-09-paper-template-fill__PaperTemplatePanel */
export function PaperTemplatePanel({
  state = "ok",
  className,
  onAction,
}: W2ComponentProps) {
  const [verify, setVerify] = useState("");
  const [gap, setGap] = useState("");

  if (state === "loading") {
    return (
      <div className="ihl-panel" data-component-id="ihl-09-paper-template-fill__PaperTemplatePanel" data-state={state}>
        <PanelStateMessage state="loading" />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="ihl-panel" data-component-id="ihl-09-paper-template-fill__PaperTemplatePanel" data-state={state}>
        <PanelStateMessage state="error" />
      </div>
    );
  }

  return (
    <div
      className={["ihl-panel", className].filter(Boolean).join(" ")}
      data-component-id="ihl-09-paper-template-fill__PaperTemplatePanel"
      data-state={state}
    >
      <div className="ihl-panel__title-row">
        <div>
          <p className="ihl-shell__breadcrumb">掲示板 › 論文 › テンプレート</p>
          <h1 className="ihl-panel__title">📄 論文テンプレート（穴埋め）</h1>
          <p className="ihl-panel__subtitle">空欄を埋めると、ほぼ完成形になります</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.82rem", color: "var(--civ-fg-muted)" }}>完成度 60%</span>
          <div className="ihl-progress" style={{ width: 120, marginTop: 6 }}>
            <div className="ihl-progress__bar ihl-progress__bar--success" style={{ width: "60%" }} />
          </div>
        </div>
      </div>

      <section className="ihl-card">
        <div className="ihl-card__head">
          <span />
          <span className="ihl-card__badge">モック</span>
        </div>

        {[
          { label: "目的 ✓", value: "温度がクワガタの角長に与える影響を明らかにする", filled: true },
          { label: "仮説 ✓", value: "温度が高いほど、オスの角長は長くなる", filled: true },
          { label: "条件：温度", chip: "22-30℃" },
          { label: "条件：湿度", chip: "60%" },
          { label: "条件：餌", chip: "昆虫ゼリー" },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr",
              gap: 16,
              padding: "12px 0",
              borderBottom: "1px solid var(--civ-border)",
              fontSize: "0.85rem",
              alignItems: "center",
            }}
          >
            <span style={{ color: "var(--civ-fg-muted)" }}>{row.label}</span>
            {row.chip ? (
              <span className="ihl-chip">{row.chip}</span>
            ) : (
              <span>{row.value}</span>
            )}
          </div>
        ))}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            gap: 16,
            padding: "12px 0",
            borderBottom: "1px solid var(--civ-border)",
            alignItems: "center",
          }}
        >
          <span style={{ color: "var(--civ-fg-muted)" }}>検証したいこと</span>
          <input
            className="ihl-form-control"
            type="text"
            placeholder="ここに記入..."
            value={verify}
            onChange={(e) => setVerify(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            gap: 16,
            padding: "12px 0",
            borderBottom: "1px solid var(--civ-border)",
            alignItems: "center",
          }}
        >
          <span style={{ color: "var(--civ-fg-muted)" }}>現在のフェーズ</span>
          <select className="ihl-form-control ihl-form-select" defaultValue="試す" style={{ borderColor: "var(--civ-accent)" }}>
            <option>観測</option>
            <option>仮説</option>
            <option>試す</option>
            <option>記録</option>
            <option>引用</option>
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            gap: 16,
            padding: "12px 0",
            alignItems: "center",
          }}
        >
          <span style={{ color: "var(--civ-fg-muted)" }}>必要なデータ / ギャップ</span>
          <input
            className="ihl-form-control"
            type="text"
            placeholder="ここに記入..."
            value={gap}
            onChange={(e) => setGap(e.target.value)}
          />
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginTop: 20 }}>
        <button type="button" className="ihl-btn-outline">
          📄 プレビュー / 論文にする
        </button>
        <button type="button" className="ihl-btn-ghost">
          観測から差し込む（自動）
        </button>
        <button type="button" className="ihl-btn-ghost" style={{ color: "var(--civ-fg-muted)" }}>
          進行中のまま保存（消えません）
        </button>
        <button type="button" className="ihl-btn-ghost" style={{ marginLeft: "auto" }} onClick={() => hot(onAction, 0)}>
          ← 進行中論文
        </button>
      </div>
    </div>
  );
}
