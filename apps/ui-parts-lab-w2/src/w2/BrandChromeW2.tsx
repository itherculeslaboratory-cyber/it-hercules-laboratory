import type { MouseEvent } from "react";
import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import "@ihl/ui-catalog/components/brand-chrome.css";

const HOME_SCREEN_ID = "01";

/** 3101 専用 BrandChrome — Charter Q5:B 深葉にプロフィール導線 */
export function BrandChromeW2({ className, onNavigate }: W2ComponentProps = {}) {
  const handleLogoClick = (e: MouseEvent) => {
    e.preventDefault();
    onNavigate?.(HOME_SCREEN_ID);
  };

  const go = (target: string) => (e: MouseEvent) => {
    e.preventDefault();
    onNavigate?.(target);
  };

  return (
    <header
      className={["ihl-brand-chrome", "ihl-brand-chrome--w2", className].filter(Boolean).join(" ")}
      data-component-id="ihl-brand-chrome"
      data-w2-variant="profile-nav"
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
      <nav className="ihl-brand-chrome__actions" aria-label="アカウント">
        <button type="button" className="ihl-brand-chrome__action" onClick={go("PRnotif")} title="通知">
          🔔 通知
        </button>
        <button type="button" className="ihl-brand-chrome__action" onClick={go("PR")} title="マイページ">
          👤 マイページ
        </button>
      </nav>
    </header>
  );
}
