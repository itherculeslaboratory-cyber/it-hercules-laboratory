import { BrandChrome } from "../components/BrandChrome";

import { SignupOnboardingForm } from "../components/SignupOnboardingForm";

import "../tokens/civ.css";

import "./signup-screen.css";



type SignupScreenProps = {

  onNavigate?: (screenId: string) => void;

};



/**

 * ScreenDef: screen-defs/O2-signup.json

 * ヘッダーは BrandChrome 1 本のみ（PageHeader / breadcrumb なし）

 */

export function SignupScreen({ onNavigate }: SignupScreenProps) {

  return (

    <div className="ihl-screen ihl-screen--signup" data-screen-id="O2">

      <BrandChrome />

      <main className="ihl-screen__main">

        <SignupOnboardingForm

          onOpenTerms={() => onNavigate?.("O3")}

          onComplete={() => onNavigate?.("01")}

        />

      </main>

    </div>

  );

}


