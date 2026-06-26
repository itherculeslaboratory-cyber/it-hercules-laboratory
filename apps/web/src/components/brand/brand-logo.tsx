import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { BRAND_ASSETS } from "@/lib/brand-assets";

type BrandLogoProps = {
  variant?: "primary" | "mark" | "responsive";
  className?: string;
  linked?: boolean;
};

export function BrandLogo({ variant = "primary", className, linked = true }: BrandLogoProps) {
  const primary = (
    <Image
      src={BRAND_ASSETS.logoPrimary}
      alt="IT Hercules Laboratory"
      className={cn(
        "h-10 w-auto max-w-[260px] sm:h-11",
        variant === "responsive" ? "hidden sm:block" : "",
        className,
      )}
      width={260}
      height={40}
      priority
      data-testid="brand-logo-primary"
    />
  );

  const mark = (
    <Image
      src={BRAND_ASSETS.logoMark}
      alt="IT Hercules Laboratory"
      className={cn("h-9 w-9", variant === "responsive" ? "sm:hidden" : "", className)}
      width={36}
      height={36}
      priority
      data-testid="brand-logo-mark"
    />
  );

  const content =
    variant === "mark" ? mark : variant === "responsive" ? (
      <>
        {mark}
        {primary}
      </>
    ) : (
      primary
    );

  if (!linked) {
    return <span className="inline-flex items-center">{content}</span>;
  }

  return (
    <Link href="/" className="inline-flex items-center no-underline hover:no-underline" data-testid="brand-logo-link">
      {content}
    </Link>
  );
}
