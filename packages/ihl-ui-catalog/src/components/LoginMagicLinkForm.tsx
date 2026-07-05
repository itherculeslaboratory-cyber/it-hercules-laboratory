import { useState, type FormEvent } from "react";
import type { W2ComponentProps } from "../types/w2";
import { PrimaryButton } from "./PrimaryButton";
import "./form-card.css";
import "./form-field.css";
import "./login-magic-link-form.css";

type LoginMagicLinkFormProps = W2ComponentProps & {
  onSent?: (email: string) => void;
};

/** catalog id: ihl-00-onboarding-login__LoginMagicLinkForm */
export function LoginMagicLinkForm({
  state = "ok",
  className,
  onSent,
  onNavigate,
}: LoginMagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">(
    state === "loading" ? "sending" : "idle",
  );

  if (state === "empty") {
    return (
      <article
        className={["ihl-form-card", "ihl-login-card", className].filter(Boolean).join(" ")}
        data-component-id="ihl-00-onboarding-login__LoginMagicLinkForm"
        data-state="empty"
      >
        <p className="ihl-form-card__footer-hint">メールアドレスを入力してください</p>
      </article>
    );
  }

  if (state === "error") {
    return (
      <article
        className={["ihl-form-card", "ihl-login-card", className].filter(Boolean).join(" ")}
        data-component-id="ihl-00-onboarding-login__LoginMagicLinkForm"
        data-state="error"
      >
        <p className="ihl-login-card__sent">送信に失敗しました</p>
      </article>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    window.setTimeout(() => {
      setStatus("sent");
      onSent?.(email.trim());
      onNavigate?.("O2");
    }, 400);
  }

  return (
    <article
      className={["ihl-form-card", "ihl-login-card", className].filter(Boolean).join(" ")}
      data-component-id="ihl-00-onboarding-login__LoginMagicLinkForm"
      data-state={state}
    >
      <h1 className="ihl-form-card__title ihl-login-card__title">ログイン</h1>

      <form className="ihl-login-card__form" onSubmit={handleSubmit}>
        <div className="ihl-form-field">
          <label className="ihl-form-field__label" htmlFor="login-email">
            メールアドレス
          </label>
          <input
            id="login-email"
            className="ihl-form-control"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "sending"}
            required
          />
        </div>

        <PrimaryButton
          type="submit"
          disabled={!email.trim()}
          loading={status === "sending"}
          testId="login-magic-link-submit"
        >
          ログインリンクを送る
        </PrimaryButton>
      </form>

      <p className="ihl-form-card__footer-hint">パスワードは不要です（マジックリンク）</p>

      {status === "sent" && (
        <p className="ihl-login-card__sent" role="status">
          ログインリンクを送信しました（W2 パイロット · API 未接続）
        </p>
      )}
    </article>
  );
}
