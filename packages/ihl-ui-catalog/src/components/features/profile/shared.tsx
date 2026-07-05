import type { ReactNode } from "react";
import type { W2ComponentProps } from "../../../types/w2";
import "./profile.css";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

export function ProfileNullStatePanel(_props: W2ComponentProps) {
  return null;
}

type ShellProps = W2ComponentProps & {
  componentId: string;
  children: ReactNode;
};

export function ProfileShell({ componentId, state = "ok", className, children }: ShellProps) {
  return (
    <section className={["ihl-prof", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state={state}>
      {children}
    </section>
  );
}

export function ProfileCrumb({ parts }: { parts: { label: string; action?: () => void }[] }) {
  return (
    <p className="ihl-prof__crumb">
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

export function MetricCard({
  title,
  value,
  sub,
  badge,
  desc,
  onClick,
}: {
  title: string;
  value: ReactNode;
  sub?: ReactNode;
  badge?: string;
  desc?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag type={onClick ? "button" : undefined} className="ihl-prof-metric" onClick={onClick}>
      <h3 className="ihl-prof-metric__title">{title}</h3>
      <div className="ihl-prof-metric__value">{value}</div>
      {sub}
      {badge && <span className="ihl-prof-metric__badge">{badge}</span>}
      {desc && <p className="ihl-prof-metric__desc">{desc}</p>}
    </Tag>
  );
}
