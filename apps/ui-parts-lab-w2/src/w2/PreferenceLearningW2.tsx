import { useCallback, useEffect, useMemo, useState } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import "@ihl/ui-catalog/components/features/vote/vote.css";
import { W2ShellOnly } from "./withW2Shell";
import {
  buildProfileFromSession,
  CONVERGE_ROUNDS,
  emptyDimensionMatrix,
  COLOR_FILTER_DEFERRED_NOTE,
  FILTERABLE_VECTOR_KEYS,
  formatSpecimenBlock,
  formatVectorValue,
  getCurrentPair,
  pairKey,
  readPreferencePhase,
  readPreferenceProfile,
  readPreferenceSession,
  reasonForSpecimen,
  recommendSpecimens,
  VECTOR_DIM_META,
  VECTOR_DIRECTION_LABEL,
  VALUECHECK_DIM_LABEL,
  VALUECHECK_DIMENSIONS,
  VALUECHECK_TEMPLATE_ID,
  writePreferencePhase,
  writePreferenceProfile,
  writePreferenceSession,
  type DimensionMatrixEntry,
  type MockSpecimen,
  type OverallFit,
  type PreferencePhase,
  type PreferenceProfileMock,
  type PreferenceSession,
  type ValueCheckCell,
  type ValueCheckRecord,
  type VectorDimensionKey,
} from "./preference-profile-lab";

const ID = "ihl-10-preference-pairwise";

function ProgressChip({ phase }: { phase: PreferencePhase }) {
  const steps = [
    { id: "discover", label: "発見", active: phase === "recommend" },
    { id: "refine", label: "精緻化", active: phase === "pairwise" || phase === "converged" },
    { id: "match", label: "マッチ", active: false, muted: true },
  ];
  return (
    <div className="w2-mch-progress" role="navigation" aria-label="好み学習の進捗">
      {steps.map((step, i) => (
        <span key={step.id} className="w2-mch-progress__item">
          {i > 0 && <span className="w2-mch-progress__sep" aria-hidden>—</span>}
          <span
            className={[
              "w2-mch-progress__chip",
              step.active ? "w2-mch-progress__chip--active" : "",
              step.muted ? "w2-mch-progress__chip--muted" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {step.label}
            {step.active && <span className="w2-mch-progress__dot" aria-hidden>●</span>}
            {!step.active && !step.muted && <span className="w2-mch-progress__dot" aria-hidden>○</span>}
          </span>
        </span>
      ))}
    </div>
  );
}

function SpecimenTextCard({ specimen }: { specimen: MockSpecimen }) {
  const rows = formatSpecimenBlock(specimen);
  return (
    <div className="w2-mch-spec-text" aria-label={`${specimen.name} の属性`}>
      <p className="w2-mch-spec-text__name">{specimen.name}</p>
      <dl className="w2-mch-spec-text__grid">
        {rows.map((row) => (
          <div key={row.label} className="w2-mch-spec-text__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RecommendView({
  profile,
  onStartPairwise,
  onDetail,
}: {
  profile: PreferenceProfileMock | null;
  onStartPairwise: () => void;
  onDetail: (id: string) => void;
}) {
  const items = recommendSpecimens(profile);
  const isEmpty = !profile || profile.voteCount === 0;

  if (isEmpty) {
    return (
      <div className="w2-mch-empty">
        <h3 className="w2-mch-empty__title">まだおすすめがありません</h3>
        <p className="w2-mch-empty__lead">
          好みを教えていただくと、あなた向けの個体をおすすめできます。
        </p>
        <button type="button" className="w2-mch-btn-primary" onClick={onStartPairwise}>
          まず②で好みを教えて
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w2-mch-rec-grid">
        {items.map((item) => (
          <article key={item.id} className="w2-mch-rec-card">
            <SpecimenTextCard specimen={item} />
            <p className="w2-mch-rec-card__reason">{reasonForSpecimen(item, profile)}</p>
            <button type="button" className="w2-mch-link" onClick={() => onDetail(item.id)}>
              詳細 ▸
            </button>
          </article>
        ))}
      </div>
      <button type="button" className="w2-mch-btn-primary w2-mch-btn-primary--center" onClick={onStartPairwise}>
        好みをもっと精緻化する
      </button>
    </>
  );
}

function ValueCheckOverlay({
  left,
  right,
  onClose,
  onSubmit,
}: {
  left: MockSpecimen;
  right: MockSpecimen;
  onClose: () => void;
  onSubmit: (record: Omit<ValueCheckRecord, "createdAt" | "round">) => void;
}) {
  const [dimensions, setDimensions] = useState<DimensionMatrixEntry[]>(emptyDimensionMatrix);
  const [overallFit, setOverallFit] = useState<OverallFit | null>(null);

  const setCell = (key: DimensionMatrixEntry["key"], value: ValueCheckCell) => {
    setDimensions((prev) =>
      prev.map((d) => (d.key === key ? { ...d, value: d.value === value ? null : value } : d)),
    );
  };

  const handleSubmit = () => {
    if (!overallFit) return;
    onSubmit({
      templateId: VALUECHECK_TEMPLATE_ID,
      dimensions,
      overallFit,
      leftId: left.id,
      rightId: right.id,
    });
    onClose();
  };

  return (
    <div
      className="w2-mch-vc-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="w2-mch-vc-title"
      data-testid="mch-valuecheck-overlay"
    >
      <div className="w2-mch-vc-panel">
        <h3 id="w2-mch-vc-title" className="w2-mch-vc-title">詳しく評価（任意）</h3>
        <p className="w2-mch-vc-lead">
          ペア: {left.name} / {right.name}
        </p>

        <table className="w2-mch-vc-grid">
          <thead>
            <tr>
              <th scope="col">次元</th>
              <th scope="col">×</th>
              <th scope="col">−</th>
              <th scope="col">◯</th>
              <th scope="col">skip</th>
            </tr>
          </thead>
          <tbody>
            {VALUECHECK_DIMENSIONS.map((key) => {
              const entry = dimensions.find((d) => d.key === key)!;
              return (
                <tr key={key}>
                  <th scope="row">{VALUECHECK_DIM_LABEL[key]}</th>
                  {(["x", "minus", "circle", null] as const).map((val) => (
                    <td key={String(val)}>
                      <button
                        type="button"
                        className={[
                          "w2-mch-vc-cell",
                          entry.value === val ? "w2-mch-vc-cell--active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-pressed={entry.value === val}
                        data-testid={`mch-vc-cell-${key}-${val ?? "skip"}`}
                        onClick={() => setCell(key, val)}
                      >
                        {val === "x" ? "×" : val === "minus" ? "−" : val === "circle" ? "◯" : "—"}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <fieldset className="w2-mch-vc-overall">
          <legend>総合</legend>
          {(["no", "maybe", "yes"] as const).map((fit) => (
            <label key={fit} className="w2-mch-vc-overall__label">
              <input
                type="radio"
                name="overall-fit"
                checked={overallFit === fit}
                onChange={() => setOverallFit(fit)}
              />
              {fit === "no" ? "no" : fit === "maybe" ? "maybe" : "yes"}
            </label>
          ))}
        </fieldset>

        <div className="w2-mch-vc-actions">
          <button
            type="button"
            className="w2-mch-btn-primary"
            data-testid="mch-vc-submit"
            disabled={!overallFit}
            onClick={handleSubmit}
          >
            送信
          </button>
          <button type="button" className="w2-mch-btn-ghost" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

function PairwiseView({
  session,
  onChoice,
  onBackToRecommend,
  onValueCheck,
}: {
  session: PreferenceSession;
  onChoice: (choice: "left" | "right" | "neither") => void;
  onBackToRecommend: () => void;
  onValueCheck: (record: Omit<ValueCheckRecord, "createdAt" | "round">) => void;
}) {
  const [showVc, setShowVc] = useState(false);
  const pair = getCurrentPair(session);
  const [left, right] = pair;
  const round = session.round + 1;

  return (
    <>
      <div className="w2-mch-pairwise-toolbar">
        <button type="button" className="w2-mch-link" onClick={onBackToRecommend}>
          ← おすすめに戻る
        </button>
        <span className="w2-mch-round">{round}/{CONVERGE_ROUNDS} 回</span>
      </div>
      <p className="ihl-vote__lead">どちらの個体が好みですか？</p>
      <div className="w2-mch-pair-grid" data-testid="mch-pair-container">
        {([["left", left], ["right", right]] as const).map(([side, specimen]) => (
          <div key={side} className="w2-mch-pair-col">
            <SpecimenTextCard specimen={specimen} />
            <button
              type="button"
              className="w2-mch-pair-btn"
              onClick={() => onChoice(side)}
            >
              {side === "left" ? "左" : "右"}
            </button>
          </div>
        ))}
      </div>
      <div className="w2-mch-pair-secondary">
        <button type="button" className="w2-mch-btn-ghost" onClick={() => onChoice("neither")}>
          どちらも ×
        </button>
        <button
          type="button"
          className="w2-mch-link w2-mch-pair-detail"
          data-testid="mch-pair-btn-detail"
          onClick={() => setShowVc(true)}
        >
          詳しく ▸
        </button>
      </div>
      {showVc && (
        <ValueCheckOverlay
          left={left}
          right={right}
          onClose={() => setShowVc(false)}
          onSubmit={onValueCheck}
        />
      )}
    </>
  );
}

function ConvergedView({
  profile,
  onContinue,
  onApplySearch,
}: {
  profile: PreferenceProfileMock;
  onContinue: () => void;
  onApplySearch: () => void;
}) {
  const pct = Math.round(profile.confidence * 100);
  const vectorKeys = FILTERABLE_VECTOR_KEYS.filter((k) => profile.vector?.[k]);

  return (
    <div className="w2-mch-converged">
      <h3 className="w2-mch-converged__title">あなたの好み（暫定）</h3>
      <div className="w2-mch-converged__meter" aria-label={`収束度 ${pct}%`}>
        <div className="w2-mch-converged__bar" style={{ width: `${pct}%` }} />
        <span className="w2-mch-converged__pct">収束度 {pct}%</span>
      </div>
      <p className="w2-mch-converged__meta">評価数: {profile.voteCount}</p>
      <p className="w2-mch-converged__prefer">{profile.summaryLine}</p>

      {vectorKeys.length > 0 && (
        <div className="w2-mch-converged__vector" data-testid="mch-profile-vector">
          <p style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", margin: "8px 0 4px" }}>
            好み条件（数値）
          </p>
          <ul style={{ margin: 0, padding: "0 0 0 1.1em", fontSize: "0.8125rem", lineHeight: 1.6 }}>
            {vectorKeys.map((key) => {
              const entry = profile.vector[key]!;
              const meta = VECTOR_DIM_META[key];
              return (
                <li key={key}>
                  {meta.label}: {formatVectorValue(key, entry.target)}
                  {VECTOR_DIRECTION_LABEL[entry.direction]}
                </li>
              );
            })}
          </ul>
          <p style={{ fontSize: "0.7rem", color: "var(--civ-fg-muted)", margin: "6px 0 0", lineHeight: 1.4 }}>
            {COLOR_FILTER_DEFERRED_NOTE}
          </p>
        </div>
      )}

      {profile.prefer.length > 0 && (
        <p className="w2-mch-converged__prefer" style={{ fontSize: "0.75rem", opacity: 0.85 }}>
          ラベル要約: {profile.prefer.slice(0, 4).join("・")}
        </p>
      )}
      {profile.avoid.length > 0 && (
        <p className="w2-mch-converged__avoid">避ける傾向: {profile.avoid.join("・")}</p>
      )}
      <div className="w2-mch-converged__actions">
        <button type="button" className="w2-mch-btn-ghost" onClick={onContinue}>
          続ける
        </button>
        <button type="button" className="w2-mch-btn-primary" onClick={onApplySearch}>
          検索に反映
        </button>
      </div>
    </div>
  );
}

function PreviewBand({ profile }: { profile: PreferenceProfileMock | null }) {
  const order = recommendSpecimens(profile).map((s) => s.name);
  return (
    <aside className="w2-mch-preview" aria-label="好み反映プレビュー">
      <p className="w2-mch-preview__label">プレビュー帯 — 学習中の並びイメージ</p>
      <ol className="w2-mch-preview__list">
        {order.map((name, i) => (
          <li key={name}>
            <span className="w2-mch-preview__rank">{i + 1}</span>
            {name}
          </li>
        ))}
      </ol>
    </aside>
  );
}

/** 3101 専用 — 好み学習 (#10 · ADR-H-02 · UI設計-v1) */
export function PreferenceLearningContentAreaW2(props: W2ComponentProps) {
  const { state = "ok", onNavigate, className } = props;
  const [phase, setPhase] = useState<PreferencePhase>(() => readPreferencePhase());
  const [session, setSession] = useState<PreferenceSession>(() => readPreferenceSession());
  const [profile, setProfile] = useState<PreferenceProfileMock | null>(() => readPreferenceProfile());
  const [error, setError] = useState<string | null>(null);

  const syncPhase = useCallback((next: PreferencePhase) => {
    setPhase(next);
    writePreferencePhase(next);
  }, []);

  useEffect(() => {
    writePreferenceSession(session);
  }, [session]);

  const currentProfile = useMemo(() => {
    if (session.votes.length > 0 || (session.valueChecks?.length ?? 0) > 0) {
      return buildProfileFromSession(session);
    }
    return profile;
  }, [session, profile]);

  const persistProfile = useCallback((nextSession: PreferenceSession) => {
    const built = buildProfileFromSession(nextSession);
    writePreferenceProfile(built);
    setProfile(built);
    return built;
  }, []);

  const handleStartPairwise = () => {
    setError(null);
    syncPhase("pairwise");
  };

  const handleBackToRecommend = () => {
    syncPhase("recommend");
  };

  const handleChoice = (choice: "left" | "right" | "neither") => {
    const [left, right] = getCurrentPair(session);
    const key = pairKey(left.id, right.id);
    const nextVotes = [
      ...session.votes,
      { choice, left: left.traits, right: right.traits, leftId: left.id, rightId: right.id },
    ];
    const nextRound = session.round + 1;
    const nextPairIndex = session.pairIndex + 1;
    const usedPairKeys = [...(session.usedPairKeys ?? []), key];

    if (nextRound >= CONVERGE_ROUNDS) {
      const nextSession: PreferenceSession = {
        ...session,
        phase: "converged",
        round: nextRound,
        pairIndex: nextPairIndex,
        votes: nextVotes,
        usedPairKeys,
      };
      persistProfile(nextSession);
      setSession(nextSession);
      syncPhase("converged");
      return;
    }

    const nextSession: PreferenceSession = {
      ...session,
      round: nextRound,
      pairIndex: nextPairIndex,
      votes: nextVotes,
      usedPairKeys,
    };
    persistProfile(nextSession);
    setSession(nextSession);
  };

  const handleValueCheck = (partial: Omit<ValueCheckRecord, "createdAt" | "round">) => {
    const record: ValueCheckRecord = {
      ...partial,
      round: session.round,
      createdAt: new Date().toISOString(),
    };
    const nextSession: PreferenceSession = {
      ...session,
      valueChecks: [...(session.valueChecks ?? []), record],
    };
    persistProfile(nextSession);
    setSession(nextSession);
  };

  const handleContinue = () => {
    syncPhase("pairwise");
  };

  const handleApplySearch = () => {
    if (currentProfile) writePreferenceProfile(currentProfile);
    onNavigate?.("05a");
  };

  if (state === "loading") {
    return (
      <W2ShellOnly feature="misc">
        <section className={["ihl-vote", className].filter(Boolean).join(" ")} data-component-id={`${ID}__ContentArea`} data-state="loading">
          <p className="w2-mch-loading">ペアを読み込み中…</p>
        </section>
      </W2ShellOnly>
    );
  }

  if (state === "error") {
    return (
      <W2ShellOnly feature="misc">
        <section className={["ihl-vote", className].filter(Boolean).join(" ")} data-component-id={`${ID}__ContentArea`} data-state="error">
          <p role="alert">記録に失敗しました。もう一度お試しください。</p>
          <button type="button" className="w2-mch-btn-outline" onClick={() => setError(null)}>
            再試行
          </button>
        </section>
      </W2ShellOnly>
    );
  }

  return (
    <W2ShellOnly feature="misc">
      <section
        className={["ihl-vote", "w2-mch", className].filter(Boolean).join(" ")}
        data-component-id={`${ID}__ContentArea`}
        data-state={state}
        data-w2-patched="true"
      >
        <p className="ihl-vote__crumb">好み学習</p>
        <h2 className="ihl-vote__title">好み学習</h2>
        <p className="w2-mch-sample-note">サンプルデータ — 本番個体ではありません</p>

        <ProgressChip phase={phase} />

        {error && (
          <div className="w2-mch-error" role="alert">
            {error}
            <button type="button" className="w2-mch-link" onClick={() => setError(null)}>
              再試行
            </button>
          </div>
        )}

        {phase === "recommend" && (
          <RecommendView
            profile={currentProfile}
            onStartPairwise={handleStartPairwise}
            onDetail={() => onNavigate?.("05b")}
          />
        )}

        {phase === "pairwise" && (
          <PairwiseView
            session={session}
            onChoice={handleChoice}
            onBackToRecommend={handleBackToRecommend}
            onValueCheck={handleValueCheck}
          />
        )}

        {phase === "converged" && currentProfile && (
          <ConvergedView profile={currentProfile} onContinue={handleContinue} onApplySearch={handleApplySearch} />
        )}

        <PreviewBand profile={currentProfile} />
      </section>
    </W2ShellOnly>
  );
}

export function PreferenceLearningPrimaryActionW2(_props: W2ComponentProps) {
  return null;
}

export function PreferenceLearningStatePanelW2(_props: W2ComponentProps) {
  return <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true" />;
}
