import type { ReactNode } from "react";
import type { W2ComponentProps } from "../../../types/w2";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

type ObsDeepNavProps = {
  onAction?: W2ComponentProps["onAction"];
  links: { label: string; hotspot: number }[];
};

/** 深い画面用 — 戻る / ホーム等の ghost ナビ */
export function ObsDeepNav({ onAction, links }: ObsDeepNavProps) {
  if (links.length === 0) return null;
  return (
    <nav className="obs-deep-nav" aria-label="画面ショートカット">
      {links.map((link) => (
        <button key={link.label} type="button" className="obs-btn-ghost" onClick={() => hot(onAction, link.hotspot)}>
          {link.label}
        </button>
      ))}
    </nav>
  );
}

export function ObsNullPart(_props: W2ComponentProps) {
  return null;
}

export function ObsBreadcrumb({ segments }: { segments: string[] }) {
  return (
    <nav className="obs-breadcrumb" aria-label="パンくず">
      {segments.map((seg, i) => (
        <span key={seg}>
          {i > 0 && <span className="obs-breadcrumb__sep"> › </span>}
          <span className={i === segments.length - 1 ? "obs-breadcrumb__current" : undefined}>{seg}</span>
        </span>
      ))}
    </nav>
  );
}

export function ObsTargetChip({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button type="button" className="obs-target-chip" onClick={onClick}>
      <span className="obs-target-chip__icon" aria-hidden>
        🪲
      </span>
      {label}
    </button>
  );
}

export function ObsScreenWrap({
  className,
  children,
  componentId,
}: {
  className?: string;
  children: ReactNode;
  componentId: string;
}) {
  return (
    <section className={["obs-screen", className].filter(Boolean).join(" ")} data-component-id={componentId}>
      {children}
    </section>
  );
}

export function ObsGenderToggle({
  value,
  onChange,
}: {
  value: "male" | "female";
  onChange: (v: "male" | "female") => void;
}) {
  return (
    <div className="obs-gender-toggle" role="group" aria-label="性別">
      <button
        type="button"
        className={value === "male" ? "obs-gender-toggle__btn obs-gender-toggle__btn--active" : "obs-gender-toggle__btn"}
        onClick={() => onChange("male")}
      >
        雄
      </button>
      <button
        type="button"
        className={value === "female" ? "obs-gender-toggle__btn obs-gender-toggle__btn--active" : "obs-gender-toggle__btn"}
        onClick={() => onChange("female")}
      >
        雌
      </button>
    </div>
  );
}
