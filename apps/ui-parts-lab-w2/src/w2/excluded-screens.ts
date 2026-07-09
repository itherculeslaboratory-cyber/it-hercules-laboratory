/** W2 charter Q6:A — orphan stub 除外（3101 のみ） */
export const W2_EXCLUDED_SCREEN_IDS = new Set(["06soc"]);

export function isW2ExcludedScreen(id: string): boolean {
  return W2_EXCLUDED_SCREEN_IDS.has(id);
}
