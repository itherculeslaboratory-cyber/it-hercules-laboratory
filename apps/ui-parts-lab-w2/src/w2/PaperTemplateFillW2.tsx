import { useCallback, useMemo, useState } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import { PanelStateMessage } from "@ihl/ui-catalog/components/shared/StandardShell";
import "@ihl/ui-catalog/components/shared/standard-shell.css";
import { W2ShellOnly } from "./withW2Shell";
import {
  MOCK_PAPER_IN_PROGRESS,
  OBSERVATION_INSERT_PRESET,
  PAPER_SECTION_LABELS,
  RESEARCH_STEPS,
  computeCompleteness,
  formatConditions,
  type PaperSectionsDraft,
  type ResearchStep,
} from "./paper-mock";

const ID = "ihl-09-paper-template-fill__PaperTemplatePanel";

function cloneSections(): PaperSectionsDraft {
  return structuredClone(MOCK_PAPER_IN_PROGRESS.sections);
}

function PreviewPane({ sections }: { sections: PaperSectionsDraft }) {
  return (
    <div className="w2-paper-preview" aria-label="節プレビュー">
      <h2 className="w2-paper-preview__title">プレビュー</h2>
      <dl className="w2-paper-preview__list">
        <div className="w2-paper-preview__row">
          <dt>{PAPER_SECTION_LABELS.purpose}</dt>
          <dd>{sections.purpose.text || "—"}</dd>
        </div>
        <div className="w2-paper-preview__row">
          <dt>{PAPER_SECTION_LABELS.hypothesis}</dt>
          <dd>{sections.hypothesis.text || "—"}</dd>
        </div>
        <div className="w2-paper-preview__row">
          <dt>{PAPER_SECTION_LABELS.conditions}</dt>
          <dd>
            {sections.conditions.filled
              ? formatConditions(sections.conditions)
              : "温度 · 湿度 · 餌を入力…"}
          </dd>
        </div>
        <div className="w2-paper-preview__row">
          <dt>{PAPER_SECTION_LABELS.verification}</dt>
          <dd>{sections.verification.text || "—"}</dd>
        </div>
        <div className="w2-paper-preview__row">
          <dt>{PAPER_SECTION_LABELS.current_phase}</dt>
          <dd>{sections.current_phase.label_ja}</dd>
        </div>
        <div className="w2-paper-preview__row">
          <dt>{PAPER_SECTION_LABELS.gaps}</dt>
          <dd>
            {sections.gaps.note || "—"}
            {sections.gaps.missing_keys.length > 0 && (
              <span className="w2-paper-preview__tags">
                {sections.gaps.missing_keys.map((k) => (
                  <span key={k} className="ihl-chip">
                    {k}
                  </span>
                ))}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** walkId 09t — テンプレ穴埋め（QuartoReview / OSF 型 split-pane） */
export function PaperTemplateFillPanelW2({
  state = "ok",
  className,
  onAction,
  onNavigate,
}: W2ComponentProps) {
  const [sections, setSections] = useState<PaperSectionsDraft>(cloneSections);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const completeness = useMemo(() => computeCompleteness(sections), [sections]);

  const patch = useCallback((patchFn: (prev: PaperSectionsDraft) => PaperSectionsDraft) => {
    setSections((prev) => patchFn(prev));
    setSavedNote(null);
  }, []);

  const insertFromObservation = () => {
    patch((prev) => ({
      ...prev,
      conditions: { ...OBSERVATION_INSERT_PRESET.conditions },
      verification: { ...OBSERVATION_INSERT_PRESET.verification },
    }));
    setSavedNote("観測 #4821 から条件・検証を差し込みました。");
  };

  const saveInProgress = () => {
    setSavedNote("進行中のまま保存しました（消えません）。");
    onAction?.("save");
  };

  if (state === "loading") {
    return (
      <div className={["ihl-panel w2-paper w2-paper--template", className].filter(Boolean).join(" ")} data-component-id={ID} data-state={state}>
        <PanelStateMessage state="loading" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className={["ihl-panel w2-paper w2-paper--template", className].filter(Boolean).join(" ")} data-component-id={ID} data-state={state}>
        <PanelStateMessage state="error" />
      </div>
    );
  }

  return (
    <W2ShellOnly feature="paper">
      <div
        className={["ihl-panel w2-paper w2-paper--template", className].filter(Boolean).join(" ")}
        data-component-id={ID}
        data-w2-patched="true"
        data-state={state}
      >
        <header className="w2-paper-template-header">
          <div>
            <p className="ihl-shell__breadcrumb">知の広場 › 論文 › テンプレート</p>
            <h1 className="ihl-panel__title">論文テンプレート（穴埋め）</h1>
            <p className="ihl-panel__subtitle">空欄を埋めると、ほぼ完成形になります</p>
          </div>
          <div className="w2-paper-meter" aria-label={`完成度 ${completeness}%`}>
            <span className="w2-paper-meter__label">完成度 {completeness}%</span>
            <div className="ihl-progress w2-paper-meter__bar">
              <div
                className="ihl-progress__bar ihl-progress__bar--success"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </header>

        <div className="w2-paper-split">
          <PreviewPane sections={sections} />

          <form
            className="w2-paper-form"
            aria-label="6 節フォーム"
            onSubmit={(e) => {
              e.preventDefault();
              saveInProgress();
            }}
          >
            <div className="w2-paper-field">
              <label className="w2-paper-field__label" htmlFor="paper-purpose">
                {PAPER_SECTION_LABELS.purpose}
                {sections.purpose.filled && <span className="w2-paper-check w2-paper-check--done">✓</span>}
              </label>
              <textarea
                id="paper-purpose"
                className="ihl-form-control w2-paper-field__input"
                rows={2}
                value={sections.purpose.text}
                placeholder="何を明らかにするか（1 行〜短文）"
                onChange={(e) =>
                  patch((prev) => ({
                    ...prev,
                    purpose: { text: e.target.value, filled: e.target.value.trim().length > 0 },
                  }))
                }
              />
            </div>

            <div className="w2-paper-field">
              <label className="w2-paper-field__label" htmlFor="paper-hypothesis">
                {PAPER_SECTION_LABELS.hypothesis}
                {sections.hypothesis.filled && <span className="w2-paper-check w2-paper-check--done">✓</span>}
              </label>
              <textarea
                id="paper-hypothesis"
                className="ihl-form-control w2-paper-field__input"
                rows={2}
                value={sections.hypothesis.text}
                placeholder="P⇒Q の予想"
                onChange={(e) =>
                  patch((prev) => ({
                    ...prev,
                    hypothesis: { text: e.target.value, filled: e.target.value.trim().length > 0 },
                  }))
                }
              />
            </div>

            <fieldset className="w2-paper-field w2-paper-field--group">
              <legend className="w2-paper-field__label">
                {PAPER_SECTION_LABELS.conditions}
                {sections.conditions.filled && <span className="w2-paper-check w2-paper-check--done">✓</span>}
              </legend>
              <div className="w2-paper-field-row">
                <label className="w2-paper-field__sublabel" htmlFor="paper-temp">
                  温度 (°C)
                </label>
                <input
                  id="paper-temp"
                  className="ihl-form-control"
                  type="text"
                  inputMode="decimal"
                  value={sections.conditions.temperature_c}
                  onChange={(e) =>
                    patch((prev) => {
                      const temperature_c = e.target.value;
                      const next = { ...prev.conditions, temperature_c };
                      return {
                        ...prev,
                        conditions: {
                          ...next,
                          filled: Boolean(next.temperature_c && next.humidity_pct && next.feed),
                        },
                      };
                    })
                  }
                />
              </div>
              <div className="w2-paper-field-row">
                <label className="w2-paper-field__sublabel" htmlFor="paper-humidity">
                  湿度 (%)
                </label>
                <input
                  id="paper-humidity"
                  className="ihl-form-control"
                  type="text"
                  inputMode="decimal"
                  value={sections.conditions.humidity_pct}
                  onChange={(e) =>
                    patch((prev) => {
                      const humidity_pct = e.target.value;
                      const next = { ...prev.conditions, humidity_pct };
                      return {
                        ...prev,
                        conditions: {
                          ...next,
                          filled: Boolean(next.temperature_c && next.humidity_pct && next.feed),
                        },
                      };
                    })
                  }
                />
              </div>
              <div className="w2-paper-field-row">
                <label className="w2-paper-field__sublabel" htmlFor="paper-feed">
                  餌
                </label>
                <input
                  id="paper-feed"
                  className="ihl-form-control"
                  type="text"
                  value={sections.conditions.feed}
                  onChange={(e) =>
                    patch((prev) => {
                      const feed = e.target.value;
                      const next = { ...prev.conditions, feed };
                      return {
                        ...prev,
                        conditions: {
                          ...next,
                          filled: Boolean(next.temperature_c && next.humidity_pct && next.feed),
                        },
                      };
                    })
                  }
                />
              </div>
            </fieldset>

            <div className="w2-paper-field">
              <label className="w2-paper-field__label" htmlFor="paper-verify">
                {PAPER_SECTION_LABELS.verification}
                {sections.verification.filled && <span className="w2-paper-check w2-paper-check--done">✓</span>}
              </label>
              <textarea
                id="paper-verify"
                className="ihl-form-control w2-paper-field__input"
                rows={2}
                value={sections.verification.text}
                placeholder="検証対象を記入…"
                onChange={(e) =>
                  patch((prev) => ({
                    ...prev,
                    verification: { text: e.target.value, filled: e.target.value.trim().length > 0 },
                  }))
                }
              />
            </div>

            <div className="w2-paper-field">
              <label className="w2-paper-field__label" htmlFor="paper-phase">
                {PAPER_SECTION_LABELS.current_phase}
              </label>
              <select
                id="paper-phase"
                className="ihl-form-control ihl-form-select w2-paper-field__input"
                value={sections.current_phase.step}
                onChange={(e) => {
                  const step = e.target.value as ResearchStep;
                  const label = RESEARCH_STEPS.find((s) => s.step === step)?.label ?? step;
                  patch((prev) => ({
                    ...prev,
                    current_phase: { step, label_ja: label, filled: true },
                  }));
                }}
              >
                {RESEARCH_STEPS.map((s) => (
                  <option key={s.step} value={s.step}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w2-paper-field">
              <label className="w2-paper-field__label" htmlFor="paper-gaps">
                {PAPER_SECTION_LABELS.gaps}
                {sections.gaps.filled && <span className="w2-paper-check w2-paper-check--done">✓</span>}
              </label>
              <textarea
                id="paper-gaps"
                className="ihl-form-control w2-paper-field__input"
                rows={2}
                value={sections.gaps.note}
                placeholder="不足キー · 自分が足せるデータ…"
                onChange={(e) =>
                  patch((prev) => ({
                    ...prev,
                    gaps: {
                      ...prev.gaps,
                      note: e.target.value,
                      filled: e.target.value.trim().length > 0,
                    },
                  }))
                }
              />
              {sections.gaps.missing_keys.length > 0 && (
                <div className="w2-paper-gaps__keys">
                  {sections.gaps.missing_keys.map((key) => (
                    <span key={key} className="ihl-chip">
                      {key}
                    </span>
                  ))}
                  <span className="ihl-chip ihl-chip--danger">不足</span>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="w2-paper-template-actions">
          <button type="button" className="ihl-btn-outline" onClick={() => onAction?.("preview")}>
            プレビュー / 論文にする
          </button>
          <button type="button" className="ihl-btn-ghost" onClick={insertFromObservation}>
            観測から差し込む（自動）
          </button>
          <button type="button" className="ihl-btn-primary" onClick={saveInProgress}>
            進行中のまま保存
          </button>
          <button type="button" className="ihl-btn-ghost w2-paper-template-actions__back" onClick={() => onNavigate?.("09")}>
            ← 進行中論文
          </button>
        </div>

        <p className="w2-paper-footnote">
          {savedNote ?? "進行中のまま保存（消えません）· append-only"}
        </p>
      </div>

      <nav className="w2-hand-shell__footer" aria-label="論文テンプレ導線">
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("09")}>
          進行中論文
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("05ctx")}>
          観測
        </button>
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("07a")}>
          知の広場
        </button>
      </nav>
    </W2ShellOnly>
  );
}
