import { useCallback, useEffect, useMemo, useState } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  hot,
  ObsDeepNav,
  ObsScreenWrap,
  ObsTargetChip,
} from "@ihl/ui-catalog/components/features/observation/obs-shared";
import { W2ShellOnly } from "./withW2Shell";
import { readWorkflowContext, targetChipLabel, writeWorkflowContext } from "./observation-draft-lab";
import {
  readSubscriptions,
  resolveActiveSubscription,
  subscriptionToWorkflowContext,
  writeLastTargetId,
  type ObsSubscription,
} from "./obs-subscription-lab";
import {
  adjustProfileFromFeedback,
  applyProfileTrustEdits,
  applyProfileVectorEdits,
  defaultFilters,
  PAGE_LIMIT,
  preferenceProximityScore,
  searchCaptures,
  sexLabel,
  stageLabel,
  type ObsCaptureRecord,
  type ObsSearchFilters,
  type ObsSortMode,
  type ObsSex,
  type ObsStage,
} from "./obs-search-mock";
import {
  COLOR_FILTER_DEFERRED_NOTE,
  DEFAULT_TRUST_FILTERS,
  emptyNumericFilterDraft,
  learnedHintForKey,
  normalizeTrustFilters,
  numericDraftFromProfile,
  normalizeProfile,
  readPreferenceProfile,
  trustFiltersActive,
  trustFromNumericDraft,
  vectorFromNumericDraft,
  type NumericFilterDraft,
  type NumericFilterDraftEntry,
  type PreferenceProfileMock,
  type PreferenceVector,
  type TrustFilters,
} from "./preference-profile-lab";
import { NumericFilterRow, type NumericRowKey } from "./NumericFilterRow";

const ID = "ihl-05-obs-search-grid";

const ALL_NUMERIC_KEYS: NumericRowKey[] = [
  "body_length_mm",
  "horn_length_mm",
  "price_yen",
  "karma",
  "market_good_count",
  "market_bad_count",
];

const STAGE_OPTIONS: { value: ObsStage | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "egg", label: "卵" },
  { value: "larva", label: "幼虫" },
  { value: "pupa", label: "蛹" },
  { value: "adult", label: "成虫" },
];

function SearchSkeleton() {
  return (
    <div className="obs-result-grid" aria-busy="true" aria-label="読み込み中">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="obs-result-card" style={{ opacity: 0.45, pointerEvents: "none" }}>
          <div className="obs-result-card__thumb" aria-hidden>
            —
          </div>
          <div className="obs-result-card__meta">読み込み中…</div>
        </div>
      ))}
    </div>
  );
}

function NumericFiltersSection({
  profile,
  draft,
  trustFlags,
  onDraftChange,
  onTrustFlagsChange,
  onLoadPreferences,
}: {
  profile: PreferenceProfileMock | null;
  draft: NumericFilterDraft;
  trustFlags: TrustFilters;
  onDraftChange: (next: NumericFilterDraft) => void;
  onTrustFlagsChange: (next: TrustFilters) => void;
  onLoadPreferences: () => void;
}) {
  const pct = profile && profile.voteCount > 0 ? Math.round(profile.confidence * 100) : null;

  const patchRow = (key: NumericRowKey, entry: NumericFilterDraftEntry) => {
    onDraftChange({ ...draft, [key]: entry });
  };

  return (
    <div className="obs-filter-group" data-testid="obs-numeric-filters">
      <label>数値条件（好み・信頼）</label>

      {profile && profile.voteCount > 0 && (
        <p className="obs-filter-summary">
          {profile.summaryLine}
          {pct !== null && <span>（収束 {pct}%）</span>}
        </p>
      )}

      <details className="obs-filter-details">
        <summary>条件の説明</summary>
        <p>
          体長・角長は好みの並び替え、金額は予算の好みです。カルマ・良い/悪い件数は出品者の信頼ゲート（ハード除外）ですが、
          以上・以下・付近の方向は他の数値次元と同じです。空欄の次元は〔絞り込む〕で適用されません。
          {COLOR_FILTER_DEFERRED_NOTE}
        </p>
      </details>

      <details className="obs-filter-details">
        <summary>マーケット評価の算出（ADR-H-08 · 06 §11 Y08）</summary>
        <p>
          取引相手の声 — <strong>良い / 普通 / 悪い</strong> の件数（悪いはタグ+理由必須 · 版管理）。
          検索フィルタは件数ベース（何件以上/以下）· 良い率（%）は結果カード表示のみ。
          カルマ・好み学習の評価とは別ドメインです。
        </p>
      </details>

      <button
        type="button"
        className="obs-btn-outline obs-filter-load-btn"
        data-testid="obs-load-preference"
        onClick={onLoadPreferences}
      >
        好み学習を読み込む
      </button>

      {ALL_NUMERIC_KEYS.map((key) => (
        <NumericFilterRow
          key={key}
          rowKey={key}
          entry={
            draft[key] ?? {
              value: null,
              direction: key === "price_yen" ? "lte" : "gte",
            }
          }
          learnedHint={learnedHintForKey(profile, key)}
          onChange={(entry) => patchRow(key, entry)}
        />
      ))}

      <label className="obs-trust-checkbox">
        <input
          type="checkbox"
          checked={trustFlags.excludeLowRatedSellers}
          aria-label="悪い評価のある出品者を除外（悪い5件以上またはカルマ0以下）"
          onChange={(e) =>
            onTrustFlagsChange({ ...trustFlags, excludeLowRatedSellers: e.target.checked })
          }
        />
        <span>
          悪い評価のある出品者を除外
          <span className="obs-trust-checkbox__note">
            悪い ≥ 5 件 or カルマ ≤ 0 の出品者を非表示（悪い件数フィルタと同型）
          </span>
        </span>
      </label>
    </div>
  );
}

function PreferenceProfileBand({
  profile,
  onOpenLearning,
}: {
  profile: PreferenceProfileMock | null;
  onOpenLearning: () => void;
}) {
  if (!profile || profile.voteCount === 0) {
    return (
      <button
        type="button"
        className="obs-card obs-pref-band obs-pref-band--cold"
        onClick={onOpenLearning}
        style={{
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          marginBottom: 16,
          padding: "12px 14px",
          border: "1px dashed var(--civ-border-card)",
        }}
      >
        <strong style={{ fontSize: "0.875rem" }}>好みが未設定です</strong>
        <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>
          好み学習で傾向を教えると、検索結果を近い順に並べ替えます。
        </p>
        <span className="obs-btn-link" style={{ marginTop: 8, display: "inline-block" }}>
          好みを教える →
        </span>
      </button>
    );
  }

  const pct = Math.round(profile.confidence * 100);
  return (
    <button
      type="button"
      className="obs-card obs-pref-band"
      onClick={onOpenLearning}
      style={{
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        marginBottom: 16,
        padding: "12px 14px",
      }}
    >
      <span style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)" }}>あなたの好み</span>
      <p style={{ margin: "4px 0 0", fontSize: "0.875rem" }}>
        {profile.summaryLine}
        <span style={{ color: "var(--civ-fg-muted)", marginLeft: 8 }}>（収束 {pct}%）</span>
      </p>
      <span className="obs-btn-link" style={{ marginTop: 6, display: "inline-block", fontSize: "0.8125rem" }}>
        好み学習を開く →
      </span>
    </button>
  );
}

function CaptureCard({
  capture,
  profile,
  appliedVector,
  sortMode,
  onOpenDetail,
  onFeedback,
}: {
  capture: ObsCaptureRecord;
  profile: PreferenceProfileMock | null;
  appliedVector: PreferenceVector;
  sortMode: ObsSortMode;
  onOpenDetail: () => void;
  onFeedback: (fb: "up" | "down") => void;
}) {
  const showPrefChip =
    sortMode === "preference-proximity" &&
    Object.keys(appliedVector).length > 0 &&
    profile &&
    preferenceProximityScore(capture, profile, appliedVector) > 0;

  return (
    <div className="obs-result-card" style={{ position: "relative" }}>
      <button
        type="button"
        style={{ width: "100%", border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left" }}
        onClick={onOpenDetail}
        data-testid="obs-open-detail"
      >
        <div className="obs-result-card__thumb" aria-hidden>
          <span style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)" }}>{capture.view_type}</span>
        </div>
        <div className="obs-result-card__meta">
          {showPrefChip && (
            <span
              style={{
                display: "inline-block",
                marginBottom: 4,
                padding: "2px 6px",
                fontSize: "0.625rem",
                borderRadius: 4,
                background: "rgba(201, 162, 39, 0.2)",
                color: "#C9A227",
              }}
            >
              好み
            </span>
          )}
          <div>
            体長 {capture.body_length_mm || "—"}mm · ¥{capture.priceYen.toLocaleString("ja-JP")} · {sexLabel(capture.sex)}
          </div>
          <div style={{ marginTop: 2, fontSize: "0.7rem", opacity: 0.85 }}>
            {capture.sellerName} · マーケット評価 良{capture.marketRatingGood}/普
            {capture.marketRatingNeutral}/悪{capture.marketRatingBad}（{capture.marketGoodRatePct}%）· カルマ
            {capture.sellerKarma >= 0 ? "+" : ""}
            {capture.sellerKarma}
          </div>
          <div style={{ marginTop: 2, opacity: 0.7, fontSize: "0.65rem" }}>{capture.capture_id}</div>
        </div>
      </button>
      {profile && profile.voteCount > 0 && (
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "0 8px 8px",
            justifyContent: "flex-end",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="obs-btn-ghost"
            aria-label="この個体は好みに合う"
            title="好みに合う"
            style={{ fontSize: "0.875rem", padding: "2px 6px" }}
            onClick={() => onFeedback("up")}
          >
            👍
          </button>
          <button
            type="button"
            className="obs-btn-ghost"
            aria-label="この個体は好みに合わない"
            title="好みに合わない"
            style={{ fontSize: "0.875rem", padding: "2px 6px" }}
            onClick={() => onFeedback("down")}
          >
            👎
          </button>
        </div>
      )}
    </div>
  );
}

function filtersFromSubscription(sub: ObsSubscription, stageOverride?: ObsStage): ObsSearchFilters {
  return {
    subscriptionId: sub.subscriptionId,
    species: sub.speciesName,
    scientificName: sub.scientificName,
    subspeciesStatus: sub.subspeciesStatus,
    sex: "all",
    stage_name: stageOverride ?? "all",
    keyword: "",
  };
}

function hydrateFiltersFromContext(
  screenParams: Record<string, string> | undefined,
): ObsSearchFilters {
  const subs = readSubscriptions();
  const ctx = readWorkflowContext();

  const paramSubId = screenParams?.subscription_id?.trim();
  const paramSpecies = screenParams?.species?.trim();
  const stage = screenParams?.stage?.trim() as ObsStage | undefined;

  let active = resolveActiveSubscription(paramSubId ?? ctx?.subscriptionId ?? undefined);
  if (!active && subs.length > 0) {
    active = subs[0]!;
  }

  if (!active) {
    return defaultFilters();
  }

  const base = filtersFromSubscription(active);
  writeLastTargetId(active.subscriptionId);

  if (paramSpecies) {
    if (paramSpecies.toLowerCase().includes("hercules") || paramSpecies === "Dynastes hercules") {
      base.species = "Dynastes hercules";
    } else if (paramSpecies.toLowerCase().includes("dichotoma") || paramSpecies === "Allomyrina dichotoma") {
      base.species = "Allomyrina dichotoma";
    } else {
      base.species = paramSpecies;
    }
  }

  if (stage && ["egg", "larva", "pupa", "adult"].includes(stage)) {
    base.stage_name = stage;
  } else if (ctx?.stage && ctx.stage !== "unknown") {
    base.stage_name = ctx.stage as ObsStage;
  }

  if (ctx?.scientificName) {
    base.scientificName = ctx.scientificName;
  }

  return base;
}

export function ObsSearchContentAreaW2({
  state = "ok",
  onAction,
  onNavigate,
  screenParams,
  className,
}: W2ComponentProps) {
  const [draftFilters, setDraftFilters] = useState<ObsSearchFilters>(() => hydrateFiltersFromContext(screenParams));
  const [appliedFilters, setAppliedFilters] = useState<ObsSearchFilters>(() => hydrateFiltersFromContext(screenParams));
  const [subscriptions, setSubscriptions] = useState(() => readSubscriptions());
  const [profile, setProfile] = useState<PreferenceProfileMock | null>(() => readPreferenceProfile());
  const [numericDraft, setNumericDraft] = useState<NumericFilterDraft>(() => emptyNumericFilterDraft());
  const [draftTrustFlags, setDraftTrustFlags] = useState<TrustFilters>(() => ({ ...DEFAULT_TRUST_FILTERS }));
  const [appliedTrust, setAppliedTrust] = useState<TrustFilters>(() => ({ ...DEFAULT_TRUST_FILTERS }));
  const [appliedVector, setAppliedVector] = useState<PreferenceVector>({});
  const [sortMode, setSortMode] = useState<ObsSortMode>("newest");
  const [page, setPage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);

  const ctx = readWorkflowContext();
  const chipLabel = targetChipLabel(ctx, ctx?.stage === "larva" ? "L3 幼虫" : "");

  useEffect(() => {
    setDraftFilters(hydrateFiltersFromContext(screenParams));
    setAppliedFilters(hydrateFiltersFromContext(screenParams));
    setSubscriptions(readSubscriptions());
    setPage(0);
  }, [screenParams?.species, screenParams?.stage, screenParams?.domain, screenParams?.subscription_id]);

  const handleSubscriptionChange = useCallback((subscriptionId: string) => {
    const sub = subscriptions.find((s) => s.subscriptionId === subscriptionId);
    if (!sub) return;
    writeLastTargetId(subscriptionId);
    const next = filtersFromSubscription(sub, draftFilters.stage_name !== "all" ? draftFilters.stage_name : undefined);
    setDraftFilters((f) => ({ ...next, sex: f.sex, keyword: f.keyword }));
    setAppliedFilters((f) => ({ ...next, sex: f.sex, keyword: f.keyword }));
    const ctx = subscriptionToWorkflowContext(sub, readWorkflowContext()?.stage ?? "larva");
    writeWorkflowContext(ctx);
    setPage(0);
  }, [subscriptions, draftFilters.stage_name]);

  useEffect(() => {
    if (state !== "loading") {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(true), 600);
    return () => window.clearTimeout(t);
  }, [state, retryKey]);

  const handleLoadPreferences = useCallback(() => {
    const stored = readPreferenceProfile();
    if (!stored) return;
    setProfile(stored);
    setNumericDraft(numericDraftFromProfile(stored));
    const trust = normalizeTrustFilters(stored.trustFilters);
    setDraftTrustFlags({
      excludeLowRatedSellers: trust.excludeLowRatedSellers,
    });
  }, []);

  const effectiveProfile = profile;

  const results = useMemo(() => {
    if (subscriptions.length === 0 || !appliedFilters.subscriptionId) {
      return [];
    }
    try {
      return searchCaptures(
        appliedFilters,
        sortMode,
        effectiveProfile,
        appliedTrust,
        appliedVector,
      );
    } catch {
      return [];
    }
  }, [appliedFilters, sortMode, effectiveProfile, appliedTrust, appliedVector, retryKey, subscriptions.length]);

  const total = results.length;
  const pageItems = results.slice(page * PAGE_LIMIT, (page + 1) * PAGE_LIMIT);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const hasActiveNumericFilter = Object.keys(appliedVector).length > 0;

  const hasActiveFilter =
    appliedFilters.subscriptionId !== "" ||
    appliedFilters.sex !== "all" ||
    appliedFilters.stage_name !== "all" ||
    appliedFilters.keyword.trim().length > 0 ||
    trustFiltersActive(appliedTrust) ||
    hasActiveNumericFilter;

  const handleApplyFilters = useCallback(() => {
    setSearchError(null);
    setAppliedFilters({ ...draftFilters });

    const vector = vectorFromNumericDraft(numericDraft);
    const trust = trustFromNumericDraft(numericDraft, draftTrustFlags);
    setAppliedTrust(normalizeTrustFilters(trust));
    setAppliedVector(vector);

    const base =
      profile ??
      normalizeProfile({
        voteCount: 0,
        summaryLine: "好みを学習中です",
        trustFilters: trust,
      });
    let next = base;
    if (Object.keys(vector).length > 0) {
      next = applyProfileVectorEdits(base, vector);
      if (sortMode === "newest") {
        setSortMode("preference-proximity");
      }
    } else if (sortMode === "preference-proximity") {
      setSortMode("newest");
    }
    next = applyProfileTrustEdits(next, trust);
    setProfile(next);
    setPage(0);
  }, [draftFilters, numericDraft, draftTrustFlags, profile, sortMode]);

  const handleFeedback = useCallback(
    (capture: ObsCaptureRecord, feedback: "up" | "down") => {
      const current = profile ?? {
        prefer: [],
        avoid: [],
        vector: {},
        confidence: 0.35,
        voteCount: 0,
        summaryLine: "好みを学習中です",
        updatedAt: new Date().toISOString(),
      };
      const next = adjustProfileFromFeedback(current, capture, feedback);
      setProfile(next);
      if (next.voteCount > 0 && sortMode === "newest") {
        setSortMode("preference-proximity");
      }
    },
    [profile, sortMode],
  );

  const renderGrid = () => {
    if (state === "loading" || !mounted) {
      return <SearchSkeleton />;
    }

    if (state === "error" || searchError) {
      return (
        <div className="obs-card" role="alert" style={{ padding: 16 }}>
          <p>{searchError ?? "観測データを取得できませんでした。"}</p>
          <button
            type="button"
            className="obs-btn-outline"
            onClick={() => {
              setSearchError(null);
              setRetryKey((k) => k + 1);
            }}
          >
            再試行
          </button>
        </div>
      );
    }

    if (state === "empty" || total === 0) {
      const noSubs = subscriptions.length === 0;
      const msg = noSubs
        ? "登録済み対象がありません。対象ナビゲータで追加してください"
        : hasActiveFilter
          ? "条件に一致する観測データがありません"
          : "観測データが未登録です";
      return (
        <div className="obs-card" role="status" style={{ padding: 16 }}>
          <p>{msg}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {hasActiveFilter && (
              <button
                type="button"
                className="obs-btn-outline"
                onClick={() => {
                  const active = resolveActiveSubscription();
                  const cleared = active ? filtersFromSubscription(active) : defaultFilters();
                  setDraftFilters(cleared);
                  setAppliedFilters(cleared);
                  setNumericDraft(emptyNumericFilterDraft());
                  setDraftTrustFlags({ ...DEFAULT_TRUST_FILTERS });
                  setAppliedTrust({ ...DEFAULT_TRUST_FILTERS });
                  setAppliedVector({});
                  setSortMode("newest");
                  setPage(0);
                }}
              >
                フィルタを緩める
              </button>
            )}
            <button type="button" className="obs-btn-outline" onClick={() => onNavigate?.("05ctx")}>
              対象を選ぶ
            </button>
            <button type="button" className="obs-btn-outline" onClick={() => onNavigate?.("05i")}>
              計測入力へ
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="obs-result-grid">
          {pageItems.map((capture) => (
            <CaptureCard
              key={capture.capture_id}
              capture={capture}
              profile={profile}
              appliedVector={appliedVector}
              sortMode={sortMode}
              onOpenDetail={() => {
                hot(onAction, 1);
                onNavigate?.("05b", { capture_id: capture.capture_id });
              }}
              onFeedback={(fb) => handleFeedback(capture, fb)}
            />
          ))}
        </div>
        {pageCount > 1 && (
          <nav className="obs-search-toolbar" style={{ marginTop: 16 }} aria-label="ページネーション">
            <button
              type="button"
              className="obs-btn-outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              前へ
            </button>
            <span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>
              {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              className="obs-btn-outline"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              次へ
            </button>
          </nav>
        )}
      </>
    );
  };

  return (
    <W2ShellOnly feature="obs">
      <ObsScreenWrap className={className} componentId={`${ID}__ContentArea`}>
        <div data-testid="obs-grid-page">
        <div className="obs-page-header">
          <div>
            <h1 className="obs-page-title">観測 検索</h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <ObsTargetChip
              label={chipLabel}
              onClick={() => {
                hot(onAction, 0);
                onNavigate?.("05ctx");
              }}
            />
            <button
              type="button"
              className="obs-btn-outline"
              onClick={() => {
                hot(onAction, 2);
                onNavigate?.("05i");
              }}
            >
              計測入力へ
            </button>
            <button
              type="button"
              className="obs-btn-outline"
              onClick={() => {
                hot(onAction, 3);
                onNavigate?.("05tl");
              }}
            >
              テンプレ一覧
            </button>
            <button
              type="button"
              className="obs-btn-ghost"
              onClick={() => {
                hot(onAction, 4);
                onNavigate?.("01");
              }}
            >
              ホーム
            </button>
          </div>
        </div>

        <PreferenceProfileBand profile={profile} onOpenLearning={() => onNavigate?.("10")} />

        <div className="obs-search-layout">
          <aside className="obs-filter-panel obs-card">
            <strong style={{ fontSize: "0.875rem" }}>フィルタ</strong>

            <div className="obs-filter-group" data-testid="obs-subscription-target">
              <label htmlFor="obs-subscription-w2">登録済み対象</label>
              {subscriptions.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: 0 }}>
                  登録済み対象がありません。
                  <button type="button" className="obs-btn-link" onClick={() => onNavigate?.("05ctx")}>
                    対象ナビゲータで追加
                  </button>
                </p>
              ) : (
                <select
                  id="obs-subscription-w2"
                  value={draftFilters.subscriptionId}
                  onChange={(e) => handleSubscriptionChange(e.target.value)}
                >
                  {subscriptions.map((sub) => (
                    <option key={sub.subscriptionId} value={sub.subscriptionId}>
                      {sub.displayJa}
                      {sub.level === "subspecies" ? "（亜種）" : "（種）"}
                    </option>
                  ))}
                </select>
              )}
              <p style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", margin: "6px 0 0" }}>
                登録済み対象から 1 件選択 · 前回の選択を記憶します
              </p>
            </div>

            <div className="obs-filter-group">
              <label>性別</label>
              <div className="obs-segmented">
                {(
                  [
                    { v: "all" as const, l: "すべて" },
                    { v: "male" as const, l: "♂" },
                    { v: "female" as const, l: "♀" },
                    { v: "unknown" as const, l: "?" },
                  ] as const
                ).map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    className={
                      draftFilters.sex === v
                        ? "obs-segmented__btn obs-segmented__btn--active"
                        : "obs-segmented__btn"
                    }
                    onClick={() => setDraftFilters((f) => ({ ...f, sex: v }))}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="obs-filter-group">
              <label>ステージ</label>
              <div className="obs-segmented">
                {STAGE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      draftFilters.stage_name === value
                        ? "obs-segmented__btn obs-segmented__btn--active"
                        : "obs-segmented__btn"
                    }
                    onClick={() => setDraftFilters((f) => ({ ...f, stage_name: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <NumericFiltersSection
              profile={profile}
              draft={numericDraft}
              trustFlags={draftTrustFlags}
              onDraftChange={setNumericDraft}
              onTrustFlagsChange={setDraftTrustFlags}
              onLoadPreferences={handleLoadPreferences}
            />

            <button type="button" className="obs-btn-primary" style={{ width: "100%" }} onClick={handleApplyFilters}>
              絞り込む
            </button>
          </aside>

          <div>
            <div className="obs-search-toolbar">
              <input
                type="search"
                placeholder="ID、タグ、備考を検索…"
                aria-label="キーワード検索"
                value={draftFilters.keyword}
                onChange={(e) => setDraftFilters((f) => ({ ...f, keyword: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyFilters();
                }}
              />
              <span style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>{total} 件</span>
              <select
                className="ihl-form-control ihl-form-select"
                aria-label="並び替え"
                value={sortMode}
                onChange={(e) => {
                  setSortMode(e.target.value as ObsSortMode);
                  setPage(0);
                }}
                style={{ minWidth: 140 }}
              >
                <option
                  value="preference-proximity"
                  disabled={Object.keys(appliedVector).length === 0}
                >
                  好み近い順
                </option>
                <option value="newest">新着順</option>
              </select>
            </div>

            {sortMode === "preference-proximity" && Object.keys(appliedVector).length > 0 && (
              <div
                className="obs-card"
                style={{ marginBottom: 12, padding: "8px 12px", fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}
              >
                並び: <strong style={{ color: "var(--civ-fg)" }}>好み近い順</strong> — 入力した数値条件に近い個体を先に表示
              </div>
            )}

            {renderGrid()}
          </div>
        </div>

        <ObsDeepNav
          onAction={onAction}
          links={[
            { label: "対象ナビゲータ", hotspot: 0 },
            { label: "計測入力", hotspot: 2 },
            { label: "ホーム", hotspot: 4 },
          ]}
        />
        </div>
      </ObsScreenWrap>
    </W2ShellOnly>
  );
}

export function ObsSearchPrimaryActionW2(_props: W2ComponentProps) {
  return null;
}

export function ObsSearchStatePanelW2({ state = "ok", className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} className={className} data-state={state} data-w2-patched="true" />
  );
}

// re-export for tests / debug
export { preferenceProximityScore, stageLabel };
export type { ObsSex };
