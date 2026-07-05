/** W2 部品共通 props — UIbuilder / ScreenDef 正本 */
export type W2PartState = "ok" | "loading" | "empty" | "error";

export type W2ComponentProps = {
  state?: W2PartState;
  className?: string;
  /** ScreenRenderer が注入 — 同一 component_id の画面差分用 */
  screenId?: string;
  /** URL クエリ等 — 03m metric バリアント等 */
  screenParams?: Record<string, string>;
  onNavigate?: (screenId: string, params?: Record<string, string>) => void;
  onAction?: (action: string, payload?: unknown) => void;
};

export type ScreenDefNode = {
  id: string;
  component_id: string;
  region?: string;
  props?: Record<string, unknown>;
};

export type ScreenDefTransition = {
  from: string;
  to_screen_id: string;
  label?: string;
  /** 遷移先 screen へ渡すクエリ（例: 03m?metric=completion） */
  params?: Record<string, string>;
};

export type ScreenDef = {
  screen_id: string;
  route: string;
  title: string;
  layout?: "auth" | "standard";
  nodes: ScreenDefNode[];
  transitions?: ScreenDefTransition[];
  notes?: string;
};
