"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

type GmoMeta = {
  tier?: string;
  stub?: boolean;
  expected_count?: number;
  webhook_event_count?: number;
  provider_note?: string;
};

export default function GmoAdminPage() {
  const [meta, setMeta] = useState<GmoMeta | null>(null);
  const [transferCode, setTransferCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<GmoMeta>("/api/v1/gmo/reconciliation/meta"),
      api.get<{ transfer_code: string }>("/api/v1/gmo/transfer-code?user_id=user-demo"),
    ])
      .then(([m, t]) => {
        setMeta(m);
        setTransferCode(t.transfer_code);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageColumn>
        <StatePanel kind="loading" title="GMO 照合メタを読み込み中" />
      </PageColumn>
    );
  }

  if (error || !meta) {
    return (
      <PageColumn>
        <StatePanel kind="error" title="表示できません" description={error ?? undefined} />
      </PageColumn>
    );
  }

  return (
    <PageColumn>
      <Stack>
        <Link href="/admin/karma" className="text-sm text-civ-muted">
          ← 管理ハブ
        </Link>
        <header className="flex items-center gap-2">
          <h1 className="text-2xl font-normal">GMO 振込照合</h1>
          <Badge tone={meta.stub ? "warning" : "info"}>{meta.tier ?? "stub"} tier</Badge>
        </header>
        <Card>
          <CardTitle>接続メタ</CardTitle>
          <CardDescription>{meta.provider_note}</CardDescription>
          <p className="text-sm text-civ-muted mt-4">
            期待入金 {meta.expected_count ?? 0} 件 · Webhook ログ {meta.webhook_event_count ?? 0} 件
          </p>
        </Card>
        <Card>
          <CardTitle>デモ振込コード</CardTitle>
          <p className="mt-2 font-mono text-lg">{transferCode}</p>
          <p className="text-sm text-civ-muted mt-2">
            名義末尾にコードを追記して振込。本番 live は人間ゲート（P0-NEXT-GMO-LIVE-EXEC）後。
          </p>
        </Card>
      </Stack>
    </PageColumn>
  );
}
