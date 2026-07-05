import type { W2ComponentProps } from "../types/w2";
import "./primary-button.css";

type PrimaryButtonProps = W2ComponentProps & {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
  loading?: boolean;
  testId?: string;
};

/** catalog id: ihl-primitive-primary-button — 画面横断の主 CTA */
export function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
  loading,
  testId,
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={["ihl-primary-button", className].filter(Boolean).join(" ")}
      disabled={disabled || loading}
      onClick={onClick}
      data-component-id="ihl-primitive-primary-button"
      data-testid={testId}
    >
      {loading ? "送信中…" : children}
    </button>
  );
}
