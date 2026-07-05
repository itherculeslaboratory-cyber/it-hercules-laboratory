import type { ReactNode } from "react";
import type { W2ComponentProps } from "../../../types/w2";
import "./settings.css";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

export function SettingsNullStatePanel(_props: W2ComponentProps) {
  return null;
}

type ShellProps = W2ComponentProps & {
  componentId: string;
  children: ReactNode;
};

export function SettingsShell({ componentId, state = "ok", className, children }: ShellProps) {
  return (
    <section className={["ihl-set", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state={state}>
      {children}
    </section>
  );
}

export function SettingsCrumb({ parts }: { parts: { label: string; action?: () => void }[] }) {
  return (
    <p className="ihl-set__crumb">
      {parts.map((p, i) => (
        <span key={p.label}>
          {i > 0 && " › "}
          {p.action ? (
            <button type="button" onClick={p.action}>
              {p.label}
            </button>
          ) : (
            p.label
          )}
        </span>
      ))}
    </p>
  );
}

export function SettingsCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className="ihl-set-card" onClick={onClick}>
      <span className="ihl-set-card__icon">{icon}</span>
      <span className="ihl-set-card__title">{title}</span>
      <span className="ihl-set-card__desc">{desc}</span>
      <span className="ihl-set-card__chev">›</span>
    </button>
  );
}
