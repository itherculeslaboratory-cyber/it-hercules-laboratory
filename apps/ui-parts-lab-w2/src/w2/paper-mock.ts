/** 09 論文柱 — lab mock（PaperSectionsV1 · ADR-H-09 低コスト導線） */

export type ResearchStep = "observe" | "hypothesize" | "try" | "record" | "cite";

export type PaperSectionKey =
  | "purpose"
  | "hypothesis"
  | "conditions"
  | "verification"
  | "current_phase"
  | "gaps";

export type PaperConditions = {
  temperature_c: string;
  humidity_pct: string;
  feed: string;
};

export type PaperSectionsDraft = {
  purpose: { text: string; filled: boolean };
  hypothesis: { text: string; filled: boolean };
  conditions: PaperConditions & { filled: boolean };
  verification: { text: string; filled: boolean };
  current_phase: { step: ResearchStep; label_ja: string; filled: boolean };
  gaps: { missing_keys: string[]; tags: string[]; note: string; filled: boolean };
};

export type PaperInProgressMock = {
  content_id: string;
  title: string;
  case_chip: string;
  status_label: string;
  sections: PaperSectionsDraft;
};

export const RESEARCH_STEPS: { step: ResearchStep; label: string }[] = [
  { step: "observe", label: "観測" },
  { step: "hypothesize", label: "仮説" },
  { step: "try", label: "試す" },
  { step: "record", label: "記録" },
  { step: "cite", label: "引用" },
];

/** ADR-H-07 — 探索用 case チップ（BBS 層と enum 共有 · 09 上部行） */
export const PAPER_CASE_CHIPS = [
  "paper",
  "observation",
  "breeding_log",
  "analysis",
  "review",
  "replication",
  "hypothesis",
  "other",
] as const;

export const PAPER_SECTION_LABELS: Record<PaperSectionKey, string> = {
  purpose: "目的",
  hypothesis: "仮説",
  conditions: "条件（温度/湿度/餌）",
  verification: "検証したいこと",
  current_phase: "現在のフェーズ",
  gaps: "必要なデータ / ギャップ",
};

export const MOCK_PAPER_IN_PROGRESS: PaperInProgressMock = {
  content_id: "paper_01",
  title: "温度と角長の相関（進行中）",
  case_chip: "temperature実験",
  status_label: "進行中",
  sections: {
    purpose: {
      text: "温度がクワガタの角長に与える影響を明らかにする。",
      filled: true,
    },
    hypothesis: {
      text: "温度が高いほど、オスの角長は長くなる。",
      filled: true,
    },
    conditions: {
      temperature_c: "22–30",
      humidity_pct: "60",
      feed: "昆虫ゼリー",
      filled: true,
    },
    verification: {
      text: "異なる温度条件下で飼育した個体の角長を比較し、温度と角長の相関を検証する。",
      filled: true,
    },
    current_phase: {
      step: "try",
      label_ja: "試す",
      filled: true,
    },
    gaps: {
      missing_keys: ["temperature_night", "humidity_night"],
      tags: ["不足"],
      note: "夜間温度・湿度の連続ログが不足しています。",
      filled: false,
    },
  },
};

/** 観測逆流 — 〔観測から差し込む〕で conditions / verification へマップ */
export const OBSERVATION_INSERT_PRESET: Pick<PaperSectionsDraft, "conditions" | "verification"> = {
  conditions: {
    temperature_c: "26",
    humidity_pct: "58",
    feed: "昆虫ゼリー",
    filled: true,
  },
  verification: {
    text: "観測 #4821 の計測値（角長 62mm · 幼虫 L3）を追試条件として取り込む。",
    filled: true,
  },
};

export function computeCompleteness(sections: PaperSectionsDraft): number {
  const flags = [
    sections.purpose.filled,
    sections.hypothesis.filled,
    sections.conditions.filled,
    sections.verification.filled,
    sections.current_phase.filled,
    sections.gaps.filled,
  ];
  const filled = flags.filter(Boolean).length;
  return Math.round((filled / flags.length) * 100);
}

export function formatConditions(c: PaperConditions): string {
  return `温度 ${c.temperature_c}°C · 湿度 ${c.humidity_pct}% · 餌 ${c.feed}`;
}

export function stepIndex(step: ResearchStep): number {
  return RESEARCH_STEPS.findIndex((s) => s.step === step);
}
