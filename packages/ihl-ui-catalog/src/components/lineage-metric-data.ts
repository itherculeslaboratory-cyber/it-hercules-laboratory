/** 03m 指標バリアント — 同一 MortalityListPanel で差し替え */
export type LineageMetricVariant = "mortality" | "completion" | "eclosion_failure";

export type LineageMetricRow = {
  id: string;
  stage: string;
  reason: string;
  date: string;
};

export type LineageMetricConfig = {
  variant: LineageMetricVariant;
  title: string;
  breadcrumbSuffix: string;
  headline: string;
  rate: string;
  rateTone: "danger" | "success" | "warn";
  subjectLabel: string;
  subjectCount: string;
  eventLabel: string;
  eventCount: string;
  eventTone: "danger" | "success" | "warn";
  tableTitle: string;
  tableNote: string;
  rows: LineageMetricRow[];
};

const MORTALITY_ROWS: LineageMetricRow[] = [
  { id: "IND-0207", stage: "三令 初期", reason: "death (疑い:細菌)", date: "2025-06-02" },
  { id: "IND-0219", stage: "二令", reason: "death (脱皮不全)", date: "2025-06-09" },
  { id: "IND-0224", stage: "三令 後期", reason: "death (羽化不全)", date: "2025-07-15" },
];

const COMPLETION_ROWS: LineageMetricRow[] = [
  { id: "IND-0210", stage: "成虫", reason: "完品 (角・胸幅基準)", date: "2025-08-01" },
  { id: "IND-0211", stage: "成虫", reason: "完品 (角・胸幅基準)", date: "2025-08-03" },
  { id: "IND-0213", stage: "成虫", reason: "完品 (角・胸幅基準)", date: "2025-08-05" },
  { id: "IND-0215", stage: "成虫", reason: "完品 (角・胸幅基準)", date: "2025-08-07" },
];

const ECLOSION_ROWS: LineageMetricRow[] = [
  { id: "IND-0224", stage: "三令 後期", reason: "羽化不全 (前翅未展)", date: "2025-07-15" },
  { id: "IND-0228", stage: "三令 後期", reason: "羽化不全 (蛹死)", date: "2025-07-22" },
];

export const LINEAGE_METRIC_CONFIGS: Record<LineageMetricVariant, LineageMetricConfig> = {
  mortality: {
    variant: "mortality",
    title: "死亡一覧",
    breadcrumbSuffix: "死亡一覧",
    headline: "生体までの死亡率",
    rate: "12%",
    rateTone: "danger",
    subjectLabel: "対象個体",
    subjectCount: "25",
    eventLabel: "死亡",
    eventCount: "3",
    eventTone: "danger",
    tableTitle: "死亡 詳細一覧（観測へジャンプ）",
    tableNote: "ⓘ 死亡(死亡率)は life_event、状態(alive_status=dead)は Observation、詳細は各個体の観測へ。",
    rows: MORTALITY_ROWS,
  },
  completion: {
    variant: "completion",
    title: "完品率 詳細一覧",
    breadcrumbSuffix: "完品率 詳細",
    headline: "完品率",
    rate: "78%",
    rateTone: "success",
    subjectLabel: "対象個体",
    subjectCount: "25",
    eventLabel: "完品",
    eventCount: "19",
    eventTone: "success",
    tableTitle: "完品 詳細一覧（観測へジャンプ）",
    tableNote: "ⓘ 完品は羽化後の形態基準を満たした個体。詳細は各個体の観測へ。",
    rows: COMPLETION_ROWS,
  },
  eclosion_failure: {
    variant: "eclosion_failure",
    title: "羽化不全率 詳細一覧",
    breadcrumbSuffix: "羽化不全率 詳細",
    headline: "羽化不全率",
    rate: "9%",
    rateTone: "warn",
    subjectLabel: "対象個体",
    subjectCount: "25",
    eventLabel: "羽化不全",
    eventCount: "2",
    eventTone: "warn",
    tableTitle: "羽化不全 詳細一覧（観測へジャンプ）",
    tableNote: "ⓘ 羽化不全は life_event。詳細は各個体の観測へ。",
    rows: ECLOSION_ROWS,
  },
};

export function resolveLineageMetricVariant(raw?: string): LineageMetricVariant {
  if (raw === "completion" || raw === "eclosion_failure") return raw;
  return "mortality";
}
