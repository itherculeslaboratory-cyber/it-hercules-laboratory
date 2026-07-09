/** 3101 lab — preference_profile mock handoff (#10 → 05a · 05-検索-PREFERENCE-FIRST-v1) */

export const PREFERENCE_PROFILE_KEY = "preference_profile_mock";
export const PREFERENCE_SESSION_KEY = "ihl.preference_session.v1";
export const PREFERENCE_PHASE_KEY = "ihl.preference_lab.phase.v1";

export const CONVERGE_ROUNDS = 10;
export const VALUECHECK_TEMPLATE_ID = "valuecheck_default_v1";
export const VALUECHECK_WEIGHT = 1.5;

export type TraitSize = "large" | "small";
export type TraitHorn = "thick" | "thin";
export type TraitColor = "black" | "brown";
export type ViewType = "dorsal" | "lateral" | "front";

export type SpecimenTraits = {
  size: TraitSize;
  horn: TraitHorn;
  color: TraitColor;
};

export type MockSpecimen = {
  id: string;
  name: string;
  traits: SpecimenTraits;
  bodyLengthMm: number;
  hornLengthMm: number;
  hornType: string;
  colorLabel: string;
  viewType: ViewType;
  shootCondition: string;
  priceTier: "low" | "mid" | "high";
  availability: "in_stock" | "limited" | "sold_out";
};

export type VectorDirection = "gte" | "lte" | "near";

export type VectorDimensionKey =
  | "body_length_mm"
  | "horn_length_mm"
  | "black_ratio"
  | "price_tier"
  | "price_yen"
  | "availability";

/**
 * マーケット評価ドメイン正本 — ADR-H-08 · 01-要件/06-マーケット §11 Y08
 * ドメイン: 取引相手の声（良い/普通/悪い件数）≠ カルマ ≠ 好み学習の評価
 * 05a フィルタ = 良い件数 · 悪い件数（それぞれ以上/以下/付近）· CAL-05-SRCH-07
 * 良い率（%）は結果カード表示のみ · 検索ゲートには使わない
 */
export const MARKET_GOOD_RATE_MAX = 100;

/** ADR-H-08 — カルマ設計レンジ */
export const KARMA_MIN = -100;
export const KARMA_MAX = 100;

/** @deprecated lab 移行 — 星スケールは検索フィルタに不使用 */
export const MARKET_RATING_SCALE_MAX = 5;

/** @deprecated use MARKET_GOOD_RATE_MAX */
export const SELLER_RATING_SCALE_MAX = MARKET_RATING_SCALE_MAX;

/** ObsSearch / NumericFilterRow — 短ラベルのみ（詳細は `<details>`） */
export const MARKET_RATING_FILTER_LABEL = "マーケット評価";

/** ADR-H-08 · reputation_summary — 良い率（0–100%） */
export function marketGoodRatePct(good: number, neutral: number, bad: number): number {
  const total = good + neutral + bad;
  if (total <= 0) return 0;
  return Math.round((good / total) * 100);
}

export type TrustFilterKey = "karma" | "market_good_count" | "market_bad_count";

export type TrustFilters = {
  /** 未設定 = この次元は絞り込まない */
  karma?: PreferenceVectorEntry;
  /** ADR-H-08 · 06 §11 — 良い件数ゲート */
  marketGoodCount?: PreferenceVectorEntry;
  /** ADR-H-08 · 06 §11 — 悪い件数ゲート */
  marketBadCount?: PreferenceVectorEntry;
  /** true なら 悪い ≥5 件 or カルマ ≤0 の出品者を除外（悪い件数フィルタと同型 · CAL-05-SRCH-08） */
  excludeLowRatedSellers: boolean;
  /** @deprecated lab 移行用 — normalizeTrustFilters が karma へ変換 */
  karmaMin?: number;
  /** @deprecated CAL-05-SRCH-06 — 良い率%フィルタ（件数へ移行） */
  rating?: PreferenceVectorEntry;
  /** @deprecated CAL-05-SRCH-06 */
  ratingMin?: number;
  /** @deprecated CAL-05-SRCH-07 — 悪い件数除外に統合 */
  excludeRatingAtOrBelow?: number;
};

/** 悪い評価のある出品者を除外 — 悪い件数しきい値（06 §11 Y08 · CAL-05-SRCH-08） */
export const EXCLUDE_LOW_RATED_BAD_MIN = 5;

export const DEFAULT_TRUST_FILTERS: TrustFilters = {
  excludeLowRatedSellers: false,
};

export type NumericFilterDraftEntry = {
  value: number | null;
  direction: VectorDirection;
};

export type NumericFilterDraft = Record<string, NumericFilterDraftEntry>;

export const TRUST_FILTER_DIM_META: Record<TrustFilterKey, VectorDimMeta> = {
  karma: { label: "カルマ", unit: "", min: KARMA_MIN, max: KARMA_MAX, sliderSoftMax: KARMA_MAX, step: 1 },
  market_good_count: { label: "良い", unit: "件", min: 0, sliderSoftMax: 50, step: 1 },
  market_bad_count: { label: "悪い", unit: "件", min: 0, sliderSoftMax: 10, step: 1 },
};

export type PreferenceVectorEntry = {
  target: number;
  direction: VectorDirection;
};

export type PreferenceVector = Partial<Record<VectorDimensionKey, PreferenceVectorEntry>>;

export type PreferenceProfileMock = {
  prefer: string[];
  avoid: string[];
  vector: PreferenceVector;
  /** 出品者・信頼のハードゲート（好みベクトルとは別系統） */
  trustFilters?: TrustFilters;
  confidence: number;
  voteCount: number;
  summaryLine: string;
  updatedAt: string;
};

export type VectorDimMeta = {
  label: string;
  unit: string;
  min: number;
  /** Hard cap for bounded dims only (e.g. black_ratio). Size dims omit this. */
  max?: number;
  /** Slider hint range — expands when user enters a larger value via number input */
  sliderSoftMax?: number;
  step: number;
  displayScale?: number;
};

export const VECTOR_DIM_META: Record<VectorDimensionKey, VectorDimMeta> = {
  body_length_mm: { label: "体長", unit: "mm", min: 0, sliderSoftMax: 100, step: 1 },
  horn_length_mm: { label: "角長", unit: "mm", min: 0, sliderSoftMax: 60, step: 1 },
  black_ratio: { label: "色（黒率）", unit: "%", min: 0, max: 100, step: 1, displayScale: 100 },
  price_tier: { label: "価格帯", unit: "段", min: 1, max: 3, step: 1 },
  price_yen: { label: "金額", unit: "円", min: 0, sliderSoftMax: 80000, step: 1000 },
  availability: { label: "入手性", unit: "段", min: 0, max: 2, step: 1 },
};

/** User-adjustable on /s/05a — color stays in vector for rerank but not editable here */
export const FILTERABLE_VECTOR_KEYS: VectorDimensionKey[] = [
  "body_length_mm",
  "horn_length_mm",
  "price_yen",
];

export const COLOR_FILTER_DEFERRED_NOTE =
  "色は観測写真解析後に反映（lab では体長・角長を優先）";

export const VECTOR_DIRECTION_LABEL: Record<VectorDirection, string> = {
  gte: "以上",
  lte: "以下",
  near: "付近",
};

export type PreferencePhase = "recommend" | "pairwise" | "converged";

export type ValueCheckCell = "x" | "minus" | "circle" | null;
export type OverallFit = "no" | "maybe" | "yes";

export type ValueCheckDimensionKey = "size" | "horn" | "color" | "price" | "availability";

export type DimensionMatrixEntry = {
  key: ValueCheckDimensionKey;
  value: ValueCheckCell;
};

export type ValueCheckRecord = {
  templateId: typeof VALUECHECK_TEMPLATE_ID;
  dimensions: DimensionMatrixEntry[];
  overallFit: OverallFit;
  round: number;
  leftId: string;
  rightId: string;
  createdAt: string;
};

export type PreferenceSession = {
  phase: PreferencePhase;
  round: number;
  pairIndex: number;
  votes: Array<{
    choice: "left" | "right" | "neither" | "skip";
    left: SpecimenTraits;
    right: SpecimenTraits;
    leftId?: string;
    rightId?: string;
  }>;
  valueChecks: ValueCheckRecord[];
  usedPairKeys: string[];
};

export const VIEW_TYPE_LABEL: Record<ViewType, string> = {
  dorsal: "背面",
  lateral: "側面",
  front: "正面",
};

export const VALUECHECK_DIM_LABEL: Record<ValueCheckDimensionKey, string> = {
  size: "サイズ",
  horn: "角",
  color: "色",
  price: "価格",
  availability: "入手性",
};

export const VALUECHECK_DIMENSIONS: ValueCheckDimensionKey[] = [
  "size",
  "horn",
  "color",
  "price",
  "availability",
];

const TRAIT_LABEL: Record<keyof SpecimenTraits, Record<string, string>> = {
  size: { large: "大型", small: "小型" },
  horn: { thick: "太い角", thin: "短角" },
  color: { black: "黒系", brown: "茶系" },
};

const VC_CIRCLE_PREFER: Record<ValueCheckDimensionKey, string> = {
  size: "大型",
  horn: "太い角",
  color: "黒系",
  price: "手頃な価格",
  availability: "入手容易",
};

const VC_X_PREFER: Record<ValueCheckDimensionKey, string> = {
  size: "小型",
  horn: "短角",
  color: "茶系",
  price: "高価格帯",
  availability: "希少",
};

const DIMENSION_PRIORITY: (keyof SpecimenTraits)[] = ["size", "horn", "color"];

export const MOCK_SPECIMENS: MockSpecimen[] = [
  {
    id: "S01",
    name: "ヘラクレス ♂ 82mm",
    traits: { size: "large", horn: "thick", color: "black" },
    bodyLengthMm: 82,
    hornLengthMm: 48,
    hornType: "太角（Y字・光沢強）",
    colorLabel: "黒系（光沢強）",
    viewType: "dorsal",
    shootCondition: "LED リング / iPhone 15 · 45cm · 黒背景",
    priceTier: "high",
    availability: "limited",
  },
  {
    id: "S02",
    name: "ヘラクレス ♂ 68mm",
    traits: { size: "small", horn: "thin", color: "brown" },
    bodyLengthMm: 68,
    hornLengthMm: 22,
    hornType: "短角（細身）",
    colorLabel: "茶系（マット）",
    viewType: "lateral",
    shootCondition: "自然光 / Pixel 8 · 30cm · 木台",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S03",
    name: "ヘラクレス ♂ 75mm",
    traits: { size: "large", horn: "thick", color: "brown" },
    bodyLengthMm: 75,
    hornLengthMm: 41,
    hornType: "太角（幅広）",
    colorLabel: "茶系（赤み）",
    viewType: "front",
    shootCondition: "蛍光灯 / Galaxy S24 · 40cm · 白背景",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S04",
    name: "ヘラクレス ♂ 71mm",
    traits: { size: "large", horn: "thin", color: "black" },
    bodyLengthMm: 71,
    hornLengthMm: 28,
    hornType: "中角（細長）",
    colorLabel: "黒系（艶控えめ）",
    viewType: "dorsal",
    shootCondition: "LED バー / iPhone 14 · 35cm · 黒背景",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S05",
    name: "ヘラクレス ♂ 64mm",
    traits: { size: "small", horn: "thick", color: "black" },
    bodyLengthMm: 64,
    hornLengthMm: 34,
    hornType: "太角（コンパクト）",
    colorLabel: "黒系（マット）",
    viewType: "lateral",
    shootCondition: "自然光 / iPhone 13 · 28cm · 木台",
    priceTier: "low",
    availability: "in_stock",
  },
  {
    id: "S06",
    name: "ヘラクレス ♂ 79mm",
    traits: { size: "large", horn: "thick", color: "black" },
    bodyLengthMm: 79,
    hornLengthMm: 45,
    hornType: "太角（標準Y字）",
    colorLabel: "黒系（標準光沢）",
    viewType: "dorsal",
    shootCondition: "LED リング / Pixel 8 · 42cm · 黒背景",
    priceTier: "high",
    availability: "limited",
  },
  {
    id: "S07",
    name: "ヘラクレス ♂ 66mm",
    traits: { size: "small", horn: "thin", color: "black" },
    bodyLengthMm: 66,
    hornLengthMm: 20,
    hornType: "短角（直線的）",
    colorLabel: "黒系（微青み）",
    viewType: "front",
    shootCondition: "LED リング / iPhone 12 · 32cm · 黒背景",
    priceTier: "low",
    availability: "in_stock",
  },
  {
    id: "S08",
    name: "ヘラクレス ♂ 73mm",
    traits: { size: "large", horn: "thin", color: "brown" },
    bodyLengthMm: 73,
    hornLengthMm: 26,
    hornType: "中角（緩やかカーブ）",
    colorLabel: "茶系（標準）",
    viewType: "lateral",
    shootCondition: "自然光 / Pixel 7 · 38cm · 木台",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S09",
    name: "ヘラクレス ♂ 61mm",
    traits: { size: "small", horn: "thick", color: "brown" },
    bodyLengthMm: 61,
    hornLengthMm: 31,
    hornType: "太角（短めY字）",
    colorLabel: "茶系（濃）",
    viewType: "dorsal",
    shootCondition: "蛍光灯 / Galaxy A54 · 27cm · 白背景",
    priceTier: "low",
    availability: "in_stock",
  },
  {
    id: "S10",
    name: "ヘラクレス ♂ 85mm",
    traits: { size: "large", horn: "thick", color: "black" },
    bodyLengthMm: 85,
    hornLengthMm: 52,
    hornType: "太角（大振りY字）",
    colorLabel: "黒系（鏡面）",
    viewType: "front",
    shootCondition: "LED リング / iPhone 15 Pro · 48cm · 黒背景",
    priceTier: "high",
    availability: "sold_out",
  },
  {
    id: "S11",
    name: "ヘラクレス ♂ 70mm",
    traits: { size: "large", horn: "thick", color: "brown" },
    bodyLengthMm: 70,
    hornLengthMm: 38,
    hornType: "太角（標準）",
    colorLabel: "茶系（淡）",
    viewType: "dorsal",
    shootCondition: "自然光 / Pixel 8 · 36cm · 木台",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S12",
    name: "ヘラクレス ♂ 63mm",
    traits: { size: "small", horn: "thin", color: "brown" },
    bodyLengthMm: 63,
    hornLengthMm: 19,
    hornType: "短角（最小）",
    colorLabel: "茶系（黄み）",
    viewType: "lateral",
    shootCondition: "LED バー / iPhone SE · 29cm · 黒背景",
    priceTier: "low",
    availability: "in_stock",
  },
  {
    id: "S13",
    name: "ヘラクレス ♂ 77mm",
    traits: { size: "large", horn: "thin", color: "black" },
    bodyLengthMm: 77,
    hornLengthMm: 30,
    hornType: "中角（シャープ）",
    colorLabel: "黒系（深）",
    viewType: "front",
    shootCondition: "LED リング / Galaxy S23 · 41cm · 黒背景",
    priceTier: "high",
    availability: "limited",
  },
  {
    id: "S14",
    name: "ヘラクレス ♂ 69mm",
    traits: { size: "small", horn: "thick", color: "black" },
    bodyLengthMm: 69,
    hornLengthMm: 33,
    hornType: "太角（バランス型）",
    colorLabel: "黒系（標準）",
    viewType: "dorsal",
    shootCondition: "自然光 / iPhone 14 · 31cm · 木台",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S15",
    name: "ヘラクレス ♂ 74mm",
    traits: { size: "large", horn: "thick", color: "black" },
    bodyLengthMm: 74,
    hornLengthMm: 42,
    hornType: "太角（中Y字）",
    colorLabel: "黒系（微赤み）",
    viewType: "lateral",
    shootCondition: "蛍光灯 / Pixel 8 · 39cm · 白背景",
    priceTier: "mid",
    availability: "in_stock",
  },
  {
    id: "S16",
    name: "ヘラクレス ♂ 67mm",
    traits: { size: "small", horn: "thin", color: "black" },
    bodyLengthMm: 67,
    hornLengthMm: 21,
    hornType: "短角（標準）",
    colorLabel: "黒系（淡光沢）",
    viewType: "front",
    shootCondition: "LED バー / iPhone 13 · 30cm · 黒背景",
    priceTier: "low",
    availability: "in_stock",
  },
  {
    id: "S17",
    name: "ヘラクレス ♂ 80mm",
    traits: { size: "large", horn: "thin", color: "brown" },
    bodyLengthMm: 80,
    hornLengthMm: 29,
    hornType: "中角（長め）",
    colorLabel: "茶系（光沢）",
    viewType: "dorsal",
    shootCondition: "LED リング / iPhone 15 · 44cm · 黒背景",
    priceTier: "high",
    availability: "limited",
  },
  {
    id: "S18",
    name: "ヘラクレス ♂ 62mm",
    traits: { size: "small", horn: "thick", color: "brown" },
    bodyLengthMm: 62,
    hornLengthMm: 30,
    hornType: "太角（小振り）",
    colorLabel: "茶系（マット濃）",
    viewType: "lateral",
    shootCondition: "自然光 / Galaxy S22 · 28cm · 木台",
    priceTier: "low",
    availability: "in_stock",
  },
];

function traitLabel(key: keyof SpecimenTraits, value: string): string {
  return TRAIT_LABEL[key][value] ?? value;
}

export function priceTierToNum(tier: MockSpecimen["priceTier"]): number {
  return { low: 1, mid: 2, high: 3 }[tier];
}

/** lab mock — tier → 代表円価格（listing 連携前の近似） */
export function priceTierToYen(tier: MockSpecimen["priceTier"]): number {
  return { low: 12000, mid: 28000, high: 55000 }[tier];
}

export function availabilityToNum(avail: MockSpecimen["availability"]): number {
  return { in_stock: 2, limited: 1, sold_out: 0 }[avail];
}

export function colorToBlackRatio(color: TraitColor): number {
  return color === "black" ? 0.82 : 0.38;
}

export function specimenNumericValues(specimen: MockSpecimen): Record<VectorDimensionKey, number> {
  return {
    body_length_mm: specimen.bodyLengthMm,
    horn_length_mm: specimen.hornLengthMm,
    black_ratio: colorToBlackRatio(specimen.traits.color),
    price_tier: priceTierToNum(specimen.priceTier),
    price_yen: priceTierToYen(specimen.priceTier),
    availability: availabilityToNum(specimen.availability),
  };
}

export function normalizeTrustFilters(raw?: Partial<TrustFilters> | null): TrustFilters {
  if (!raw) return { ...DEFAULT_TRUST_FILTERS };
  const next: TrustFilters = {
    excludeLowRatedSellers: raw.excludeLowRatedSellers ?? false,
  };
  if (raw.karma && Number.isFinite(raw.karma.target)) {
    next.karma = {
      target: Math.max(KARMA_MIN, Math.min(KARMA_MAX, raw.karma.target)),
      direction: raw.karma.direction ?? "gte",
    };
  } else if ((raw.karmaMin ?? 0) !== 0 && Number.isFinite(raw.karmaMin)) {
    next.karma = {
      target: Math.max(KARMA_MIN, Math.min(KARMA_MAX, raw.karmaMin!)),
      direction: "gte",
    };
  }
  if (raw.marketGoodCount && Number.isFinite(raw.marketGoodCount.target)) {
    next.marketGoodCount = {
      target: Math.max(0, raw.marketGoodCount.target),
      direction: raw.marketGoodCount.direction ?? "gte",
    };
  }
  if (raw.marketBadCount && Number.isFinite(raw.marketBadCount.target)) {
    next.marketBadCount = {
      target: Math.max(0, raw.marketBadCount.target),
      direction: raw.marketBadCount.direction ?? "lte",
    };
  }
  return next;
}

export function trustFiltersActive(trust: TrustFilters): boolean {
  const n = normalizeTrustFilters(trust);
  return (
    Boolean(n.karma) ||
    Boolean(n.marketGoodCount) ||
    Boolean(n.marketBadCount) ||
    n.excludeLowRatedSellers
  );
}

function defaultDirectionForTrustKey(key: TrustFilterKey): VectorDirection {
  return key === "market_bad_count" ? "lte" : "gte";
}

function defaultDirectionForVectorKey(key: VectorDimensionKey): VectorDirection {
  return key === "price_yen" || key === "price_tier" || key === "availability" ? "lte" : "gte";
}

export function emptyNumericFilterDraft(): NumericFilterDraft {
  const draft: NumericFilterDraft = {};
  for (const key of FILTERABLE_VECTOR_KEYS) {
    draft[key] = { value: null, direction: defaultDirectionForVectorKey(key) };
  }
  for (const key of Object.keys(TRUST_FILTER_DIM_META) as TrustFilterKey[]) {
    draft[key] = { value: null, direction: defaultDirectionForTrustKey(key) };
  }
  return draft;
}

export function numericDraftFromProfile(profile: PreferenceProfileMock | null): NumericFilterDraft {
  const draft = emptyNumericFilterDraft();
  if (!profile) return draft;
  for (const key of FILTERABLE_VECTOR_KEYS) {
    const entry = profile.vector?.[key];
    if (!entry) continue;
    const meta = VECTOR_DIM_META[key];
    const display = meta.displayScale ? entry.target * meta.displayScale : entry.target;
    draft[key] = { value: display, direction: entry.direction };
  }
  const trust = normalizeTrustFilters(profile.trustFilters);
  if (trust.karma) {
    draft.karma = { value: trust.karma.target, direction: trust.karma.direction };
  }
  if (trust.marketGoodCount) {
    draft.market_good_count = {
      value: trust.marketGoodCount.target,
      direction: trust.marketGoodCount.direction,
    };
  }
  if (trust.marketBadCount) {
    draft.market_bad_count = {
      value: trust.marketBadCount.target,
      direction: trust.marketBadCount.direction,
    };
  }
  return draft;
}

export function vectorFromNumericDraft(draft: NumericFilterDraft): PreferenceVector {
  const vector: PreferenceVector = {};
  for (const key of FILTERABLE_VECTOR_KEYS) {
    const row = draft[key];
    if (!row || row.value === null || !Number.isFinite(row.value)) continue;
    const meta = VECTOR_DIM_META[key];
    const storage = meta.displayScale ? row.value / meta.displayScale : row.value;
    vector[key] = { target: storage, direction: row.direction };
  }
  return vector;
}

export function trustFromNumericDraft(
  draft: NumericFilterDraft,
  base: TrustFilters = DEFAULT_TRUST_FILTERS,
): TrustFilters {
  const next: TrustFilters = {
    excludeLowRatedSellers: base.excludeLowRatedSellers,
  };
  const karma = draft.karma;
  if (karma && karma.value !== null && Number.isFinite(karma.value)) {
    next.karma = {
      target: Math.max(KARMA_MIN, Math.min(KARMA_MAX, karma.value)),
      direction: karma.direction,
    };
  }
  const good = draft.market_good_count;
  if (good && good.value !== null && Number.isFinite(good.value)) {
    next.marketGoodCount = {
      target: Math.max(0, good.value),
      direction: good.direction,
    };
  }
  const bad = draft.market_bad_count;
  if (bad && bad.value !== null && Number.isFinite(bad.value)) {
    next.marketBadCount = {
      target: Math.max(0, bad.value),
      direction: bad.direction,
    };
  }
  return next;
}

export function learnedHintForKey(
  profile: PreferenceProfileMock | null,
  key: VectorDimensionKey | TrustFilterKey,
): string | null {
  if (!profile || profile.voteCount === 0) return null;
  if (key === "karma" || key === "market_good_count" || key === "market_bad_count") {
    const trust = normalizeTrustFilters(profile.trustFilters);
    const entry =
      key === "karma"
        ? trust.karma
        : key === "market_good_count"
          ? trust.marketGoodCount
          : trust.marketBadCount;
    if (!entry) return null;
    const meta = TRUST_FILTER_DIM_META[key];
    const display = String(Math.round(entry.target));
    return `${display}${meta.unit}${VECTOR_DIRECTION_LABEL[entry.direction]}`;
  }
  const entry = profile.vector?.[key as VectorDimensionKey];
  if (!entry) return null;
  const meta = VECTOR_DIM_META[key as VectorDimensionKey];
  const display = meta.displayScale ? entry.target * meta.displayScale : entry.target;
  const rounded = meta.displayScale ? Math.round(display) : Math.round(display * 10) / 10;
  return `${rounded}${meta.unit}${VECTOR_DIRECTION_LABEL[entry.direction]}`;
}

/** Trust hard-filter direction semantics (lab): gte = min gate · lte = max cap · near = ±band */
function trustNearTolerance(key: TrustFilterKey, target: number): number {
  if (key === "market_good_count" || key === "market_bad_count") {
    return Math.max(1, Math.round(target * 0.15));
  }
  return Math.max(10, Math.round(Math.abs(target) * 0.1));
}

function passesNumericTrustEntry(
  actual: number,
  entry: PreferenceVectorEntry,
  nearTolerance: number,
): boolean {
  const { target, direction } = entry;
  if (direction === "gte") return actual >= target;
  if (direction === "lte") return actual <= target;
  return Math.abs(actual - target) <= nearTolerance;
}

export function passesTrustFilters(
  sellerKarma: number,
  marketGoodCount: number,
  marketBadCount: number,
  trust: TrustFilters,
): boolean {
  const normalized = normalizeTrustFilters(trust);
  if (
    normalized.excludeLowRatedSellers &&
    (marketBadCount >= EXCLUDE_LOW_RATED_BAD_MIN || sellerKarma <= 0)
  ) {
    return false;
  }
  if (
    normalized.karma &&
    !passesNumericTrustEntry(
      sellerKarma,
      normalized.karma,
      trustNearTolerance("karma", normalized.karma.target),
    )
  ) {
    return false;
  }
  if (
    normalized.marketGoodCount &&
    !passesNumericTrustEntry(
      marketGoodCount,
      normalized.marketGoodCount,
      trustNearTolerance("market_good_count", normalized.marketGoodCount.target),
    )
  ) {
    return false;
  }
  if (
    normalized.marketBadCount &&
    !passesNumericTrustEntry(
      marketBadCount,
      normalized.marketBadCount,
      trustNearTolerance("market_bad_count", normalized.marketBadCount.target),
    )
  ) {
    return false;
  }
  return true;
}

function getSpecimenById(id: string | undefined): MockSpecimen | undefined {
  if (!id) return undefined;
  return MOCK_SPECIMENS.find((s) => s.id === id);
}

type DimAccumulator = {
  chosenSum: number;
  chosenWeight: number;
  rejectedSum: number;
  rejectedWeight: number;
  directionVotes: { gte: number; lte: number; near: number };
};

function emptyAccumulator(): DimAccumulator {
  return { chosenSum: 0, chosenWeight: 0, rejectedSum: 0, rejectedWeight: 0, directionVotes: { gte: 0, lte: 0, near: 0 } };
}

function addSample(acc: DimAccumulator, value: number, weight: number, role: "chosen" | "rejected"): void {
  if (role === "chosen") {
    acc.chosenSum += value * weight;
    acc.chosenWeight += weight;
  } else {
    acc.rejectedSum += value * weight;
    acc.rejectedWeight += weight;
  }
}

function biasDirection(acc: DimAccumulator, direction: VectorDirection, weight: number): void {
  acc.directionVotes[direction] += weight;
}

function resolveDirection(acc: DimAccumulator): VectorDirection {
  const { gte, lte, near } = acc.directionVotes;
  if (near >= gte && near >= lte && near > 0) return "near";
  if (gte > lte) return "gte";
  if (lte > gte) return "lte";
  const chosenMean = acc.chosenWeight > 0 ? acc.chosenSum / acc.chosenWeight : 0;
  const rejectedMean = acc.rejectedWeight > 0 ? acc.rejectedSum / acc.rejectedWeight : chosenMean;
  if (Math.abs(chosenMean - rejectedMean) < 2) return "near";
  return chosenMean >= rejectedMean ? "gte" : "lte";
}

function resolveTarget(acc: DimAccumulator, fallback: number): number {
  if (acc.chosenWeight > 0) return Math.round((acc.chosenSum / acc.chosenWeight) * 10) / 10;
  return fallback;
}

export function buildVectorFromSession(session: PreferenceSession): PreferenceVector {
  const accs: Record<VectorDimensionKey, DimAccumulator> = {
    body_length_mm: emptyAccumulator(),
    horn_length_mm: emptyAccumulator(),
    black_ratio: emptyAccumulator(),
    price_tier: emptyAccumulator(),
    price_yen: emptyAccumulator(),
    availability: emptyAccumulator(),
  };

  for (const vote of session.votes) {
    if (vote.choice === "skip") continue;
    const left = getSpecimenById(vote.leftId);
    const right = getSpecimenById(vote.rightId);
    if (!left || !right) continue;

    const leftNums = specimenNumericValues(left);
    const rightNums = specimenNumericValues(right);

    for (const key of Object.keys(accs) as VectorDimensionKey[]) {
      const acc = accs[key];
      if (vote.choice === "left") {
        addSample(acc, leftNums[key], 1, "chosen");
        addSample(acc, rightNums[key], 1, "rejected");
        biasDirection(acc, leftNums[key] >= rightNums[key] ? "gte" : "lte", 1);
      } else if (vote.choice === "right") {
        addSample(acc, rightNums[key], 1, "chosen");
        addSample(acc, leftNums[key], 1, "rejected");
        biasDirection(acc, rightNums[key] >= leftNums[key] ? "gte" : "lte", 1);
      } else if (vote.choice === "neither") {
        addSample(acc, leftNums[key], 0.5, "rejected");
        addSample(acc, rightNums[key], 0.5, "rejected");
        biasDirection(acc, "near", 0.5);
      }
    }
  }

  for (const vc of session.valueChecks ?? []) {
    for (const entry of vc.dimensions) {
      const w = VALUECHECK_WEIGHT;
      let key: VectorDimensionKey | null = null;
      if (entry.key === "size") key = "body_length_mm";
      else if (entry.key === "horn") key = "horn_length_mm";
      else if (entry.key === "color") key = "black_ratio";
      else if (entry.key === "price") key = "price_yen";
      else if (entry.key === "availability") key = "availability";
      if (!key || entry.value === null) continue;

      const acc = accs[key];
      if (entry.value === "circle") {
        const budgetDim = key === "price_yen" || key === "price_tier" || key === "availability";
        biasDirection(acc, budgetDim ? "lte" : "gte", w);
        if (key === "body_length_mm") addSample(acc, 78, w, "chosen");
        else if (key === "horn_length_mm") addSample(acc, 42, w, "chosen");
        else if (key === "black_ratio") addSample(acc, 0.82, w, "chosen");
        else if (key === "price_tier") addSample(acc, 1.5, w, "chosen");
        else if (key === "price_yen") addSample(acc, 30000, w, "chosen");
        else if (key === "availability") addSample(acc, 2, w, "chosen");
      } else if (entry.value === "x") {
        const budgetDim = key === "price_yen" || key === "price_tier" || key === "availability";
        biasDirection(acc, budgetDim ? "gte" : "lte", w);
        if (key === "body_length_mm") addSample(acc, 64, w, "chosen");
        else if (key === "horn_length_mm") addSample(acc, 22, w, "chosen");
        else if (key === "black_ratio") addSample(acc, 0.38, w, "chosen");
        else if (key === "price_tier") addSample(acc, 3, w, "chosen");
        else if (key === "price_yen") addSample(acc, 65000, w, "chosen");
        else if (key === "availability") addSample(acc, 0, w, "chosen");
      } else if (entry.value === "minus") {
        biasDirection(acc, "near", w * 0.5);
      }
    }
  }

  const defaults: Record<VectorDimensionKey, number> = {
    body_length_mm: 72,
    horn_length_mm: 35,
    black_ratio: 0.6,
    price_tier: 2,
    price_yen: 28000,
    availability: 2,
  };

  const vector: PreferenceVector = {};
  for (const key of Object.keys(accs) as VectorDimensionKey[]) {
    const acc = accs[key];
    if (acc.chosenWeight + acc.rejectedWeight < 0.5) continue;
    vector[key] = {
      target: resolveTarget(acc, defaults[key]),
      direction: resolveDirection(acc),
    };
  }
  return vector;
}

export function formatVectorValue(key: VectorDimensionKey, value: number): string {
  const meta = VECTOR_DIM_META[key];
  const scaled = meta.displayScale ? value * meta.displayScale : value;
  const rounded = meta.displayScale ? Math.round(scaled) : Math.round(scaled * 10) / 10;
  return meta.unit ? `${rounded}${meta.unit}` : String(rounded);
}

export function buildSummaryLineFromVector(vector: PreferenceVector, prefer: string[]): string {
  const parts: string[] = [];
  if (vector.body_length_mm) {
    const d = VECTOR_DIRECTION_LABEL[vector.body_length_mm.direction];
    parts.push(`体長${formatVectorValue("body_length_mm", vector.body_length_mm.target)}${d}`);
  }
  if (vector.horn_length_mm) {
    const d = VECTOR_DIRECTION_LABEL[vector.horn_length_mm.direction];
    parts.push(`角長${formatVectorValue("horn_length_mm", vector.horn_length_mm.target)}${d}`);
  }
  if (vector.price_yen) {
    const d = VECTOR_DIRECTION_LABEL[vector.price_yen.direction];
    parts.push(`金額${formatVectorValue("price_yen", vector.price_yen.target)}${d}`);
  }
  if (parts.length > 0) return parts.slice(0, 3).join(" · ");
  const traitPrefer = prefer.filter((p) =>
    Object.values(TRAIT_LABEL).some((m) => Object.values(m).includes(p)),
  );
  return traitPrefer.length > 0 ? `${traitPrefer.slice(0, 3).join("・")}を好む` : "好みを学習中です";
}

export function normalizeProfile(raw: Partial<PreferenceProfileMock>): PreferenceProfileMock {
  return {
    prefer: raw.prefer ?? [],
    avoid: raw.avoid ?? [],
    vector: raw.vector ?? {},
    trustFilters: normalizeTrustFilters(raw.trustFilters),
    confidence: raw.confidence ?? 0.35,
    voteCount: raw.voteCount ?? 0,
    summaryLine: raw.summaryLine ?? "好みを学習中です",
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function scoreNumericProximity(
  values: Record<VectorDimensionKey, number>,
  vector: PreferenceVector,
): number {
  let score = 0;
  let dims = 0;
  for (const key of Object.keys(vector) as VectorDimensionKey[]) {
    const entry = vector[key];
    if (!entry) continue;
    const v = values[key];
    const { target, direction } = entry;
    dims += 1;
    if (direction === "gte") {
      score += v >= target ? 2 + Math.min(2, (v - target) * 0.05) : -Math.min(3, (target - v) * 0.08);
    } else if (direction === "lte") {
      score += v <= target ? 2 + Math.min(2, (target - v) * (key === "price_yen" ? 0.00004 : 0.05)) : -Math.min(3, (v - target) * (key === "price_yen" ? 0.00006 : 0.08));
    } else {
      const dist = Math.abs(v - target);
      const nearScale = key === "black_ratio" ? 8 : key === "price_yen" ? 0.00015 : 0.08;
      score += Math.max(0, 3 - dist * nearScale);
    }
  }
  return dims > 0 ? score / dims : 0;
}

function traitsToLabels(traits: SpecimenTraits): string[] {
  return (Object.keys(traits) as (keyof SpecimenTraits)[]).map((k) => traitLabel(k, traits[k]));
}

export function pairKey(aId: string, bId: string): string {
  return [aId, bId].sort().join("|");
}

function differsOnDimension(a: MockSpecimen, b: MockSpecimen, dim: keyof SpecimenTraits): boolean {
  return a.traits[dim] !== b.traits[dim];
}

function sameOnOtherDimensions(a: MockSpecimen, b: MockSpecimen, targetDim: keyof SpecimenTraits): boolean {
  return DIMENSION_PRIORITY.filter((d) => d !== targetDim).every((d) => a.traits[d] === b.traits[d]);
}

function bumpCount(counts: Map<string, number>, label: string, delta: number): void {
  counts.set(label, (counts.get(label) ?? 0) + delta);
}

function scoreTrait(
  counts: Map<string, number>,
  traits: SpecimenTraits,
  sign: 1 | -1,
  weight = 1,
): void {
  for (const key of Object.keys(traits) as (keyof SpecimenTraits)[]) {
    const label = traitLabel(key, traits[key]);
    bumpCount(counts, label, sign * weight);
  }
}

function scoreValueCheckDimension(
  counts: Map<string, number>,
  entry: DimensionMatrixEntry,
  weight: number,
): void {
  if (entry.value === "circle") {
    bumpCount(counts, VC_CIRCLE_PREFER[entry.key], weight);
  } else if (entry.value === "x") {
    bumpCount(counts, VC_X_PREFER[entry.key], weight);
    bumpCount(counts, VC_CIRCLE_PREFER[entry.key], -weight * 0.5);
  } else if (entry.value === "minus") {
    bumpCount(counts, VC_CIRCLE_PREFER[entry.key], -weight * 0.25);
  }
}

export function computeDimensionUncertainty(session: PreferenceSession): Record<keyof SpecimenTraits, number> {
  const net = new Map<keyof SpecimenTraits, number>();

  for (const dim of DIMENSION_PRIORITY) {
    const values = Object.keys(TRAIT_LABEL[dim]);
    const scores = values.map((v) => {
      const label = traitLabel(dim, v);
      let s = 0;
      for (const vote of session.votes) {
        if (vote.choice === "skip") continue;
        const winner = vote.choice === "left" ? vote.left : vote.choice === "right" ? vote.right : null;
        const loser = vote.choice === "left" ? vote.right : vote.choice === "right" ? vote.left : null;
        if (vote.choice === "neither") {
          if (vote.left[dim] === v) s -= 1;
          if (vote.right[dim] === v) s -= 1;
        } else if (winner && loser) {
          if (winner[dim] === v) s += 1;
          if (loser[dim] === v) s -= 1;
        }
      }
      return s;
    });
    const spread = Math.max(...scores.map(Math.abs)) - Math.min(...scores.map(Math.abs));
    net.set(dim, spread);
  }

  for (const vc of session.valueChecks ?? []) {
    for (const entry of vc.dimensions) {
      if (entry.key === "price" || entry.key === "availability") continue;
      const dim = entry.key as keyof SpecimenTraits;
      if (entry.value === "circle" || entry.value === "x") {
        net.set(dim, (net.get(dim) ?? 0) + VALUECHECK_WEIGHT);
      }
    }
  }

  const uncertainty: Record<keyof SpecimenTraits, number> = { size: 1, horn: 1, color: 1 };
  for (const dim of DIMENSION_PRIORITY) {
    const activity = net.get(dim) ?? 0;
    uncertainty[dim] = 1 / (1 + activity);
  }
  return uncertainty;
}

export function selectNextPair(session: PreferenceSession): [MockSpecimen, MockSpecimen] {
  const used = new Set(session.usedPairKeys ?? []);
  const uncertainty = computeDimensionUncertainty(session);

  const rankedDims = [...DIMENSION_PRIORITY].sort((a, b) => {
    const diff = uncertainty[b] - uncertainty[a];
    if (Math.abs(diff) > 0.001) return diff;
    return DIMENSION_PRIORITY.indexOf(a) - DIMENSION_PRIORITY.indexOf(b);
  });

  for (const dim of rankedDims) {
    for (let i = 0; i < MOCK_SPECIMENS.length; i++) {
      for (let j = i + 1; j < MOCK_SPECIMENS.length; j++) {
        const left = MOCK_SPECIMENS[i];
        const right = MOCK_SPECIMENS[j];
        if (!differsOnDimension(left, right, dim)) continue;
        if (!sameOnOtherDimensions(left, right, dim)) continue;
        const key = pairKey(left.id, right.id);
        if (used.has(key)) continue;
        return [left, right];
      }
    }
  }

  for (let i = 0; i < MOCK_SPECIMENS.length; i++) {
    for (let j = i + 1; j < MOCK_SPECIMENS.length; j++) {
      const key = pairKey(MOCK_SPECIMENS[i].id, MOCK_SPECIMENS[j].id);
      if (!used.has(key)) return [MOCK_SPECIMENS[i], MOCK_SPECIMENS[j]];
    }
  }

  return [MOCK_SPECIMENS[0], MOCK_SPECIMENS[1]];
}

export function getCurrentPair(session: PreferenceSession): [MockSpecimen, MockSpecimen] {
  return selectNextPair(session);
}

export function emptyDimensionMatrix(): DimensionMatrixEntry[] {
  return VALUECHECK_DIMENSIONS.map((key) => ({ key, value: null }));
}

export function reasonForSpecimen(specimen: MockSpecimen, profile: PreferenceProfileMock | null): string {
  if (!profile || profile.voteCount === 0) return "人気の個体です";
  const vectorKeys = Object.keys(profile.vector ?? {}) as VectorDimensionKey[];
  if (vectorKeys.length > 0) {
    const nums = specimenNumericValues(specimen);
    const score = scoreNumericProximity(nums, profile.vector);
    if (score >= 2) {
      const parts: string[] = [];
      if (profile.vector.body_length_mm && nums.body_length_mm >= profile.vector.body_length_mm.target - 2) {
        parts.push("体長が好みに近い");
      }
      if (profile.vector.horn_length_mm && nums.horn_length_mm >= profile.vector.horn_length_mm.target - 3) {
        parts.push("角長が好みに近い");
      }
      if (parts.length > 0) return parts.slice(0, 2).join("・");
    }
  }
  const labels = traitsToLabels(specimen.traits);
  const hit = labels.filter((l) => profile.prefer.includes(l));
  if (hit.length >= 2) return `${hit.slice(0, 2).join("・")}に近い`;
  if (hit.length === 1) return `${hit[0]}寄りの個体`;
  return "新着の個体です";
}

export function normalizeSession(raw: Partial<PreferenceSession>): PreferenceSession {
  return {
    phase: raw.phase ?? "recommend",
    round: raw.round ?? 0,
    pairIndex: raw.pairIndex ?? 0,
    votes: raw.votes ?? [],
    valueChecks: raw.valueChecks ?? [],
    usedPairKeys: raw.usedPairKeys ?? [],
  };
}

export function readPreferenceProfile(): PreferenceProfileMock | null {
  try {
    const raw = localStorage.getItem(PREFERENCE_PROFILE_KEY);
    if (!raw) return null;
    return normalizeProfile(JSON.parse(raw) as Partial<PreferenceProfileMock>);
  } catch {
    return null;
  }
}

export function writePreferenceProfile(profile: PreferenceProfileMock): void {
  localStorage.setItem(PREFERENCE_PROFILE_KEY, JSON.stringify(profile));
}

export function readPreferenceSession(): PreferenceSession {
  try {
    const raw = sessionStorage.getItem(PREFERENCE_SESSION_KEY);
    if (raw) return normalizeSession(JSON.parse(raw) as Partial<PreferenceSession>);
  } catch {
    /* fall through */
  }
  return normalizeSession({});
}

export function writePreferenceSession(session: PreferenceSession): void {
  sessionStorage.setItem(PREFERENCE_SESSION_KEY, JSON.stringify(session));
}

export function readPreferencePhase(): PreferencePhase {
  try {
    const raw = sessionStorage.getItem(PREFERENCE_PHASE_KEY);
    if (raw === "recommend" || raw === "pairwise" || raw === "converged") return raw;
  } catch {
    /* fall through */
  }
  return "recommend";
}

export function writePreferencePhase(phase: PreferencePhase): void {
  sessionStorage.setItem(PREFERENCE_PHASE_KEY, phase);
}

export function buildProfileFromSession(session: PreferenceSession): PreferenceProfileMock {
  const counts = new Map<string, number>();

  for (const vote of session.votes) {
    if (vote.choice === "left") {
      scoreTrait(counts, vote.left, 1);
      scoreTrait(counts, vote.right, -1);
    } else if (vote.choice === "right") {
      scoreTrait(counts, vote.right, 1);
      scoreTrait(counts, vote.left, -1);
    } else if (vote.choice === "neither") {
      scoreTrait(counts, vote.left, -1);
      scoreTrait(counts, vote.right, -1);
    }
  }

  for (const vc of session.valueChecks ?? []) {
    for (const entry of vc.dimensions) {
      scoreValueCheckDimension(counts, entry, VALUECHECK_WEIGHT);
    }
    if (vc.overallFit === "yes") {
      bumpCount(counts, "総合好み", VALUECHECK_WEIGHT);
    } else if (vc.overallFit === "no") {
      bumpCount(counts, "総合好み", -VALUECHECK_WEIGHT);
    }
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const prefer = sorted.filter(([, v]) => v > 0).map(([k]) => k).slice(0, 4);
  const avoid = sorted.filter(([, v]) => v < 0).map(([k]) => k).slice(0, 3);

  const pairwiseCount = session.votes.filter((v) => v.choice !== "skip").length;
  const vcCount = session.valueChecks?.length ?? 0;
  const voteCount = pairwiseCount + vcCount;
  const confidence = Math.min(0.95, 0.35 + voteCount * 0.04 + vcCount * 0.02);

  const traitPrefer = prefer.filter((p) =>
    Object.values(TRAIT_LABEL).some((m) => Object.values(m).includes(p)),
  );
  const vector = buildVectorFromSession(session);
  const summaryLine = buildSummaryLineFromVector(vector, traitPrefer.length > 0 ? prefer : []);

  return {
    prefer,
    avoid,
    vector,
    trustFilters: { ...DEFAULT_TRUST_FILTERS },
    confidence,
    voteCount,
    summaryLine,
    updatedAt: new Date().toISOString(),
  };
}

export function recommendSpecimens(profile: PreferenceProfileMock | null): MockSpecimen[] {
  const score = (s: MockSpecimen) => {
    if (!profile) return s.bodyLengthMm;
    const nums = specimenNumericValues(s);
    const vectorKeys = Object.keys(profile.vector ?? {}) as VectorDimensionKey[];
    if (vectorKeys.length > 0) {
      return scoreNumericProximity(nums, profile.vector) * 10 + s.bodyLengthMm * 0.01;
    }
    const labels = traitsToLabels(s.traits);
    let acc = labels.reduce(
      (sum, l) => sum + (profile.prefer.includes(l) ? 2 : profile.avoid.includes(l) ? -2 : 0),
      0,
    );
    if (profile.prefer.includes("手頃な価格") && s.priceTier !== "high") acc += 1;
    if (profile.avoid.includes("高価格帯") && s.priceTier === "high") acc -= 2;
    if (profile.prefer.includes("入手容易") && s.availability === "in_stock") acc += 1;
    return acc;
  };
  return [...MOCK_SPECIMENS].sort((a, b) => score(b) - score(a)).slice(0, 3);
}

export function previewOrderLabels(profile: PreferenceProfileMock | null): string[] {
  return recommendSpecimens(profile).map((s) => s.name);
}

export function formatSpecimenBlock(specimen: MockSpecimen): Array<{ label: string; value: string }> {
  return [
    { label: "体長", value: `${specimen.bodyLengthMm} mm` },
    { label: "角長", value: `${specimen.hornLengthMm} mm` },
    { label: "角型", value: specimen.hornType },
    { label: "色", value: specimen.colorLabel },
    { label: "視点", value: VIEW_TYPE_LABEL[specimen.viewType] },
    { label: "撮影", value: specimen.shootCondition },
  ];
}
