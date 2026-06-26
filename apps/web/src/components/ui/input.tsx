import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-button border border-civ-border bg-civ-section px-3 py-2 text-civ-fg placeholder:text-civ-disabled focus:border-civ-info min-h-[44px]",
        className,
      )}
      {...props}
    />
  );
}
