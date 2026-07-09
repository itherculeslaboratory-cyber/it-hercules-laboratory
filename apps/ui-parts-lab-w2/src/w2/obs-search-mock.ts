/** 3101 lab — 05a 観測検索 mock dataset · preference rerank stub (FR-MCH-REC-05) */

import type {
  PreferenceProfileMock,
  PreferenceVector,
  SpecimenTraits,
  TrustFilters,
  VectorDimensionKey,
} from "./preference-profile-lab";
import {
  availabilityToNum,
  colorToBlackRatio,
  marketGoodRatePct,
  normalizeTrustFilters,
  passesTrustFilters,
  priceTierToNum,
  priceTierToYen,
  scoreNumericProximity,
  trustFiltersActive,
  writePreferenceProfile,
} from "./preference-profile-lab";

export type ObsSex = "male" | "female" | "unknown";
export type ObsStage = "egg" | "larva" | "pupa" | "adult";
export type ObsQc = "usable" | "warning" | "rejected";

export type ObsCaptureRecord = {
  capture_id: string;
  individual_id: string;
  species: string;
  species_label: string;
  sex: ObsSex;
  stage_name: ObsStage;
  view_type: "dorsal" | "lateral" | "front";
  traits: SpecimenTraits;
  body_length_mm: number;
  horn_length_mm: number;
  color_label: string;
  horn_type: string;
  qc: ObsQc;
  tags: string[];
  notes: string;
  captured_at: string;
  price_tier?: "low" | "mid" | "high";
  priceYen: number;
  availability?: "in_stock" | "limited" | "sold_out";
  sellerId: string;
  sellerName: string;
  sellerKarma: number;
  /** ADR-H-08 · 06 §11 Y08 — 良い率（%）= good / (good+neutral+bad) */
  marketGoodRatePct: number;
  /** 出品者マーケット評価内訳（ADR-H-08 プロフィール表示と同型） */
  marketRatingGood: number;
  marketRatingNeutral: number;
  marketRatingBad: number;
};

export type ObsSearchFilters = {
  /** 購読リストの subscriptionId（G2 — 購読のみから選択） */
  subscriptionId: string;
  species: string;
  scientificName: string;
  subspeciesStatus: "subspecies" | "species_only" | "unresolved";
  sex: ObsSex | "all";
  stage_name: ObsStage | "all";
  keyword: string;
};

export type ObsSortMode = "preference-proximity" | "newest";

const TRAIT_LABEL: Record<keyof SpecimenTraits, Record<string, string>> = {
  size: { large: "大型", small: "小型" },
  horn: { thick: "太い角", thin: "短角" },
  color: { black: "黒系", brown: "茶系" },
};

const SEX_LABEL: Record<ObsSex, string> = {
  male: "♂",
  female: "♀",
  unknown: "?",
};

const STAGE_LABEL: Record<ObsStage, string> = {
  egg: "卵",
  larva: "幼虫",
  pupa: "蛹",
  adult: "成虫",
};

type SellerMock = {
  sellerId: string;
  sellerName: string;
  sellerKarma: number;
  /** ADR-H-08 market_rating — 取引評価平均（★1–5）と良い/普通/悪い件数 */
  marketRating: {
    value: number;
    reviewCount: number;
    good: number;
    neutral: number;
    bad: number;
  };
};

/** lab mock — 出品者プール（06 §11 Y08 マーケット評価 · ADR-H-08 · カルマ −100〜+100） */
const SELLER_POOL: SellerMock[] = [
  { sellerId: "sel-lab-a", sellerName: "甲虫園ラボ", sellerKarma: 142, marketRating: { value: 4.8, reviewCount: 43, good: 38, neutral: 4, bad: 1 } },
  { sellerId: "sel-lab-b", sellerName: "ヘラクレス職人", sellerKarma: 88, marketRating: { value: 4.2, reviewCount: 28, good: 22, neutral: 5, bad: 1 } },
  { sellerId: "sel-lab-c", sellerName: "標本ハウス", sellerKarma: 56, marketRating: { value: 3.6, reviewCount: 15, good: 9, neutral: 4, bad: 2 } },
  { sellerId: "sel-lab-d", sellerName: "昆虫マーケ匿名", sellerKarma: -12, marketRating: { value: 2.4, reviewCount: 8, good: 2, neutral: 2, bad: 4 } },
  { sellerId: "sel-lab-e", sellerName: "初心者出品", sellerKarma: -48, marketRating: { value: 1.5, reviewCount: 4, good: 0, neutral: 1, bad: 3 } },
];

/** 20 captures — traits aligned with preference-profile-lab for meaningful rerank */
export const MOCK_OBS_CAPTURES: ObsCaptureRecord[] = [
  mk("CAP-S01", "S01", { size: "large", horn: "thick", color: "black" }, 82, 48, "male", "adult", "usable", "2026-06-12T09:00:00Z", 0, undefined, "high", "limited"),
  mk("CAP-S02", "S02", { size: "small", horn: "thin", color: "brown" }, 68, 22, "male", "adult", "usable", "2026-06-11T14:30:00Z", 1, undefined, "mid", "in_stock"),
  mk("CAP-S03", "S03", { size: "large", horn: "thick", color: "brown" }, 75, 41, "male", "adult", "usable", "2026-06-10T11:00:00Z", 2, undefined, "mid", "in_stock"),
  mk("CAP-S04", "S04", { size: "large", horn: "thin", color: "black" }, 71, 28, "female", "adult", "warning", "2026-06-09T16:45:00Z", 3, undefined, "mid", "in_stock"),
  mk("CAP-S05", "S05", { size: "small", horn: "thick", color: "black" }, 64, 34, "male", "adult", "usable", "2026-06-08T08:20:00Z", 4, undefined, "low", "in_stock"),
  mk("CAP-S06", "S06", { size: "large", horn: "thick", color: "black" }, 79, 45, "male", "adult", "usable", "2026-06-07T19:10:00Z", 0, undefined, "high", "limited"),
  mk("CAP-S07", "S07", { size: "small", horn: "thin", color: "black" }, 66, 20, "male", "adult", "usable", "2026-06-06T13:00:00Z", 1, undefined, "low", "in_stock"),
  mk("CAP-S08", "S08", { size: "large", horn: "thin", color: "brown" }, 73, 26, "female", "adult", "usable", "2026-06-05T10:30:00Z", 2, undefined, "mid", "in_stock"),
  mk("CAP-S09", "S09", { size: "small", horn: "thick", color: "brown" }, 61, 31, "male", "larva", "usable", "2026-06-04T07:15:00Z", 3, undefined, "low", "in_stock"),
  mk("CAP-S10", "S10", { size: "large", horn: "thick", color: "black" }, 85, 52, "male", "adult", "usable", "2026-06-03T20:00:00Z", 4, undefined, "high", "sold_out"),
  mk("CAP-S11", "S11", { size: "large", horn: "thick", color: "brown" }, 70, 38, "male", "adult", "usable", "2026-06-02T12:40:00Z", 0, undefined, "mid", "in_stock"),
  mk("CAP-S12", "S12", { size: "small", horn: "thin", color: "brown" }, 63, 19, "unknown", "adult", "warning", "2026-06-01T09:55:00Z", 1, undefined, "low", "in_stock"),
  mk("CAP-S13", "S13", { size: "large", horn: "thin", color: "black" }, 77, 30, "male", "adult", "usable", "2026-05-31T15:20:00Z", 2, undefined, "high", "limited"),
  mk("CAP-S14", "S14", { size: "small", horn: "thick", color: "black" }, 69, 33, "female", "adult", "usable", "2026-05-30T11:10:00Z", 3, undefined, "mid", "in_stock"),
  mk("CAP-S15", "S15", { size: "large", horn: "thick", color: "black" }, 74, 42, "male", "adult", "usable", "2026-05-29T18:30:00Z", 4, undefined, "mid", "in_stock"),
  mk("CAP-S16", "S16", { size: "small", horn: "thin", color: "black" }, 67, 21, "male", "pupa", "usable", "2026-05-28T06:00:00Z", 0, undefined, "low", "in_stock"),
  mk("CAP-S17", "S17", { size: "large", horn: "thin", color: "brown" }, 80, 29, "male", "adult", "usable", "2026-05-27T14:00:00Z", 1, undefined, "high", "limited"),
  mk("CAP-S18", "S18", { size: "small", horn: "thick", color: "brown" }, 62, 30, "male", "larva", "usable", "2026-05-26T08:45:00Z", 2, undefined, "low", "in_stock"),
  mk("CAP-ADC01", "ADC-01", { size: "large", horn: "thick", color: "black" }, 76, 40, "male", "adult", "usable", "2026-05-25T10:00:00Z", 3, "Allomyrina dichotoma", "mid", "in_stock"),
  mk("CAP-EGG01", "EGG-01", { size: "small", horn: "thin", color: "brown" }, 0, 0, "unknown", "egg", "usable", "2026-05-24T07:00:00Z", 4, undefined, "low", "in_stock"),
];

function mk(
  capture_id: string,
  individual_id: string,
  traits: SpecimenTraits,
  body_length_mm: number,
  horn_length_mm: number,
  sex: ObsSex,
  stage_name: ObsStage,
  qc: ObsQc,
  captured_at: string,
  sellerIndex: number,
  speciesOverride?: string,
  price_tier: "low" | "mid" | "high" = "mid",
  availability: "in_stock" | "limited" | "sold_out" = "in_stock",
): ObsCaptureRecord {
  const species = speciesOverride ?? "Dynastes hercules";
  const species_label = species === "Allomyrina dichotoma" ? "カブトムシ（大）" : "ヘラクレスオオカブト";
  const traitTags = traitLabels(traits);
  const horn_type = traits.horn === "thick" ? "太角" : "短角";
  const color_label = traits.color === "black" ? "黒系" : "茶系";
  const seller = SELLER_POOL[sellerIndex % SELLER_POOL.length]!;
  const baseYen = priceTierToYen(price_tier);
  const priceYen = baseYen + (body_length_mm % 9) * 500;
  return {
    capture_id,
    individual_id,
    species,
    species_label,
    sex,
    stage_name,
    view_type: "dorsal",
    traits,
    body_length_mm,
    horn_length_mm,
    color_label,
    horn_type,
    qc,
    tags: [...traitTags, species_label, STAGE_LABEL[stage_name], SEX_LABEL[sex]],
    notes: `${species_label} · ${body_length_mm || "—"}mm · ${traitTags.join(" ")} · ¥${priceYen.toLocaleString("ja-JP")}`,
    captured_at,
    price_tier,
    priceYen,
    availability,
    sellerId: seller.sellerId,
    sellerName: seller.sellerName,
    sellerKarma: seller.sellerKarma,
    marketGoodRatePct: marketGoodRatePct(
      seller.marketRating.good,
      seller.marketRating.neutral,
      seller.marketRating.bad,
    ),
    marketRatingGood: seller.marketRating.good,
    marketRatingNeutral: seller.marketRating.neutral,
    marketRatingBad: seller.marketRating.bad,
  };
}

export function traitLabels(traits: SpecimenTraits): string[] {
  return (Object.keys(traits) as (keyof SpecimenTraits)[]).map((k) => TRAIT_LABEL[k][traits[k]] ?? traits[k]);
}

export function sexLabel(sex: ObsSex): string {
  return SEX_LABEL[sex];
}

export function stageLabel(stage: ObsStage): string {
  return STAGE_LABEL[stage];
}

export function captureNumericValues(capture: ObsCaptureRecord): Record<VectorDimensionKey, number> {
  return {
    body_length_mm: capture.body_length_mm,
    horn_length_mm: capture.horn_length_mm,
    black_ratio: colorToBlackRatio(capture.traits.color),
    price_tier: priceTierToNum(capture.price_tier ?? "mid"),
    price_yen: capture.priceYen,
    availability: availabilityToNum(capture.availability ?? "in_stock"),
  };
}

/** Numeric vector proximity — only scores keys present in vector (empty dims skipped) */
export function preferenceProximityScore(
  capture: ObsCaptureRecord,
  profile: PreferenceProfileMock | null,
  activeVector?: PreferenceVector,
): number {
  if (!profile) return 0;

  const vector = activeVector ?? profile.vector ?? {};
  const vectorKeys = Object.keys(vector) as VectorDimensionKey[];
  if (vectorKeys.length > 0) {
    const nums = captureNumericValues(capture);
    return scoreNumericProximity(nums, vector);
  }

  if (profile.voteCount === 0) return 0;

  const labels = traitLabels(capture.traits);
  return labels.reduce((sum, label) => {
    if (profile.prefer.includes(label)) return sum + 2;
    if (profile.avoid.includes(label)) return sum - 2;
    return sum;
  }, 0);
}

export function isPreferenceMatch(capture: ObsCaptureRecord, profile: PreferenceProfileMock | null): boolean {
  return preferenceProximityScore(capture, profile) > 0;
}

export function filterCaptures(items: ObsCaptureRecord[], filters: ObsSearchFilters): ObsCaptureRecord[] {
  const q = filters.keyword.trim().toLowerCase();
  return items.filter((c) => {
    if (filters.species && filters.species !== "all" && c.species !== filters.species) return false;
    if (filters.sex !== "all" && c.sex !== filters.sex) return false;
    if (filters.stage_name !== "all" && c.stage_name !== filters.stage_name) return false;
    if (!q) return true;
    const hay = [
      c.capture_id,
      c.individual_id,
      c.notes,
      c.sellerName,
      c.sellerId,
      ...c.tags,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

/** 出品者・信頼ハードゲート — metadata より前に除外（悪い除外=bad≥5∨karma≤0 · CAL-05-SRCH-08） */
export function filterByTrust(
  items: ObsCaptureRecord[],
  trust: TrustFilters,
): ObsCaptureRecord[] {
  const normalized = normalizeTrustFilters(trust);
  if (!trustFiltersActive(normalized)) return items;
  return items.filter((c) =>
    passesTrustFilters(
      c.sellerKarma,
      c.marketRatingGood,
      c.marketRatingBad,
      normalized,
    ),
  );
}

export function sortCaptures(
  items: ObsCaptureRecord[],
  sortMode: ObsSortMode,
  profile: PreferenceProfileMock | null,
  activeVector?: PreferenceVector,
): ObsCaptureRecord[] {
  const copy = [...items];
  const vector = activeVector ?? profile?.vector ?? {};
  const hasVector = Object.keys(vector).length > 0;
  if (sortMode === "newest" || !profile || (!hasVector && profile.voteCount === 0)) {
    return copy.sort((a, b) => b.captured_at.localeCompare(a.captured_at));
  }
  return copy.sort((a, b) => {
    const scoreDiff =
      preferenceProximityScore(b, profile, vector) - preferenceProximityScore(a, profile, vector);
    if (scoreDiff !== 0) return scoreDiff;
    return b.captured_at.localeCompare(a.captured_at);
  });
}

export function searchCaptures(
  filters: ObsSearchFilters,
  sortMode: ObsSortMode,
  profile: PreferenceProfileMock | null,
  trustFilters?: TrustFilters,
  activeVector?: PreferenceVector,
): ObsCaptureRecord[] {
  const trust = normalizeTrustFilters(trustFilters ?? profile?.trustFilters);
  const vector = activeVector ?? profile?.vector ?? {};
  const afterTrust = filterByTrust(MOCK_OBS_CAPTURES, trust);
  const filtered = filterCaptures(afterTrust, filters);
  return sortCaptures(filtered, sortMode, profile, vector);
}

/** Specimen trait labels used in preference search (lab mock) */
export const KNOWN_TRAIT_LABELS = ["大型", "小型", "太い角", "短角", "黒系", "茶系"] as const;

export const DEFAULT_PRICE_YEN_ENTRY = { target: 28000, direction: "lte" as const };

export function buildProfileSummaryLine(
  prefer: string[],
  avoid: string[],
  vector?: PreferenceProfileMock["vector"],
): string {
  if (vector && Object.keys(vector).length > 0) {
    const parts: string[] = [];
    if (vector.body_length_mm) {
      parts.push(`体長${Math.round(vector.body_length_mm.target)}mm`);
    }
    if (vector.horn_length_mm) {
      parts.push(`角長${Math.round(vector.horn_length_mm.target)}mm`);
    }
    if (vector.price_yen) {
      const dir = vector.price_yen.direction === "lte" ? "以下" : vector.price_yen.direction === "gte" ? "以上" : "付近";
      parts.push(`¥${Math.round(vector.price_yen.target).toLocaleString("ja-JP")}${dir}`);
    }
    if (parts.length > 0) return `${parts.slice(0, 3).join("・")}を好む`;
  }
  const known = KNOWN_TRAIT_LABELS as readonly string[];
  const traitPrefer = prefer.filter((p) => known.includes(p));
  if (traitPrefer.length > 0) return `${traitPrefer.slice(0, 3).join("・")}を好む`;
  const traitAvoid = avoid.filter((a) => known.includes(a));
  if (traitAvoid.length > 0) return `${traitAvoid.slice(0, 2).join("・")}を避ける傾向`;
  return "好みを学習中です";
}

export function applyProfileVectorEdits(
  profile: PreferenceProfileMock,
  vector: PreferenceProfileMock["vector"],
): PreferenceProfileMock {
  const activeVector: PreferenceVector = {};
  for (const key of Object.keys(vector ?? {}) as VectorDimensionKey[]) {
    const entry = vector[key];
    if (entry && Number.isFinite(entry.target)) {
      activeVector[key] = entry;
    }
  }
  const next: PreferenceProfileMock = {
    ...profile,
    vector: activeVector,
    summaryLine: buildProfileSummaryLine(profile.prefer, profile.avoid, activeVector),
    updatedAt: new Date().toISOString(),
  };
  writePreferenceProfile(next);
  return next;
}

export function applyProfileTrustEdits(
  profile: PreferenceProfileMock,
  trustFilters: TrustFilters,
): PreferenceProfileMock {
  const next: PreferenceProfileMock = {
    ...profile,
    trustFilters: normalizeTrustFilters(trustFilters),
    updatedAt: new Date().toISOString(),
  };
  writePreferenceProfile(next);
  return next;
}

export function applyProfileTraitEdits(
  profile: PreferenceProfileMock,
  prefer: string[],
  avoid: string[],
): PreferenceProfileMock {
  const next: PreferenceProfileMock = {
    ...profile,
    prefer: [...prefer],
    avoid: [...avoid],
    summaryLine: buildProfileSummaryLine(prefer, avoid, profile.vector),
    updatedAt: new Date().toISOString(),
  };
  writePreferenceProfile(next);
  return next;
}

export const SPECIES_OPTIONS = [
  { value: "all", label: "すべて" },
  { value: "Dynastes hercules", label: "Dynastes hercules" },
  { value: "Allomyrina dichotoma", label: "Allomyrina dichotoma" },
] as const;

export const PAGE_LIMIT = 24;

function defaultDirectionForKey(key: VectorDimensionKey): "gte" | "lte" | "near" {
  return key === "price_yen" || key === "price_tier" || key === "availability" ? "lte" : "gte";
}

/** Thumbs feedback → profile adjustment stub (lab v1) */
export function adjustProfileFromFeedback(
  profile: PreferenceProfileMock,
  capture: ObsCaptureRecord,
  feedback: "up" | "down",
): PreferenceProfileMock {
  const labels = traitLabels(capture.traits);
  const prefer = new Set(profile.prefer);
  const avoid = new Set(profile.avoid);
  const vector = { ...(profile.vector ?? {}) };

  for (const label of labels) {
    if (feedback === "up") {
      prefer.add(label);
      avoid.delete(label);
    } else {
      avoid.add(label);
      prefer.delete(label);
    }
  }

  const nums = captureNumericValues(capture);
  if (feedback === "up") {
    for (const key of Object.keys(nums) as VectorDimensionKey[]) {
      const existing = vector[key];
      vector[key] = {
        target: existing
          ? Math.round((existing.target + nums[key]) / 2 * 10) / 10
          : nums[key],
        direction: existing?.direction ?? defaultDirectionForKey(key),
      };
    }
  }

  const next: PreferenceProfileMock = {
    ...profile,
    prefer: [...prefer],
    avoid: [...avoid],
    vector,
    voteCount: profile.voteCount + 1,
    confidence: Math.min(0.95, profile.confidence + (feedback === "up" ? 0.02 : -0.01)),
    summaryLine: profile.summaryLine,
    updatedAt: new Date().toISOString(),
  };
  next.summaryLine = buildProfileSummaryLine(next.prefer, next.avoid, next.vector);
  writePreferenceProfile(next);
  return next;
}

export function defaultFilters(subscriptionId = "", species = "Dynastes hercules"): ObsSearchFilters {
  return {
    subscriptionId,
    species,
    scientificName: species,
    subspeciesStatus: "species_only",
    sex: "all",
    stage_name: "all",
    keyword: "",
  };
}

export function resolveSortMode(profile: PreferenceProfileMock | null, override?: ObsSortMode): ObsSortMode {
  if (override) return override;
  if (profile && (profile.voteCount > 0 || Object.keys(profile.vector ?? {}).length > 0)) {
    return "preference-proximity";
  }
  return "newest";
}
