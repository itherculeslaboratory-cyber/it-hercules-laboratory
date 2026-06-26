"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";
import { clearAuthSessionCookie, setAuthSessionCookie } from "@/lib/auth-session";

interface MagicLinkResponse {
  message: string;
  dev_token?: string;
}

interface VerifyResponse {
  status: string;
  session_token: string;
  actor_id: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [devToken, setDevToken] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function verifyAndStore(token: string, mode: "auto" | "manual", redirectPath = nextPath) {
    setVerifying(mode === "auto");
    try {
      const res = await api.post<VerifyResponse>("/api/v1/auth/verify", { token });
      setAuthSessionCookie(res.session_token);
      setAuthReady(true);
      setStatus("idle");
      setMessage(mode === "auto" ? "認証を確認しました。アプリへ進めます。" : "開発トークンで認証しました。");
      router.replace(redirectPath);
    } catch (err) {
      setStatus("error");
      setAuthReady(false);
      setMessage(err instanceof ApiError ? err.message : "認証に失敗しました");
      if (mode === "manual") {
        clearAuthSessionCookie();
      }
    } finally {
      setVerifying(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setAuthReady(false);
    setDevToken("");
    try {
      const res = await api.post<MagicLinkResponse>("/api/v1/auth/magic-link", { email });
      setStatus("sent");
      setMessage(res.message);
      setDevToken(res.dev_token ?? "");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiError ? err.message : "送信に失敗しました");
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolvedNextPath = params.get("next") || "/";
    const token = params.get("token") || "";
    setNextPath(resolvedNextPath);
    if (token) {
      void verifyAndStore(token, "auto", resolvedNextPath);
    }
  }, []);

  const showGoAppButton = authReady && !verifying;

  return (
    <PageColumn className="max-w-md" data-testid="auth-login-page">
      <Stack>
        <div className="flex justify-center py-2" data-testid="auth-login-brand">
          <BrandLogo variant="primary" linked={false} />
        </div>
        <h1 className="text-2xl font-normal">ログイン</h1>
        <Card>
          <CardTitle>マジックリンク</CardTitle>
          <CardDescription>メールアドレスにログインリンクを送ります</CardDescription>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <label className="block text-sm text-civ-muted">
              メール
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                autoComplete="email"
                data-testid="auth-email-input"
              />
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1"
                data-testid="auth-terms-check"
              />
              <span>
                <Link href="/terms">利用規約</Link> に同意する
              </span>
            </label>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!agreeTerms || verifying}
              data-testid="auth-login-btn"
            >
              リンクを送信
            </Button>
          </form>
          {verifying ? (
            <p className="mt-4 text-sm text-civ-muted" role="status">
              ログイントークンを検証中です...
            </p>
          ) : null}
          {status === "sent" ? (
            <p className="mt-4 text-sm text-civ-success" role="status">
              {message}
            </p>
          ) : null}
          {status === "error" ? (
            <p className="mt-4 text-sm text-civ-danger" role="alert" data-testid="auth-error-banner">
              {message}
            </p>
          ) : null}
          {devToken ? (
            <div className="mt-4 rounded-card border border-civ-border p-3">
              <p className="text-xs text-civ-muted">開発モード: dev token で直接検証できます</p>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 w-full"
                data-testid="auth-dev-token-btn"
                onClick={() => void verifyAndStore(devToken, "manual")}
              >
                開発トークンで認証
              </Button>
            </div>
          ) : null}
          {showGoAppButton ? (
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={() => router.push(nextPath)}
              data-testid="auth-go-app-btn"
            >
              アプリへ進む
            </Button>
          ) : null}
        </Card>
        <p className="text-sm text-civ-muted">
          初回の方は <Link href="/register">新規登録</Link>
        </p>
      </Stack>
    </PageColumn>
  );
}
