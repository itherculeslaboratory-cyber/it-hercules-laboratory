import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Tone = "muted" | "success" | "danger" | "info" | "warning";

const tones: Record<Tone, string> = {
  muted: "border-civ-border text-civ-muted",
  success: "border-civ-success text-civ-success",
  danger: "border-civ-danger text-civ-danger",
  info: "border-civ-info text-civ-info",
  warning: "border-civ-warning text-civ-warning",
};

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-button border px-2 py-0.5 text-xs",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
