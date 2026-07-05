import { BrandChrome } from "../components/BrandChrome";
import { LoginMagicLinkForm } from "../components/LoginMagicLinkForm";
import "../tokens/civ.css";
import "./login-screen.css";

type LoginScreenProps = {
  onNavigate?: (screenId: string) => void;
};

/**
 * ScreenDef: screen-defs/O1-login.json
 * ヘッダーは BrandChrome 1 本のみ（PageHeader / breadcrumb なし）
 */
export function LoginScreen({ onNavigate }: LoginScreenProps) {
  return (
    <div className="ihl-screen ihl-screen--login" data-screen-id="O1">
      <BrandChrome />
      <main className="ihl-screen__main">
        <LoginMagicLinkForm onSent={() => onNavigate?.("O2")} />
      </main>
    </div>
  );
}
