import { useState } from "react";
import type { W2ComponentProps } from "../types/w2";
import { PrimaryButton } from "./PrimaryButton";
import "./form-card.css";
import "./terms-agreement-form.css";

const ARTICLES = [
  {
    n: 1,
    title: "適用範囲",
    body: "本規約は、IT Hercules Laboratory（以下「本サービス」）の利用に関する条件を定めます。",
  },
  {
    n: 2,
    title: "アカウント",
    body: "利用者は正確な情報を登録し、マジックリンク認証によりアカウントを管理します。",
  },
  {
    n: 3,
    title: "コンテンツとデータ",
    body: "観測データ・血統情報等は INSERT ONLY の文明史モデルに従い保存されます。",
  },
];

/** catalog id: ihl-00-terms__TermsAgreementForm */
export function TermsAgreementForm({
  state = "ok",
  className,
  onNavigate,
  onAction,
}: W2ComponentProps) {
  const [busy, setBusy] = useState(false);

  if (state === "loading") {
    return (
      <article className={`ihl-form-card ihl-terms-card ${className ?? ""}`} data-component-id="ihl-00-terms__TermsAgreementForm" data-state="loading">
        <p className="ihl-terms-card__loading">読み込み中…</p>
      </article>
    );
  }

  if (state === "error") {
    return (
      <article className={`ihl-form-card ihl-terms-card ihl-terms-card--error ${className ?? ""}`} data-component-id="ihl-00-terms__TermsAgreementForm" data-state="error">
        <p>利用規約を読み込めませんでした</p>
      </article>
    );
  }

  function agree() {
    setBusy(true);
    window.setTimeout(() => {
      onAction?.("agree");
      onNavigate?.("O2");
    }, 300);
  }

  return (
    <article
      className={`ihl-form-card ihl-terms-card ${className ?? ""}`}
      data-component-id="ihl-00-terms__TermsAgreementForm"
      data-state={state}
    >
      <h1 className="ihl-form-card__title">利用規約</h1>
      <p className="ihl-form-card__lead">
        利用規約をよくお読みいただき、同意の上、次へお進みください。
      </p>
      <hr className="ihl-form-card__divider" />

      <div className="ihl-terms-card__scroll" role="region" aria-label="利用規約本文">
        {ARTICLES.map((a) => (
          <section key={a.n} className="ihl-terms-article">
            <header className="ihl-terms-article__head">
              <h2 className="ihl-terms-article__title">
                第{a.n}条 {a.title}
              </h2>
              <button type="button" className="ihl-form-card__link" onClick={() => onAction?.("explain", a.n)}>
                本音解説
              </button>
            </header>
            <p className="ihl-terms-article__body">{a.body}</p>
          </section>
        ))}
      </div>

      <p className="ihl-terms-card__note">
        本サービスのご利用には、利用規約への同意が必要です。
      </p>

      <div className="ihl-terms-card__actions">
        <button
          type="button"
          className="ihl-terms-card__back"
          disabled={busy}
          onClick={() => {
            onAction?.("back");
            onNavigate?.("O2");
          }}
        >
          戻る
        </button>
        <PrimaryButton type="button" loading={busy} onClick={agree} testId="terms-agree">
          同意して続ける
        </PrimaryButton>
      </div>
    </article>
  );
}
