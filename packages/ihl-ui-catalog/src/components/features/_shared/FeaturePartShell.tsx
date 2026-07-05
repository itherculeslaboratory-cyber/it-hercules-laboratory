import type { ReactNode } from "react";
import type { W2ComponentProps, W2PartState } from "../../../types/w2";
import "./feature-screen.css";

function stateClass(state: W2PartState): string {
  if (state === "loading") return "ihl-feature-part--loading";
  if (state === "empty") return "ihl-feature-part--empty";
  if (state === "error") return "ihl-feature-part--error";
  return "";
}

type FeaturePartShellProps = W2ComponentProps & {
  componentId: string;
  shell?: boolean;
  children: ReactNode;
};

export function FeaturePartShell({
  componentId,
  state = "ok",
  className,
  shell = true,
  children,
}: FeaturePartShellProps) {
  if (state === "empty") {
    return (
      <section className={["ihl-feature-part", "ihl-feature-part--empty", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state="empty">
        <p>データがありません</p>
      </section>
    );
  }
  if (state === "error") {
    return (
      <section className={["ihl-feature-part", "ihl-feature-part--error", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state="error">
        <p>読み込みに失敗しました</p>
      </section>
    );
  }
  if (state === "loading") {
    return (
      <section className={["ihl-feature-part", "ihl-feature-part--loading", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state="loading">
        <p>読み込み中…</p>
      </section>
    );
  }

  return (
    <section
      className={["ihl-feature-part", stateClass(state), shell ? "ihl-feature-shell" : "", className].filter(Boolean).join(" ")}
      data-component-id={componentId}
      data-state={state}
    >
      {children}
    </section>
  );
}
