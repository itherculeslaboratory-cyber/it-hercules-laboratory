import type { ComposedPart } from "../../lib/types";

type StatePanelProps = {
  parts: ComposedPart[];
  screenId: string;
};

/** QUANTUM primitive · region StatePanel · part manifest for screen */
export function StatePanel({ parts, screenId }: StatePanelProps) {
  return (
    <aside className="part-state-panel" data-part="StatePanel" aria-label="部品状態">
      <strong>composed-parts</strong> · 画面 <code>{screenId}</code> · {parts.length} 部品
      <div className="part-chips">
        {parts.map((p) => (
          <span key={p.id} className={`part-chip ${p.reuse === "required" ? "required" : ""}`} title={p.id}>
            {p.region}
          </span>
        ))}
      </div>
    </aside>
  );
}
