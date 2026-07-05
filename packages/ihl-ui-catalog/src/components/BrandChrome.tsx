import type { MouseEvent } from "react";
import "./brand-chrome.css";
import type { W2ComponentProps } from "../types/w2";

const HOME_SCREEN_ID = "01";

/** catalog id: ihl-brand-chrome · 単一ブランドバー（logo-primary のみ） */
export function BrandChrome({ className, onNavigate }: W2ComponentProps = {}) {
  const handleLogoClick = (e: MouseEvent) => {    e.preventDefault();
    onNavigate?.(HOME_SCREEN_ID);
  };

  return (
    <header
      className={["ihl-brand-chrome", className].filter(Boolean).join(" ")}
      data-component-id="ihl-brand-chrome"
    >
      <a
        href={`/s/${HOME_SCREEN_ID}`}
        className="ihl-brand-chrome__link"
        aria-label="IT Hercules Laboratory ホーム"
        onClick={handleLogoClick}
      >
        <img
          className="ihl-brand-chrome__logo"
          src="/brand/logo-primary.png"
          alt="IT Hercules Laboratory"
          width={560}
          height={88}
        />
      </a>
    </header>
  );
}
