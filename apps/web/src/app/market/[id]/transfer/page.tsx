"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function GmoTransferPage() {
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Record<string, unknown>>(`/api/v1/market/transfer/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageColumn><StatePanel kind="loading" title="照合情報を読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="表示できません" description={error ?? undefined} /></PageColumn>;

  return (
    <PageColumn>
      <Stack>
        <Link href={`/market/${id}`} className="text-sm text-civ-muted">← 出品詳細</Link>
        <header className="flex items-center gap-2">
          <h1 className="text-2xl font-normal">GMO 振込案内</h1>
          <Badge tone="warning">stub tier</Badge>
        </header>
        <Card>
          <CardTitle>振込コード</CardTitle>
          <p className="mt-2 font-mono text-lg">{String(data.transfer_code)}</p>
          <p className="text-sm text-civ-muted mt-4">
            手数料 {String(data.fee_percent)}% · 状態: {String(data.status)}
          </p>
          <p className="text-sm text-civ-muted mt-2">{String(data.message)}</p>
        </Card>
      </Stack>
    </PageColumn>
  );
}
