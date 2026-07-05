import { BrandChrome } from "../../components/BrandChrome";
import { FormField } from "../../components/FormField";
import { LoginMagicLinkForm } from "../../components/LoginMagicLinkForm";
import { PrimaryButton } from "../../components/PrimaryButton";
import { SignupOnboardingForm } from "../../components/SignupOnboardingForm";
import { TermsAgreementForm } from "../../components/TermsAgreementForm";
import type { CatalogComponent } from "../overrides.types";

/**
 * 横断プリミティブ — 全画面共有。並列ワーカーは編集禁止。
 * @owner platform
 */
export const PRIMITIVE_OVERRIDES: Record<string, CatalogComponent> = {
  "ihl-brand-chrome": BrandChrome,
  "ihl-primitive-primary-button": PrimaryButton,
  "ihl-primitive-form-field": FormField,
  "ihl-00-onboarding-login__LoginMagicLinkForm": LoginMagicLinkForm,
  "ihl-00-onboarding-signup__SignupOnboardingForm": SignupOnboardingForm,
  "ihl-00-terms__TermsAgreementForm": TermsAgreementForm,
};
