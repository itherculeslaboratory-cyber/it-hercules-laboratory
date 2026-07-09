import { useState } from "react";
import type { ComponentType } from "react";
import type { W2ComponentProps, W2PartState } from "@ihl/ui-catalog/types/w2";

const STATES: W2PartState[] = ["ok", "loading", "empty", "error"];

const STATE_LABELS: Record<W2PartState, string> = {
  ok: "通常",
  loading: "読込中",
  empty: "空",
  error: "エラー",
};

type W2UniversalStatePanelProps = W2ComponentProps & {
  Inner: ComponentType<W2ComponentProps>;
  componentId: string;
};

/** Charter Q9:C — 全画面 StatePanel に 4 状態トグルを付与（3101 専用） */
export function W2UniversalStatePanel({
  Inner,
  componentId,
  screenId,
  screenParams,
  onNavigate,
  onAction,
  className,
  state: initialState,
}: W2UniversalStatePanelProps) {
  const urlState = screenParams?.partState as W2PartState | undefined;
  const [localState, setLocalState] = useState<W2PartState>(
    urlState && STATES.includes(urlState) ? urlState : initialState ?? "ok",
  );
  const activeState = urlState && STATES.includes(urlState) ? urlState : localState;

  return (
    <div className="w2-state-panel-wrap" data-w2-state-panel={componentId}>
      <div className="w2-state-panel-toggle" role="group" aria-label="表示状態（Q9:C）">
        {STATES.map((s) => (
          <button
            key={s}
            type="button"
            className={`w2-state-panel-toggle__btn${activeState === s ? " is-active" : ""}`}
            aria-pressed={activeState === s}
            onClick={() => {
              setLocalState(s);
              if (screenId && onNavigate) {
                const next = { ...screenParams, partState: s };
                if (s === "ok") delete next.partState;
                onNavigate(screenId, next);
              }
            }}
          >
            {STATE_LABELS[s]}
          </button>
        ))}
      </div>
      <Inner
        state={activeState}
        screenId={screenId}
        screenParams={screenParams}
        onNavigate={onNavigate}
        onAction={onAction}
        className={className}
      />
    </div>
  );
}

export function isStatePanelComponentId(componentId: string): boolean {
  return componentId.endsWith("__StatePanel");
}
