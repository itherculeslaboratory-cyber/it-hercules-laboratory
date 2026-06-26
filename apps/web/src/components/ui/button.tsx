import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-civ-info text-civ-deep hover:opacity-90 border border-transparent",
  secondary:
    "bg-civ-card text-civ-fg border border-civ-border hover:border-civ-info",
  ghost: "bg-transparent text-civ-muted hover:text-civ-fg border border-transparent",
};

export function Button({
  className,
  variant = "secondary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-normal transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
