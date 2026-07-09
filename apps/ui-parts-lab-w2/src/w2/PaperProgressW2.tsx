import type { ReactNode } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PanelStateMessage } from "@ihl/ui-catalog/components/shared/StandardShell";
import "@ihl/ui-catalog/components/shared/standard-shell.css";
import { W2ShellOnly } from "./withW2Shell";
import {
  MOCK_PAPER_IN_PROGRESS,
  PAPER_CASE_CHIPS,
  PAPER_SECTION_LABELS,
  RESEARCH_STEPS,
  formatConditions,
  stepIndex,
  type PaperSectionKey,
} from "./paper-mock";

const ID = "ihl-09-paper-in-progress__PaperProgressPanel";

function SectionCheck({ filled }: { filled: boolean }) {
  return (
    <span
      className={["w2-paper-check", filled ? "w2-paper-check--done" : "w2-paper-check--open"].join(" ")}
      aria-label={filled ? "記入済み" : "未記入"}
    >
      {filled ? "✓" : "○"}
    </span>
  );
}

function SectionRow({
  sectionKey,
  filled,
  children,
}: {
  sectionKey: PaperSectionKey;
  filled: boolean;
  children: ReactNode;
}) {
  return (
    <div className="w2-paper-section-row">
      <div className="w2-paper-section-row__label">
        <SectionCheck filled={filled} />
        <span>{PAPER_SECTION_LABELS[sectionKey]}</span>
      </div>
      <div className="w2-paper-section-row__body">{children}</div>
    </div>
  );
}

function PhaseTimeline({ currentStep }: { currentStep: (typeof RESEARCH_STEPS)[number]["step"] }) {
  const activeIdx = stepIndex(currentStep);
  return (
    <div className="w2-paper-phase" aria-label="研究の進行ステップ">
      <div className="w2-paper-phase__track" aria-hidden />
      {RESEARCH_STEPS.map((item, i) => {
        const isActive = i === activeIdx;
        const isPast = i < activeIdx;
        return (
          <div
            key={item.step}
            className={[
              "w2-paper-phase__step",
              isActive ? "w2-paper-phase__step--active" : "",
              isPast ? "w2-paper-phase__step--past" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="w2-paper-phase__dot">{i + 1}</span>
            <span className="w2-paper-phase__label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** walkId 09 — 進行中論文（6 節 + 5 ステップ · BBS スレ一覧ではない） */
export function PaperProgressPanelW2({
  state = "ok",
  className,
  onAction,
  onNavigate,
}: W2ComponentProps) {
  const paper = MOCK_PAPER_IN_PROGRESS;
  const { sections } = paper;
  const phase = sections.current_phase;

  if (state === "loading") {
    return (
      <div className={["ihl-panel w2-paper", className].filter(Boolean).join(" ")} data-component-id={ID} data-state={state}>
        <PanelStateMessage state="loading" />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className={["ihl-panel w2-paper", className].filter(Boolean).join(" ")} data-component-id={ID} data-state={state}>
        <PanelStateMessage
          state="empty"
          emptyText="まだ研究記録がありません。観測から〔研究を始める〕で起票できます。"
        />
        <div className="w2-paper-empty-cta">
          <button type="button" className="w2-mch-btn-primary" onClick={() => onNavigate?.("05ctx")}>
            観測から研究を始める
          </button>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={["ihl-panel w2-paper", className].filter(Boolean).join(" ")} data-component-id={ID} data-state={state}>
        <PanelStateMessage state="error" />
      </div>
    );
  }

  return (
    <W2ShellOnly feature="paper">
      <div
        className={["ihl-panel w2-paper", className].filter(Boolean).join(" ")}
        data-component-id={ID}
        data-w2-patched="true"
        data-state={state}
      >
        <div className="w2-paper-case-row" role="toolbar" aria-label="case チップ（探索用）">
          {PAPER_CASE_CHIPS.map((chip) => (
            <span key={chip} className={["w2-paper-case-chip", chip === "paper" ? "w2-paper-case-chip--active" : ""].filter(Boolean).join(" ")}>
              {chip}
            </span>
          ))}
        </div>

        <header className="w2-paper-header">
          <div className="w2-paper-header__main">
            <span className="w2-paper-header__icon" aria-hidden>
              📄
            </span>
            <div>
              <h1 className="ihl-panel__title">{paper.title}</h1>
              <span className="ihl-chip ihl-chip--warn">
                進行中（{paper.case_chip}）
              </span>
            </div>
          </div>
          <span className="ihl-chip ihl-chip--warn w2-paper-phase-badge">
            今この phase: {phase.label_ja}
          </span>
        </header>

        <div className="ihl-grid-2 w2-paper-grid">
          <section className="ihl-card w2-paper-sections" aria-label="6 節テンプレ">
            <SectionRow sectionKey="purpose" filled={sections.purpose.filled}>
              {sections.purpose.filled ? (
                sections.purpose.text
              ) : (
                <span className="w2-paper-placeholder">何を明らかにするかを記入…</span>
              )}
            </SectionRow>

            <SectionRow sectionKey="hypothesis" filled={sections.hypothesis.filled}>
              {sections.hypothesis.filled ? (
                sections.hypothesis.text
              ) : (
                <span className="w2-paper-placeholder">P⇒Q の予想を記入…</span>
              )}
            </SectionRow>

            <SectionRow sectionKey="conditions" filled={sections.conditions.filled}>
              {sections.conditions.filled ? (
                <div className="w2-paper-condition-chips">
                  <span className="ihl-chip">温度 {sections.conditions.temperature_c}°C</span>
                  <span className="ihl-chip">湿度 {sections.conditions.humidity_pct}%</span>
                  <span className="ihl-chip">餌 {sections.conditions.feed}</span>
                </div>
              ) : (
                <span className="w2-paper-placeholder">温度 · 湿度 · 餌を記入…</span>
              )}
            </SectionRow>

            <SectionRow sectionKey="verification" filled={sections.verification.filled}>
              {sections.verification.filled ? (
                sections.verification.text
              ) : (
                <span className="w2-paper-placeholder">検証対象を記入…</span>
              )}
            </SectionRow>

            <SectionRow sectionKey="current_phase" filled={sections.current_phase.filled}>
              <span className="ihl-chip ihl-chip--warn">{phase.label_ja}（記録中）</span>
            </SectionRow>

            <SectionRow sectionKey="gaps" filled={sections.gaps.filled}>
              <div className="w2-paper-gaps">
                <p className="w2-paper-gaps__note">{sections.gaps.note}</p>
                <div className="w2-paper-gaps__keys">
                  {sections.gaps.missing_keys.map((key) => (
                    <span key={key} className="ihl-chip">
                      {key}
                    </span>
                  ))}
                  {sections.gaps.tags.map((tag) => (
                    <span key={tag} className="ihl-chip ihl-chip--danger">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </SectionRow>
          </section>

          <section className="ihl-card w2-paper-rail" aria-label="5 ステップ進行">
            <h2 className="ihl-card__title">研究の進行ステップ</h2>
            <PhaseTimeline currentStep={phase.step} />
            <button
              type="button"
              className="ihl-btn-outline w2-paper-rail__cta"
              onClick={() =>
                onNavigate?.("05i", {
                  preset_temp: sections.conditions.temperature_c,
                  preset_humidity: sections.conditions.humidity_pct,
                  preset_feed: sections.conditions.feed,
                })
              }
            >
              同じ条件でデータを追加する
            </button>
            <p className="w2-paper-rail__hint">条件を合わせて参加できます（{formatConditions(sections.conditions)}）</p>
          </section>
        </div>

        <footer className="w2-paper-footer">
          <button type="button" className="ihl-btn-ghost" onClick={() => onNavigate?.("05ctx")}>
            ← 観測キャプチャへ
          </button>
          <button type="button" className="ihl-btn-ghost" onClick={() => onAction?.("add-citation")}>
            引用を追加
          </button>
          <button type="button" className="ihl-btn-primary" onClick={() => onNavigate?.("09t")}>
            テンプレを編集 →
          </button>
        </footer>
        <p className="w2-paper-footnote">進行中のまま保存（消えません）· 論文は終点ではなく研究の起点</p>
      </div>

      <nav className="w2-hand-shell__footer" aria-label="論文導線">
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("07a")}>
          知の広場
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("09t")}>
          テンプレ穴埋め
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("05ctx")}>
          観測
        </button>
      </nav>
    </W2ShellOnly>
  );
}
