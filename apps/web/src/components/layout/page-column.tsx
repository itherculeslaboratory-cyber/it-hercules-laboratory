import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function PageColumn({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-5xl px-4 py-8", className)}
      {...props}
    />
  );
}

export function Stack({
  className,
  gap = "md",
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: "sm" | "md" | "lg" }) {
  const gapClass =
    gap === "sm" ? "gap-4" : gap === "lg" ? "gap-8" : "gap-6";
  return <div className={cn("flex flex-col", gapClass, className)} {...props} />;
}
