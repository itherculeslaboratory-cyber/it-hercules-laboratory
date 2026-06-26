"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function SettingsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Record<string, unknown>>("/api/v1/settings")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">設定</h1>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {data ? (
          <Card>
            <CardTitle>一般</CardTitle>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-civ-muted">言語</dt><dd>{String(data.language)}</dd></div>
              <div className="flex justify-between"><dt className="text-civ-muted">通知</dt><dd>{data.notifications ? "ON" : "OFF"}</dd></div>
              <div className="flex justify-between"><dt className="text-civ-muted">相手先 PII</dt><dd>{String(data.counterparty_pii_mode)}</dd></div>
            </dl>
          </Card>
        ) : null}
        <div className="grid gap-3">
          <Link href="/settings/ui-template" className="no-underline">
            <Card className="hover:border-civ-info">UI テンプレ選択</Card>
          </Link>
          <Link href="/env/shelf" className="no-underline">
            <Card className="hover:border-civ-info">データ取得元（機器）</Card>
          </Link>
          <Link href="/settings/devices" className="no-underline">
            <Card className="hover:border-civ-info">機器管理（追加・一覧）</Card>
          </Link>
          <Link href="/builder" className="no-underline">
            <Card className="hover:border-civ-info">UI ビルダー</Card>
          </Link>
          <Link href="/admin/karma" className="no-underline">
            <Card className="hover:border-civ-info">カルマ管理（L4）</Card>
          </Link>
        </div>
      </Stack>
    </PageColumn>
  );
}
