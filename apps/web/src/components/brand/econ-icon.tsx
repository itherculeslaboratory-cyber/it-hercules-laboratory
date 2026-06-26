import Image from "next/image";
import { cn } from "@/lib/cn";
import { BRAND_ASSETS } from "@/lib/brand-assets";

type EconIconKind = "pt-coin" | "indulgence";

const ECON_META: Record<EconIconKind, { src: string; alt: string; testId: string }> = {
  "pt-coin": {
    src: BRAND_ASSETS.ptCoin,
    alt: "プラチナコイン",
    testId: "econ-icon-pt-coin",
  },
  indulgence: {
    src: BRAND_ASSETS.indulgence,
    alt: "黄金ヘラクレス教の免罪符",
    testId: "econ-icon-indulgence",
  },
};

type EconIconProps = {
  kind: EconIconKind;
  size?: "sm" | "md" | "lg";
  framed?: boolean;
  className?: string;
};

const SIZE_SLOT_CLASS: Record<NonNullable<EconIconProps["size"]>, string> = {
  sm: "civ-brandIconSlot--sm",
  md: "civ-brandIconSlot--md",
  lg: "civ-brandIconSlot--lg",
};

const SIZE_DIM: Record<NonNullable<EconIconProps["size"]>, number> = {
  sm: 20,
  md: 36,
  lg: 56,
};

export function EconIcon({ kind, size = "md", framed = true, className }: EconIconProps) {
  const meta = ECON_META[kind];
  const dim = SIZE_DIM[size];

  const image = (
    <Image
      src={meta.src}
      alt={meta.alt}
      className={cn(framed ? "civ-brandIconSlot__img" : "h-full w-full object-contain")}
      width={dim}
      height={dim}
      data-testid={meta.testId}
    />
  );

  if (!framed) {
    return (
      <span className={cn("inline-flex shrink-0", SIZE_SLOT_CLASS[size], className)}>
        {image}
      </span>
    );
  }

  return (
    <span
      className={cn("civ-brandIconSlot", SIZE_SLOT_CLASS[size], className)}
      data-testid={`${meta.testId}-slot`}
    >
      {image}
    </span>
  );
}

export function isIndulgenceSku(sku: string) {
  return sku.toLowerCase().includes("indulgence");
}
