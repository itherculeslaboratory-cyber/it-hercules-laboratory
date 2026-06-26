/** User-facing copy when commit blob is absent (ver2 · preferences §C). */

export type PhotoAbsentReason = "not_saved_at_commit" | "blob_missing" | null | undefined;

export function photoAbsentMessage(reason?: PhotoAbsentReason): string {
  if (reason === "blob_missing") {
    return "写真データを取得できません（保存記録はあります）";
  }
  return "写真なし（commit時未保存）";
}
