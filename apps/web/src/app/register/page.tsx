"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [language, setLanguage] = useState("ja");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/v1/auth/register", {
        handle,
        language,
        agree_terms: agree,
      });
      router.push("/language");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "登録に失敗しました");
    }
  }

  return (
    <PageColumn className="max-w-md" data-testid="auth-register-page">
      <Stack>
        <div className="flex justify-center py-2" data-testid="auth-register-brand">
          <BrandLogo variant="primary" linked={false} />
        </div>
        <h1 className="text-2xl font-normal">新規登録</h1>
        <Card>
          <CardTitle>アカウント作成</CardTitle>
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <label className="block text-sm text-civ-muted">
              ハンドル名
              <Input
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="mt-1"
                data-testid="auth-register-handle"
              />
            </label>
            <label className="block text-sm text-civ-muted">
              表示言語
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 py-2 min-h-[44px]"
                data-testid="auth-register-language"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1"
                data-testid="auth-register-agree"
              />
              <span>
                <Link href="/terms">利用規約</Link> に同意する
              </span>
            </label>
            {error ? (
              <p className="text-sm text-civ-danger" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!agree}
              data-testid="auth-register-submit"
            >
              登録する
            </Button>
          </form>
        </Card>
      </Stack>
    </PageColumn>
  );
}
