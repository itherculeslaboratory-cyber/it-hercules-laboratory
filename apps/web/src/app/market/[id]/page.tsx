"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function MarketDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Record<string, unknown>>(`/api/v1/market/listings/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageColumn><StatePanel kind="loading" title="読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="出品なし" description={error ?? undefined} /></PageColumn>;

  const board = data.board as { stage: number; step: string; payment_deadline: string };

  return (
    <PageColumn>
      <Stack>
        <Link href="/market" className="text-sm text-civ-muted">← 一覧</Link>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>{String(data.title)}</CardTitle>
            <p className="text-civ-muted mt-2">{String(data.price_pt)} PT</p>
            <Button variant="primary" className="mt-4">申し込む（Stage 1）</Button>
            <Link href={`/market/${id}/transfer`} className="block mt-2 text-sm">
              振込案内へ
            </Link>
          </Card>
          <Card>
            <CardTitle>プライベートボード</CardTitle>
            <p className="text-sm text-civ-muted mt-2">
              Stage {board.stage} · {board.step} · 期限 {board.payment_deadline}
            </p>
            <p className="text-sm text-civ-muted mt-4">当事者 2 人のみ · 第三者非公開</p>
          </Card>
        </div>
      </Stack>
    </PageColumn>
  );
}
