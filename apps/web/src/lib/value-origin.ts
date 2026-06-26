/** value_origin → 表示ラベル（schemas/dictionaries/value_origin.yaml 準拠） */

const VALUE_ORIGIN_LABELS: Record<string, string> = {
  direct_observed: "直接観測",
  image_derived: "画像由来",
  environment_derived: "環境由来",
  lineage_derived: "血統由来",
  estimated: "推定",
  imputed: "補完",
  aggregate: "集計",
  model_inference: "モデル推論",
  unknown: "不明",
};

export type ValueOriginTone = "info" | "success" | "warning" | "muted";

export function formatValueOriginLabel(
  valueOrigin?: string | null,
  source?: string | null,
): string {
  if (valueOrigin && VALUE_ORIGIN_LABELS[valueOrigin]) {
    return VALUE_ORIGIN_LABELS[valueOrigin];
  }
  if (source && VALUE_ORIGIN_LABELS[source]) {
    return VALUE_ORIGIN_LABELS[source];
  }
  if (valueOrigin) return valueOrigin;
  if (source) return source;
  return "—";
}

export function valueOriginTone(valueOrigin?: string | null): ValueOriginTone {
  switch (valueOrigin) {
    case "direct_observed":
      return "success";
    case "image_derived":
      return "warning";
    case "environment_derived":
      return "info";
    default:
      return "muted";
  }
}
