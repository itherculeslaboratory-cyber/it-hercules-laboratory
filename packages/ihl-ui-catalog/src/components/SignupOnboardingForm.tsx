import { useState, type FormEvent } from "react";
import type { W2ComponentProps } from "../types/w2";
import { FormField } from "./FormField";
import { PrimaryButton } from "./PrimaryButton";
import "./form-card.css";
import "./form-field.css";

const LOCALES = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
] as const;

type SignupOnboardingFormProps = W2ComponentProps & {
  onComplete?: (payload: { handle: string; locale: string }) => void;
  onOpenTerms?: () => void;
};

/** catalog id: ihl-00-onboarding-signup__SignupOnboardingForm */
export function SignupOnboardingForm({
  state = "ok",
  className,
  onComplete,
  onOpenTerms,
  onNavigate,
}: SignupOnboardingFormProps) {
  const [handle, setHandle] = useState("");
  const [locale, setLocale] = useState<string>("ja");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">(
    state === "loading" ? "submitting" : "idle",
  );

  const canSubmit = handle.trim().length >= 2 && agreed && status === "idle";

  if (state === "error") {
    return (
      <article
        className={["ihl-form-card", className].filter(Boolean).join(" ")}
        data-component-id="ihl-00-onboarding-signup__SignupOnboardingForm"
        data-state="error"
      >
        <p className="ihl-form-card__footer-hint">登録を完了できませんでした</p>
      </article>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    window.setTimeout(() => {
      onComplete?.({ handle: handle.trim(), locale });
      onNavigate?.("01");
    }, 400);
  }

  return (
    <article
      className={["ihl-form-card", className].filter(Boolean).join(" ")}
      data-component-id="ihl-00-onboarding-signup__SignupOnboardingForm"
      data-state={state}
    >
      <h1 className="ihl-form-card__title">新規登録</h1>
      <p className="ihl-form-card__lead">
        カブトムシ・クワガタムシ研究プラットフォームへようこそ。
        <br />
        アカウントを作成して、研究活動をはじめましょう。
      </p>
      <hr className="ihl-form-card__divider" />

      <form onSubmit={handleSubmit}>
        <FormField
          id="signup-handle"
          label="ハンドル名"
          required
          hint="公開される名前です。あとから変更できます。"
        >
          <input
            id="signup-handle"
            className="ihl-form-control"
            type="text"
            name="handle"
            autoComplete="username"
            placeholder="例) kabutomushi_labo"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            disabled={status === "submitting"}
            required
            minLength={2}
          />
        </FormField>

        <FormField
          id="signup-locale"
          label="表示言語"
          required
          hint="あとから設定画面で変更できます。"
        >
          <select
            id="signup-locale"
            className="ihl-form-control ihl-form-select"
            name="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            disabled={status === "submitting"}
            required
          >
            {LOCALES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>

        <div className="ihl-form-card__checkbox-row">
          <input
            id="signup-terms"
            className="ihl-form-card__checkbox"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={status === "submitting"}
          />
          <div>
            <label className="ihl-form-card__checkbox-label" htmlFor="signup-terms">
              利用規約に同意する{" "}
              <button
                type="button"
                className="ihl-form-card__link"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTerms?.();
                  onNavigate?.("O3");
                }}
              >
                利用規約を読む ↗
              </button>
            </label>
            <p className="ihl-form-card__terms-note">
              サービスのご利用には、利用規約への同意が必要です。
            </p>
          </div>
        </div>

        <PrimaryButton type="submit" disabled={!canSubmit} loading={status === "submitting"} testId="signup-start">
          はじめる
        </PrimaryButton>
      </form>
    </article>
  );
}
